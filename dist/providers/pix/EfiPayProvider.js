"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../../utils/all/index");
class EfiPayProvider {
    baseUrl;
    clientId;
    clientSecret;
    certificatePath;
    accessToken;
    providerInfo = {
        name: 'EfiPay',
        description: 'Plataforma de pagamentos Pix via API.',
        documentation: 'https://dev.efipay.com.br/docs/api-pix/',
        isOnline: true,
        vendor: {
            name: 'EfiPay',
            shotname: 'efipay',
            url: 'https://www.efipay.com.br',
            api: 'https://api.efipay.com.br',
            versions: [
                {
                    name: 'br.com.efipay.api-v1',
                    version: '1.0.0',
                    path: '/',
                }
            ],
        },
    };
    constructor(configs) {
        this.baseUrl = configs.isTest ? 'https://pix-h.api.efipay.com.br' : 'https://pix.api.efipay.com.br';
        this.clientId = configs.clientId;
        this.clientSecret = configs.clientSecret;
        this.certificatePath = configs.certificatePath;
        this.accessToken = null;
    }
    searchPixBilling(body) {
        throw new Error('Method not implemented.');
    }
    async generateToken() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios_1.default.post(`${this.baseUrl}/oauth/token`, { grant_type: 'client_credentials' }, {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        });
        this.accessToken = response.data.access_token;
    }
    getHeaders() {
        if (!this.accessToken) {
            throw new Error('Token de acesso não foi gerado.');
        }
        return {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };
    }
    async gerarCobPix(valueCents, description, customer) {
        const payload = {
            calendario: {
                expiracao: 3600
            },
            devedor: {
                cpf: customer.document,
                nome: customer.name
            },
            valor: {
                original: (valueCents / 100).toFixed(2)
            },
            chave: (0, index_1.randomUUID)(),
            infoAdicionais: [
                { nome: 'Descrição', valor: description }
            ]
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v2/cob`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarCobrancas(page = 1, registrationStartDate, registrationEndDate) {
        const params = {
            inicio: registrationStartDate || new Date().toISOString(),
            fim: registrationEndDate || new Date().toISOString(),
            paginaAtual: page,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/v2/cob`, {
            headers: this.getHeaders(),
            params,
        });
        return response.data;
    }
    async consultarCobrancaPorID(txid) {
        const response = await axios_1.default.get(`${this.baseUrl}/v2/cob/${txid}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async estornarCobranca(txid) {
        const response = await axios_1.default.post(`${this.baseUrl}/v2/pix/${txid}/devolucao`, {
            valor: '10.00',
        }, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        const valueCents = Math.round(body.valueCents);
        await this.generateToken();
        const data = await this.gerarCobPix(valueCents, body.description, {
            name: body.name,
            document: body.document,
            email: body.email,
            phone: body.phone,
        });
        return {
            qrcode: data.pix.qrcode,
            pixkey: data.pix.txid,
            value: {
                original: body.valueCents,
                cents: valueCents,
                fixed: (valueCents / 100).toFixed(2),
                float: valueCents / 100,
            },
            expires: {
                timestamp: body.expires,
                dateTime: new Date(body.expires * 1000).toLocaleString('pt-BR'),
                iso: new Date(body.expires * 1000).toISOString(),
            },
            code: data.txid,
        };
    }
    async listingPixBilling(body) {
        const data = await this.listarCobrancas(body.page ?? 1, body.registrationDateStart ?? new Date().toISOString(), body.registrationDateEnd ?? new Date().toISOString());
        const cobrancas = data.cobs.map((mp) => ({
            referenceCode: mp.txid,
            valueCents: mp.valor.original * 100,
            content: mp.qrcode,
            status: mp.status,
            generatorName: mp.devedor.nome,
            generatorDocument: mp.devedor.cpf,
            registrationDate: mp.calendario.criacao,
            paymentDate: mp.calendario.expiracao,
            endToEnd: mp.endToEndId || 'N/A',
        }));
        return {
            qrcodes: cobrancas,
            meta: {
                current_page: body.page || 1,
                total_pages: Math.ceil(data.total / 20),
                total_items_amount: data.total,
                total_value_cents: cobrancas.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async generateProviderWidthdraw(body) {
        const payload = {
            valor: (body.valueCents / 100).toFixed(2),
            chave: body.pixKey,
            descricao: `Saque para ${body.receiverName}`,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v2/pix`, payload, {
            headers: this.getHeaders(),
        });
        const withdrawal = response.data;
        return {
            reference_code: withdrawal.txid,
            idempotent_id: body.idempotentId,
            value_cents: withdrawal.valor * 100,
            pix_key_type: body.pixKeyType || 'CPF',
            pix_key: body.pixKey ?? '',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: withdrawal.status,
        };
    }
    async listProviderWidthdraw(body) {
        const params = {
            inicio: body.registrationDateStart || new Date().toISOString(),
            fim: body.registrationDateEnd || new Date().toISOString(),
            page: body.page,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/v2/withdrawals`, {
            headers: this.getHeaders(),
            params,
        });
        const withdrawals = response.data.withdrawals.map((withdrawal) => ({
            referenceCode: withdrawal.txid,
            idempotentId: withdrawal.correlationId,
            valueCents: Math.round(withdrawal.valor * 100),
            pixKeyType: withdrawal.pixKeyType || 'CPF',
            pixKey: withdrawal.pixKey,
            receiverName: withdrawal.receiverName,
            receiverDocument: withdrawal.receiverDocument,
            status: withdrawal.status,
            registrationDate: withdrawal.created_at,
            paymentDate: withdrawal.paid_at || null,
            cancellationDate: withdrawal.cancelled_at || null,
            cancellationReason: withdrawal.cancellation_reason || null,
            endToEnd: withdrawal.endToEndId || 'N/A',
        }));
        return {
            payments: withdrawals,
            meta: {
                current_page: body.page || 1,
                total_pages: response.data.paginacao.total_pages,
                total_items_amount: response.data.paginacao.total_items,
                total_value_cents: withdrawals.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async getBalance() {
        await this.generateToken();
        const response = await axios_1.default.get(`${this.baseUrl}/v2/conta/saldo`, {
            headers: this.getHeaders(),
        });
        const saldo = response.data;
        return {
            valueCents: Math.round(saldo.saldo * 100),
            valueFloat: saldo.saldo,
        };
    }
    async searchProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/v2/withdrawals/${body.correlationId}`, {
            headers: this.getHeaders(),
        });
        const withdrawal = response.data;
        return {
            referenceCode: withdrawal.txid,
            idempotentId: withdrawal.correlationId,
            valueCents: Math.round(withdrawal.valor * 100),
            pixKeyType: withdrawal.pixKeyType || 'CPF',
            pixKey: withdrawal.pixKey,
            receiverName: withdrawal.receiverName,
            receiverDocument: withdrawal.receiverDocument,
            status: withdrawal.status,
            registrationDate: withdrawal.created_at,
            paymentDate: withdrawal.paid_at || null,
            cancellationDate: withdrawal.cancelled_at || null,
            endToEnd: withdrawal.endToEndId || 'N/A',
        };
    }
}
exports.default = EfiPayProvider;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const index_js_1 = require("../../utils/all/index.js");
const PixProvider_1 = __importDefault(require("./PixProvider"));
class OpenPixProvider {
    baseUrl;
    apiKey;
    providerInfo = {
        name: 'OpenPix',
        description: 'Plataforma de pagamentos instantâneos com Pix.',
        documentation: 'https://developers.openpix.com.br',
        isOnline: true,
        vendor: {
            name: 'OpenPix',
            shotname: 'openpix',
            url: 'https://openpix.com.br',
            api: 'https://api.openpix.com.br',
            versions: [
                {
                    name: 'br.com.openpix.api-v1',
                    version: '1.0.0',
                    path: '/',
                },
            ],
        },
    };
    constructor(configs) {
        this.baseUrl = configs.isTest
            ? 'https://sandbox.openpix.com.br'
            : 'https://api.openpix.com.br';
        this.apiKey = configs.apiKey;
    }
    getHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }
    async gerarQrCodePix(valueCents, description, customer) {
        const payload = {
            correlationID: (0, index_js_1.randomUUID)(),
            value: valueCents,
            comment: description,
            customer: {
                name: customer.name,
                email: customer.email,
                taxID: customer.document,
                phone: customer.phone,
            },
        };
        const response = await axios_1.default.post(`${this.baseUrl}/api/v1/charge`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarCobrancas(page = 1, registrationStartDate, registrationEndDate) {
        const params = {
            page,
            startDate: registrationStartDate,
            endDate: registrationEndDate,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/api/v1/charge`, {
            headers: this.getHeaders(),
            params,
        });
        return response.data;
    }
    async consultarCobrancaPorID(correlationID) {
        const response = await axios_1.default.get(`${this.baseUrl}/api/v1/charge/${correlationID}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async estornarCobranca(correlationID) {
        const response = await axios_1.default.post(`${this.baseUrl}/api/v1/charge/${correlationID}/refund`, {}, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        const valueCents = Math.round(body.valueCents);
        const data = await this.gerarQrCodePix(valueCents, body.description, {
            name: body.name,
            document: body.document,
            email: body.email,
            phone: body.phone,
            city: body.city,
        });
        return {
            qrcode: data.charge.qrCodeImage,
            pixkey: data.charge.brCode,
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
            code: data.charge.correlationID,
        };
    }
    async listingPixBilling(body) {
        const data = await this.listarCobrancas(body.page ?? 1, body.registrationDateStart ?? new Date().toISOString(), body.registrationDateEnd ?? new Date().toISOString());
        const cobrancas = data.charges.map((mp) => ({
            referenceCode: mp.correlationID,
            valueCents: mp.value,
            content: mp.qrCodeImage,
            status: mp.status,
            generatorName: mp.customer.name,
            generatorDocument: mp.customer.taxID,
            payerName: mp.payer?.name || 'N/A',
            payerDocument: mp.payer?.taxID || 'N/A',
            registrationDate: mp.createdAt,
            paymentDate: mp.paidAt,
            endToEnd: mp.endToEndId || 'N/A',
        }));
        return {
            qrcodes: cobrancas,
            meta: {
                current_page: body.page || 1,
                total_pages: Math.ceil(data.charges.length / 20),
                total_items_amount: data.charges.length,
                total_value_cents: cobrancas.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async searchPixBilling(body) {
        const data = await this.consultarCobrancaPorID(body.reference);
        return {
            referenceCode: data.charge.correlationID,
            valueCents: data.charge.value,
            status: data.charge.status,
            registrationDate: data.charge.createdAt,
            paymentDate: data.charge.paidAt,
            generatorName: data.charge.customer.name,
            generatorDocument: data.charge.customer.taxID,
        };
    }
    async generateProviderWidthdraw(body) {
        return {
            reference_code: (0, index_js_1.randomUUID)(),
            idempotent_id: body.idempotentId,
            value_cents: body.valueCents,
            pix_key_type: body.pixKeyType || 'CPF',
            pix_key: body.pixKey || '12345678901',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: 'APPROVED',
        };
    }
    async listProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/api/v1/subaccount/withdraw`, {
            headers: this.getHeaders(),
            params: {
                page: body.page,
                registrationStartDate: body.registrationDateStart,
                registrationEndDate: body.registrationDateEnd,
                paymentStartDate: body.paymentStartDate,
                paymentEndDate: body.paymentEndDate,
            },
        });
        const payments = response.data.withdrawals.map((withdrawal) => ({
            referenceCode: withdrawal.correlationID,
            idempotentId: withdrawal.correlationID,
            valueCents: withdrawal.value,
            pixKeyType: 'CPF',
            pixKey: withdrawal.destinationAlias,
            receiverName: withdrawal.comment || 'Desconhecido',
            receiverDocument: 'Não disponível',
            status: withdrawal.status,
            registrationDate: withdrawal.createdAt,
            paymentDate: withdrawal.paymentDate,
            cancellationDate: withdrawal.cancellationDate || null,
            cancellationReason: withdrawal.cancellationReason || null,
            endToEnd: withdrawal.transactionID || 'N/A',
        }));
        return {
            payments,
            meta: {
                current_page: body.page || 1,
                total_pages: 1,
                total_items_amount: payments.length,
                total_value_cents: payments.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async getBalance() {
        const response = await axios_1.default.get(`${this.baseUrl}/api/v1/balance`, {
            headers: this.getHeaders(),
        });
        const balance = response.data;
        return {
            valueCents: balance.balance * 100,
            valueFloat: balance.balance,
        };
    }
    async searchProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/api/v1/subaccount/withdraw/${body.correlationID}`, {
            headers: this.getHeaders(),
        });
        const data = response.data.withdrawal;
        return {
            referenceCode: data.correlationID,
            idempotentId: data.correlationID,
            valueCents: data.value,
            pixKeyType: (new PixProvider_1.default({ pixkey: data.destinationAlias })).determinePixType().type,
            pixKey: data.destinationAlias,
            receiverName: data.comment || 'Desconhecido',
            receiverDocument: 'Não disponível',
            status: data.status,
            registrationDate: data.createdAt,
            paymentDate: data.paymentDate,
            endToEnd: data.transactionID || 'N/A',
        };
    }
}
exports.default = OpenPixProvider;

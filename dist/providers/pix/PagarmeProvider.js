"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const index_js_1 = require("../../utils/all/index");
class PagarMeProvider {
    baseUrl;
    apiKey;
    providerInfo = {
        name: 'Pagar.me',
        description: 'A plataforma completa para aceitar pagamentos online.',
        documentation: 'https://docs.pagar.me',
        isOnline: true,
        vendor: {
            name: 'Pagar.me',
            shotname: 'pagarme',
            url: 'https://pagar.me',
            api: 'https://api.pagar.me',
            versions: [
                {
                    name: 'br.com.pagarme.api-v1',
                    version: '1.0.0',
                    path: '/core/v1',
                },
                {
                    name: 'br.com.pagarme.api-v2',
                    version: '1.2.0',
                    path: '/core/v2',
                },
                {
                    name: 'br.com.pagarme.api-v3',
                    version: '2.3.0',
                    path: '/core/v3',
                },
                {
                    name: 'br.com.pagarme.api-v4',
                    version: '3.4.0',
                    path: '/core/v4',
                },
                {
                    name: 'br.com.pagarme.api-v5',
                    version: '4.5.0',
                    path: '/core/v5',
                },
            ],
        },
    };
    constructor(configs) {
        this.apiKey = configs.apiKey;
        this.baseUrl = 'https://api.pagar.me/core/v5';
    }
    getHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }
    async gerarTransacaoCredito(valueCents, cardDetails, customer) {
        const payload = {
            api_key: this.apiKey,
            amount: valueCents,
            payment_method: 'credit_card',
            card_number: cardDetails.number,
            card_expiration_date: cardDetails.expiration_date,
            card_holder_name: cardDetails.holder_name,
            card_cvv: cardDetails.cvv,
            customer,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/transactions`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async gerarQrCode(valueCents, expirationTime, description) {
        const payload = {
            api_key: this.apiKey,
            amount: valueCents,
            payment_method: 'pix',
            pix_expiration_date: expirationTime
                ? new Date(expirationTime * 1000).toISOString()
                : new Date(Date.now() + 3600 * 1000).toISOString(),
            description,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/transactions`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarTransacoes(page = 1, startDate, endDate) {
        const params = {
            api_key: this.apiKey,
            page,
            count: 20,
            date_created_since: startDate,
            date_created_until: endDate,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/transactions`, {
            headers: this.getHeaders(),
            params,
        });
        return response.data;
    }
    async consultarTransacaoPorId(transactionId) {
        const response = await axios_1.default.get(`${this.baseUrl}/transactions/${transactionId}`, {
            params: { api_key: this.apiKey },
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async estornarTransacao(transactionId) {
        const response = await axios_1.default.post(`${this.baseUrl}/transactions/${transactionId}/refund`, {
            api_key: this.apiKey,
        }, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async cadastrarWebhook(url, event) {
        const payload = {
            api_key: this.apiKey,
            url,
            events: [event],
        };
        const response = await axios_1.default.post(`${this.baseUrl}/webhooks`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        var valueCents = Number.isInteger(body.valueCents)
            ? body.valueCents
            : Math.round(body.valueCents * 100);
        var expireTimestamp = Math.round(new Date().getTime() / 1000 + (body.expires ?? 3600));
        await this.gerarQrCode(valueCents, expireTimestamp);
        return {
            pixkey: body.pixkey,
            value: {
                original: body.valueCents,
                cents: valueCents,
                fixed: (valueCents / 100).toFixed(2),
                float: valueCents / 100,
            },
            expires: {
                timestamp: expireTimestamp,
                dateTime: new Date(expireTimestamp * 1000).toLocaleString('pt-BR'),
                iso: new Date(expireTimestamp * 1000).toISOString(),
            },
            code: (0, index_js_1.randomUUID)(),
        };
    }
    async listingPixBilling(body) {
        var data = await this.listarTransacoes(body.page ?? 1, body.registrationDateStart ?? new Date().toISOString(), body.registrationDateEnd ?? new Date().toISOString());
        data = data.data.map((mp) => {
            return {
                referenceCode: mp.id,
                valueCents: mp.amount,
                content: mp.pix_qr_code,
                status: mp.status,
                registrationDate: mp.date_created,
                paymentDate: mp.date_updated,
            };
        });
        return {
            qrcodes: data,
            meta: {
                current_page: body.page || 1,
                total_pages: Math.ceil(data.length / 20),
                total_items_amount: data.length,
                total_value_cents: data.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async getBalance() {
        return {
            valueCents: 0,
            valueFloat: 0.0,
        };
    }
    async searchPixBilling(body) {
        var data = await this.consultarTransacaoPorId(body.reference);
        return {
            referenceCode: data.id,
            valueCents: data.amount,
            status: data.status,
            registrationDate: data.date_created,
            paymentDate: data.date_updated,
        };
    }
    async generateProviderWidthdraw(body) {
        const payload = {
            api_key: this.apiKey,
            amount: body.valueCents,
            bank_account: {
                bank_code: body.bankIspb,
                agencia: body.agency,
                conta: body.account,
                conta_dv: '0',
                type: body.accountType === 'checking' ? 'conta_corrente' : 'conta_poupanca',
                document_number: body.receiverDocument,
                legal_name: body.receiverName,
            },
        };
        const response = await axios_1.default.post(`${this.baseUrl}/transfers`, payload, {
            headers: this.getHeaders(),
        });
        return {
            reference_code: response.data.id,
            idempotent_id: body.idempotentId,
            value_cents: body.valueCents,
            pix_key_type: body.pixKeyType || '',
            pix_key: body.pixKey || '',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: response.data.status,
        };
    }
    async listProviderWidthdraw(body) {
        const params = {
            api_key: this.apiKey,
            page: body.page || 1,
            count: 20,
            date_created_since: body.registrationDateStart,
            date_created_until: body.registrationDateEnd,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/transfers`, {
            headers: this.getHeaders(),
            params,
        });
        const withdrawals = response.data.map((transfer) => ({
            referenceCode: transfer.id,
            idempotentId: transfer.correlation_id || '',
            valueCents: transfer.amount,
            pixKeyType: 'N/A',
            pixKey: 'N/A',
            receiverName: transfer.recipient_name,
            receiverDocument: transfer.recipient_document_number,
            status: transfer.status,
            registrationDate: transfer.date_created,
            paymentDate: transfer.date_updated,
            cancellationDate: transfer.date_canceled || null,
            cancellationReason: transfer.reason || null,
            endToEnd: 'N/A',
        }));
        return {
            payments: withdrawals,
            meta: {
                current_page: body.page || 1,
                total_pages: Math.ceil(response.data.length / 20),
                total_items_amount: response.data.length,
                total_value_cents: withdrawals.reduce((acc, withdrawal) => acc + withdrawal.valueCents, 0),
            },
        };
    }
    async searchProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/transfers/${body.correlationId}`, {
            headers: this.getHeaders(),
            params: { api_key: this.apiKey },
        });
        const transfer = response.data;
        return {
            referenceCode: transfer.id,
            idempotentId: transfer.correlation_id || '',
            valueCents: transfer.amount,
            pixKeyType: 'N/A',
            pixKey: 'N/A',
            receiverName: transfer.recipient_name,
            receiverDocument: transfer.recipient_document_number,
            status: transfer.status,
            registrationDate: transfer.date_created,
            paymentDate: transfer.date_updated,
            cancellationDate: transfer.date_canceled || null,
            endToEnd: 'N/A',
        };
    }
}
exports.default = PagarMeProvider;

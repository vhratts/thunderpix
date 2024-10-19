"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
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
    constructor(apiKey, isTest = false) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.pagar.me/core/v5';
    }
    generateProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
    listProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
    searchProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
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
            code: (0, crypto_1.randomUUID)(),
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
}
exports.default = PagarMeProvider;

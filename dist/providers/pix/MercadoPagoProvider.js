"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
class MercadoPagoProvider {
    baseUrl;
    clientId;
    clientSecret;
    accessToken;
    providerInfo = {
        name: 'Mercado Pago',
        description: 'A solução completa de pagamentos para o seu negócio.',
        documentation: 'https://www.mercadopago.com.br/developers/pt',
        isOnline: true,
        vendor: {
            name: 'Mercado Pago',
            shotname: 'mercado_pago',
            url: 'https://www.mercadopago.com.br',
            api: 'https://api.mercadopago.com',
            versions: [
                {
                    name: 'br.com.mercadopago.api-v1',
                    version: '1.0.0',
                    path: '/',
                }
            ],
        },
    };
    constructor(clientId, clientSecret, isTest = false) {
        if (isTest) {
            this.baseUrl = 'https://api.mercadopago.com/sandbox';
        }
        else {
            this.baseUrl = 'https://api.mercadopago.com';
        }
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = null;
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
    async generateToken() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios_1.default.post(`${this.baseUrl}/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
        }, {
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
    async gerarQrCode(valueCents, expirationTime, description) {
        const payload = {
            transaction_amount: valueCents / 100,
            description,
            payment_method_id: 'pix',
            date_of_expiration: new Date(expirationTime ? expirationTime * 1000 : Date.now() + 3600 * 1000).toISOString(),
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v1/payments`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarPagamentos(page = 1, registrationStartDate, registrationEndDate) {
        const params = {
            offset: (page - 1) * 20,
            limit: 20,
            range: 'date_created',
            begin_date: registrationStartDate,
            end_date: registrationEndDate,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/v1/payments/search`, {
            headers: this.getHeaders(),
            params,
        });
        return response.data;
    }
    async consultarPagamentoPorId(paymentId) {
        const response = await axios_1.default.get(`${this.baseUrl}/v1/payments/${paymentId}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async cadastrarPagamento(valueCents, receiverName, receiverDocument, pixKey, pixKeyType, authorized = false) {
        const payload = {
            transaction_amount: valueCents / 100,
            payment_method_id: pixKey ? 'pix' : 'bank_transfer',
            description: `Pagamento para ${receiverName}`,
            payer: {
                email: `${receiverDocument}@email.com`,
                identification: {
                    type: pixKeyType || 'CPF',
                    number: receiverDocument,
                },
            },
            pix_key: pixKey,
            statement_descriptor: 'Pagamento PIX',
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v1/payments`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async cadastrarWebhook(url, event) {
        const payload = {
            url,
            topics: [event],
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v1/webhooks`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        var valueCents = Number.isInteger(body.valueCents)
            ? body.valueCents
            : Math.round(body.valueCents * 100);
        var expireTimestamp = Math.round(new Date().getTime() / 1000 + (body.expires ?? 3600));
        await this.generateToken();
        var data = await this.gerarQrCode(valueCents, expireTimestamp);
        return {
            qrcode: data.point_of_interaction.transaction_data.qr_code,
            pixkey: data.point_of_interaction.transaction_data.qr_code_base64,
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
            code: data.id ?? (0, crypto_1.randomUUID)(),
        };
    }
    async listingPixBilling(body) {
        var data = await this.listarPagamentos(body.page ?? 1, body.registrationDateStart ?? new Date().toISOString(), body.registrationDateEnd ?? new Date().toISOString());
        data = data.results.map((mp) => {
            return {
                referenceCode: mp.id,
                valueCents: mp.transaction_amount * 100,
                content: mp.point_of_interaction.transaction_data.qr_code,
                status: mp.status,
                registrationDate: mp.date_created,
                paymentDate: mp.date_approved,
            };
        });
        return data;
    }
    async searchPixBilling(body) {
        var data = await this.consultarPagamentoPorId(body.reference);
        return {
            referenceCode: data.id,
            valueCents: data.transaction_amount * 100,
            status: data.status,
            registrationDate: data.date_created,
            paymentDate: data.date_approved,
        };
    }
}
exports.default = MercadoPagoProvider;

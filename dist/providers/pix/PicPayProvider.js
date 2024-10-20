"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
class PicPayProvider {
    baseUrl;
    token;
    providerInfo = {
        name: 'PicPay',
        description: 'A solução completa para pagamentos instantâneos e transferências.',
        documentation: 'https://ecommerce.picpay.com/doc/',
        isOnline: true,
        vendor: {
            name: 'PicPay',
            shotname: 'picpay',
            url: 'https://picpay.com',
            api: 'https://appws.picpay.com/ecommerce/public',
            versions: [
                {
                    name: 'br.com.picpay.api-v1',
                    version: '1.0.0',
                    path: '/',
                },
            ],
        },
    };
    constructor(configs) {
        this.token = configs.token;
        this.baseUrl = configs.isTest
            ? 'https://appws.picpay.com/ecommerce/public/sandbox'
            : 'https://appws.picpay.com/ecommerce/public';
    }
    getHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }
    async gerarCobranca(referenceId, value, callbackUrl, returnUrl, buyer) {
        const payload = {
            referenceId,
            value,
            callbackUrl,
            returnUrl,
            buyer,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/payments`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async consultarCobranca(referenceId) {
        const response = await axios_1.default.get(`${this.baseUrl}/payments/${referenceId}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async estornarPagamento(referenceId) {
        const response = await axios_1.default.post(`${this.baseUrl}/payments/${referenceId}/refunds`, {}, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        var valueCents = Number.isInteger(body.valueCents)
            ? body.valueCents
            : Math.round(body.valueCents * 100);
        var response = await this.gerarCobranca(body.pixkey, (valueCents / 100), body.callbackUrl, body.returnUrl, {
            firstName: body.name,
            lastName: body.lastName,
            document: body.document
        });
        return {
            qrcode: response.qrcode.base64,
            pixkey: body.pixkey,
            value: {
                original: body.valueCents,
                cents: valueCents,
                fixed: (valueCents / 100).toFixed(2),
                float: valueCents / 100,
            },
            expires: {
                timestamp: Math.floor(Date.now() / 1000 + body.expires),
                dateTime: new Date(Date.now() + body.expires * 1000).toLocaleString('pt-BR'),
                iso: new Date(Date.now() + body.expires * 1000).toISOString(),
            },
            code: response.referenceId,
        };
    }
    async searchPixBilling(body) {
        const data = await this.consultarCobranca(body.reference);
        return {
            referenceCode: data.referenceId,
            valueCents: data.value * 100,
            content: data.paymentUrl,
            status: data.status,
            registrationDate: data.createdAt,
            paymentDate: data.paidAt,
        };
    }
    listingPixBilling(body) {
        throw new Error('Method not implemented.');
    }
    async generateProviderWidthdraw(body) {
        return {
            reference_code: (0, crypto_1.randomUUID)(),
            idempotent_id: body.idempotentId,
            value_cents: body.valueCents,
            pix_key_type: body.pixKeyType || 'CPF',
            pix_key: body.pixKey || '99999999999',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: 'APPROVED',
        };
    }
    async listProviderWidthdraw(body) {
        return {
            payments: [
                {
                    referenceCode: (0, crypto_1.randomUUID)(),
                    idempotentId: 'idem123',
                    valueCents: 10000,
                    pixKeyType: 'CPF',
                    pixKey: '12345678901',
                    receiverName: 'Receiver Example',
                    receiverDocument: '98765432100',
                    status: 'COMPLETED',
                    registrationDate: new Date().toISOString(),
                    paymentDate: new Date().toISOString(),
                    cancellationDate: null,
                    cancellationReason: null,
                    endToEnd: 'E123456789012345678901234567890123456789012345',
                },
            ],
            meta: {
                current_page: body.page,
                total_pages: 1,
                total_items_amount: 1,
                total_value_cents: 10000,
            },
        };
    }
    searchProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
}
exports.default = PicPayProvider;

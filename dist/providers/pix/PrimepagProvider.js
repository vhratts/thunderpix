"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../../utils/all/index");
const querystring_1 = __importDefault(require("querystring"));
class PrimepagProvider {
    baseUrl;
    clientId;
    clientSecret;
    accessToken;
    providerInfo = {
        name: 'Primepag',
        description: 'O Banco Digital Completo para Suas Transações Financeiras. Simples, Seguro e Inovador.',
        documentation: 'https://primepag.com.br/desenvolvedores',
        isOnline: true,
        vendor: {
            name: 'Banco Primepag',
            shotname: 'prime',
            url: 'https://primepag.com.br',
            api: 'https://api.primepag.com.br',
            versions: [
                {
                    name: 'br.com.primepag.api-v1',
                    version: '1.2.9',
                    path: '/',
                }
            ],
        },
    };
    constructor(configs) {
        if (configs.isTest) {
            this.baseUrl = 'https://api-stg.primepag.com.br';
        }
        else {
            this.baseUrl = 'https://api.primepag.com.br';
        }
        this.clientId = configs.clientId;
        this.clientSecret = configs.clientSecret;
        this.accessToken = null;
    }
    async generateToken() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios_1.default.post(`${this.baseUrl}/auth/generate_token`, {
            grant_type: 'client_credentials',
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
    async gerarQrCode(valueCents, expirationTime, generatorName, generatorDocument) {
        const payload = {
            value_cents: valueCents,
            generator_name: generatorName,
            generator_document: generatorDocument,
            expiration_time: expirationTime,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v1/pix/qrcodes`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarQRCodes(page = 1, registrationStartDate, registrationEndDate, paymentStartDate, paymentEndDate) {
        const params = {
            page,
            registration_start_date: registrationStartDate,
            registration_end_date: registrationEndDate,
            payment_start_date: paymentStartDate,
            payment_end_date: paymentEndDate,
        };
        if (!params.payment_start_date) {
            delete params.payment_start_date;
        }
        if (!params.payment_end_date) {
            delete params.payment_end_date;
        }
        var query = querystring_1.default.encode(params);
        const response = await axios_1.default.get(`${this.baseUrl}/v1/pix/qrcodes?${query}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async consultarQrCodePorReferencia(referenceCode) {
        const response = await axios_1.default.get(`${this.baseUrl}/v1/pix/qrcodes/${referenceCode}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async consultarQrCodePorEndToEnd(endToEnd) {
        const response = await axios_1.default.get(`${this.baseUrl}/v1/pix/qrcodes/${endToEnd}/end_to_end`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async cadastrarPagamento(initiationType, idempotentId, valueCents, receiverName, receiverDocument, pixKeyType, pixKey, bankIspb, agency, account, accountType, authorized = false) {
        const payload = {
            initiation_type: initiationType,
            idempotent_id: idempotentId,
            value_cents: valueCents,
            receiver_name: receiverName,
            receiver_document: receiverDocument,
            pix_key_type: pixKeyType,
            pix_key: pixKey,
            receiver_bank_ispb: bankIspb,
            receiver_agency: agency,
            receiver_account: account,
            receiver_account_type: accountType,
            authorized,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v1/pix/payments`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarPagamentos(page = 1, registrationStartDate, registrationEndDate, paymentStartDate, paymentEndDate) {
        const params = {
            page,
            registration_start_date: registrationStartDate,
            registration_end_date: registrationEndDate,
            payment_start_date: paymentStartDate,
            payment_end_date: paymentEndDate,
        };
        if (!params.payment_start_date) {
            delete params.payment_start_date;
        }
        if (!params.payment_end_date) {
            delete params.payment_end_date;
        }
        var query = querystring_1.default.encode(params);
        const response = await axios_1.default.get(`${this.baseUrl}/v1/pix/payments?${query}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }
    async cadastrarWebhook(webhookTypeId, url, authorization) {
        const payload = {
            url,
            authorization,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/v1/webhooks/${webhookTypeId}`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async Balance() {
        const response = await axios_1.default.get(`${this.baseUrl}/v1/account/balance`, {
            headers: this.getHeaders(),
        });
        return {
            valueCents: response.data.account.value_cents,
            valueFloat: (response.data.account.value_cents / 100)
        };
    }
    async generatingPixBilling(body) {
        var valueCents = Number.isInteger(body.valueCents)
            ? body.valueCents
            : Math.round(body.valueCents * 100);
        var expireTimestamp = Math.round(new Date().getTime() / 1000 + (body.expires ?? 3600));
        await this.generateToken();
        var data = await this.gerarQrCode(valueCents, expireTimestamp);
        return {
            qrcode: data.qrcode.image_base64,
            pixkey: data.qrcode.content,
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
            code: data.qrcode.reference_code ?? (0, index_1.randomUUID)(),
        };
    }
    async listingPixBilling(body) {
        await this.generateToken();
        var data = await this.listarQRCodes(body.page ?? 1, body.registrationDateStart ?? new Date().toISOString(), body.registrationDateEnd ?? new Date().toISOString());
        data = data.qrcodes.map((mp) => {
            return {
                referenceCode: mp.reference_code,
                valueCents: mp.value_cents,
                content: mp.content,
                status: mp.status,
                generatorName: mp.generator_name,
                generatorDocument: mp.generator_document,
                payerName: mp.payer_name,
                payerDocument: mp.payer_document,
                registrationDate: mp.registration_date,
                paymentDate: mp.payment_date,
                endToEnd: mp.end_to_end,
            };
        });
        return data;
    }
    async searchPixBilling(body) {
        await this.generateToken();
        var data = await this.consultarQrCodePorReferencia(body.reference);
        var qrcode = {
            referenceCode: data.qrcode.reference_code,
            valueCents: data.qrcode.value_cents,
            content: data.qrcode.content,
            status: data.qrcode.status,
            generatorName: data.qrcode.generator_name,
            generatorDocument: data.qrcode.generator_document,
            payerName: data.qrcode.payer_name,
            payerDocument: data.qrcode.payer_document,
            payerBankName: data.qrcode.payer_bank_name,
            payerAgency: data.qrcode.payer_agency,
            payerAccount: data.qrcode.payer_account,
            payerAccountType: data.qrcode.payer_account_type,
            registrationDate: data.qrcode.registration_date,
            paymentDate: data.qrcode.payment_date,
            endToEnd: data.qrcode.end_to_end,
        };
        return qrcode;
    }
    async generateProviderWidthdraw(body) {
        await this.generateToken();
        var data = await this.cadastrarPagamento(body.initiationType, body.idempotentId, body.valueCents, body.receiverName, body.receiverDocument, body.pixKeyType, body.pixKey, body.bankIspb, body.agency, body.account, body.accountType, body.authorized ?? true);
        return data.payment;
    }
    async listProviderWidthdraw(body) {
        await this.generateToken();
        var data = await this.listarPagamentos(body.page, body.registrationDateStart, body.registrationDateEnd, body.paymentStartDate, body.paymentEndDate);
        data = data.payments.map((mp) => {
            return {
                referenceCode: mp.reference_code,
                idempotentId: mp.idempotent_id,
                valueCents: mp.value_cents,
                pixKeyType: mp.pix_key_type,
                pixKey: mp.pix_key,
                receiverName: mp.receiver_name,
                receiverDocument: mp.receiver_document,
                status: mp.status,
                registrationDate: mp.registration_date,
                paymentDate: mp.payment_date,
                cancellationDate: mp.cancellation_date,
                cancellationReason: mp.cancellation_reason,
                endToEnd: mp.end_to_end,
            };
        });
        return data;
    }
    async getBalance() {
        await this.generateToken();
        return await this.Balance();
    }
    async searchProviderWidthdraw(body) {
        await this.generateToken();
        return {
            search: []
        };
    }
}
exports.default = PrimepagProvider;

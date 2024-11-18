"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const index_js_1 = require("../../utils/all/index.js");
const PixProvider_1 = __importDefault(require("./PixProvider"));
class CieloPixProvider {
    baseUrl;
    clientId;
    clientSecret;
    accessToken;
    providerInfo = {
        name: 'Cielo',
        description: 'A solução completa de PIX para o seu negócio.',
        documentation: 'https://developercielo.github.io/manual/cielo-ecommerce',
        isOnline: true,
        vendor: {
            name: 'Cielo',
            shotname: 'cielo',
            url: 'https://www.cielo.com.br',
            api: 'https://api.cieloecommerce.cielo.com.br',
            versions: [
                {
                    name: 'br.com.cielo.api-v1',
                    version: '1.0.0',
                    path: '/',
                },
            ],
        },
    };
    constructor(configs) {
        if (configs.isTest) {
            this.baseUrl = 'https://apisandbox.cieloecommerce.cielo.com.br';
        }
        else {
            this.baseUrl = 'https://api.cieloecommerce.cielo.com.br';
        }
        this.clientId = configs.clientId;
        this.clientSecret = configs.clientSecret;
        this.accessToken = null;
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
            'MerchantId': this.clientId,
            'MerchantKey': this.clientSecret,
        };
    }
    async gerarQrCodePix(valueCents, body) {
        const payload = {
            MerchantOrderId: (0, index_js_1.randomUUID)(),
            Payment: {
                Type: 'Pix',
                Amount: valueCents,
                Description: body.description,
                ExpirationDate: new Date(body.expires * 1000).toISOString(),
                PixKey: body.pixkey,
                CallbackUrl: body.callbackUrl,
                ReturnUrl: body.returnUrl,
                Customer: {
                    Name: body.name,
                    Identity: body.document,
                    IdentityType: "CPF",
                    Email: body.email,
                    Phone: body.phone,
                    LastName: body.lastName,
                },
            },
        };
        const response = await axios_1.default.post(`${this.baseUrl}/1/sales`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarPix(page = 1, registrationStartDate, registrationEndDate) {
        const params = {
            page,
            registration_start_date: registrationStartDate,
            registration_end_date: registrationEndDate,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/1/sales`, {
            headers: this.getHeaders(),
            params,
        });
        return response.data;
    }
    async consultarPixPorReferencia(referenceCode) {
        const response = await axios_1.default.get(`${this.baseUrl}/1/sales/${referenceCode}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async estornarPix(referenceCode) {
        const response = await axios_1.default.put(`${this.baseUrl}/1/sales/${referenceCode}/void`, {}, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        var valueCents = Math.round(body.valueCents);
        await this.generateToken();
        const data = await this.gerarQrCodePix(valueCents, body);
        return {
            qrcode: data.Payment.QrCodeString,
            pixkey: data.Payment.Pix.CopiaCola,
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
            code: data.Payment.PaymentId,
        };
    }
    async listingPixBilling(body) {
        var data = await this.listarPix(body.page ?? 1, body.registrationDateStart ?? new Date().toISOString(), body.registrationDateEnd ?? new Date().toISOString());
        data = data.Payments.map((mp) => {
            return {
                referenceCode: mp.PaymentId,
                valueCents: mp.Amount,
                content: mp.QrCodeString,
                status: mp.Status,
                generatorName: mp.Customer.Name,
                generatorDocument: mp.Customer.Identity,
                payerName: mp.Payer?.Name || 'N/A',
                payerDocument: mp.Payer?.Identity || 'N/A',
                registrationDate: mp.DateCreated,
                paymentDate: mp.DatePaid || null,
                endToEnd: mp.EndToEndId || 'N/A',
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
        var data = await this.consultarPixPorReferencia(body.reference);
        return {
            referenceCode: data.PaymentId,
            valueCents: data.Amount,
            status: data.Status,
            registrationDate: data.DateCreated,
            paymentDate: data.DatePaid || null,
            generatorName: data.Customer.Name,
            generatorDocument: data.Customer.Identity,
        };
    }
    async generateProviderWidthdraw(body) {
        const payload = {
            correlationId: (0, index_js_1.randomUUID)(),
            value: body.valueCents,
            pixKey: body.pixKey,
            description: `Saque para ${body.receiverName}`,
            bankAccount: {
                agency: body.agency,
                account: body.account,
                accountType: body.accountType,
                bankIspb: body.bankIspb,
            },
        };
        const response = await axios_1.default.post(`${this.baseUrl}/1/subaccounts/withdraw`, payload, {
            headers: this.getHeaders(),
        });
        const withdrawal = response.data;
        return {
            reference_code: withdrawal.correlationId,
            idempotent_id: body.idempotentId,
            value_cents: withdrawal.value,
            pix_key_type: withdrawal.pixKeyType,
            pix_key: withdrawal.pixKey,
            receiver_name: withdrawal.receiverName,
            receiver_document: withdrawal.receiverDocument,
            status: withdrawal.status,
        };
    }
    async listProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/1/subaccounts/withdrawals`, {
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
            referenceCode: withdrawal.correlationId,
            idempotentId: withdrawal.correlationId,
            valueCents: withdrawal.value,
            pixKeyType: new PixProvider_1.default({ pixkey: withdrawal.pixKey }).determinePixType().type,
            pixKey: withdrawal.pixKey,
            receiverName: withdrawal.receiverName,
            receiverDocument: withdrawal.receiverDocument,
            status: withdrawal.status,
            registrationDate: withdrawal.createdAt,
            paymentDate: withdrawal.paidAt,
            cancellationDate: withdrawal.cancellationDate || null,
            cancellationReason: withdrawal.cancellationReason || null,
            endToEnd: withdrawal.endToEndId || 'N/A',
        }));
        return {
            payments,
            meta: {
                current_page: body.page || 1,
                total_pages: Math.ceil(response.data.TotalItems / 20),
                total_items_amount: payments.length,
                total_value_cents: payments.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async getBalance() {
        return {
            valueCents: 0,
            valueFloat: 0.0
        };
    }
    async searchProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/1/subaccounts/withdraw/${body.correlationID}`, {
            headers: this.getHeaders(),
        });
        const data = response.data.withdrawal;
        return {
            referenceCode: data.correlationId,
            idempotentId: data.correlationId,
            valueCents: data.value,
            pixKeyType: new PixProvider_1.default({ pixkey: data.pixKey }).determinePixType().type,
            pixKey: data.pixKey,
            receiverName: data.receiverName,
            receiverDocument: data.receiverDocument,
            status: data.status,
            registrationDate: data.createdAt,
            paymentDate: data.paidAt,
            cancellationDate: data.cancellationDate || null,
            endToEnd: data.endToEndId || 'N/A',
        };
    }
}
exports.default = CieloPixProvider;

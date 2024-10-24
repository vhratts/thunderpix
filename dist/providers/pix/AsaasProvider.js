"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class AsaasProvider {
    baseUrl;
    apiKey;
    providerInfo = {
        name: 'Asaas',
        description: 'Plataforma brasileira de gestão financeira e pagamentos online.',
        documentation: 'https://asaasv3.docs.apiary.io/',
        isOnline: true,
        vendor: {
            name: 'Asaas',
            shotname: 'asaas',
            url: 'https://www.asaas.com',
            api: 'https://www.asaas.com/api',
            versions: [
                {
                    name: 'br.com.asaas.api-v3',
                    version: 'v3',
                    path: '/v3',
                },
            ],
        },
    };
    constructor(configs) {
        this.apiKey = configs.apiKey;
        this.baseUrl = configs.isTest
            ? 'https://sandbox.asaas.com/api/v3'
            : 'https://www.asaas.com/api/v3';
    }
    listingPixBilling(body) {
        throw new Error('Method not implemented.');
    }
    searchPixBilling(body) {
        throw new Error('Method not implemented.');
    }
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'access_token': this.apiKey,
        };
    }
    async gerarQrCodePix(valueCents, description, customer) {
        const payload = {
            customer: {
                name: customer.name,
                cpfCnpj: customer.document,
                email: customer.email,
                phone: customer.phone,
            },
            billingType: 'PIX',
            value: valueCents / 100,
            description,
            dueDate: new Date().toISOString().split('T')[0],
        };
        const response = await axios_1.default.post(`${this.baseUrl}/payments`, payload, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async listarCobrancas(page = 1, startDate, endDate) {
        const params = {
            offset: (page - 1) * 10,
            limit: 10,
            dateCreated: startDate ? `${startDate},${endDate}` : undefined,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/payments`, {
            headers: this.getHeaders(),
            params,
        });
        return response.data;
    }
    async consultarCobrancaPorId(paymentId) {
        const response = await axios_1.default.get(`${this.baseUrl}/payments/${paymentId}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async estornarCobranca(paymentId) {
        const response = await axios_1.default.post(`${this.baseUrl}/payments/${paymentId}/refund`, {}, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
    async generatingPixBilling(body) {
        const valueCents = Math.round(body.valueCents);
        const data = await this.gerarQrCodePix(valueCents, body.description, {
            name: body.name,
            email: body.email,
            phone: body.phone,
            document: body.document,
        });
        return {
            qrcode: data.pixQrCode,
            pixkey: data.pixQrCodeId,
            value: {
                original: body.valueCents,
                cents: valueCents,
                fixed: (valueCents / 100).toFixed(2),
                float: valueCents / 100,
            },
            expires: {
                timestamp: new Date().getTime() / 1000 + 3600,
                dateTime: new Date().toLocaleString('pt-BR'),
                iso: new Date().toISOString(),
            },
            code: data.id,
        };
    }
    async getBalance() {
        const response = await axios_1.default.get(`${this.baseUrl}/finance/balance`, {
            headers: this.getHeaders(),
        });
        const balance = response.data;
        return {
            valueCents: Math.round(balance.balance * 100),
            valueFloat: balance.balance,
        };
    }
    async listProviderWidthdraw(body) {
        const params = {
            offset: (body.page - 1) * 10,
            limit: 10,
            startDate: body.registrationDateStart,
            endDate: body.registrationDateEnd,
        };
        const response = await axios_1.default.get(`${this.baseUrl}/transfers`, {
            headers: this.getHeaders(),
            params,
        });
        const withdrawals = response.data.data.map((withdrawal) => ({
            referenceCode: withdrawal.id,
            idempotentId: withdrawal.id,
            valueCents: withdrawal.value * 100,
            pixKeyType: 'CPF',
            pixKey: withdrawal.bankAccount,
            receiverName: withdrawal.name,
            receiverDocument: withdrawal.cpfCnpj,
            status: withdrawal.status,
            registrationDate: withdrawal.dateCreated,
            paymentDate: withdrawal.datePayment,
        }));
        return {
            payments: withdrawals,
            meta: {
                current_page: body.page,
                total_pages: Math.ceil(response.data.totalCount / 10),
                total_items_amount: response.data.totalCount,
                total_value_cents: withdrawals.reduce((acc, curr) => acc + curr.valueCents, 0),
            },
        };
    }
    async generateProviderWidthdraw(body) {
        const payload = {
            bankAccount: body.pixKey,
            value: (body.valueCents / 100).toFixed(2),
            description: `Saque para ${body.receiverName}`,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/transfers`, payload, {
            headers: this.getHeaders(),
        });
        return {
            reference_code: response.data.id,
            idempotent_id: body.idempotentId,
            value_cents: body.valueCents,
            pix_key_type: body.pixKeyType || 'NA',
            pix_key: body.pixKey || 'NA',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: response.data.status,
        };
    }
    async searchProviderWidthdraw(body) {
        const response = await axios_1.default.get(`${this.baseUrl}/transfers/${body.correlationId}`, {
            headers: this.getHeaders(),
        });
        const withdrawal = response.data;
        return {
            referenceCode: withdrawal.id,
            idempotentId: withdrawal.id,
            valueCents: withdrawal.value * 100,
            pixKeyType: 'CPF',
            pixKey: withdrawal.bankAccount,
            receiverName: withdrawal.name,
            receiverDocument: withdrawal.cpfCnpj,
            status: withdrawal.status,
            registrationDate: withdrawal.dateCreated,
            paymentDate: withdrawal.datePayment,
        };
    }
}
exports.default = AsaasProvider;

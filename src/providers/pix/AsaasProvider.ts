import axios from 'axios';
import ProviderInterface from '../../interfaces/ProviderInterface';
import { randomUUID } from 'crypto';

interface ProviderConstruct {
    apiKey: string;
    isTest: boolean;
}

export default class AsaasProvider implements ProviderInterface {
    private baseUrl: string;
    private apiKey: string;

    public providerInfo = {
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

    constructor(configs: ProviderConstruct) {
        this.apiKey = configs.apiKey;
        this.baseUrl = configs.isTest
            ? 'https://sandbox.asaas.com/api/v3'
            : 'https://www.asaas.com/api/v3';
    }
    listingPixBilling(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }
    searchPixBilling(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    // Função auxiliar para configurar os headers com token de autorização
    private getHeaders(): any {
        return {
            'Content-Type': 'application/json',
            'access_token': this.apiKey,
        };
    }

    // Geração de cobrança via PIX (Assas)
    async gerarQrCodePix(
        valueCents: number,
        description: string,
        customer: {
            name: string;
            email: string;
            phone: string;
            document: string;
        }
    ) {
        const payload = {
            customer: {
                name: customer.name,
                cpfCnpj: customer.document,
                email: customer.email,
                phone: customer.phone,
            },
            billingType: 'PIX',
            value: valueCents / 100, // Valor em reais
            description,
            dueDate: new Date().toISOString().split('T')[0], // Data de vencimento
        };

        const response = await axios.post(`${this.baseUrl}/payments`, payload, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Listar cobranças
    async listarCobrancas(page: number = 1, startDate?: string, endDate?: string) {
        const params = {
            offset: (page - 1) * 10,
            limit: 10,
            dateCreated: startDate ? `${startDate},${endDate}` : undefined,
        };

        const response = await axios.get(`${this.baseUrl}/payments`, {
            headers: this.getHeaders(),
            params,
        });

        return response.data;
    }

    // Consultar cobrança por ID
    async consultarCobrancaPorId(paymentId: string) {
        const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Estornar cobrança PIX
    async estornarCobranca(paymentId: string) {
        const response = await axios.post(
            `${this.baseUrl}/payments/${paymentId}/refund`,
            {},
            {
                headers: this.getHeaders(),
            }
        );

        return response.data;
    }

    // Função para gerar cobrança Pix e retorno formatado
    async generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object> {
        const valueCents = Math.round(body.valueCents);

        const data = await this.gerarQrCodePix(valueCents, body.description, {
            name: body.name,
            email: body.email,
            phone: body.phone,
            document: body.document,
        });

        return {
            qrcode: data.pixQrCode, // QR Code em base64
            pixkey: data.pixQrCodeId, // ID da transação PIX
            value: {
                original: body.valueCents,
                cents: valueCents,
                fixed: (valueCents / 100).toFixed(2),
                float: valueCents / 100,
            },
            expires: {
                timestamp: new Date().getTime() / 1000 + 3600, // 1 hora
                dateTime: new Date().toLocaleString('pt-BR'),
                iso: new Date().toISOString(),
            },
            code: data.id, // Código de referência
        };
    }

    // Consultar saldo da conta Asaas
    async getBalance(): Promise<BalanceOutput> {
        const response = await axios.get(`${this.baseUrl}/finance/balance`, {
            headers: this.getHeaders(),
        });

        const balance = response.data;

        return {
            valueCents: Math.round(balance.balance * 100), // Converte para centavos
            valueFloat: balance.balance, // Valor decimal
        };
    }

    // Listar saques (withdrawals)
    async listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput> {
        const params = {
            offset: (body.page - 1) * 10,
            limit: 10,
            startDate: body.registrationDateStart,
            endDate: body.registrationDateEnd,
        };

        const response = await axios.get(`${this.baseUrl}/transfers`, {
            headers: this.getHeaders(),
            params,
        });

        const withdrawals = response.data.data.map((withdrawal: any) => ({
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
                total_value_cents: withdrawals.reduce((acc: any, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }

    // Função de saque (withdrawal)
    async generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput> {
        const payload = {
            bankAccount: body.pixKey,
            value: (body.valueCents / 100).toFixed(2),
            description: `Saque para ${body.receiverName}`,
        };

        const response = await axios.post(`${this.baseUrl}/transfers`, payload, {
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

    // Consultar saque por referência
    async searchProviderWidthdraw(body: { correlationId: string }): Promise<Object> {
        const response = await axios.get(`${this.baseUrl}/transfers/${body.correlationId}`, {
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

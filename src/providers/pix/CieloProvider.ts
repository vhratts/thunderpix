import axios from 'axios';
import ProviderInterface from '../../interfaces/ProviderInterface';
import { randomUUID } from '../../utils/all/index';
import PixProvider from './PixProvider';

interface ProviderConstruct {
    clientId: string,
    clientSecret: string,
    isTest: boolean | false
}

export default class CieloPixProvider implements ProviderInterface {
    private baseUrl: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null;
    public providerInfo = {
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

    constructor(configs: ProviderConstruct) {
        if (configs.isTest) {
            this.baseUrl = 'https://apisandbox.cieloecommerce.cielo.com.br';
        } else {
            this.baseUrl = 'https://api.cieloecommerce.cielo.com.br';
        }

        this.clientId = configs.clientId;
        this.clientSecret = configs.clientSecret;
        this.accessToken = null;
    }

    // Gera o token de acesso usando OAuth2.0 (caso necessário)
    async generateToken(): Promise<void> {
        const auth = Buffer.from(
            `${this.clientId}:${this.clientSecret}`,
        ).toString('base64');
        const response = await axios.post(
            `${this.baseUrl}/oauth/token`,
            {
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
            },
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        this.accessToken = response.data.access_token;
    }

    // Função auxiliar para configurar os headers com token de autorização
    private getHeaders(): any {
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

    // Geração de QRCode para pagamento via PIX
    async gerarQrCodePix(
        valueCents: number,
        body: PixGeneratingPixBillingInterface
    ) {
        const payload = {
            MerchantOrderId: randomUUID(),
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

        const response = await axios.post(`${this.baseUrl}/1/sales`, payload, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Listar cobranças PIX
    async listarPix(
        page: number = 1,
        registrationStartDate?: string,
        registrationEndDate?: string,
    ) {
        const params = {
            page,
            registration_start_date: registrationStartDate,
            registration_end_date: registrationEndDate,
        };

        const response = await axios.get(`${this.baseUrl}/1/sales`, {
            headers: this.getHeaders(),
            params,
        });

        return response.data;
    }

    // Consultar cobrança PIX por referência
    async consultarPixPorReferencia(referenceCode: string) {
        const response = await axios.get(`${this.baseUrl}/1/sales/${referenceCode}`, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Estornar uma cobrança PIX
    async estornarPix(referenceCode: string) {
        const response = await axios.put(`${this.baseUrl}/1/sales/${referenceCode}/void`, {}, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Função para gerar cobrança PIX com retorno formatado
    async generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object> {
        var valueCents: number = Math.round(body.valueCents);

        await this.generateToken();

        const data = await this.gerarQrCodePix(valueCents, body);

        // A chave Copia-e-Cola será retornada pelo endpoint da Cielo
        return {
            qrcode: data.Payment.QrCodeString,  // Conteúdo do QR Code gerado
            pixkey: data.Payment.Pix.CopiaCola,  // Chave Copia-e-Cola gerada
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
            code: data.Payment.PaymentId,  // Código de referência da transação
        };
    }

    // Função para listar cobranças PIX
    async listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput> {
        var data = await this.listarPix(
            body.page ?? 1,
            body.registrationDateStart ?? new Date().toISOString(),
            body.registrationDateEnd ?? new Date().toISOString(),
        );

        data = data.Payments.map((mp: any) => {
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
                total_value_cents: data.reduce((acc: number, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }

    async searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput> {
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

    // Função para cadastrar pagamento manual (não implementado, mas deixado como exemplo)
    // Geração de saque Pix (withdrawal)
    async generateProviderWidthdraw(
        body: PixGenerateProviderWidthdraw
    ): Promise<generateProviderWidthdrawOutput> {
        const payload = {
            correlationId: randomUUID(),
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

        const response = await axios.post(`${this.baseUrl}/1/subaccounts/withdraw`, payload, {
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

    // Listar saques realizados (withdraw)
    async listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput> {
        const response = await axios.get(`${this.baseUrl}/1/subaccounts/withdrawals`, {
            headers: this.getHeaders(),
            params: {
                page: body.page,
                registrationStartDate: body.registrationDateStart,
                registrationEndDate: body.registrationDateEnd,
                paymentStartDate: body.paymentStartDate,
                paymentEndDate: body.paymentEndDate,
            },
        });

        const payments = response.data.withdrawals.map((withdrawal: any) => ({
            referenceCode: withdrawal.correlationId,
            idempotentId: withdrawal.correlationId,
            valueCents: withdrawal.value,
            pixKeyType: new PixProvider({pixkey: withdrawal.pixKey}).determinePixType().type, // Exemplo: CPF/CNPJ
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
                total_value_cents: payments.reduce((acc: number, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }

    async getBalance(): Promise<BalanceOutput> {
        return {
            valueCents: 0,
            valueFloat: 0.0
        };
    }

    // Consultar saque por referência
    async searchProviderWidthdraw(body: { correlationID: string }): Promise<Object> {
        const response = await axios.get(`${this.baseUrl}/1/subaccounts/withdraw/${body.correlationID}`, {
            headers: this.getHeaders(),
        });

        const data = response.data.withdrawal;

        return {
            referenceCode: data.correlationId,
            idempotentId: data.correlationId,
            valueCents: data.value,
            pixKeyType: new PixProvider({pixkey: data.pixKey}).determinePixType().type,  // Exemplo
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

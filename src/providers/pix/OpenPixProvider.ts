import axios from 'axios';
import ProviderInterface from '../../interfaces/ProviderInterface';
import { randomUUID } from 'crypto';

interface ProviderConstruct {
    apiKey: string,
    isTest: boolean | false
}

export default class OpenPixProvider implements ProviderInterface {
    private baseUrl: string;
    private apiKey: string;
    public providerInfo = {
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
                }
            ],
        },
    };

    constructor(configs: ProviderConstruct) {
        this.baseUrl = configs.isTest ? 'https://sandbox.openpix.com.br' : 'https://api.openpix.com.br';
        this.apiKey = configs.apiKey;
    }

    // Função auxiliar para configurar os headers de autorização
    private getHeaders(): any {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    // Geração de cobrança via Pix com chave Copia-e-Cola
    async gerarQrCodePix(
        valueCents: number,
        description: string,
        customer: {
            name: string,
            document: string,
            email: string,
            phone: string,
            city: string
        }
    ) {
        const payload = {
            correlationID: randomUUID(),
            value: valueCents, // Valor em centavos
            comment: description,
            customer: {
                name: customer.name,
                email: customer.email,
                taxID: customer.document,
                phone: customer.phone,
            },
        };

        const response = await axios.post(`${this.baseUrl}/api/v1/charge`, payload, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Listar cobranças Pix
    async listarCobrancas(
        page: number = 1,
        registrationStartDate?: string,
        registrationEndDate?: string
    ) {
        const params = {
            page,
            startDate: registrationStartDate,
            endDate: registrationEndDate,
        };

        const response = await axios.get(`${this.baseUrl}/api/v1/charge`, {
            headers: this.getHeaders(),
            params,
        });

        return response.data;
    }

    // Consultar cobrança Pix por ID
    async consultarCobrancaPorID(correlationID: string) {
        const response = await axios.get(`${this.baseUrl}/api/v1/charge/${correlationID}`, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Estornar uma cobrança Pix
    async estornarCobranca(correlationID: string) {
        const response = await axios.post(`${this.baseUrl}/api/v1/charge/${correlationID}/refund`, {}, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Geração de cobrança Pix com retorno formatado
    async generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object> {
        const valueCents = Math.round(body.valueCents);

        const data = await this.gerarQrCodePix(valueCents, body.description, {
            name: body.name,
            document: body.document,
            email: body.email,
            phone: body.phone,
            city: body.city,
        });

        return {
            qrcode: data.charge.qrCodeImage,  // QR Code gerado em base64
            pixkey: data.charge.brCode,  // Chave Copia-e-Cola
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
            code: data.charge.correlationID,  // Código de transação
        };
    }

    // Função para listar cobranças Pix
    async listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput> {
        const data = await this.listarCobrancas(
            body.page ?? 1,
            body.registrationDateStart ?? new Date().toISOString(),
            body.registrationDateEnd ?? new Date().toISOString()
        );

        const cobrancas = data.charges.map((mp: any) => ({
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
                total_value_cents: cobrancas.reduce((acc: number, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }

    async searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput> {
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

    // Cadastrar pagamento manual (não suportado diretamente pela OpenPix)
    async generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput> {
        return {
            reference_code: randomUUID(),
            idempotent_id: body.idempotentId,
            value_cents: body.valueCents,
            pix_key_type: body.pixKeyType || 'CPF',
            pix_key: body.pixKey || '12345678901',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: 'APPROVED',
        };
    }

    // Listar pagamentos (não diretamente suportado pela OpenPix)
    async listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput> {
        const response = await axios.get(`${this.baseUrl}/api/v1/subaccount/withdraw`, {
            headers: this.getHeaders(),
            params: {
                page: body.page,
                registrationStartDate: body.registrationStartDate,
                registrationEndDate: body.registrationEndDate,
                paymentStartDate: body.paymentStartDate,
                paymentEndDate: body.paymentEndDate,
            }
        });
    
        const payments = response.data.withdrawals.map((withdrawal: any) => ({
            referenceCode: withdrawal.correlationID,
            idempotentId: withdrawal.correlationID,
            valueCents: withdrawal.value,
            pixKeyType: 'CPF',  // Exemplo
            pixKey: withdrawal.destinationAlias,
            receiverName: withdrawal.comment || 'Desconhecido',
            receiverDocument: 'Não disponível',  // Depende do campo disponível
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
                total_pages: 1, // Calcular se necessário
                total_items_amount: payments.length,
                total_value_cents: payments.reduce((acc: number, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }
    

    async searchProviderWidthdraw(body: { correlationID: string }): Promise<Object> {
        const response = await axios.get(`${this.baseUrl}/api/v1/subaccount/withdraw/${body.correlationID}`, {
            headers: this.getHeaders(),
        });
    
        const data = response.data.withdrawal;
    
        return {
            referenceCode: data.correlationID,
            idempotentId: data.correlationID,
            valueCents: data.value,
            pixKeyType: 'CPF',  // Exemplo
            pixKey: data.destinationAlias,
            receiverName: data.comment || 'Desconhecido',
            receiverDocument: 'Não disponível',  // Depende do campo disponível
            status: data.status,
            registrationDate: data.createdAt,
            paymentDate: data.paymentDate,
            endToEnd: data.transactionID || 'N/A',
        };
    }    
}

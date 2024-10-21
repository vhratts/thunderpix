import axios from 'axios';
import ProviderInterface from '../../interfaces/ProviderInterface';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

interface ProviderConstruct {
    clientId: string;
    clientSecret: string;
    certificatePath: string;
    isTest: boolean;
}

export default class EfiPayProvider implements ProviderInterface {
    private baseUrl: string;
    private clientId: string;
    private clientSecret: string;
    private certificatePath: string;
    private accessToken: string | null;

    public providerInfo = {
        name: 'EfiPay',
        description: 'Plataforma de pagamentos Pix via API.',
        documentation: 'https://dev.efipay.com.br/docs/api-pix/',
        isOnline: true,
        vendor: {
            name: 'EfiPay',
            shotname: 'efipay',
            url: 'https://www.efipay.com.br',
            api: 'https://api.efipay.com.br',
            versions: [
                {
                    name: 'br.com.efipay.api-v1',
                    version: '1.0.0',
                    path: '/',
                }
            ],
        },
    };

    constructor(configs: ProviderConstruct) {
        this.baseUrl = configs.isTest ? 'https://pix-h.api.efipay.com.br' : 'https://pix.api.efipay.com.br';
        this.clientId = configs.clientId;
        this.clientSecret = configs.clientSecret;
        this.certificatePath = configs.certificatePath;
        this.accessToken = null;
    }
    searchPixBilling(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    // Autenticação OAuth2.0
    async generateToken(): Promise<void> {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios.post(
            `${this.baseUrl}/oauth/token`,
            { grant_type: 'client_credentials' },
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                httpsAgent: new (require('https').Agent)({
                    pfx: fs.readFileSync(this.certificatePath),
                    passphrase: '', // Senha do certificado se houver
                }),
            }
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
        };
    }

    // Geração de cobrança Pix (Pix Cob)
    async gerarCobPix(
        valueCents: number,
        description: string,
        customer: {
            name: string,
            document: string,
            email: string,
            phone: string
        }
    ) {
        const payload = {
            calendario: {
                expiracao: 3600
            },
            devedor: {
                cpf: customer.document,
                nome: customer.name
            },
            valor: {
                original: (valueCents / 100).toFixed(2) // Valor em reais
            },
            chave: randomUUID(), // Chave Pix ou chave aleatória
            infoAdicionais: [
                { nome: 'Descrição', valor: description }
            ]
        };

        const response = await axios.post(`${this.baseUrl}/v2/cob`, payload, {
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
            inicio: registrationStartDate || new Date().toISOString(),
            fim: registrationEndDate || new Date().toISOString(),
            paginaAtual: page,
        };

        const response = await axios.get(`${this.baseUrl}/v2/cob`, {
            headers: this.getHeaders(),
            params,
        });

        return response.data;
    }

    // Consultar cobrança Pix por ID
    async consultarCobrancaPorID(txid: string) {
        const response = await axios.get(`${this.baseUrl}/v2/cob/${txid}`, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Estornar uma cobrança Pix
    async estornarCobranca(txid: string) {
        const response = await axios.post(`${this.baseUrl}/v2/pix/${txid}/devolucao`, {
            valor: '10.00', // Valor do estorno
        }, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Geração de cobrança com Pix (Cob)
    async generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object> {
        const valueCents = Math.round(body.valueCents);
        await this.generateToken();

        const data = await this.gerarCobPix(valueCents, body.description, {
            name: body.name,
            document: body.document,
            email: body.email,
            phone: body.phone,
        });

        return {
            qrcode: data.pix.qrcode,  // QR Code gerado em base64
            pixkey: data.pix.txid,    // Transaction ID do Pix
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
            code: data.txid,  // Código de transação
        };
    }

    // Listar cobranças Pix
    async listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput> {
        const data = await this.listarCobrancas(
            body.page ?? 1,
            body.registrationDateStart ?? new Date().toISOString(),
            body.registrationDateEnd ?? new Date().toISOString()
        );

        const cobrancas = data.cobs.map((mp: any) => ({
            referenceCode: mp.txid,
            valueCents: mp.valor.original * 100,
            content: mp.qrcode,
            status: mp.status,
            generatorName: mp.devedor.nome,
            generatorDocument: mp.devedor.cpf,
            registrationDate: mp.calendario.criacao,
            paymentDate: mp.calendario.expiracao,
            endToEnd: mp.endToEndId || 'N/A',
        }));

        return {
            qrcodes: cobrancas,
            meta: {
                current_page: body.page || 1,
                total_pages: Math.ceil(data.total / 20),
                total_items_amount: data.total,
                total_value_cents: cobrancas.reduce((acc: number, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }

    // Função de saque (withdraw)
    async generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput> {
        const payload = {
            valor: (body.valueCents / 100).toFixed(2),
            chave: body.pixKey,
            descricao: `Saque para ${body.receiverName}`,
        };

        const response = await axios.post(`${this.baseUrl}/v2/pix`, payload, {
            headers: this.getHeaders(),
        });

        const withdrawal = response.data;
        return {
            reference_code: withdrawal.txid,
            idempotent_id: body.idempotentId,
            value_cents: withdrawal.valor * 100,
            pix_key_type: body.pixKeyType || 'CPF',
            pix_key: body.pixKey ?? '',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: withdrawal.status,
        };
    }

    // Listar saques (withdrawals)
    async listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput> {
        const params = {
            inicio: body.registrationStartDate || new Date().toISOString(),
            fim: body.registrationEndDate || new Date().toISOString(),
            page: body.page,
        };

        const response = await axios.get(`${this.baseUrl}/v2/withdrawals`, {
            headers: this.getHeaders(),
            params,
        });

        const withdrawals = response.data.withdrawals.map((withdrawal: any) => ({
            referenceCode: withdrawal.txid,
            idempotentId: withdrawal.correlationId,
            valueCents: Math.round(withdrawal.valor * 100),
            pixKeyType: withdrawal.pixKeyType || 'CPF',
            pixKey: withdrawal.pixKey,
            receiverName: withdrawal.receiverName,
            receiverDocument: withdrawal.receiverDocument,
            status: withdrawal.status,
            registrationDate: withdrawal.created_at,
            paymentDate: withdrawal.paid_at || null,
            cancellationDate: withdrawal.cancelled_at || null,
            cancellationReason: withdrawal.cancellation_reason || null,
            endToEnd: withdrawal.endToEndId || 'N/A',
        }));

        return {
            payments: withdrawals,
            meta: {
                current_page: body.page || 1,
                total_pages: response.data.paginacao.total_pages,
                total_items_amount: response.data.paginacao.total_items,
                total_value_cents: withdrawals.reduce((acc: number, curr: any) => acc + curr.valueCents, 0),
            },
        };
    }

    // Consultar saque por referência
    async searchProviderWidthdraw(body: { correlationId: string }): Promise<Object> {
        const response = await axios.get(`${this.baseUrl}/v2/withdrawals/${body.correlationId}`, {
            headers: this.getHeaders(),
        });

        const withdrawal = response.data;

        return {
            referenceCode: withdrawal.txid,
            idempotentId: withdrawal.correlationId,
            valueCents: Math.round(withdrawal.valor * 100),
            pixKeyType: withdrawal.pixKeyType || 'CPF',
            pixKey: withdrawal.pixKey,
            receiverName: withdrawal.receiverName,
            receiverDocument: withdrawal.receiverDocument,
            status: withdrawal.status,
            registrationDate: withdrawal.created_at,
            paymentDate: withdrawal.paid_at || null,
            cancellationDate: withdrawal.cancelled_at || null,
            endToEnd: withdrawal.endToEndId || 'N/A',
        };
    }
}

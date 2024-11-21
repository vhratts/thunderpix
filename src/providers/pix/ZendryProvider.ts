import axios from 'axios';
import ProviderInterface from '../../interfaces/ProviderInterface';
import { randomUUID } from '../../utils/all/index';
import qs from "../../utils/QueryString/index";

interface ProviderConstruct {
    clientId: string,
    clientSecret: string,
    isTest: boolean | false
}

export default class ZendryProvider implements ProviderInterface {
    private baseUrl: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null;
    public providerInfo = {
        name: 'Zendry',
        description: 'O Banco Digital Completo para Suas Transações Financeiras. Simples, Seguro e Inovador.',
        documentation: 'https://zendry.com.br/desenvolvedores',
        isOnline: true,
        vendor: {
            name: 'Banco Zendry',
            shotname: 'prime',
            url: 'https://zendry.com.br',
            api: 'https://api.zendry.com.br',
            versions: [
                {
                    name: 'br.com.zendry.api-v1',
                    version: '1.2.9',
                    path: '/',
                }
            ],
        },
    };

    constructor(configs: ProviderConstruct) {
        if(configs.isTest){
            this.baseUrl = 'https://api-stg.zendry.com.br';
        } else {
            this.baseUrl = 'https://api.zendry.com.br';
        }

        this.clientId = configs.clientId;
        this.clientSecret = configs.clientSecret;
        this.accessToken = null;
    }

    // Gera o token de acesso usando OAuth2.0
    async generateToken(): Promise<void> {
        const auth = Buffer.from(
            `${this.clientId}:${this.clientSecret}`,
        ).toString('base64');
        const response = await axios.post(
            `${this.baseUrl}/auth/generate_token`,
            {
                grant_type: 'client_credentials',
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
        };
    }

    // Geração de QRCode Cobrança PIX
    async gerarQrCode(
        valueCents: number,
        expirationTime?: number,
        generatorName?: string,
        generatorDocument?: string,
    ) {
        const payload = {
            value_cents: valueCents,
            generator_name: generatorName,
            generator_document: generatorDocument,
            expiration_time: expirationTime,
        };

        const response = await axios.post(
            `${this.baseUrl}/v1/pix/qrcodes`,
            payload,
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    // Listar QRCodes
    async listarQRCodes(
        page: number = 1,
        registrationStartDate?: string,
        registrationEndDate?: string,
        paymentStartDate?: string,
        paymentEndDate?: string,
    ) {
        const params = {
            page,
            registration_start_date: registrationStartDate,
            registration_end_date: registrationEndDate,
            payment_start_date: paymentStartDate,
            payment_end_date: paymentEndDate,
        };

        if(!params.payment_start_date){
            delete params.payment_start_date;
        }

        if(!params.payment_end_date){
            delete params.payment_end_date;
        }

        var query = qs.stringify(params);

        const response = await axios.get(`${this.baseUrl}/v1/pix/qrcodes?${query}`, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Consultar QRCode por código de referência
    async consultarQrCodePorReferencia(referenceCode: string) {
        const response = await axios.get(
            `${this.baseUrl}/v1/pix/qrcodes/${referenceCode}`,
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    // Consultar QRCode por código EndToEnd
    async consultarQrCodePorEndToEnd(endToEnd: string) {
        const response = await axios.get(
            `${this.baseUrl}/v1/pix/qrcodes/${endToEnd}/end_to_end`,
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    // Cadastrar pagamento PIX
    async cadastrarPagamento(
        initiationType: 'dict' | 'manual',
        idempotentId: string,
        valueCents: number,
        receiverName: string,
        receiverDocument: string,
        pixKeyType?: string,
        pixKey?: string,
        bankIspb?: string,
        agency?: string,
        account?: string,
        accountType?: string,
        authorized: boolean = false,
    ) {
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

        const response = await axios.post(
            `${this.baseUrl}/v1/pix/payments`,
            payload,
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    // Listar pagamentos cadastrados
    async listarPagamentos(
        page: number = 1,
        registrationStartDate?: string,
        registrationEndDate?: string,
        paymentStartDate?: string,
        paymentEndDate?: string,
    ) {
        const params = {
            page,
            registration_start_date: registrationStartDate,
            registration_end_date: registrationEndDate,
            payment_start_date: paymentStartDate,
            payment_end_date: paymentEndDate,
        };

        if(!params.payment_start_date){
            delete params.payment_start_date;
        }

        if(!params.payment_end_date){
            delete params.payment_end_date;
        }

        var query = qs.stringify(params);

        const response = await axios.get(`${this.baseUrl}/v1/pix/payments?${query}`, {
            headers: this.getHeaders()
        });

        return response.data;
    }

    // Cadastrar Webhook
    async cadastrarWebhook(
        webhookTypeId: number,
        url: string,
        authorization?: string,
    ) {
        const payload = {
            url,
            authorization,
        };



        const response = await axios.post(
            `${this.baseUrl}/v1/webhooks/${webhookTypeId}`,
            payload,
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    async Balance(): Promise<BalanceOutput> {
        const response = await axios.get(
            `${this.baseUrl}/v1/account/balance`,
            {
                headers: this.getHeaders(),
            },
        );

        return {
            valueCents: response.data.account.value_cents,
            valueFloat: (response.data.account.value_cents / 100)
        };
    }

    async generatingPixBilling(
        body: PixGeneratingPixBillingInterface,
    ): Promise<Object> {
        var valueCents: number = Number.isInteger(body.valueCents)
            ? body.valueCents
            : Math.round(body.valueCents * 100);

        var expireTimestamp = Math.round(
            new Date().getTime() / 1000 + (body.expires ?? 3600),
        );

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
                dateTime: new Date(expireTimestamp * 1000).toLocaleString(
                    'pt-BR',
                ),
                iso: new Date(expireTimestamp * 1000).toISOString(),
            },
            code: data.qrcode.reference_code ?? randomUUID(),
        };
    }

    async listingPixBilling(
        body: PixlistingPixBilling,
    ): Promise<listingPixBillingOutput> {
        await this.generateToken();

        var data = await this.listarQRCodes(
            body.page ?? 1,
            body.registrationDateStart ?? new Date().toISOString(),
            body.registrationDateEnd ?? new Date().toISOString(),
        );

        data = data.qrcodes.map((mp: any) => {
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

    async searchPixBilling(
        body: searchPixBilling,
    ): Promise<searchPixBillingOutput> {
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

    async generateProviderWidthdraw(
        body: PixGenerateProviderWidthdraw,
    ): Promise<generateProviderWidthdrawOutput> {
        await this.generateToken();
        var data = await this.cadastrarPagamento(
            body.initiationType,
            body.idempotentId,
            body.valueCents,
            body.receiverName,
            body.receiverDocument,
            body.pixKeyType,
            body.pixKey,
            body.bankIspb,
            body.agency,
            body.account,
            body.accountType,
            body.authorized ?? true,
        );

        return data.payment;
    }
    async listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput> {
        await this.generateToken();

        var data = await this.listarPagamentos(
            body.page,
            body.registrationDateStart,
            body.registrationDateEnd,
            body.paymentStartDate,
            body.paymentEndDate,
        );


        data = data.payments.map((mp: any) => {
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

    async getBalance(): Promise<BalanceOutput> {
        await this.generateToken();
        return await this.Balance();
    }

    async searchProviderWidthdraw(body?: object): Promise<Object> {
        await this.generateToken();
        return {
            search: []
        };
    }
}

import axios from 'axios';
import ProviderInterface from '../../interfaces/ProviderInterface';
import { randomUUID } from 'crypto';

export default class PicPayProvider implements ProviderInterface {
    private baseUrl: string;
    private token: string;
    public providerInfo: object = {
        name: 'PicPay',
        description:
            'A solução completa para pagamentos instantâneos e transferências.',
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

    constructor(token: string, isTest: boolean = false) {
        this.token = token;
        this.baseUrl = isTest
            ? 'https://appws.picpay.com/ecommerce/public/sandbox'
            : 'https://appws.picpay.com/ecommerce/public';
    }

    // Função auxiliar para configurar os headers com token de autorização
    private getHeaders(): any {
        return {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    // Geração de cobrança via PicPay
    async gerarCobranca(
        referenceId: string,
        value: number,
        callbackUrl: string,
        returnUrl: string,
        buyer: {
            firstName: string;
            lastName: string;
            document: string;
        },
    ) {
        const payload = {
            referenceId,
            value,
            callbackUrl,
            returnUrl,
            buyer,
        };

        const response = await axios.post(`${this.baseUrl}/payments`, payload, {
            headers: this.getHeaders(),
        });

        return response.data;
    }

    // Consultar o status de uma cobrança
    async consultarCobranca(referenceId: string) {
        const response = await axios.get(
            `${this.baseUrl}/payments/${referenceId}`,
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    // Estornar um pagamento
    async estornarPagamento(referenceId: string) {
        const response = await axios.post(
            `${this.baseUrl}/payments/${referenceId}/refunds`,
            {},
            {
                headers: this.getHeaders(),
            },
        );

        return response.data;
    }

    // Função para gerar cobrança e formatar o resultado para ser utilizado
    async generatingPixBilling(
        body: PixGeneratingPixBillingInterface,
    ): Promise<Object> {
        var valueCents: number = Number.isInteger(body.valueCents)
            ? body.valueCents
            : Math.round(body.valueCents * 100);

        var response = await this.gerarCobranca(
            body.pixkey,
            (valueCents / 100),
            body.callbackUrl,
            body.returnUrl,
            {
                firstName: body.name,
                lastName: body.lastName,
                document: body.document
            },
        );

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
                dateTime: new Date(
                    Date.now() + body.expires * 1000,
                ).toLocaleString('pt-BR'),
                iso: new Date(Date.now() + body.expires * 1000).toISOString(),
            },
            code: response.referenceId,
        };
    }

    // Consultar status de cobrança por referência
    async searchPixBilling(
        body: searchPixBilling,
    ): Promise<searchPixBillingOutput> {
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

    // Listar cobranças (não implementada na API PicPay, mas simulada para manter o padrão)
    listingPixBilling(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    // Gerar pagamento via Pix (simulação)
    async generateProviderWidthdraw(
        body: PixGenerateProviderWidthdraw,
    ): Promise<generateProviderWidthdrawOutput> {
        return {
            reference_code: randomUUID(),
            idempotent_id: body.idempotentId,
            value_cents: body.valueCents,
            pix_key_type: body.pixKeyType || 'CPF',
            pix_key: body.pixKey || '99999999999',
            receiver_name: body.receiverName,
            receiver_document: body.receiverDocument,
            status: 'APPROVED',
        };
    }

    // Listar pagamentos (simulação)
    async listProviderWidthdraw(
        body: listProviderWidthdraw,
    ): Promise<listProviderWidthdrawOutput> {
        return {
            payments: [
                {
                    referenceCode: randomUUID(),
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

    searchProviderWidthdraw(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }
}
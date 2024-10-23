import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    apiKey: string;
    isTest: boolean | false;
}
export default class PagarMeProvider implements ProviderInterface {
    private baseUrl;
    private apiKey;
    providerInfo: {
        name: string;
        description: string;
        documentation: string;
        isOnline: boolean;
        vendor: {
            name: string;
            shotname: string;
            url: string;
            api: string;
            versions: {
                name: string;
                version: string;
                path: string;
            }[];
        };
    };
    constructor(configs: ProviderConstruct);
    private getHeaders;
    gerarTransacaoCredito(valueCents: number, cardDetails: {
        number: string;
        expiration_date: string;
        holder_name: string;
        cvv: string;
    }, customer: {
        name: string;
        email: string;
        document: string;
        phone: string;
    }): Promise<any>;
    gerarQrCode(valueCents: number, expirationTime?: number, description?: string): Promise<any>;
    listarTransacoes(page?: number, startDate?: string, endDate?: string): Promise<any>;
    consultarTransacaoPorId(transactionId: string): Promise<any>;
    estornarTransacao(transactionId: string): Promise<any>;
    cadastrarWebhook(url: string, event: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput>;
    getBalance(): Promise<BalanceOutput>;
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    searchProviderWidthdraw(body: {
        correlationId: string;
    }): Promise<Object>;
}
export {};

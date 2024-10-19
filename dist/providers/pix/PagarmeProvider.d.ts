import ProviderInterface from '../../interfaces/ProviderInterface';
export default class PagarMeProvider implements ProviderInterface {
    private baseUrl;
    private apiKey;
    providerInfo: object;
    constructor(apiKey: string, isTest?: boolean);
    generateProviderWidthdraw(body?: object): Promise<Object>;
    listProviderWidthdraw(body?: object): Promise<Object>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
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
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
}

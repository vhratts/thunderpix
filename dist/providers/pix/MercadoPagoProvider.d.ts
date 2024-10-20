import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    clientId: string;
    clientSecret: string;
    isTest: boolean | false;
}
export default class MercadoPagoProvider implements ProviderInterface {
    private baseUrl;
    private clientId;
    private clientSecret;
    private accessToken;
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
    generateProviderWidthdraw(body?: object): Promise<Object>;
    listProviderWidthdraw(body?: object): Promise<Object>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
    generateToken(): Promise<void>;
    private getHeaders;
    gerarQrCode(valueCents: number, expirationTime?: number, description?: string): Promise<any>;
    listarPagamentos(page?: number, registrationStartDate?: string, registrationEndDate?: string): Promise<any>;
    consultarPagamentoPorId(paymentId: string): Promise<any>;
    cadastrarPagamento(valueCents: number, receiverName: string, receiverDocument: string, pixKey?: string, pixKeyType?: string, authorized?: boolean): Promise<any>;
    cadastrarWebhook(url: string, event: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput>;
    getBalance(): Promise<BalanceOutput>;
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
}
export {};

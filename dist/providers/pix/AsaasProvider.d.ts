import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    apiKey: string;
    isTest: boolean;
}
export default class AsaasProvider implements ProviderInterface {
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
    listingPixBilling(body?: object): Promise<Object>;
    searchPixBilling(body?: object): Promise<Object>;
    private getHeaders;
    gerarQrCodePix(valueCents: number, description: string, customer: {
        name: string;
        email: string;
        phone: string;
        document: string;
    }): Promise<any>;
    listarCobrancas(page?: number, startDate?: string, endDate?: string): Promise<any>;
    consultarCobrancaPorId(paymentId: string): Promise<any>;
    estornarCobranca(paymentId: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    getBalance(): Promise<BalanceOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    searchProviderWidthdraw(body: {
        correlationId: string;
    }): Promise<Object>;
}
export {};

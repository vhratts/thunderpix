import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    apiKey: string;
    isTest: boolean | false;
}
export default class OpenPixProvider implements ProviderInterface {
    private baseUrl;
    private apiKey;
    providerInfo: object;
    constructor(configs: ProviderConstruct);
    private getHeaders;
    gerarQrCodePix(valueCents: number, description: string, customer: {
        name: string;
        document: string;
        email: string;
        phone: string;
        city: string;
    }): Promise<any>;
    listarCobrancas(page?: number, registrationStartDate?: string, registrationEndDate?: string): Promise<any>;
    consultarCobrancaPorID(correlationID: string): Promise<any>;
    estornarCobranca(correlationID: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput>;
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    searchProviderWidthdraw(body: {
        correlationID: string;
    }): Promise<Object>;
}
export {};

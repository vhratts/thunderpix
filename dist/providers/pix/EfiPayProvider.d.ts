import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    clientId: string;
    clientSecret: string;
    certificatePath: string;
    isTest: boolean;
}
export default class EfiPayProvider implements ProviderInterface {
    private baseUrl;
    private clientId;
    private clientSecret;
    private certificatePath;
    private accessToken;
    providerInfo: object;
    constructor(configs: ProviderConstruct);
    searchPixBilling(body?: object): Promise<Object>;
    generateToken(): Promise<void>;
    private getHeaders;
    gerarCobPix(valueCents: number, description: string, customer: {
        name: string;
        document: string;
        email: string;
        phone: string;
    }): Promise<any>;
    listarCobrancas(page?: number, registrationStartDate?: string, registrationEndDate?: string): Promise<any>;
    consultarCobrancaPorID(txid: string): Promise<any>;
    estornarCobranca(txid: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    searchProviderWidthdraw(body: {
        correlationId: string;
    }): Promise<Object>;
}
export {};

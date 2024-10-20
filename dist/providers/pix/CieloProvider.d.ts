import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    clientId: string;
    clientSecret: string;
    isTest: boolean | false;
}
export default class CieloPixProvider implements ProviderInterface {
    private baseUrl;
    private clientId;
    private clientSecret;
    private accessToken;
    providerInfo: object;
    constructor(configs: ProviderConstruct);
    generateToken(): Promise<void>;
    private getHeaders;
    gerarQrCodePix(valueCents: number, body: PixGeneratingPixBillingInterface): Promise<any>;
    listarPix(page?: number, registrationStartDate?: string, registrationEndDate?: string): Promise<any>;
    consultarPixPorReferencia(referenceCode: string): Promise<any>;
    estornarPix(referenceCode: string): Promise<any>;
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

import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    clientId: string;
    clientSecret: string;
    isTest: boolean | false;
}
export default class PrimepagProvider implements ProviderInterface {
    private baseUrl;
    private clientId;
    private clientSecret;
    private accessToken;
    providerInfo: object;
    constructor(configs: ProviderConstruct);
    generateToken(): Promise<void>;
    private getHeaders;
    gerarQrCode(valueCents: number, expirationTime?: number, generatorName?: string, generatorDocument?: string): Promise<any>;
    listarQRCodes(page?: number, registrationStartDate?: string, registrationEndDate?: string, paymentStartDate?: string, paymentEndDate?: string): Promise<any>;
    consultarQrCodePorReferencia(referenceCode: string): Promise<any>;
    consultarQrCodePorEndToEnd(endToEnd: string): Promise<any>;
    cadastrarPagamento(initiationType: 'dict' | 'manual', idempotentId: string, valueCents: number, receiverName: string, receiverDocument: string, pixKeyType?: string, pixKey?: string, bankIspb?: string, agency?: string, account?: string, accountType?: string, authorized?: boolean): Promise<any>;
    listarPagamentos(page?: number, registrationStartDate?: string, registrationEndDate?: string, paymentStartDate?: string, paymentEndDate?: string): Promise<any>;
    cadastrarWebhook(webhookTypeId: number, url: string, authorization?: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput>;
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}
export {};

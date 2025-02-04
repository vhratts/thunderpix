import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    clientId: string;
    clientSecret: string;
    isTest: boolean | false;
}
export default class ZendryProvider implements ProviderInterface {
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
    generateToken(): Promise<void>;
    private getHeaders;
    gerarQrCode(valueCents: number, expirationTime?: number, generatorName?: string, generatorDocument?: string): Promise<any>;
    listarQRCodes(page?: number, registrationStartDate?: string, registrationEndDate?: string, paymentStartDate?: string, paymentEndDate?: string): Promise<any>;
    consultarQrCodePorReferencia(referenceCode: string): Promise<any>;
    consultarQrCodePorEndToEnd(endToEnd: string): Promise<any>;
    cadastrarPagamento(initiationType: 'dict' | 'manual', idempotentId: string, valueCents: number, receiverName: string, receiverDocument: string, pixKeyType?: string, pixKey?: string, bankIspb?: string, agency?: string, account?: string, accountType?: string, authorized?: boolean): Promise<any>;
    listarPagamentos(page?: number, registrationStartDate?: string, registrationEndDate?: string, paymentStartDate?: string, paymentEndDate?: string): Promise<any>;
    cadastrarWebhook(webhookTypeId: number, url: string, authorization?: string): Promise<any>;
    Balance(): Promise<BalanceOutput>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body: PixlistingPixBilling): Promise<listingPixBillingOutput>;
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    getBalance(): Promise<BalanceOutput>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}
export {};

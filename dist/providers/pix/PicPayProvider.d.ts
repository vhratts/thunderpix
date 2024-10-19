import ProviderInterface from '../../interfaces/ProviderInterface';
export default class PicPayProvider implements ProviderInterface {
    private baseUrl;
    private token;
    providerInfo: object;
    constructor(token: string, isTest?: boolean);
    private getHeaders;
    gerarCobranca(referenceId: string, value: number, callbackUrl: string, returnUrl: string, buyer: {
        firstName: string;
        lastName: string;
        document: string;
    }): Promise<any>;
    consultarCobranca(referenceId: string): Promise<any>;
    estornarPagamento(referenceId: string): Promise<any>;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    searchPixBilling(body: searchPixBilling): Promise<searchPixBillingOutput>;
    listingPixBilling(body?: object): Promise<Object>;
    generateProviderWidthdraw(body: PixGenerateProviderWidthdraw): Promise<generateProviderWidthdrawOutput>;
    listProviderWidthdraw(body: listProviderWidthdraw): Promise<listProviderWidthdrawOutput>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}

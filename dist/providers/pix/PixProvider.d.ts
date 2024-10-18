import ProviderInterface from '../../interfaces/ProviderInterface';
export default class PixProvider implements ProviderInterface {
    private pixkey;
    providerInfo: object;
    constructor(pixkey: string);
    generatePixPayload(valor: number, chave?: string | null, descricao?: string | null, nomeRecebedor?: string | null, cidadeRecebedor?: string | null): string;
    generatePixQRCode(chave: string, valor: number, descricao: string, nomeRecebedor: string, cidadeRecebedor: string): Promise<string>;
    private CpfOrCnpjKey;
    private validateChavePix;
    private generateCRC16;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body?: object): Promise<Object>;
    searchPixBilling(body?: object): Promise<Object>;
    generateProviderWidthdraw(body?: object): Promise<Object>;
    listProviderWidthdraw(body?: object): Promise<Object>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}
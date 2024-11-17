import ProviderInterface from '../../interfaces/ProviderInterface';
interface ProviderConstruct {
    pixkey: string;
}
interface pixTypeOutput {
    key: string;
    type: string;
}
interface PixPayloadOutput {
    format: string;
    method?: string;
    chave: string;
    valor?: string;
    moeda: string;
    pais: string;
    nomeRecebedor: string;
    cidadeRecebedor: string;
    cep?: string;
    crc: string;
    additionalInfo?: string;
}
export default class PixProvider implements ProviderInterface {
    private pixkey;
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
    generatePixPayload(valor: number, chave?: string | null, descricao?: string | null, nomeRecebedor?: string | null, cidadeRecebedor?: string | null): string;
    generatePixQRCode(chave: string, valor: number, descricao: string, nomeRecebedor: string, cidadeRecebedor: string): Promise<string>;
    private CpfOrCnpjKey;
    private validateChavePix;
    determinePixType(chave?: any): pixTypeOutput;
    generateCRC16(payload: string): string;
    extractPixPayload(evmpix: string): PixPayloadOutput;
    generatingPixBilling(body: PixGeneratingPixBillingInterface): Promise<Object>;
    listingPixBilling(body?: object): Promise<Object>;
    searchPixBilling(body?: object): Promise<Object>;
    generateProviderWidthdraw(body?: object): Promise<Object>;
    listProviderWidthdraw(body?: object): Promise<Object>;
    getBalance(): Promise<BalanceOutput>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}
export {};

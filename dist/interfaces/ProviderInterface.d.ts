interface InfoProviderInterface {
    name: string;
    description: string;
    documentation: string;
    isOnline: boolean;
    vendor: {
        name: string;
        shotname: string;
        url: string;
        api: string;
    };
}
export default interface ProviderInterface {
    providerInfo: InfoProviderInterface;
    generatingPixBilling(body?: object): Promise<Object>;
    listingPixBilling(body?: object): Promise<Object>;
    searchPixBilling(body?: object): Promise<Object>;
    generateProviderWidthdraw(body?: object): Promise<Object>;
    listProviderWidthdraw(body?: object): Promise<Object>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}
export {};

export default interface ProviderInterface {
    generatingPixBilling(body?: object): Promise<Object>;
    listingPixBilling(body?: object): Promise<Object>;
    searchPixBilling(body?: object): Promise<Object>;
    generateProviderWidthdraw(body?: object): Promise<Object>;
    listProviderWidthdraw(body?: object): Promise<Object>;
    searchProviderWidthdraw(body?: object): Promise<Object>;
}

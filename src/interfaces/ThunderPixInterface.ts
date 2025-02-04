export default interface ThinderPixInterface {
    getQrCode(params?: {}): Promise<Object> | Object;
    getBalance(params?: {}): Promise<Object> | Object;
    getTransactions(params?: {}): Promise<Object> | Object;
    getTransaction(params?: {}): Promise<Object> | Object;
    createQrCode(params?: {}): Promise<Object> | Object;
    createTransaction(params?: {}): Promise<Object> | Object;
}
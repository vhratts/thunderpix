import ProviderInterface from "./interfaces/ProviderInterface";
import ThinderPixInterface from "./interfaces/ThunderPixInterface";
import PixProvider from './providers/pix/PixProvider';

export {
    PixProvider
};

export default class ThunderPix implements ThinderPixInterface {
    private provider: ProviderInterface;
    constructor(provider: ProviderInterface){
        this.provider = provider;
    }

    async createQrCode(params?: {
        valueCents: number,
        expires: number
    }) {
        return await this.provider.generatingPixBilling(params);
    }
    async getBalance(params?: {}) {}
    async getTransactions(params?: {}) {}
    async getQrCode(params?: {}) {}
}
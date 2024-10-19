import ProviderInterface from "./interfaces/ProviderInterface";
import ThinderPixInterface from "./interfaces/ThunderPixInterface";
import PixProvider from './providers/pix/PixProvider';
import PrimepagProvider from './providers/pix/PrimepagProvider';
import MercadoPagoProvider from './providers/pix/MercadoPagoProvider';
import PicPayProvider from './providers/pix/PicPayProvider';
import PagarMeProvider from './providers/pix/PagarmeProvider';

export {
    PixProvider, PrimepagProvider, MercadoPagoProvider,
    PicPayProvider, PagarMeProvider
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
import ProviderInterface from "./interfaces/ProviderInterface";
import ThinderPixInterface from "./interfaces/ThunderPixInterface";
import PixProvider from './providers/pix/PixProvider';
import PrimepagProvider from './providers/pix/PrimepagProvider';
export { PixProvider, PrimepagProvider };
export default class ThunderPix implements ThinderPixInterface {
    private provider;
    constructor(provider: ProviderInterface);
    createQrCode(params?: {
        valueCents: number;
        expires: number;
    }): Promise<Object>;
    getBalance(params?: {}): Promise<void>;
    getTransactions(params?: {}): Promise<void>;
    getQrCode(params?: {}): Promise<void>;
}

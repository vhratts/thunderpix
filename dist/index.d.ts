import ProviderInterface from "./interfaces/ProviderInterface";
import ThinderPixInterface from "./interfaces/ThunderPixInterface";
import PixProvider from './providers/pix/PixProvider';
import PrimepagProvider from './providers/pix/PrimepagProvider';
import MercadoPagoProvider from './providers/pix/MercadoPagoProvider';
import PicPayProvider from './providers/pix/PicPayProvider';
import PagarMeProvider from './providers/pix/PagarmeProvider';
import OpenPixProvider from './providers/pix/OpenPixProvider';
import CieloProvider from './providers/pix/CieloProvider';
export { PixProvider, PrimepagProvider, MercadoPagoProvider, PicPayProvider, PagarMeProvider, OpenPixProvider, CieloProvider };
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

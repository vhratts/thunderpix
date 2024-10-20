import ProviderInterface from './interfaces/ProviderInterface';
import ThinderPixInterface from './interfaces/ThunderPixInterface';
import PixProvider from './providers/pix/PixProvider';
import PrimepagProvider from './providers/pix/PrimepagProvider';
import MercadoPagoProvider from './providers/pix/MercadoPagoProvider';
import PicPayProvider from './providers/pix/PicPayProvider';
import PagarMeProvider from './providers/pix/PagarmeProvider';
import OpenPixProvider from './providers/pix/OpenPixProvider';
import CieloProvider from './providers/pix/CieloProvider';
import EfiPayProvider from './providers/pix/EfiPayProvider';

export {
    PixProvider,
    PrimepagProvider,
    MercadoPagoProvider,
    PicPayProvider,
    PagarMeProvider,
    OpenPixProvider,
    CieloProvider,
    EfiPayProvider,
};

export default class ThunderPix implements ThinderPixInterface {
    private provider: ProviderInterface;
    constructor(provider: ProviderInterface) {
        this.provider = provider;
    }

    async createQrCode(params?: { valueCents: number; expires: number }) {
        return await this.provider.generatingPixBilling(params);
    }

    async getBalance() {
        return this.provider.getBalance();
    }

    async getTransactions(params: {
        type: string;
        options: {
            page: number | null;
            registrationDateStart: string | null;
            registrationDateEnd: string | null;
        };
    }) {
        if ((params.type = 'output')) {
            var response = await this.provider.listingPixBilling(
                params?.options,
            );
        } else {
            var response = await this.provider.listProviderWidthdraw(
                params?.options,
            );
        }

        return response;
    }

    async getQrCode(params: {
        reference: string
    }) {
        return await this.provider.searchPixBilling(params);
    }
}

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
import AsaasProvider from './providers/pix/AsaasProvider';
import ZendryProvider from './providers/pix/ZendryProvider';

export {
    PixProvider,
    PrimepagProvider,
    MercadoPagoProvider,
    PicPayProvider,
    PagarMeProvider,
    OpenPixProvider,
    CieloProvider,
    EfiPayProvider,
    AsaasProvider,
    ZendryProvider
};

export default class ThunderPix implements ThinderPixInterface {
    private provider: ProviderInterface;
    constructor(provider: ProviderInterface) {
        this.provider = provider;
    }
    getTransaction(params?: {}): Promise<Object> | Object {
        throw new Error('Method not implemented.');
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
        
        if (params.type == 'output') {
            var response = await this.provider.listProviderWidthdraw(
                params.options,
            );
        } else {
            var response = await this.provider.listingPixBilling(
                params.options,
            );
        }

        return response;
    }

    async getQrCode(params: { reference: string }) {
        return await this.provider.searchPixBilling(params);
    }

    async createTransaction(params: {
        initiationType: 'dict';
        idempotentId: string;
        valueCents: number;
        receiverName: string;
        receiverDocument: string;
        pixKeyType?: string;
        pixKey?: string;
        bankIspb?: string;
        agency?: string;
        account?: string;
        accountType?: string;
        authorized: true;
    }): Promise<Object> {
        return await this.provider.generateProviderWidthdraw(params);
    }
}

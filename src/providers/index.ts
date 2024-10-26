// import ProviderInterface from '../interfaces/ProviderInterface';
import MercadoPagoProvider from './pix/MercadoPagoProvider';
import PagarMeProvider from './pix/PagarmeProvider';
import PicPayProvider from './pix/PicPayProvider';
import PixProvider from './pix/PixProvider';
import PrimepagProvider from './pix/PrimepagProvider';
import OpenPixProvider from './pix/OpenPixProvider';
import CieloProvider from './pix/CieloProvider';
import EfiPayProvider from './pix/EfiPayProvider';
import AsaasProvider from './pix/AsaasProvider';
import ZendryProvider from './pix/ZendryProvider';

export default {
    PixProvider, PrimepagProvider, MercadoPagoProvider,
    PagarMeProvider, PicPayProvider, OpenPixProvider,
    CieloProvider, EfiPayProvider, AsaasProvider, ZendryProvider
}

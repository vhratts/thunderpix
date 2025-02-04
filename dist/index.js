"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThunderUtils = exports.ZendryProvider = exports.AsaasProvider = exports.EfiPayProvider = exports.CieloProvider = exports.OpenPixProvider = exports.PagarMeProvider = exports.PicPayProvider = exports.MercadoPagoProvider = exports.PrimepagProvider = exports.PixProvider = void 0;
const ThuderUtils_1 = __importDefault(require("./libs/ThuderUtils"));
exports.ThunderUtils = ThuderUtils_1.default;
const PixProvider_1 = __importDefault(require("./providers/pix/PixProvider"));
exports.PixProvider = PixProvider_1.default;
const PrimepagProvider_1 = __importDefault(require("./providers/pix/PrimepagProvider"));
exports.PrimepagProvider = PrimepagProvider_1.default;
const MercadoPagoProvider_1 = __importDefault(require("./providers/pix/MercadoPagoProvider"));
exports.MercadoPagoProvider = MercadoPagoProvider_1.default;
const PicPayProvider_1 = __importDefault(require("./providers/pix/PicPayProvider"));
exports.PicPayProvider = PicPayProvider_1.default;
const PagarmeProvider_1 = __importDefault(require("./providers/pix/PagarmeProvider"));
exports.PagarMeProvider = PagarmeProvider_1.default;
const OpenPixProvider_1 = __importDefault(require("./providers/pix/OpenPixProvider"));
exports.OpenPixProvider = OpenPixProvider_1.default;
const CieloProvider_1 = __importDefault(require("./providers/pix/CieloProvider"));
exports.CieloProvider = CieloProvider_1.default;
const EfiPayProvider_1 = __importDefault(require("./providers/pix/EfiPayProvider"));
exports.EfiPayProvider = EfiPayProvider_1.default;
const AsaasProvider_1 = __importDefault(require("./providers/pix/AsaasProvider"));
exports.AsaasProvider = AsaasProvider_1.default;
const ZendryProvider_1 = __importDefault(require("./providers/pix/ZendryProvider"));
exports.ZendryProvider = ZendryProvider_1.default;
class ThunderPix {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    getTransaction(params) {
        throw new Error('Method not implemented.');
    }
    async createQrCode(params) {
        return await this.provider.generatingPixBilling(params);
    }
    async getBalance() {
        return this.provider.getBalance();
    }
    async getTransactions(params) {
        if (params.type == 'output') {
            var response = await this.provider.listProviderWidthdraw(params.options);
        }
        else {
            var response = await this.provider.listingPixBilling(params.options);
        }
        return response;
    }
    async getQrCode(params) {
        return await this.provider.searchPixBilling(params);
    }
    async createTransaction(params) {
        return await this.provider.generateProviderWidthdraw(params);
    }
}
exports.default = ThunderPix;

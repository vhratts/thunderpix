"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfiPayProvider = exports.CieloProvider = exports.OpenPixProvider = exports.PagarMeProvider = exports.PicPayProvider = exports.MercadoPagoProvider = exports.PrimepagProvider = exports.PixProvider = void 0;
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
class ThunderPix {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async createQrCode(params) {
        return await this.provider.generatingPixBilling(params);
    }
    async getBalance(params) { }
    async getTransactions(params) { }
    async getQrCode(params) { }
}
exports.default = ThunderPix;

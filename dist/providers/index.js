"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MercadoPagoProvider_1 = __importDefault(require("./pix/MercadoPagoProvider"));
const PagarmeProvider_1 = __importDefault(require("./pix/PagarmeProvider"));
const PicPayProvider_1 = __importDefault(require("./pix/PicPayProvider"));
const PixProvider_1 = __importDefault(require("./pix/PixProvider"));
const PrimepagProvider_1 = __importDefault(require("./pix/PrimepagProvider"));
const OpenPixProvider_1 = __importDefault(require("./pix/OpenPixProvider"));
const CieloProvider_1 = __importDefault(require("./pix/CieloProvider"));
const EfiPayProvider_1 = __importDefault(require("./pix/EfiPayProvider"));
const AsaasProvider_1 = __importDefault(require("./pix/AsaasProvider"));
const ZendryProvider_1 = __importDefault(require("./pix/ZendryProvider"));
exports.default = {
    PixProvider: PixProvider_1.default, PrimepagProvider: PrimepagProvider_1.default, MercadoPagoProvider: MercadoPagoProvider_1.default,
    PagarMeProvider: PagarmeProvider_1.default, PicPayProvider: PicPayProvider_1.default, OpenPixProvider: OpenPixProvider_1.default,
    CieloProvider: CieloProvider_1.default, EfiPayProvider: EfiPayProvider_1.default, AsaasProvider: AsaasProvider_1.default, ZendryProvider: ZendryProvider_1.default
};

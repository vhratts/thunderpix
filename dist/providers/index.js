"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PicPayProvider = exports.PagarMeProvider = exports.MercadoPagoProvider = exports.PrimepagProvider = exports.PixProvider = void 0;
const MercadoPagoProvider_1 = __importDefault(require("./pix/MercadoPagoProvider"));
exports.MercadoPagoProvider = MercadoPagoProvider_1.default;
const PagarmeProvider_1 = __importDefault(require("./pix/PagarmeProvider"));
exports.PagarMeProvider = PagarmeProvider_1.default;
const PicPayProvider_1 = __importDefault(require("./pix/PicPayProvider"));
exports.PicPayProvider = PicPayProvider_1.default;
const PixProvider_1 = __importDefault(require("./pix/PixProvider"));
exports.PixProvider = PixProvider_1.default;
const PrimepagProvider_1 = __importDefault(require("./pix/PrimepagProvider"));
exports.PrimepagProvider = PrimepagProvider_1.default;

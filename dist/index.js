"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimepagProvider = exports.PixProvider = void 0;
const PixProvider_1 = __importDefault(require("./providers/pix/PixProvider"));
exports.PixProvider = PixProvider_1.default;
const PrimepagProvider_1 = __importDefault(require("./providers/pix/PrimepagProvider"));
exports.PrimepagProvider = PrimepagProvider_1.default;
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

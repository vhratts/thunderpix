"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = void 0;
const PixProvider_1 = __importDefault(require("./pix/PixProvider"));
exports.Providers = {
    PixProvider: PixProvider_1.default
};
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
class ThunderUtils {
    async decodeAndValidateJWT(token, jwksUrl) {
        try {
            const decodedHeader = jsonwebtoken_1.default.decode(token, { complete: true });
            if (!decodedHeader || !decodedHeader.header.kid) {
                throw new Error('Header do JWT inválido.');
            }
            const kid = decodedHeader.header.kid;
            const response = await axios_1.default.get(jwksUrl);
            const keys = response.data.keys;
            const key = keys.find((key) => key.kid === kid);
            if (!key) {
                throw new Error('Chave correspondente ao kid não encontrada.');
            }
            const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.x5c[0]}\n-----END PUBLIC KEY-----`;
            const payload = jsonwebtoken_1.default.verify(token, publicKey, {
                algorithms: ['RS256'],
            });
            return payload;
        }
        catch (error) {
            console.error('Erro ao decodificar ou validar o JWT:', error);
            return null;
        }
    }
    decodeJWT(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token, { complete: true });
            if (!decoded || typeof decoded !== 'object') {
                throw new Error('Token inválido.');
            }
            const { header, payload } = decoded;
            return { header, payload };
        }
        catch (error) {
            console.error('Erro ao decodificar o JWT:', error);
            return null;
        }
    }
}
exports.default = ThunderUtils;

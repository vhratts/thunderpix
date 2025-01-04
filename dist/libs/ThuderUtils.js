"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ThunderUtils {
    decodeJWT(token) {
        try {
            const [headerEncoded, payloadEncoded] = token.split('.');
            if (!headerEncoded || !payloadEncoded) {
                throw new Error('Token inválido.');
            }
            const base64UrlDecode = (str) => {
                const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                return decodeURIComponent(atob(base64)
                    .split('')
                    .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
                    .join(''));
            };
            const header = JSON.parse(base64UrlDecode(headerEncoded));
            const payload = JSON.parse(base64UrlDecode(payloadEncoded));
            return { header, payload };
        }
        catch (error) {
            console.error('Erro ao decodificar o JWT:', error);
            return null;
        }
    }
}
exports.default = ThunderUtils;

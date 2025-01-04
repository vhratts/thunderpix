"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EMV_NAMES = {
    '00': 'Payload Format Indicator',
    '26': 'Merchant Account Information',
    '52': 'Merchant Category Code',
    '53': 'Transaction Currency',
    '58': 'Country Code',
    '59': 'Merchant Name',
    '60': 'Merchant City',
    '62': 'Additional Data Field Template',
    '63': 'CRC',
    '26.00': 'GUI',
};
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
    decodeEMVToObject(emvString) {
        const decodeField = (str) => {
            const result = {};
            let i = 0;
            while (i < str.length) {
                const id = str.slice(i, i + 2);
                i += 2;
                const size = parseInt(str.slice(i, i + 2), 10);
                i += 2;
                const data = str.slice(i, i + size);
                i += size;
                const emvName = EMV_NAMES[id] || '';
                if (id === '26') {
                    result[id] = {
                        ID: id,
                        EMVName: emvName,
                        Size: size,
                        Data: decodeField(data),
                    };
                }
                else {
                    result[id] = {
                        ID: id,
                        EMVName: emvName,
                        Size: size,
                        Data: data,
                    };
                }
            }
            return result;
        };
        return decodeField(emvString);
    }
    emvParser(emvObject) {
        const result = {};
        const parseItem = (item) => {
            if (typeof item.Data === 'object') {
                return Object.values(item.Data).map((subItem) => parseItem(subItem));
            }
            return item.Data;
        };
        for (const key in emvObject) {
            const item = emvObject[key];
            const keyName = (item.EMVName || `Field_${key}`).replace(/[^a-zA-Z0-9]/g, '_');
            result[keyName] = parseItem(item);
        }
        return result;
    }
    extractPixUrl(keyValueObject) {
        const pixKey = 'Merchant_Account_Information';
        if (!keyValueObject[pixKey] || !Array.isArray(keyValueObject[pixKey])) {
            return null;
        }
        const urls = keyValueObject[pixKey].filter((item) => /^([a-z0-9\-]+\.)+[a-z]{2,}\/.+$/.test(item));
        if (urls.length === 0) {
            return null;
        }
        const url = `https://${urls[0]}`;
        return { url, size: url.length };
    }
}
exports.default = ThunderUtils;

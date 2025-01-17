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
    static pixTypeIdentify(chave) {
        const tiposChave = [
            {
                type: 'cpf',
                regex: /^\d{11}$/,
                validator: function (chave) {
                    return ThunderUtils.documentValidation(chave);
                },
                format: '/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/',
            },
            {
                type: 'phone',
                regex: /^\d{11}$/,
                validator: function (chave) {
                    return /^(\d{2})(9\d{8}|\d{8})$/.test(chave);
                },
                format: '/\\+?(\\d{1,3})?(\\d{2})(\\d{4,5})(\\d{4})/',
            },
            {
                type: 'cnpj',
                regex: /^\d{14}$/,
                format: '/(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})/',
            },
            {
                type: 'email',
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                format: '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/',
            },
            {
                type: 'token',
                regex: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
                format: '/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/',
            },
        ];
        for (let tipo of tiposChave) {
            if (tipo.regex.test(chave) &&
                (!tipo.validator || tipo.validator(chave))) {
                return {
                    type: tipo.type,
                    regex: tipo.format,
                    status: true,
                };
            }
        }
        return { type: 'unknown', regex: '', status: false };
    }
    static documentValidation(cpf) {
        let soma = 0;
        let resto;
        if (cpf == '00000000000')
            return false;
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto == 10 || resto == 11)
            resto = 0;
        if (resto != parseInt(cpf.substring(9, 10)))
            return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto == 10 || resto == 11)
            resto = 0;
        return resto == parseInt(cpf.substring(10, 11));
    }
}
exports.default = ThunderUtils;

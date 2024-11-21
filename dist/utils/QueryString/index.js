"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queryString = {
    stringify(obj) {
        return Object.keys(obj)
            .filter(key => obj[key] !== undefined && obj[key] !== null)
            .map(key => queryString.encode(key) + '=' + queryString.encode(String(obj[key])))
            .join('&');
    },
    parse(str) {
        return str
            .replace(/^\?/, '')
            .split('&')
            .reduce((acc, pair) => {
            const [key, value] = pair.split('=').map(queryString.decode);
            acc[key] = value ?? '';
            return acc;
        }, {});
    },
    encode(value) {
        return encodeURIComponent(value)
            .replace(/%20/g, '+')
            .replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
    },
    decode(value) {
        return decodeURIComponent(value.replace(/\+/g, ' '));
    }
};
exports.default = queryString;

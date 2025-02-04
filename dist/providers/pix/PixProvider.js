"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qrcode_1 = __importDefault(require("qrcode"));
const cpf_cnpj_validator_1 = require("cpf-cnpj-validator");
const pix_1 = __importDefault(require("../../utils/Bacem/pix"));
const index_1 = require("../../utils/all/index");
class PixProvider {
    pixkey;
    providerInfo = {
        name: 'Pix',
        description: 'Provedor padrão de qrcode-pix',
        documentation: 'https://bacen.github.io/pix-api',
        isOnline: true,
        vendor: {
            name: 'Banco Central do Brasil',
            shotname: 'bacem',
            url: 'https://www.bcb.gov.br',
            api: 'https://pix.bcb.gov.br/api',
            versions: [
                {
                    name: 'br.gov.bacem-pix-api-v1',
                    version: '1.0.0',
                    path: '/v1',
                },
                {
                    name: 'br.gov.bacem-pix-api-v1',
                    version: '2.0.0',
                    path: '/v2',
                },
            ],
        },
    };
    constructor(configs) {
        this.pixkey = configs.pixkey;
    }
    generatePixPayload(valor, chave = null, descricao = null, nomeRecebedor = null, cidadeRecebedor = null) {
        if (!chave) {
            chave = this.pixkey;
        }
        if (!Number.isInteger(valor)) {
            valor = Math.round(valor * 100);
        }
        if (!nomeRecebedor) {
            nomeRecebedor = 'Recebedor';
        }
        if (!descricao) {
            descricao = 'Pague antes do vencimento';
        }
        if (!cidadeRecebedor) {
            cidadeRecebedor = 'Sao Paulo';
        }
        if (!this.validateChavePix(chave)) {
            throw new Error('Chave Pix inválida');
        }
        const payload = (0, pix_1.default)({
            key: chave,
            name: nomeRecebedor,
            city: cidadeRecebedor,
            transactionId: '***',
            amount: valor / 100,
        });
        return payload;
    }
    async generateCopyAndPastQrCode(code, options) {
        const qrCodeDataURL = await qrcode_1.default.toDataURL(code, options);
        return {
            qrcode: qrCodeDataURL,
            metadata: code,
        };
    }
    async generatePixQRCode(chave, valor, descricao, nomeRecebedor, cidadeRecebedor) {
        const payload = this.generatePixPayload(valor, chave, descricao, nomeRecebedor, cidadeRecebedor);
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(payload);
        return qrCodeDataUrl;
    }
    CpfOrCnpjKey(key) {
        if (cpf_cnpj_validator_1.cpf.isValid(key)) {
            return true;
        }
        if (cpf_cnpj_validator_1.cnpj.isValid(key)) {
            return true;
        }
        return false;
    }
    validateChavePix(chave) {
        const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(chave);
        const isTelefone = /^\+\d{1,3}\d{9,13}$/.test(chave);
        const isAleatoria = /^[a-zA-Z0-9]{32}$/.test(chave);
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(chave);
        const isCpfCnpj = this.CpfOrCnpjKey(chave);
        return isEmail || isTelefone || isAleatoria || isUuid || isCpfCnpj;
    }
    determinePixType(chave) {
        if (!chave) {
            chave = this.pixkey;
        }
        const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(chave);
        const isTelefone = /^\+\d{1,3}\d{9,13}$/.test(chave);
        const isAleatoria = /^[a-zA-Z0-9]{32}$/.test(chave);
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(chave);
        const isCpfCnpj = this.CpfOrCnpjKey(chave);
        return {
            key: chave,
            type: isEmail
                ? 'email'
                : isTelefone
                    ? 'phone'
                    : isAleatoria
                        ? 'token'
                        : isUuid
                            ? 'random'
                            : isCpfCnpj
                                ? 'cpf'
                                : 'cnpj',
        };
    }
    generateCRC16(payload) {
        let crc = 0xffff;
        for (let i = 0; i < payload.length; i++) {
            crc ^= payload.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = (crc << 1) ^ 0x1021;
                }
                else {
                    crc = crc << 1;
                }
            }
        }
        crc &= 0xffff;
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }
    extractPixPayload(evmpix) {
        const data = {};
        const mappings = {
            '00': 'payloadFormatIndicator',
            '01': 'pointOfInitiationMethod',
            '26': 'merchantAccountInfo',
            '52': 'merchantCategoryCode',
            '53': 'transactionCurrency',
            '54': 'transactionAmount',
            '58': 'countryCode',
            '59': 'merchantName',
            '60': 'merchantCity',
            '61': 'postalCode',
            '62': 'additionalDataFieldTemplate',
            '63': 'crc',
        };
        function processField(evmpix, offset) {
            const id = evmpix.slice(offset, offset + 2);
            const length = parseInt(evmpix.slice(offset + 2, offset + 4), 10);
            const value = evmpix.slice(offset + 4, offset + 4 + length);
            return { id, length, value, nextOffset: offset + 4 + length };
        }
        let offset = 0;
        while (offset < evmpix.length) {
            const { id, value, nextOffset } = processField(evmpix, offset);
            offset = nextOffset;
            const fieldName = mappings[id] || `unknownField_${id}`;
            if (id === '26') {
                const subfields = {};
                let subOffset = 0;
                while (subOffset < value.length) {
                    const { id: subId, value: subValue, nextOffset: subNextOffset, } = processField(value, subOffset);
                    subOffset = subNextOffset;
                    if (subId === '01')
                        subfields.pixKey = subValue;
                }
                data[fieldName] = subfields.pixKey || '';
            }
            else {
                data[fieldName] = value;
            }
        }
        const crcIndex = evmpix.indexOf('6304');
        if (crcIndex !== -1) {
            const crcPayload = evmpix.substring(0, crcIndex + 4);
            const generatedCRC = this.generateCRC16(crcPayload);
            if (generatedCRC !== evmpix.slice(crcIndex + 4, crcIndex + 8)) {
                throw new Error('CRC16 mismatch - invalid EVM Pix code');
            }
        }
        return {
            format: data.payloadFormatIndicator || '',
            method: data.pointOfInitiationMethod,
            chave: data.merchantAccountInfo || '',
            valor: data.transactionAmount,
            moeda: data.transactionCurrency,
            pais: data.countryCode,
            nomeRecebedor: data.merchantName,
            cidadeRecebedor: data.merchantCity,
            cep: data.postalCode,
            crc: data.crc,
            additionalInfo: data.additionalDataFieldTemplate,
        };
    }
    async generatingPixBilling(body) {
        try {
            body.pixkey = this.pixkey ?? body.pixkey;
            var valueCents = Number.isInteger(body.valueCents)
                ? body.valueCents
                : Math.round(body.valueCents * 100);
            var pixkey = this.generatePixPayload(body.valueCents, body.pixkey, body.description, body.name, body.city);
            var qrcode = await this.generatePixQRCode(body.pixkey, body.valueCents, body.description, body.name, body.city);
            var expireTimestamp = Math.round(new Date().getTime() / 1000 + (body.expires ?? 3600));
            return {
                qrcode: qrcode,
                pixkey: pixkey,
                value: {
                    original: body.valueCents,
                    cents: valueCents,
                    fixed: (valueCents / 100).toFixed(2),
                    float: valueCents / 100,
                },
                expires: {
                    timestamp: expireTimestamp,
                    dateTime: new Date(expireTimestamp * 1000).toLocaleString('pt-BR'),
                    iso: new Date(expireTimestamp * 1000).toISOString(),
                },
                code: (0, index_1.randomUUID)(),
            };
        }
        catch (error) {
            throw new Error(`Fail or error: ${error.message}`);
        }
    }
    listingPixBilling(body) {
        throw new Error('Method not implemented.');
    }
    searchPixBilling(body) {
        throw new Error('Method not implemented.');
    }
    generateProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
    listProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
    async getBalance() {
        return {
            valueCents: 0,
            valueFloat: 0.0,
        };
    }
    searchProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
}
exports.default = PixProvider;

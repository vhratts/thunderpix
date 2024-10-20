"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qrcode_1 = __importDefault(require("qrcode"));
const cpf_cnpj_validator_1 = require("cpf-cnpj-validator");
const pix_1 = __importDefault(require("../../utils/Bacem/pix"));
const crypto_1 = require("crypto");
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
        console.log(valor);
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
                code: (0, crypto_1.randomUUID)(),
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
    searchProviderWidthdraw(body) {
        throw new Error('Method not implemented.');
    }
}
exports.default = PixProvider;

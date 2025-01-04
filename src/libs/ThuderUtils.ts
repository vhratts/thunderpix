// import jwt, { JwtPayload } from 'jsonwebtoken';
// import axios from 'axios';

/**
 * Representa um item EMV decodificado.
 */
interface EMVItem {
    ID: string;
    EMVName: string;
    Size: number;
    Data: string | EMVObject;
}

interface EMVObject {
    [key: string]: EMVItem;
}

/**
 * Mapeia os nomes conhecidos para IDs EMV.
 */
const EMV_NAMES: { [key: string]: string } = {
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

export default class ThunderUtils {
    /**
     * Decodifica um JWT e exibe o Header e o Payload.
     * @param token O token JWT a ser decodificado.
     * @returns Um objeto contendo o Header e o Payload.
     */
    decodeJWT(
        token: string,
    ): { header: object; payload: string | object } | null {
        try {
            // Dividir o token em suas partes (Header, Payload e Signature)
            const [headerEncoded, payloadEncoded] = token.split('.');

            if (!headerEncoded || !payloadEncoded) {
                throw new Error('Token inválido.');
            }

            // Função para decodificar Base64URL
            const base64UrlDecode = (str: string): string => {
                const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                return decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(
                            (c) =>
                                `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`,
                        )
                        .join(''),
                );
            };

            // Decodificar Header e Payload
            const header = JSON.parse(base64UrlDecode(headerEncoded));
            const payload = JSON.parse(base64UrlDecode(payloadEncoded));

            // console.log('Header:', header);
            // console.log('Payload:', payload);

            return { header, payload };
        } catch (error) {
            console.error('Erro ao decodificar o JWT:', error);
            return null;
        }
    }

    /**
     * Decodifica uma chave EMV em um objeto estruturado.
     * @param emvString A string EMV (PIX copia-e-cola) a ser decodificada.
     * @returns Um objeto representando a chave EMV.
     */
    decodeEMVToObject(emvString: string): EMVObject {
        const decodeField = (str: string): EMVObject => {
            const result: EMVObject = {};
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
                    // Decodifica subcampos
                    result[id] = {
                        ID: id,
                        EMVName: emvName,
                        Size: size,
                        Data: decodeField(data),
                    };
                } else {
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

    /**
     * Converte um objeto EMV decodificado em um formato chave=valor.
     * @param emvObject O objeto EMV decodificado.
     * @returns Um objeto chave=valor.
     */
    emvParser(emvObject: EMVObject): { [key: string]: any } {
        const result: { [key: string]: any } = {};

        const parseItem = (item: EMVItem): any => {
            if (typeof item.Data === 'object') {
                // Se o Data for um objeto, processa recursivamente e retorna um array de valores
                return Object.values(item.Data).map((subItem) =>
                    parseItem(subItem),
                );
            }
            return item.Data;
        };

        for (const key in emvObject) {
            const item = emvObject[key];
            // Remove espaços e substitui caracteres para criar chaves amigáveis
            const keyName = (item.EMVName || `Field_${key}`).replace(
                /[^a-zA-Z0-9]/g,
                '_',
            );
            result[keyName] = parseItem(item);
        }

        return result;
    }

    /**
     * Verifica se há uma URL válida em Merchant_Account_Information.
     * @param keyValueObject O objeto chave=valor gerado a partir do EMV.
     * @returns Um objeto contendo a URL com https:// e o tamanho da URL, ou null se não houver uma URL válida.
     */
    extractPixUrl(keyValueObject: {
        [key: string]: any;
    }): { url: string; size: number } | null {
        const pixKey = 'Merchant_Account_Information';

        if (!keyValueObject[pixKey] || !Array.isArray(keyValueObject[pixKey])) {
            return null;
        }

        const urls = keyValueObject[pixKey].filter((item: string) =>
            /^([a-z0-9\-]+\.)+[a-z]{2,}\/.+$/.test(item),
        );

        if (urls.length === 0) {
            return null;
        }

        // Usa a primeira URL válida encontrada
        const url = `https://${urls[0]}`;
        return { url, size: url.length };
    }
}

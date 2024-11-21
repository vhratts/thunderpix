import qrcode from 'qrcode';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import ProviderInterface from '../../interfaces/ProviderInterface';
import pix from '../../utils/Bacem/pix';
import { randomUUID } from '../../utils/all/index';

interface ProviderConstruct {
    pixkey: string
}

interface pixTypeOutput {
    key: string,
    type: string
}

interface PixPayloadOutput {
    format: string;                 // Indicador do formato do payload
    method?: string;                // Método de iniciação (se presente)
    chave: string;                  // Chave Pix do recebedor
    valor?: string;                 // Valor da transação, se especificado
    moeda: string;                  // Código da moeda
    pais: string;                   // Código do país
    nomeRecebedor: string;          // Nome do recebedor
    cidadeRecebedor: string;        // Cidade do recebedor
    cep?: string;                   // Código postal, se especificado
    crc: string;                    // Código CRC16 para validação
    additionalInfo?: string;        // Informações adicionais, se presentes
}


export default class PixProvider implements ProviderInterface {
    private pixkey: string;
    
    public providerInfo = {
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

    public constructor(configs: ProviderConstruct) {
        this.pixkey = configs.pixkey;
    }

    // Função que gera o payload do Pix (copia e cola)
    public generatePixPayload(
        valor: number,
        chave: string | null = null,
        descricao: string | null = null,
        nomeRecebedor: string | null = null,
        cidadeRecebedor: string | null = null,
    ): string {
        // Se não houver chave passada, usa a chave padrão da classe
        if (!chave) {
            chave = this.pixkey;
        }

        // Se o valor não for inteiro, converte para centavos
        if (!Number.isInteger(valor)) {
            valor = Math.round(valor * 100); // Converte para centavos, arredondando
        }

        // Definindo os valores padrão, se não forem passados
        if (!nomeRecebedor) {
            nomeRecebedor = 'Recebedor';
        }

        if (!descricao) {
            descricao = 'Pague antes do vencimento';
        }

        if (!cidadeRecebedor) {
            cidadeRecebedor = 'Sao Paulo';
        }

        // Validação da chave Pix
        if (!this.validateChavePix(chave)) {
            throw new Error('Chave Pix inválida');
        }

        // Criação do payload Pix usando a biblioteca `pix-payload`
        const payload = pix({
            key: chave, // Chave Pix
            name: nomeRecebedor, // Nome do Recebedor
            city: cidadeRecebedor, // Cidade do Recebedor
            transactionId: '***', // ID da transação (pode ser substituído ou gerado dinamicamente)
            //   message: descricao, // Descrição da transação
            amount: valor / 100, // Valor formatado corretamente para Pix (exemplo: 19.99)
        });

        // Retorna o payload gerado
        return payload;
    }

    // Função para gerar o QR Code Pix
    public async generatePixQRCode(
        chave: string,
        valor: number,
        descricao: string,
        nomeRecebedor: string,
        cidadeRecebedor: string,
    ): Promise<string> {
        const payload = this.generatePixPayload(
            valor,
            chave,
            descricao,
            nomeRecebedor,
            cidadeRecebedor,
        );
        const qrCodeDataUrl = await qrcode.toDataURL(payload);
        return qrCodeDataUrl; // Retorna a URL do QRCode gerado
    }

    private CpfOrCnpjKey(key: string): boolean {
        if (cpf.isValid(key)) {
            return true;
        }

        if (cnpj.isValid(key)) {
            return true;
        }

        return false;
    }

    // Função que valida a chave Pix
    private validateChavePix(chave: string): boolean {
        const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(chave);
        const isTelefone = /^\+\d{1,3}\d{9,13}$/.test(chave); // Exemplo: +5511999999999
        const isAleatoria = /^[a-zA-Z0-9]{32}$/.test(chave); // Chave aleatória tem 32 caracteres
        const isUuid =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                chave,
            ); // Formato UUID
        const isCpfCnpj = this.CpfOrCnpjKey(chave); // Validação de CPF ou CNPJ
        return isEmail || isTelefone || isAleatoria || isUuid || isCpfCnpj;
    }

    public determinePixType(chave?: any): pixTypeOutput {
        if(!chave){
            chave = this.pixkey;
        }
        const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(chave);
        const isTelefone = /^\+\d{1,3}\d{9,13}$/.test(chave); // Exemplo: +5511999999999
        const isAleatoria = /^[a-zA-Z0-9]{32}$/.test(chave); // Chave aleatória tem 32 caracteres
        const isUuid =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                chave,
            ); // Formato UUID
        const isCpfCnpj = this.CpfOrCnpjKey(chave); // Validação de CPF ou CNPJ
        return {
            key: chave,
            type: (
                isEmail ? 'email' :
                isTelefone ? 'phone' :
                isAleatoria ? 'token' :
                isUuid ? 'random' :
                isCpfCnpj ? 'cpf' : 'cnpj'
            )
        };
    }

    // Função que gera o checksum CRC16 (necessário para o payload Pix)
    public generateCRC16(payload: string): string {
        let crc = 0xffff;
        for (let i = 0; i < payload.length; i++) {
            crc ^= payload.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }
        crc &= 0xffff;
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    public extractPixPayload(evmpix: string): PixPayloadOutput {
        const data: any = {};
        const mappings: { [key: string]: string } = {
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
    
        function processField(
            evmpix: string,
            offset: number
        ): { id: string; length: number; value: string; nextOffset: number } {
            const id = evmpix.slice(offset, offset + 2);
            const length = parseInt(evmpix.slice(offset + 2, offset + 4), 10);
            const value = evmpix.slice(offset + 4, offset + 4 + length);
            return { id, length, value, nextOffset: offset + 4 + length };
        }
    
        let offset = 0;
    
        while (offset < evmpix.length) {
            const { id, value, nextOffset } = processField(evmpix, offset);
            offset = nextOffset;
    
            const fieldName = mappings[id as keyof typeof mappings] || `unknownField_${id}`;
    
            // Tratamento especial para merchantAccountInfo (ID 26)
            if (id === '26') {
                const subfields: any = {};
                let subOffset = 0;
                while (subOffset < value.length) {
                    const { id: subId, value: subValue, nextOffset: subNextOffset } = processField(
                        value,
                        subOffset
                    );
                    subOffset = subNextOffset;
    
                    if (subId === '01') subfields.pixKey = subValue; // Identificador da chave Pix
                }
                data[fieldName] = subfields.pixKey || '';
            } else {
                data[fieldName] = value;
            }
        }
    
        // Validação CRC
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
    
    
    async generatingPixBilling(
        body: PixGeneratingPixBillingInterface,
    ): Promise<Object> {
        try {
            body.pixkey = this.pixkey ?? body.pixkey;
            var valueCents: number = Number.isInteger(body.valueCents)
                ? body.valueCents
                : Math.round(body.valueCents * 100);
            var pixkey = this.generatePixPayload(
                body.valueCents,
                body.pixkey,
                body.description,
                body.name,
                body.city,
            );

            var qrcode = await this.generatePixQRCode(
                body.pixkey,
                body.valueCents,
                body.description,
                body.name,
                body.city,
            );

            var expireTimestamp = Math.round(
                new Date().getTime() / 1000 + (body.expires ?? 3600),
            );

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
                    dateTime: new Date(expireTimestamp * 1000).toLocaleString(
                        'pt-BR',
                    ),
                    iso: new Date(expireTimestamp * 1000).toISOString(),
                },
                code: randomUUID(),
            };
        } catch (error: any) {
            throw new Error(`Fail or error: ${error.message}`);
        }
    }

    listingPixBilling(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    searchPixBilling(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    generateProviderWidthdraw(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    listProviderWidthdraw(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }

    async getBalance(): Promise<BalanceOutput> {
        return {
            valueCents: 0,
            valueFloat: 0.0
        };
    }
    
    searchProviderWidthdraw(body?: object): Promise<Object> {
        throw new Error('Method not implemented.');
    }
}

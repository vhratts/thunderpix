interface EMVItem {
    ID: string;
    EMVName: string;
    Size: number;
    Data: string | EMVObject;
}
interface EMVObject {
    [key: string]: EMVItem;
}
interface PixIdentifyOutput {
    type: string;
    regex: string;
    status: boolean;
}
export default class ThunderUtils {
    decodeJWT(token: string): {
        header: object;
        payload: string | object;
    } | null;
    decodeEMVToObject(emvString: string): EMVObject;
    emvParser(emvObject: EMVObject): {
        [key: string]: any;
    };
    extractPixUrl(keyValueObject: {
        [key: string]: any;
    }): {
        url: string;
        size: number;
    } | null;
    static pixTypeIdentify(chave: string): PixIdentifyOutput;
    static documentValidation(cpf: string): boolean;
}
export {};

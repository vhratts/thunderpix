interface EMVItem {
    ID: string;
    EMVName: string;
    Size: number;
    Data: string | EMVObject;
}
interface EMVObject {
    [key: string]: EMVItem;
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
}
export {};

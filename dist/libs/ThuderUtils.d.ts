export default class ThunderUtils {
    decodeJWT(token: string): {
        header: object;
        payload: string | object;
    } | null;
}

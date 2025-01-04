import { JwtPayload } from 'jsonwebtoken';
export default class ThunderUtils {
    decodeAndValidateJWT(token: string, jwksUrl: string): Promise<JwtPayload | null>;
    decodeJWT(token: string): {
        header: object;
        payload: string | JwtPayload;
    } | null;
}

import jwt, { JwtPayload } from 'jsonwebtoken';
import axios from 'axios';

export default class ThunderUtils {
    /**
     * Decodifica e valida um JWT.
     * @param token O token JWT recebido.
     * @param jwksUrl URL do JWKS para buscar a chave pública.
     * @returns Os dados do payload, se válidos.
     */
    async decodeAndValidateJWT(
        token: string,
        jwksUrl: string,
    ): Promise<JwtPayload | null> {
        try {
            // Decodifica o header do JWT para obter o `kid`
            const decodedHeader = jwt.decode(token, { complete: true }) as {
                header: { kid: string };
            } | null;

            if (!decodedHeader || !decodedHeader.header.kid) {
                throw new Error('Header do JWT inválido.');
            }

            const kid = decodedHeader.header.kid;

            // Busca as chaves públicas do JWKS
            const response = await axios.get(jwksUrl);
            const keys = response.data.keys;

            // Encontra a chave correspondente ao `kid`
            const key = keys.find((key: any) => key.kid === kid);
            if (!key) {
                throw new Error('Chave correspondente ao kid não encontrada.');
            }

            // Converte a chave pública para PEM
            const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.x5c[0]}\n-----END PUBLIC KEY-----`;

            // Verifica e valida o token
            const payload = jwt.verify(token, publicKey, {
                algorithms: ['RS256'],
            }) as JwtPayload;

            return payload;
        } catch (error) {
            console.error('Erro ao decodificar ou validar o JWT:', error);
            return null;
        }
    }

    /**
     * Decodifica um JWT e exibe o Header e o Payload.
     * @param token O token JWT a ser decodificado.
     * @returns Um objeto contendo o Header e o Payload.
     */
    decodeJWT(token: string): { header: object; payload: string | JwtPayload } | null {
        try {
            // Decodifica o JWT sem validação
            const decoded = jwt.decode(token, { complete: true });

            if (!decoded || typeof decoded !== 'object') {
                throw new Error('Token inválido.');
            }

            const { header, payload } = decoded;

            return { header, payload };
        } catch (error) {
            console.error('Erro ao decodificar o JWT:', error);
            return null;
        }
    }
}

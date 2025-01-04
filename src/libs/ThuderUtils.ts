// import jwt, { JwtPayload } from 'jsonwebtoken';
// import axios from 'axios';

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
}

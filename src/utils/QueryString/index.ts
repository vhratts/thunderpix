type QueryObject = Record<string, string | number | boolean | null | undefined>;

const queryString = {
    /**
     * Converte um objeto em uma string de consulta (query string).
     * @param {QueryObject} obj - Objeto para serializar.
     * @returns {string} Query string resultante.
     */
    stringify(obj: QueryObject): string {
        return Object.keys(obj)
            .filter(key => obj[key] !== undefined && obj[key] !== null) // Ignora valores nulos/indefinidos
            .map(key =>
                queryString.encode(key) + '=' + queryString.encode(String(obj[key]))
            )
            .join('&');
    },

    /**
     * Converte uma string de consulta em um objeto.
     * @param {string} str - String de consulta (query string).
     * @returns {QueryObject} Objeto resultante.
     */
    parse(str: string): QueryObject {
        return str
            .replace(/^\?/, '') // Remove o '?' inicial, se existir
            .split('&') // Divide em pares chave=valor
            .reduce<QueryObject>((acc, pair) => {
                const [key, value] = pair.split('=').map(queryString.decode);
                acc[key] = value ?? '';
                return acc;
            }, {});
    },

    /**
     * Codifica uma string para ser usada em uma URL.
     * @param {string} value - Valor para codificar.
     * @returns {string} Valor codificado.
     */
    encode(value: string): string {
        return encodeURIComponent(value)
            .replace(/%20/g, '+') // Substitui espaços por '+'
            .replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`); // Trata caracteres especiais
    },

    /**
     * Decodifica uma string codificada de uma URL.
     * @param {string} value - Valor para decodificar.
     * @returns {string} Valor decodificado.
     */
    decode(value: string): string {
        return decodeURIComponent(value.replace(/\+/g, ' ')); // Substitui '+' por espaço antes de decodificar
    }
};

export default queryString;
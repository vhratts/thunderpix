type QueryObject = Record<string, string | number | boolean | null | undefined>;
declare const queryString: {
    stringify(obj: QueryObject): string;
    parse(str: string): QueryObject;
    encode(value: string): string;
    decode(value: string): string;
};
export default queryString;

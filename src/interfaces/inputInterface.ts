interface PixGeneratingPixBillingInterface {
    valueCents: number;
    pixkey: string;
    description: string;
    name: string;
    city: string;
    expires: number;
}

interface PixGenerateProviderWidthdraw {
    initiationType: 'dict' | 'manual';
    idempotentId: string;
    valueCents: number;
    receiverName: string;
    receiverDocument: string;
    pixKeyType?: string;
    pixKey?: string;
    bankIspb?: string;
    agency?: string;
    account?: string;
    accountType?: string;
    authorized: boolean;
}

interface PixlistingPixBilling {
    page: number | null;
    registrationDateStart: string | null;
    registrationDateEnd: string | null;
}

interface searchPixBilling {
    reference: string;
}

interface listProviderWidthdraw {
    page: number;
    registrationStartDate?: string;
    registrationEndDate?: string;
    paymentStartDate?: string;
    paymentEndDate?: string;
}

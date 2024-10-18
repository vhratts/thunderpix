interface listingPixBillingOutput {
    qrcodes: [
        {
            referenceCode: string;
            valueCents: number;
            content: string;
            status: string;
            generatorName: string;
            generatorDocument: string;
            payerName: string;
            payerDocument: string;
            registrationDate: string;
            paymentDate: string;
            endToEnd: string;
        },
    ];
    meta: {
        current_page: number;
        total_pages: number;
        total_items_amount: number;
        total_value_cents: number;
    };
}

interface searchPixBillingOutput {
    referenceCode: string;
    valueCents: number;
    content: string;
    status: string;
    generatorName: string;
    generatorDocument: string;
    payerName: string;
    payerDocument: string;
    payerBankName: string;
    payerAgency: string;
    payerAccount: string;
    payerAccountType: string;
    registrationDate: string;
    paymentDate: string;
    endToEnd: string;
}

interface generateProviderWidthdrawOutput {
    reference_code: string;
    idempotent_id: string;
    value_cents: number;
    pix_key_type: string;
    pix_key: string;
    receiver_name: string;
    receiver_document: string;
    status: string;
}

interface listProviderWidthdrawOutput {
    payments: [
        {
            referenceCode: string;
            idempotentId: string;
            valueCents: number;
            pixKeyType: string;
            pixKey: string;
            receiverName: string;
            receiverDocument: string;
            status: string;
            registrationDate: string;
            paymentDate: string;
            cancellationDate: string | null;
            cancellationReason: string | null;
            endToEnd: string;
        },
    ];
    meta: {
        current_page: number;
        total_pages: number;
        total_items_amount: number;
        total_value_cents: number;
    };
}

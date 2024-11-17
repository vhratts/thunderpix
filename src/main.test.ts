/**
 * Testes
 */

import ThunderPix, { PixProvider, ZendryProvider } from './index';

(async () => {
    // var provider = new PixProvider('91b7482c-3ef1-4eff-8d80-9a59c87773a8');
    var provider = new ZendryProvider({
        clientId: '...',
        clientSecret: '...',
        isTest: false,
    });

    var thunder = new ThunderPix(provider);

    // var qrcode = await thunder.createQrCode({
    //   valueCents: 199,
    //   expires: 3600,
    // });

    // var data = await thunder.getTransactions({
    //     type: 'input',
    //     options: {
    //         page: 1,
    //         registrationDateStart: new Date('2024-10-01').toISOString(),
    //         registrationDateEnd: new Date().toISOString(),
    //     },
    // });

    var data = await thunder.getBalance();

    console.log(data);
})();

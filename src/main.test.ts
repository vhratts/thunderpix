/**
 * Testes
 */

import ThunderPix, { PixProvider, PrimepagProvider, ZendryProvider } from './index';

(async () => {
    // var provider = new PixProvider({
    //     pixkey: '91b7482c-3ef1-4eff-8d80-9a59c87773a8'
    // });

    var provider = new PrimepagProvider({
        clientId: '74166a82-...',
        clientSecret: 'c9cd716f-...',
        isTest: false,
    });

    var thunder = new ThunderPix(provider);

    var data = await thunder.createQrCode({
      valueCents: 199,
      expires: 3600,
    });

    // var data = await thunder.getTransactions({
    //     type: 'input',
    //     options: {
    //         page: 1,
    //         registrationDateStart: new Date('2024-10-01').toISOString(),
    //         registrationDateEnd: new Date().toISOString(),
    //     },
    // });

    // var data = await thunder.getBalance();
    // var data = provider.extractPixPayload("00020126790014BR.GOV.BCB.PIX0136f50c83a9-9dc0-43b2-9765-821fb07969170217mensagem de teste52040000530398654041.005802BR5925Victor Hugo Sergio Brito 6009SAO PAULO62140510GNLIXSIv4j63046166")

    console.log(data);
})();

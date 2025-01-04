/**
 * Testes
 */

import ThunderPix, { PixProvider, PrimepagProvider, ThunderUtils, ZendryProvider } from './index';

(async () => {
    // var provider = new PixProvider({
    //     pixkey: '91b7482c-3ef1-4eff-8d80-9a59c87773a8'
    // });

    var utils = new ThunderUtils();

    var data = utils.decodeJWT("eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vcGl4LnByaW1lcGFnLmNvbS5ici9xci92My9qd2tzIiwia2lkIjoiTmFoTF85dDZPQWd3WkpRM0VpUjdxVVN5S1lnQXVaNVR1NVhqYlpGSDZ6TSIsInR5cCI6IkpXUyIsIng1dCI6Iktnby03NzdyX2ZxUU8tUklFWjBEaVpTeWVHYyJ9.eyJyZXZpc2FvIjowLCJjYWxlbmRhcmlvIjp7ImNyaWFjYW8iOiIyMDI1LTAxLTAzVDIzOjQzOjM0WiIsImFwcmVzZW50YWNhbyI6IjIwMjUtMDEtMDNUMjM6NDQ6MThaIiwiZXhwaXJhY2FvIjozNjAwfSwidmFsb3IiOnsib3JpZ2luYWwiOiIxLjA1IiwibW9kYWxpZGFkZUFsdGVyYWNhbyI6MH0sImNoYXZlIjoiOGJiM2MxNjQtODVlZi00YjI2LTgwMjEtZTg2MjNlNzU0NWVhIiwidHhpZCI6IjIyMGI5OWUwNGE0NDg3OTEyZGUxYWMwZTVmZTNkOCIsInN0YXR1cyI6IkFUSVZBIiwiaW5mb0FkaWNpb25haXMiOltdfQ.Lmu8DXDHwxC3Q_J0pZVe1S8jHh_pIgKp2sgLAdZcwFromHUc_KTHFReNCkMgakJiX2rk1_snX1LWSGqI3u8X3yGduVt52BSL2zF2bIaByCj_74K-_O244AANCYk3o6Dm2Pg95kjTf_QcSfSnUzzdiGdLzYIjoMxaDp07_1_BJSew-9rpCXM_n2cLYfGDWyZZGJ51gAdgZ9txlb_Ju16naKvLHBkQ06FarZBKk2kKB3BXC7pSVwQ6Z0GneE3LZoayRHBKlk2YSuEkZRabJ6J5KOtTfepVFMUumdWch80HVRqQ0Kq8br_8fSQw1u8wHRyguAyPngzgcGt-9CmwMfbXnQ")

    // var provider = new PrimepagProvider({
    //     clientId: '74166a82-...',
    //     clientSecret: 'c9cd716f-...',
    //     isTest: false,
    // });

    // var thunder = new ThunderPix(provider);

    // var data = await thunder.createQrCode({
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

    // var data = await thunder.getBalance();
    // var data = provider.extractPixPayload("00020126790014BR.GOV.BCB.PIX0136f50c83a9-9dc0-43b2-9765-821fb07969170217mensagem de teste52040000530398654041.005802BR5925Victor Hugo Sergio Brito 6009SAO PAULO62140510GNLIXSIv4j63046166")

    console.log(data);
})();

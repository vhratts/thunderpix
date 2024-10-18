/**
 * Testes 
 */

import ThunderPix, { PixProvider, PrimepagProvider } from './index';

(async () => {
  // var provider = new PixProvider('91b7482c-3ef1-4eff-8d80-9a59c87773a8');
  var provider = new PrimepagProvider('ac536f63-0d9b-4897-9e33-f1cf67adaac0', '38da4a8d-b99d-4d9a-8b85-0d66ba6789c0', true);
  var thunder = new ThunderPix(provider);

  var qrcode = await thunder.createQrCode({
    valueCents: 199,
    expires: 3600,
  });

  console.log(qrcode);
})();

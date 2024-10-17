/**
 * Testes
 */

import ThunderPix from './index';
import PixProvider from './providers/pix/PixProvider';

(async () => {
  var provider = new PixProvider('91b7482c-3ef1-4eff-8d80-9a59c87773a8');
  var thunder = new ThunderPix(provider);

  var qrcode = await thunder.createQrCode({
    valueCents: 199,
    expires: 3600,
  });

  console.log(qrcode);
})();

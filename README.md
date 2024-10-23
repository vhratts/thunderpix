<p align="center">
<a href="#" target="_blank" style="display: flex; justify-content: center;">
<img src="app.png" width="400" alt="logo" style="width: 80px;">
</a>
</p>

<p align="center">
<a href="#" style="font-size: 30px;">⚡️ ThunderPix</a>
</p>

<p align="center">
<img src="https://img.shields.io/badge/version-1.1.0-cyan" alt="version">
<img src="https://img.shields.io/badge/build-pass-info" alt="build">
<img src="https://img.shields.io/badge/test-pass-green" alt="test">
</p>

<p align="center">
Biblioteca javascript de padronização de gateways de pagamentos PIX 
</p>

## Introdução
Esta biblioteca tem como intuito fornecer uma interface de desenvolvimento de sistemas de pagamento, agregando as principais bibliotecas do mercado. 

## instalação
Para instalar este pacote em seu projeto, utilize o ```NPM``` ou ```YARN```

```sh
npm install thunderpix
```

## Inicio Rápido

Para utilizar a biblioteca, é necessario declarar o ```Provedo de pagamento``` que você deseja 
utilizar. 

```ts
/**
 * Importe o construtor do ThunderPix 
 * e alguns dos provedores de pagamento listados
 */
import ThunderPix, { PixProvider } from 'thunderpix';
```

No exemplo usaremos um utilitario simples para gerar QrCode de cobrança Pix a partir de chave estática
(email, aleatoria, cpf, telefone, cnpj).

```ts
(async () => {
  /**
   * Iniciando uma instancia do provedor
   * de pagamentos (no exemplo, uma chave pix aleatória)
   */
  var provider = new PixProvider({
    pixkey: '91b7482c-3ef1-4eff-8d80-9a59c87773a8'
  });
  /**
   * Inicia o construtor do ThunderPix
   * passando a instancia do provedor de pagamento
   */
  var thunder = new ThunderPix(provider);

  /**
   * Gerando um QrCode Pix de cobrança
   */
  var qrcode = await thunder.createQrCode({
    valueCents: 199,
    expires: 3600,
  });

  console.log(qrcode);
})();
```
O codigo acima é um exeplo basico de uso, onde o retorno da chamada é um objeto
contendo os seguntes parametros:

```json
{
  "qrcode": "data:image/png;base64,..",
 "pixkey": "00020126580014BR.GOV.BCB.PIX013691b7482c-3ef1-4eff-8d80-9a59c87773a852040000530398654041.995802BR5909Recebedor6009Sao Paulo62070503***6304E144",
  "value": { "original": 199, "cents": 199, "fixed": "1.99", "float": 1.99 },
  "expires": {
    "timestamp": 1729220402,
    "dateTime": "18/10/2024, 0:00:02",
    "iso": "2024-10-18T03:00:02.000Z"
  },
  "code": "fa99076c-f5d6-49fa-b4d9-51fdd1852fe6"
}
```

## Provedores de pagamento suportados

A tabela abaixo mostra a lista de provedores de pagamento suportados pela biblioteca. 
De acordo com a atualização do desenvolvimento, esta tabela será modificada.

>- AVISO: Esta tabela é atualizada de acordo com a entrada ou saida de provedores de pagamento do sistema. Caso alguma API fique indisponivel por queda do serviço do provedor, O mesmo será tirado desta biblioteca.

| logo/imagem | nome/link | online/offline | Provedor | Recuperar Saldo | Gerar QrCode | Listar QrCodes | Buscar QrCode | Gerar Saque | Listar Saque | Buscar Saque |
|------|-------------|--------|----------|-------------|--------------|----------------|---------------|-------------|--------------|--------------|
| <img src="https://www.bcb.gov.br/content/estabilidadefinanceira/piximg/logo_pix.png" alt="Logo Pix" width="100" height="40"> | [Pix](https://www.bcb.gov.br/estabilidadefinanceira/pix) | ✅ online | [PixProvider](src/providers/pix/PixProvider.ts) | 🚫 Não | ✅ Sim | 🚫 Não | 🚫 Não | 🚫 Não | 🚫 Não | 🚫 Não |
| <img src="https://primepag.com.br/wp-content/uploads/2023/12/Logo-Primepag-5-1-1536x339.png" alt="Logo Primepag" width="100" height="25"> | [Banco Primepag](https://primepag.com.br) | ✅ online | [PrimepagProvider](src/providers/pix/PrimepagProvider.ts) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" alt="Logo MercadoPago" width="100" height="25"> | [Mercado Pago](https://www.mercadopago.com.br) | ✅ online | [MercadoPagoProvider](src/providers/pix/MercadoPagoProvider.ts) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| <img src="https://cdn.worldvectorlogo.com/logos/picpay-1.svg" alt="Logo PicPay" width="100" height="25"> | [PicPay](https://picpay.com) | ✅ online | [PicPayProvider](src/providers/pix/PicPayProvider.ts) | 🚫 Não | ✅ Sim | ✅ Sim | ✅ Sim | 🚫 Não | 🚫 Não | 🚫 Não |
| <img src="https://lojaintegrada.com.br/assets/img/pagarme-logo.png" alt="Logo PicPay" width="100" height="35"> | [Pagar-me](https://pagar.me) | ✅ online | [PagarmeProvider](src/providers/pix/PagarmeProvider.ts) | 🚫 Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| <img src="https://openpix.com.br/_next/static/media/og-openpix.c750b819.png" alt="Logo OpenPix" width="100" height="55"> | [OpenPix](https://openpix.com.br) | ✅ online | [OpenPixProvider](src/providers/pix/OpenPixProvider.ts) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| <img src="https://sejaefi.com.br/_ipx/_/images/components/menu/logo-efi-pay-orange.svg" alt="Logo OpenPix" width="100" height="55"> | [EfiPay](https://sejaefi.com.br) | ✅ online | [EfiPayProvider](src/providers/pix/EfiPayProvider.ts) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |

## Bugs e reports

Para reportar bugs ou erros, use a aba [issues](https://github.com/vhratts/thunderpix/issues) deste repositório.

## Contato
Desenvolvedor: Victor Ratts<br>
Email: victor@vratts.com<br>
site: [vratts](https://vratts.com)

### Me pague um café ☕️ 🙏 
Pix: 91b7482c-3ef1-4eff-8d80-9a59c87773a8


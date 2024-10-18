<p align="center">
<a href="#" target="_blank" style="display: flex; justify-content: center;">
<img src="app.png" width="400" alt="logo" style="width: 80px;">
</a>
</p>

<p align="center">
<a href="#" style="font-size: 30px;">⚡️ ThunderPix</a>
</p>

<p align="center">
<img src="https://img.shields.io/badge/version-1.0.0-cyan" alt="version">
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
  var provider = new PixProvider('91b7482c-3ef1-4eff-8d80-9a59c87773a8');
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
  "valueCents": 1.99,
  "expires": 3600,
  "code": "KQyVUwqU8WkMlV..."
}
```

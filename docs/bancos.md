# Consulta de bancos

Tela: `/financeiro/consulta-bancos`

A pesquisa usa a lista de instituições do Banco Central publicada pela Brasil API.

## Endpoint

`GET https://brasilapi.com.br/api/banks/v1`

Não há filtro na URL. A tela baixa a lista e filtra no navegador.

| Termo digitado | Critério |
|---|---|
| Com letras, por exemplo `Bradesco` | Nome abreviado ou nome completo, sem diferenciar acentos |
| Até 3 dígitos, por exemplo `237` ou `001` | Código de compensação |
| Mais de 3 dígitos | Trecho do ISPB |

Um termo como `Bradesco 237` casa pelo nome ou pelo código. A tela mostra no máximo 20 instituições e informa o total quando a pesquisa é mais ampla.

## Campos exibidos

| Campo na tela | Campo da API |
|---|---|
| Banco | `fullName`, ou `name` quando o nome completo não vem |
| Código | `code`, com três dígitos |
| ISPB | `ispb` |

Código ou ISPB ausente aparece como "Não informado".

## Falhas

Lista indisponível, resposta fora do formato ou falha de rede: "Não foi possível consultar os bancos." Uma pesquisa sem correspondência não é erro.

## Código

- `app/services/bancos.js`
- `app/pages/consulta-bancos.jsx`
- `app/components/BankResult.jsx`

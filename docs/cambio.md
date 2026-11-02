# Consulta de câmbio

Tela: `/financeiro/consulta-cambio`

A cotação é a PTAX do Banco Central, em reais por unidade da moeda estrangeira, via Brasil API.

## Moedas

`GET https://brasilapi.com.br/api/cambio/v1/moedas`

O seletor usa essa lista. O rótulo em português de `app/utils/currencies.json` substitui o nome da API quando o símbolo existe no arquivo. Moedas que a PTAX não publica, como real, peso argentino e yuan, não entram no seletor. Coroa dinamarquesa, coroa norueguesa e coroa sueca aparecem com o nome vindo da API.

## Cotação

`GET https://brasilapi.com.br/api/cambio/v1/cotacao/{moeda}/{data}`

A data usa o fuso de São Paulo, no formato `YYYY-MM-DD`. A Brasil API recusa o dia corrente (`today_date_error`). A consulta começa no dia anterior. Em fim de semana ou feriado, a própria API devolve o último dia útil e o campo `data` traz essa data. Se a data pedida responder 400 ou 404, a tela tenta até sete dias para trás.

De cada resposta, a tela usa o boletim de fechamento (`FECHAMENTO PTAX`). Se ele não vier, usa o último boletim da lista.

## Campos exibidos

| Campo na tela | Origem |
|---|---|
| Compra | `cotacao_compra` |
| Venda | `cotacao_venda` |
| Data | `data` |
| Boletim | `tipo_boletim` |

Os valores são formatados em reais, com quatro casas decimais.

## Conversão

Depois da cotação, a tela mostra dois campos: o valor na moeda consultada e o valor em reais. Os dois usam a cotação de venda. Alterar um recalcula o outro. O campo editado permanece como foi digitado; o outro aparece com duas casas decimais. Uma nova consulta ou outra moeda limpa os dois campos.

## Falhas

Lista de moedas indisponível: a consulta fica desabilitada e a tela pede para recarregar.

Cotação indisponível por falha de rede ou resposta inválida: "Não foi possível consultar o câmbio."

Nenhum dos sete dias com cotação: "Não há cotação PTAX disponível para esta moeda nos últimos dias."

## Código

- `app/services/cambio.js`
- `app/pages/consulta-cambio.jsx`
- `app/utils/currencies.json`

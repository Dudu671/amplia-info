# Consulta de corretoras

Tela: `/financeiro/consulta-corretoras`

A pesquisa usa o cadastro de corretoras da CVM publicado pela Brasil API.

## Endpoint

`GET https://brasilapi.com.br/api/cvm/corretoras/v1`

A API também aceita `?uf=`, mas esta tela não filtra por estado. O nome é filtrado no navegador, em `nome_social` e `nome_comercial`, sem diferenciar acentos. A pesquisa só segue com pelo menos 2 caracteres.

A lista inclui corretoras que não estão em funcionamento. A situação cadastral aparece no resultado, por exemplo `EM FUNCIONAMENTO NORMAL` ou `CANCELADA`.

A tela mostra no máximo 20 corretoras e informa o total quando há mais correspondências.

## Campos exibidos

| Campo na tela | Campo da API |
|---|---|
| Título | `nome_comercial`, ou `nome_social` |
| Razão social | `nome_social` |
| CNPJ | `cnpj` |
| Situação | `status` |
| Cidade | `municipio` e `uf` |
| Código CVM | `codigo_cvm` |
| Telefone | `telefone` |
| E-mail | `email` |

Campos vazios ficam de fora do cartão.

## Falhas

Menos de 2 caracteres: "Digite pelo menos 2 caracteres do nome da corretora."

Lista indisponível, resposta fora do formato ou falha de rede: "Não foi possível consultar as corretoras." Uma pesquisa sem correspondência não é erro.

## Código

- `app/services/corretoras.js`
- `app/pages/consulta-corretoras.jsx`
- `app/components/ConsultationResult.jsx`

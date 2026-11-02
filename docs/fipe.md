# Consulta FIPE

Tela: `/financeiro/consulta-fipe`

O preço médio é o da tabela FIPE vigente, consultado pela Brasil API. Não há chave de acesso.

## Endpoints

A base é `https://brasilapi.com.br/api/fipe`. O tipo de veículo da tela entra na URL: `carros`, `motos` ou `caminhoes`.

| Passo | Rota | Rótulo | Código usado no passo seguinte |
|---|---|---|---|
| Marcas | `GET /marcas/v1/{tipo}` | `nome` | `valor` |
| Modelos | `GET /veiculos/v1/{tipo}/{marca}` | `modelo` | `valor` |
| Anos | `GET /anos/v1/{tipo}/{marca}/{modelo}` | `nome` | `valor`, no formato `1987-1` ou `1997-3`. Os mais recentes aparecem primeiro. O código `32000`, usado para veículo zero-quilômetro, aparece como "Zero KM" |
| Preço | `GET /detalhes/v1/{tipo}/{marca}/{modelo}/{ano}` | — | — |

Cada lista só carrega depois da escolha anterior. Trocar o tipo, a marca ou o modelo limpa os campos seguintes e o preço. Se uma lista falhar, escolher de novo o campo anterior refaz a consulta.

A rota `/fipe/tabelas/v1` lista meses de referência antigos e não é usada. Sem esse parâmetro, a Brasil API responde com a tabela vigente.

## Campos exibidos

| Campo na tela | Campo da API |
|---|---|
| Título | `valor`, já formatado em reais |
| Marca | `marca` |
| Modelo | `modelo` |
| Ano | `anoModelo`, quando tem quatro dígitos; caso contrário, o rótulo escolhido no seletor |
| Combustível | `combustivel` |
| Código FIPE | `codigoFipe` |
| Referência | `mesReferencia` |

## Falhas

Lista indisponível ou em formato inesperado: "Não foi possível carregar as marcas.", e o equivalente para modelos e anos.

Preço indisponível ou incompleto: "Não foi possível consultar o preço FIPE." ou "Não foi possível interpretar o preço FIPE."

Uma lista vazia não é erro. O seletor correspondente fica desabilitado.

## Código

- `app/services/fipe.js`
- `app/pages/consulta-fipe.jsx`

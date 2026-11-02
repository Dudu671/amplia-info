# AmpliaInfo

Portal de consultas públicas desenvolvido com React, React Router e SCSS.

## Desenvolvimento

```sh
npm ci
npm run dev
```

## Verificação

```sh
npm run lint
npm test
npm run build
```

`npm start` serve o build de produção.

## Consultas disponíveis

- As cidades de cada estado são carregadas pela API pública do IBGE.
- A pesquisa de hospitais depende de `VITE_HOSPITAIS_API_URL`. Sem configuração, a tela informa que a pesquisa está indisponível.
- Bancos, corretoras e câmbio consultam a Brasil API. O comportamento de cada uma está em [docs](docs/README.md).
- A consulta FIPE usa a Brasil API. O comportamento está em [docs/fipe.md](docs/fipe.md).
- Em Geográfico, as telas de busca de CEP, detalhe do CEP e previsão CPTEC reproduzem o protótipo do Figma. Os resultados estão identificados como exemplos; a integração dessas consultas com as APIs será feita em uma próxima etapa. A seleção de cidades na busca de CEP reutiliza a API do IBGE.

## Configuração da pesquisa de hospitais

Copie `.env.example` para `.env.local`, preencha `VITE_HOSPITAIS_API_URL` e reinicie o servidor de desenvolvimento. Essa variável é pública no navegador e não deve conter credenciais.

O serviço envia os filtros `name`, `state` e `city` como parâmetros da URL. O endpoint deve retornar um array de hospitais ou um objeto com `results` contendo esse array. Respostas inválidas e falhas de consulta são exibidas como erro, sem serem confundidas com uma pesquisa sem resultados.

## Componentes compartilhados

- `Dropdown`: seleção com pesquisa, navegação por teclado e ícone opcional; usado em Hospitais, Câmbio e FIPE.
- `ConsultationPage`, `ConsultationForm`, `ConsultationField` e `Breadcrumb`: estrutura comum das consultas financeiras.
- `ServiceCard`: acesso às consultas nas páginas de categorias.

As próximas etapas estão descritas em [planning.md](planning.md).

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
- As telas financeiras estão preparadas para a etapa de integração. As ações indisponíveis ficam desabilitadas e identificadas na interface.
- Na FIPE, o tipo de veículo pode ser selecionado. Marcas, modelos e anos dependem da integração e ficam desabilitados.

## Configuração da pesquisa de hospitais

Copie `.env.example` para `.env.local`, preencha `VITE_HOSPITAIS_API_URL` e reinicie o servidor de desenvolvimento. Essa variável é pública no navegador e não deve conter credenciais.

O serviço envia os filtros `name`, `state` e `city` como parâmetros da URL. O endpoint deve retornar um array de hospitais ou um objeto com `results` contendo esse array. Respostas inválidas e falhas de consulta são exibidas como erro, sem serem confundidas com uma pesquisa sem resultados.

## Componentes compartilhados

- `Dropdown`: seleção com pesquisa, navegação por teclado e ícone opcional; usado em Hospitais, Câmbio e FIPE.
- `ConsultationPage`, `ConsultationForm`, `ConsultationField` e `Breadcrumb`: estrutura comum das consultas financeiras.
- `ServiceCard`: acesso às consultas nas páginas de categorias.

As próximas etapas estão descritas em [planning.md](planning.md).

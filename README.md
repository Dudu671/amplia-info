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
- A pesquisa de hospitais usa um índice oficial CNES para nomes e localização e consulta os detalhes na API do Ministério da Saúde pelo servidor.
- Bancos, corretoras e câmbio consultam a Brasil API. O comportamento de cada uma está em [docs](docs/README.md).
- A consulta FIPE usa a Brasil API. O comportamento está em [docs/fipe.md](docs/fipe.md).
- A previsão CPTEC consulta a Brasil API. O comportamento está em [docs/cptec.md](docs/cptec.md).
- Em Geográfico, as telas de busca de CEP e detalhe do CEP reproduzem o protótipo do Figma. Os resultados estão identificados como exemplos; a integração dessas consultas será feita em uma próxima etapa. A seleção de cidades na busca de CEP reutiliza a API do IBGE.

## Configuração da pesquisa de hospitais

Use Node.js 24 ou superior. `npm run dev` e `npm start` iniciam o servidor e um worker que atualiza o índice ao iniciar e a cada 24 horas, independentemente das pesquisas. A primeira carga baixa cerca de 65 MB compactados e processa o JSON em fluxo. Até existir uma base válida, a tela informa indisponibilidade.

Para preparar ou atualizar a base antes de iniciar o servidor:

```sh
npm run hospitais:index
```

O índice fica em `data/hospitais/`, ignorado pelo Git. Copie `.env.example` para `.env.local` para personalizar o diretório com `HOSPITAIS_INDEX_DIR`. Em produção ele precisa apontar para um volume persistente gravável. O armazenamento contém dados públicos, fora de `public/`, e não deve ser servido como arquivo estático.

Em múltiplas instâncias, mantenha somente um atualizador: configure `HOSPITAIS_INDEX_WORKER=0` nos servidores e execute `npm run hospitais:index:watch` em um worker separado com o mesmo volume. Alternativamente agende `npm run hospitais:index` diariamente no agendador do ambiente. Os comandos carregam `.env.local`; variáveis do ambiente também são aceitas. A atualização exige acesso HTTPS ao S3 oficial, à API do Ministério e ao IBGE.

Cada atualização valida o esquema, a identidade das unidades, os dicionários, a cobertura de todas as UFs e a integridade do índice antes de trocar o manifesto atomicamente. Falhas preservam a última base e sua data. Logs JSON incluem resultado, duração e versão. Snapshots substituídos permanecem consultáveis por 48 horas para manter a paginação consistente. Arquivos antigos que já não constem em `current.json` podem ser removidos em manutenção com o worker parado.

O navegador consulta `GET /api/hospitais` com `name`, `state` (sigla), `city` (código IBGE de sete dígitos) e `cursor` opcional. A resposta contém `items` (até 20), `nextCursor` e `indexDate`. O cursor vincula a busca à versão do índice e aos filtros, com validade de 24 horas. Os detalhes de cada lote são buscados pelo CNES no Ministério, com no máximo quatro chamadas simultâneas e timeout de 30 segundos. Se um detalhe falhar, o lote inteiro apresenta erro e pode ser repetido sem saltar registros.

A pesquisa cobre unidades ativas dos tipos Posto de Saúde, Centro de Saúde/Unidade Básica, Hospital Geral, Hospital Especializado, Hospital/Dia Isolado e Pronto Atendimento. O tipo 73 é mostrado como Pronto Atendimento, pois nem todo cadastro desse tipo é uma UPA. A data visível corresponde à última modificação do arquivo oficial usado no índice, sem indicar disponibilidade atual de atendimento.

Fontes: [base oficial CNES](https://dadosabertos.saude.gov.br/dataset/cnes-cadastro-nacional-de-estabelecimentos-de-saude/resource/cd884664-b378-4c6c-854b-6a08faa25d19), [API do Ministério](https://apidadosabertos.saude.gov.br/v1/#/) e [municípios do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades).

## Componentes compartilhados

- `Dropdown`: seleção com pesquisa, navegação por teclado e ícone opcional; usado em Hospitais, Câmbio e FIPE.
- `ConsultationPage`, `ConsultationForm`, `ConsultationField` e `Breadcrumb`: estrutura comum das consultas financeiras.
- `ServiceCard`: acesso às consultas nas páginas de categorias.

As próximas etapas estão descritas em [planning.md](planning.md).

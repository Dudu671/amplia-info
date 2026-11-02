# Integrações

As consultas partem do navegador, sem chave de API. O cliente HTTP comum está em `app/services/http.js`.

| Consulta | Situação | Fonte |
|---|---|---|
| [Bancos](bancos.md) | Integrada | Brasil API |
| [Corretoras](corretoras.md) | Integrada | Brasil API |
| [Câmbio](cambio.md) | Integrada | Brasil API |
| [FIPE](fipe.md) | Integrada | Brasil API |
| [Previsão CPTEC](cptec.md) | Integrada | Brasil API |
| [CEP](cep.md) | Integrada | ViaCEP |
| Cidades | Integrada antes desta etapa | IBGE |
| CNPJ, domínio e hospitais | Pendente | Documentação entra junto com cada integração |

Cidades continuam em `app/services/cidades.js`, na API de localidades do IBGE.

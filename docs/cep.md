# Busca de CEP

Telas: `/geografico/consulta-cep` e `/geografico/consulta-cep/detalhe`

A busca por logradouro usa a ViaCEP. A Brasil API só consulta um CEP que já se conhece, então não atende o formulário. Não há chave de acesso.

## Busca

`GET https://viacep.com.br/ws/{UF}/{cidade}/{logradouro}/json/`

O estado e a cidade vêm dos seletores. A cidade segue a lista do IBGE, sem acentos na URL. O logradouro precisa de pelo menos 3 letras. A ViaCEP devolve no máximo 50 endereços. Quando a lista chega a esse limite, a tela avisa para refinar o nome.

O campo aceita o texto do logradouro. Um bairro isolado não é um filtro dessa consulta.

Os resultados mais próximos do nome digitado aparecem primeiro. Cada item leva ao detalhe, que mostra logradouro, complemento e unidade quando existem, bairro, cidade, UF e DDD.

## Código

- `app/services/cep.js`
- `app/pages/consulta-cep.jsx`
- `app/pages/detalhe-cep.jsx`

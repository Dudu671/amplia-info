# Previsão do tempo CPTEC

Tela: `/geografico/consulta-cptec`

A previsão diária vem do CPTEC/INPE pela Brasil API. Não há chave de acesso.

## Cidade

`GET https://brasilapi.com.br/api/cptec/v1/cidade/{nome}`

A busca exige pelo menos 3 letras. Se a API devolver mais de uma cidade, a tela pede para escolher. Um nome igual ao digitado, sem diferenciar acentos, tem prioridade sobre resultados parecidos. A lista mostra no máximo 12 cidades. Quando nenhuma cidade é encontrada, a API responde 404 e a tela avisa que não há resultado.

## Previsão

`GET https://brasilapi.com.br/api/cptec/v1/clima/previsao/{código da cidade}/6`

A resposta traz até seis dias, com data, condição, mínima, máxima e índice UV. O primeiro dia define a condição, a mínima e a máxima do cartão. Os dias seguintes aparecem na tabela.

O painel chama o dia de Hoje ou Amanhã quando a data corresponde. Nos demais, mostra o dia da semana. A tabela usa dia e mês.

O índice UV só aparece quando vem maior que zero. A escala é a do CPTEC: até 2 baixo, até 5 moderado, até 7 alto, até 10 muito alto e, acima disso, extremo. Zero significa que o índice não foi informado.

## Temperatura atual

O número grande do cartão é a temperatura deste momento. A previsão por cidade do CPTEC não traz essa leitura. A tela localiza a cidade e consulta a temperatura atual no Open-Meteo. O horário exibido é o da leitura.

Mínima, máxima, condição e índice UV são a previsão do primeiro dia. Se a temperatura atual não puder ser consultada, o número grande fica vazio e o restante da previsão permanece.

## Código

- `app/services/cptec.js`
- `app/pages/consulta-cptec.jsx`
- `app/components/WeatherReport.jsx`

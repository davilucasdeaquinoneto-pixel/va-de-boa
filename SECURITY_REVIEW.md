# Revisão de segurança do Vá de Boa

## Revisão de 24/11/2026

A revisão partiu do commit `e43e01d` da branch `main`. O projeto é um site estático no Render. O código revisado contém busca local, navegação por fragmentos, leitura em voz alta, vídeos e materiais para compartilhar.

| Área | Situação encontrada | Correção |
| --- | --- | --- |
| Publicação | O build copiava toda a pasta `assets/`, incluindo três versões antigas de JavaScript. | O build permite os 13 recursos usados pelas páginas e verifica se os arquivos existem antes de substituir a saída. |
| Integridade | O HTML principal e a página 404 carregavam JavaScript ou CSS sem o atributo `integrity`. | O build calcula SHA-384 sobre os bytes distribuídos e aplica a mesma integridade, versão e configuração CORS ao preload e à folha de estilo. A CSP do HTML gerado autoriza o script pelo hash. |
| Privacidade | O compartilhamento partia da URL atual e propagava os parâmetros recebidos com ela. A cópia legada podia anunciar sucesso após falhar. | O botão usa o endereço público da coleção. Se o compartilhamento ou a cópia falharem, há um link que a pessoa pode copiar. O cancelamento voluntário encerra a operação. |
| Disponibilidade | Rotas e perguntas podiam ficar ocultas se o aplicativo deixasse de carregar. A busca local processava integralmente o texto colado. | O conteúdo é legível pelo HTML e o roteador oculta as seções depois de iniciar. As duas buscas têm limite de 200 caracteres. |
| Cabeçalhos | A diretiva de bloqueio de enquadramento estava duplicada em uma meta tag, onde o navegador a ignora. | O bloqueio continua no cabeçalho HTTP. A página 404 tem CSP própria, a política de referência passa a `no-referrer` e o Render recebe `Integrity-Policy` para navegadores compatíveis. |

### Alcance da verificação

Os arquivos de trabalho e a documentação histórica continuam no repositório público. A lista do build controla os arquivos entregues pelo servidor estático. A integridade depende da proteção do próprio repositório, do build e do HTML que contém os hashes.

O diretório a implantar é `dist`. O CSP do cabeçalho e o CSP do HTML gerado atuam juntos. O primeiro inclui `frame-ancestors 'none'`; o segundo restringe o JavaScript ao conteúdo da versão. A saída do build permite conferir os arquivos e hashes antes do deploy. A resposta HTTP real do Render e as vozes disponíveis em cada dispositivo dependem do ambiente publicado.

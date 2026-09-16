# Revisão de segurança, coerência e produção — Vá de Boa

**Data:** 16/09/2026

## Escopo
Revisão estática do HTML/CSS/JavaScript, configuração do Render, links externos, privacidade, termos, acessibilidade e coerência do conteúdo normativo. Não foi executado ataque contra infraestrutura de terceiros, negação de serviço ou carga abusiva.

## Resultado resumido
- **Crítico: 0**
- **Alto: 0**
- **Médio: 0 pendentes**
- **Baixo: 0 pendentes identificados na revisão atual**

## Controles aplicados
- CSP com `default-src 'none'` e listas explícitas por tipo de recurso.
- JavaScript e CSS somente de mesma origem; nenhum script de terceiros.
- `require-trusted-types-for 'script'` e `trusted-types 'none'` para bloquear sinks DOM perigosos em navegadores compatíveis.
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` contra clickjacking.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` bloqueando câmera, microfone, geolocalização, pagamento e USB.
- COOP, COEP e CORP para isolamento de origem.
- `Origin-Agent-Cluster: ?1`.
- `X-XSS-Protection: 0` para desativar filtros legados problemáticos.
- `X-DNS-Prefetch-Control: off`.
- HSTS por um ano no ambiente HTTPS.
- `form-action 'none'`, `connect-src 'none'`, `object-src 'none'`, `frame-src 'none'`, `worker-src 'none'` e `manifest-src 'none'`.
- Assets versionados por hash e cache imutável; HTML revalidado.
- Links externos em nova aba usam `noopener noreferrer`.

## Superfície de ataque
O site não possui login, banco de dados, formulário, API própria, upload de arquivos ou processamento de entrada de usuário. A revisão não encontrou uso de `eval`, `new Function`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, handlers inline ou URLs `javascript:`.

Também não foram encontrados `fetch`, XHR, WebSocket, EventSource, cookies, `localStorage` ou `sessionStorage` na aplicação.

## Testes defensivos realizados
- sintaxe JavaScript validada com Node;
- busca por sinks de DOM XSS e APIs de execução dinâmica;
- busca por segredos/chaves/tokens em arquivos de texto;
- verificação de links externos e `rel="noopener noreferrer"`;
- verificação de referências locais e arquivos ausentes;
- verificação de IDs duplicados e alvos de navegação;
- conferência da CSP do HTML com a CSP do `render.yaml`;
- conferência dos headers defensivos por servidor local equivalente;
- revisão de privacidade contra o comportamento real da Web Speech API;
- revisão do conteúdo da Resolução CONTRAN nº 996/2023 e de sua situação no portal oficial.

### Limitação do teste automatizado de navegador
O ambiente de execução bloqueou a abertura do Chromium por política administrativa (`ERR_BLOCKED_BY_ADMINISTRATOR`). Por isso, a validação final de layout foi feita por análise estrutural e pelos testes mobile já realizados na versão anterior; as mudanças atuais foram limitadas a páginas institucionais, rodapé, controles de fala e headers.

## Coerência e transparência
- “Sobre nós” identifica os autores como alunos do curso e explica que o site integra o kit do projeto sobre bicicletas elétricas.
- O texto deixa explícito que a referência ao Senac é contextual e que o site não é canal oficial da instituição.
- Privacidade não afirma mais que toda síntese de voz é necessariamente local.
- Termos de Uso e Política de Privacidade foram harmonizados com o funcionamento real do site.
- A base normativa foi conferida em 16/09/2026.

## Observação sobre disponibilidade
Para tráfego elevado, manter como **Static Site** no Render. O uso de CDN e cache reduz a carga de origem. Nenhuma configuração pode garantir disponibilidade absoluta contra qualquer volume ou falha externa.

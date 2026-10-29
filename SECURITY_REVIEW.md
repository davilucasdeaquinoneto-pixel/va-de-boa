# Revisão de segurança — Vá de boa!

**Última revisão estática:** 29/10/2026  
**Escopo:** código versionado, HTML, CSS, JavaScript e configuração do Render.  
**Tipo de revisão:** análise estática; não equivale a teste de invasão nem a validação completa do ambiente publicado.

## Resultado resumido

- **Vulnerabilidades críticas ou altas identificadas:** nenhuma nesta revisão estática.
- **Vulnerabilidades médias confirmadas:** nenhuma.
- **Melhoria de configuração aplicada:** a publicação do Render foi direcionada para a pasta `dist`, que contém apenas os arquivos necessários à página e seus recursos.
- **Verificações pendentes:** confirmar os cabeçalhos HTTP e o comportamento da implantação depois que o Render publicar a alteração.
- **Observação de manutenção:** existem arquivos antigos de JavaScript/CSS sem referências no código atual. Não foram tratados como vulnerabilidades e permanecem no repositório por enquanto.

A ausência de problemas encontrados nesta análise não garante que o site esteja livre de vulnerabilidades.

## Controles verificados no código

- Política CSP restritiva definida no HTML e na configuração do Render; os valores foram comparados e correspondem.
- Scripts e folhas de estilo da página carregados da própria origem.
- Nenhum script inline, atributo de evento HTML, atributo `style` ou URL `javascript:` encontrado no HTML principal.
- Nenhum uso identificado no JavaScript ativo de `eval`, `new Function`, `innerHTML`, `outerHTML`, `insertAdjacentHTML` ou `document.write`.
- Nenhuma chamada identificada no JavaScript ativo a `fetch`, `XMLHttpRequest`, WebSocket, cookies, `localStorage` ou `sessionStorage`.
- Os 58 links externos examinados abrem em nova aba e incluem `rel="noopener noreferrer"`.
- 211 IDs verificados, sem duplicatas; 403 referências a âncoras internas, sem destinos ausentes.
- Nenhum recurso declarado com URL HTTP simples em atributos `src`/`href`; nenhuma importação CSS remota ou URL remota em `url()` encontrada.
- Nenhuma correspondência encontrada para os padrões comuns de credenciais pesquisados nos 19 arquivos de texto examinados. Essa busca é limitada e não substitui ferramentas especializadas de detecção de segredos.

## Alteração de publicação aplicada

A configuração em `render.yaml` agora:

1. Cria a pasta `dist` durante a compilação.
2. Copia para ela `index.html`, `404.html`, `robots.txt` e a pasta `assets/`.
3. Define `dist` como diretório publicado.

Isso evita que a implantação estática publique diretamente, no domínio do site, arquivos de documentação e configuração que ficam na raiz do repositório. O repositório GitHub continua público; essa mudança não pretende ocultar o código-fonte.

**Commit da alteração:** [5d9f7ab](https://github.com/davilucasdeaquinoneto-pixel/va-de-boa/commit/5d9f7ab163f291712e9cc880e8ab430c83346c18).

## Cabeçalhos configurados

O `render.yaml` define CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, COEP, CORP e outras diretivas de proteção.

**Limitação importante:** a configuração versionada foi inspecionada, mas os cabeçalhos de resposta do site publicado não puderam ser confirmados por esta ferramenta. A configuração só deve ser considerada validada em produção depois de verificar a resposta HTTP real após a implantação.

## Limitações e próximos passos

- A URL pública do Render não pôde ser inspecionada por esta ferramenta; portanto, não há confirmação visual nem confirmação dos cabeçalhos em produção nesta revisão.
- Não foi possível consultar as regras de proteção da branch principal com o acesso disponível.
- Não foi realizado teste dinâmico em navegador, teste de invasão da infraestrutura ou teste de carga.
- Próximas etapas recomendadas:
  1. Confirmar que a nova implantação do Render terminou sem erros.
  2. Conferir os cabeçalhos HTTP reais na aba **Network/Rede** das ferramentas de desenvolvedor do navegador.
  3. Revisar as configurações de proteção da branch principal e os alertas de segurança disponíveis no GitHub.
  4. Remover os arquivos antigos não referenciados somente depois de confirmar que não há dependência externa ou referência legada necessária.

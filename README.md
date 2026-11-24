# Vá de boa! — Projeto Turma 41

Campanha educativa independente sobre bicicletas elétricas, desenvolvida por alunos da Turma 41 do curso de Aprendizagem Profissional em Comércio de Bens, Serviços e Turismo do Senac.

Este site integra o **kit do projeto da turma sobre bicicletas elétricas**. A menção ao Senac identifica o contexto educacional dos alunos; o site não é um canal oficial da instituição.

## Publicação recomendada
No Render, use **Static Site**, comando de build `python3 scripts/build.py` e diretório público `dist`. O `render.yaml` inclui os cabeçalhos HTTP e a regra de revalidação de cache. O build usa Python 3.9 ou superior e a biblioteca padrão.

- `index.html`: página-fonte. A versão de publicação é gerada em `dist/index.html`.
- `assets/`: CSS, JavaScript, imagens, capas e vídeos versionados.
- `SECURITY_REVIEW.md`: auditoria de segurança e coerência.
- `404.html`: página de erro.

## Segurança
O build copia os recursos autorizados em `PUBLIC_ASSETS`, calcula SHA-384 para o JavaScript e as folhas de estilo e vincula a CSP da página ao script publicado. O HTML e os arquivos em `assets/` usam revalidação de cache. Ao trocar um recurso, atualize a referência no HTML e, se mudar o nome, a lista em `scripts/build.py`. O link público usado pelo botão Compartilhar fica em `#public-cards-link`.

## Testes de regressão

Na raiz do repositório, rode `python3 -m unittest discover -s tests -v` para verificar o pacote, as âncoras, o cache e a integridade. Para testar a interface, gere `dist` com `python3 scripts/build.py` e execute `python3 tests/navegador.py` com Selenium, PyYAML, Chrome e ChromeDriver instalados. Use `TEST_BROWSER=firefox` com Firefox e GeckoDriver para testar o outro navegador. O teste serve o pacote em loopback com os cabeçalhos do Render.

## Privacidade
O projeto não possui cadastro, formulário, analytics próprio ou cookies criados pela campanha. A leitura em voz alta usa a Web Speech API do navegador/sistema; algumas vozes podem ser locais e outras podem depender de serviço remoto do próprio navegador/sistema.

## Acessibilidade
- navegação por teclado e link “Pular para o conteúdo”;
- textos alternativos em imagens relevantes;
- leitura em voz alta com escolha de voz e velocidade;
- conteúdo escrito que acompanha as informações dos vídeos;
- vídeos com texto/legendas incorporadas;
- respeito a `prefers-reduced-motion`.

## Base normativa
A campanha usa como principal fonte a Resolução CONTRAN nº 996/2023. A situação da resolução foi conferida novamente no portal oficial do Ministério dos Transportes em **16/09/2026**.

## Atualização dos vídeos

- Vídeo educativo atualizado para a versão com **legendas funcionais**.
- A faixa de legenda em português também foi exportada para WebVTT e conectada ao player HTML5.
- Guia do site atualizado para a versão mais recente disponível.
- Ambos os MP4 usam `faststart` para reprodução progressiva.

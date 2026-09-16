# Vá de Boa — Projeto Turma 41

Campanha educativa independente sobre bicicletas elétricas, desenvolvida por alunos da Turma 41 do curso de Aprendizagem Profissional em Comércio de Bens, Serviços e Turismo do Senac.

Este site integra o **kit do projeto da turma sobre bicicletas elétricas**. A menção ao Senac identifica o contexto educacional dos alunos; o site não é um canal oficial da instituição.

## Publicação recomendada
Publique como **Static Site** no Render. O arquivo `render.yaml` já configura headers de segurança e cache.

- `index.html`: versão de produção.
- `assets/`: CSS, JavaScript, imagens, capas e vídeos versionados.
- `SECURITY_REVIEW.md`: auditoria de segurança e coerência.
- `404.html`: página de erro.

## Segurança
A versão de produção usa CSP restritiva, sem scripts/estilos inline e sem JavaScript de terceiros. O Render aplica headers defensivos, bloqueio de framing, isolamento de origem e cache imutável dos assets versionados.

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

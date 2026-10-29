
/* Textos e tempos das prévias educativas. */
window.CAMPAIGN_SCRIPTS = {
  checklist: {
    title: "Tá tudo pronto?",
    intro: "Vídeo vertical de 30 segundos. Uma pessoa se prepara para sair; os cuidados aparecem em texto na tela. Grave as cenas com a bicicleta parada.",
    scenes: [
      ["0–5 s", "A pergunta", "Pessoa ao lado da bicicleta, prestes a sair.", "Antes de ir, você já conferiu sua bicicleta?"],
      ["5–12 s", "A conferência", "Detalhes de pneus e manetes de freio, com tudo parado.", "Freios funcionando e pneus em boas condições: comece por aí."],
      ["12–20 s", "Os equipamentos", "Mostrar campainha, retrovisor, indicador de velocidade e sinalização.", "Confira os equipamentos e a sinalização. Ser visto também faz parte do cuidado."],
      ["20–26 s", "A atenção", "Pessoa guarda o celular e ajusta o capacete.", "Deixe a mensagem para depois. Leve sua atenção com você."],
      ["26–30 s", "O encerramento", "Tela com o nome Vá de Boa e a frase final.", "O movimento é elétrico. O cuidado é de todos."]
    ]
  },
  categorias: {
    title: "É tudo igual?",
    intro: "Vídeo vertical de 45 segundos, no formato mito ou verdade. Use os cards e textos na tela para explicar; não é necessário filmar no trânsito.",
    scenes: [
      ["0–6 s", "O mito", "Texto grande: Tudo que tem duas rodas e motor é bicicleta elétrica?", "Parece bicicleta elétrica. Mas será que é?"],
      ["6–16 s", "O pedal assistido", "Mostrar o card 1 com as palavras pedal assistido em destaque.", "Na bicicleta elétrica, o motor auxilia o pedal. A regra geral prevê até mil watts nominais, assistência até trinta e dois quilômetros por hora e ausência de acelerador."],
      ["16–28 s", "As outras categorias", "Exibir os nomes autopropelido e ciclomotor, em telas separadas.", "Também existem autopropelidos e ciclomotores. As características técnicas definem o enquadramento; o nome do anúncio não basta."],
      ["28–39 s", "A conferência", "Mostrar uma ficha técnica genérica e a referência CONTRAN 996/2023.", "Confira a ficha técnica, a classificação e as exigências aplicáveis antes de circular."],
      ["39–45 s", "O encerramento", "Marca da campanha e convite para ler os cards.", "Vá de Boa. Vá informado. Conheça os cards da campanha."]
    ]
  }
};




/* Edite os cards no index.html. Os roteiros e notas ficam neste arquivo. */
"use strict";

const cardDialog = document.getElementById("card-dialog");
const scriptDialog = document.getElementById("script-dialog");
const menuDialog = document.getElementById("menu-dialog");
const menuToggle = document.getElementById("menu-toggle");
const printRoot = document.getElementById("print-root");
const originalPosters = [...document.querySelectorAll(".card-grid .poster")];
let activeCardId = null;
let selectedPrintId = null;
let printInProgress = false;
let currentPage = "inicio";

const cardNotes = {
  "card-1": "Referência: Resolução CONTRAN nº 996/2023, art. 2º. Os 32 km/h se referem à assistência do motor na regra geral urbana, não a uma autorização para circular nessa velocidade em qualquer via. A resolução também prevê assistência a pé de até 6 km/h e condições específicas para uso esportivo.",
  "card-2": "Referência: art. 4º da Resolução CONTRAN nº 996/2023. A sinalização noturna deve abranger frente, traseira, laterais e pedais. A norma admite formas alternativas de indicação da velocidade. Freios conferidos e capacete ajustado são cuidados adicionais da campanha.",
  "card-3": "Convivência segura: adapte a velocidade ao ambiente, mantenha distância e dê prioridade ao cuidado com quem está mais vulnerável no trajeto.",
  "card-4": "Referência: Resolução CONTRAN nº 996/2023, arts. 6º a 10. O órgão responsável pela via regulamenta a circulação. Confira a sinalização e as orientações locais para a categoria do veículo.",
  "card-5": "Se precisar ler, responder ou ajustar o celular, interrompa o deslocamento e pare fora do fluxo, sem bloquear a passagem de outras pessoas.",
  "card-6": "Autopropelidos podem ter acelerador, dentro dos limites técnicos da categoria. Ter acelerador, sozinho, não torna um veículo ciclomotor. Ciclomotores têm exigências próprias de habilitação, registro e licenciamento. Consulte o quadro comparativo oficial na seção A campanha.",

  "card-7": "Referência: art. 58 do Código de Trânsito Brasileiro. Nas situações previstas na lei, a bicicleta circula nos bordos da pista e no mesmo sentido do trânsito quando não houver infraestrutura cicloviária ou acostamento utilizável. Observe a sinalização e não se esprema contra o meio-fio.",
  "card-8": "Referência: art. 201 do Código de Trânsito Brasileiro. Ao passar ou ultrapassar uma bicicleta, o condutor deve manter pelo menos 1,5 metro de distância lateral.",
  "card-9": "Referência: art. 59 do Código de Trânsito Brasileiro. A circulação de bicicletas nos passeios depende de autorização e sinalização do órgão responsável. Regras locais e condições da área compartilhada devem ser respeitadas.",
  "card-10": "Referência: Resolução CONTRAN nº 996/2023. Os 32 km/h dizem respeito ao limite de assistência do motor na definição geral da bicicleta elétrica. A velocidade de circulação depende da sinalização, da regulamentação local e das condições do trajeto.",
  "card-11": "Orientação preventiva: use o carregador compatível indicado pelo fabricante, siga o manual e não carregue baterias danificadas. Se houver aquecimento anormal, inchaço ou fumaça, afaste-se e procure ajuda adequada.",
  "card-12": "Orientação preventiva: configure o trajeto antes de sair. Para consultar o celular, pare completamente em um local seguro, fora do fluxo de circulação."
};

const scripts = window.CAMPAIGN_SCRIPTS;

// Os ícones ficam independentes do SVG original ao ampliar ou imprimir.
function clonePoster(poster) {
  const copy = poster.cloneNode(true);
  copy.removeAttribute("id");
  copy.removeAttribute("data-title");
  copy.querySelectorAll("use").forEach((use) => {
    const symbol = document.querySelector(use.getAttribute("href"));
    if (!symbol) return;
    const svg = use.parentElement;
    svg.setAttribute("viewBox", symbol.getAttribute("viewBox"));
    [...symbol.children].forEach((child) => svg.append(child.cloneNode(true)));
    use.remove();
  });
  return copy;
}

function showDialog(dialog) {
  stopSpeech();
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    // Fallback legível para navegadores antigos.
    dialog.setAttribute("open", "");
  }
  document.body.classList.add("modal-open");
}

function closeDialog(dialog) {
  if (dialog.contains(document.getElementById("speech-player"))) stopSpeech();
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
  document.body.classList.remove("modal-open");
}

function openCard(id) {
  const poster = originalPosters.find((item) => item.id === id);
  if (!poster) return;
  activeCardId = id;
  document.getElementById("card-dialog-title").textContent = poster.dataset.title;
  document.getElementById("card-dialog-content").replaceChildren(clonePoster(poster));
  document.getElementById("card-context").textContent = cardNotes[id] || "";
  showDialog(cardDialog);
  cardDialog.scrollTop = 0;
}

function preparePrint(id = null) {
  const posters = id ? originalPosters.filter((poster) => poster.id === id) : originalPosters;
  printRoot.replaceChildren();
  posters.forEach((poster) => {
    const page = document.createElement("section");
    page.className = "print-page";
    page.append(clonePoster(poster));
    const credit = document.createElement("p");
    credit.className = "print-credit";
    credit.textContent = "VÁ DE BOA · Campanha educativa sobre bicicletas elétricas · Projeto Turma 41 · 2026";
    page.append(credit);
    printRoot.append(page);
  });
  document.body.classList.add("print-ready");
}

function resetPrint() {
  selectedPrintId = null;
  printInProgress = false;
  document.querySelectorAll("[data-print-card], #dialog-print").forEach((button) => { button.disabled = false; });
  preparePrint();
}

async function printCard(id) {
  if (printInProgress || !originalPosters.some((poster) => poster.id === id)) return;
  selectedPrintId = id;
  printInProgress = true;
  document.querySelectorAll("[data-print-card], #dialog-print").forEach((button) => { button.disabled = true; });
  preparePrint(id);
  document.getElementById("status-message").textContent = "Abrindo impressão do card selecionado. Escolha a impressora ou Salvar como PDF.";
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    window.print();
  } catch (_error) {
    document.getElementById("status-message").textContent = "Não foi possível abrir a impressão. Use a opção Imprimir do seu navegador.";
    resetPrint();
  }
}

function openScript(key) {
  const script = scripts[key];
  if (!script) return;
  const content = document.getElementById("script-content");
  content.replaceChildren();
  const title = document.createElement("h2");
  title.id = "script-dialog-title";
  title.textContent = script.title;
  const intro = document.createElement("p");
  intro.className = "script-intro";
  intro.textContent = script.intro;
  const scenes = document.createElement("ol");
  scenes.className = "script-scenes";
  script.scenes.forEach(([time, heading, shot, narration]) => {
    const item = document.createElement("li");
    const timeLabel = document.createElement("span");
    timeLabel.className = "script-time";
    timeLabel.textContent = time;
    const sceneTitle = document.createElement("h3");
    sceneTitle.textContent = heading;
    const visual = document.createElement("p");
    visual.textContent = "Cena: " + shot;
    const speech = document.createElement("p");
    speech.className = "narration";
    speech.textContent = "Narração: “" + narration + "”";
    item.append(timeLabel, sceneTitle, visual, speech);
    scenes.append(item);
  });
  const production = document.createElement("p");
  production.className = "script-production";
  production.textContent = "Roteiro preparado para a gravação do grupo. Na versão final, mantenha legendas incorporadas, transcrição em texto e informação importante também fora do áudio.";
  const listen = document.createElement("button");
  listen.type = "button";
  listen.className = "button script-listen";
  listen.dataset.speakScript = key;
  listen.textContent = "Ouvir transcrição";
  content.append(title, intro, listen, scenes, production);
  showDialog(scriptDialog);
  scriptDialog.scrollTop = 0;
}

document.addEventListener("click", (event) => {
  const cardButton = event.target.closest("[data-open-card]");
  const printButton = event.target.closest("[data-print-card]");
  const scriptButton = event.target.closest("[data-script]");
  const closeButton = event.target.closest("[data-close-dialog]");
  const speakCard = event.target.closest("[data-speak-card]");
  const speakScript = event.target.closest("[data-speak-script]");
  const speakPage = event.target.closest("[data-speak-page]");
  const shareCard = event.target.closest("[data-share-card]");
  if (cardButton) openCard(cardButton.dataset.openCard);
  if (printButton) printCard(printButton.dataset.printCard);
  if (scriptButton) openScript(scriptButton.dataset.script);
  if (closeButton) closeDialog(document.getElementById(closeButton.dataset.closeDialog));
  if (speakCard) speakCardContent(speakCard.dataset.speakCard);
  if (speakScript) speakScriptContent(speakScript.dataset.speakScript);
  if (speakPage) speakPageContent();
  if (shareCard) shareCardContent(shareCard.dataset.shareCard);
});

document.getElementById("dialog-print").addEventListener("click", () => printCard(activeCardId));
[cardDialog, scriptDialog, menuDialog].forEach((dialog) => {
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (dialog === menuDialog) menuToggle.setAttribute("aria-expanded", "false");
    if (dialog.contains(document.getElementById("speech-player"))) stopSpeech();
  });
  dialog.addEventListener("click", (event) => {
    // Só fecha quando o clique de fato acontece fora do retângulo do modal.
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});

window.addEventListener("beforeprint", () => preparePrint(selectedPrintId));
window.addEventListener("afterprint", resetPrint);
const printMedia = window.matchMedia("print");
printMedia.addEventListener?.("change", (event) => { if (!event.matches && printInProgress) resetPrint(); });
// A coleção já fica pronta se o usuário usar Ctrl+P.
preparePrint();


async function shareCardContent(id) {
  const poster = originalPosters.find((item) => item.id === id);
  if (!poster) return;
  const title = poster.dataset.title || "Card Vá de Boa";
  const url = new URL(window.location.href);
  url.hash = "cards";
  const shareText = title + " — campanha Vá de Boa sobre bicicletas elétricas.";
  try {
    if (navigator.share) {
      await navigator.share({ title: "Vá de Boa", text: shareText, url: url.toString() });
      document.getElementById("status-message").textContent = "Card pronto para compartilhar.";
      return;
    }
    const text = shareText + " " + url.toString();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.className = "clipboard-helper";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    document.getElementById("status-message").textContent = "Link da campanha copiado. Agora é só colar onde quiser compartilhar.";
  } catch (error) {
    if (error?.name !== "AbortError") {
      document.getElementById("status-message").textContent = "Não foi possível abrir o compartilhamento. Copie o endereço do site pelo navegador.";
    }
  }
}

// Navegação por hash: funciona tanto em arquivo local quanto no Render.
const pageTitles = {"inicio":"Início","cards":"Materiais educativos","regras":"Regras rápidas","bicicleta-eletrica":"Guia de bicicleta elétrica","bike-equipamentos":"Equipamentos da bicicleta elétrica","bike-velocidade":"Velocidade da bicicleta elétrica","bike-circulacao":"Circulação da bicicleta elétrica","bike-manutencao":"Manutenção da bicicleta elétrica","autopropelido":"Guia de equipamentos autopropelidos","autopropelido-equipamentos":"Equipamentos autopropelidos","autopropelido-velocidade":"Velocidade do autopropelido","autopropelido-circulacao":"Circulação do autopropelido","ciclomotor":"Guia de ciclomotores","ciclomotor-documentacao":"Documentação do ciclomotor","ciclomotor-habilitacao":"Habilitação para ciclomotor","ciclomotor-equipamentos":"Equipamentos do ciclomotor","ciclomotor-circulacao":"Circulação do ciclomotor","velocidade-por-local":"Velocidade por local","calcadas-compartilhadas":"Calçadas compartilhadas","circulacao-sem-ciclovia":"Circulação sem ciclovia","distancia-ultrapassagem":"Distância na ultrapassagem","seguranca-noite-chuva":"Noite, chuva e visibilidade","celular-fones":"Celular e fones de ouvido","sinalizacao-cruzamentos":"Sinalização e cruzamentos","passageiros-carga":"Passageiros e transporte de objetos","bateria-recarga":"Bateria e recarga segura","pane-acidente":"Pane, queda ou acidente","estacionar-furtos":"Estacionamento e prevenção de furtos","antes-de-comprar":"Antes de comprar","perguntas-frequentes":"Perguntas frequentes","videos":"Vídeos","campanha":"Sobre o projeto","sobre-nos":"Sobre nós","privacidade":"Privacidade","termos":"Termos de uso","acessibilidade":"Acessibilidade"};



const guideSearchAliases = {
  "bicicleta-eletrica": "e-bike bike pedal assistido acelerador potência motor classificação",
  "bike-equipamentos": "campainha espelho retrovisor pneu luz sinalização equipamento obrigatório capacete",
  "bike-velocidade": "32 km/h 20 km/h 6 km/h limite velocidade",
  "bike-circulacao": "ciclovia ciclofaixa calçada rua passeio via lado direito bordo da pista sentido do trânsito contramão cruzamento",
  "bike-manutencao": "freios pneus corrente revisão manutenção",
  autopropelido: "patinete skate elétrico monociclo hoverboard",
  "autopropelido-equipamentos": "sinalização campainha velocímetro limitador equipamento",
  "autopropelido-velocidade": "velocidade 32 20 6 km/h",
  "autopropelido-circulacao": "patinete calçada ciclovia via",
  ciclomotor: "moto motor placa documento CNH ACC",
  "ciclomotor-documentacao": "placa registro licenciamento renavam documento",
  "ciclomotor-habilitacao": "idade 18 anos CNH categoria A ACC",
  "ciclomotor-equipamentos": "capacete retrovisor farol pneu buzina",
  "ciclomotor-circulacao": "50 km/h rua via trânsito",
  "velocidade-por-local": "limite velocidade calçada ciclovia 20 6 32",
  "calcadas-compartilhadas": "pedestre calçada passeio compartilhada sinalização",
  "circulacao-sem-ciclovia": "rua bordo da pista acostamento contramão lado direito direita mesmo sentido fluxo via carro",
  "distancia-ultrapassagem": "1,5 1.5 metro carro ultrapassar distância lateral espaço ao passar",
  "seguranca-noite-chuva": "noite chuva visibilidade luz refletivo pista molhada freio",
  "celular-fones": "celular telefone fone ouvido distração mensagem GPS",
  "sinalizacao-cruzamentos": "cruzamento placa semáforo sinalização conversão preferência",
  "passageiros-carga": "passageiro criança peso carga mochila cesto bagageiro",
  "bateria-recarga": "bateria carregador carregar recarga lítio calor fumaça fogo",
  "pane-acidente": "pane queda acidente colisão emergência 192 193 190 socorro",
  "estacionar-furtos": "furto roubo cadeado trava estacionamento bicicletário",
  "antes-de-comprar": "compra comprar anúncio ficha técnica potência acelerador velocidade fabricante nota fiscal",
  "perguntas-frequentes": "dúvida FAQ perguntas respostas lado direito bordo da via contramão calçada ciclovia distância 1,5 metro ultrapassagem velocidade 32 km/h pedestre cruzamento placa CNH documento idade acelerador potência capacete equipamento fone celular GPS chuva noite passageiro carga carregador bateria recarga fumaça pane acidente queda comprar furto regra local"
};

const faqSearchAliases = {
  "faq-lado-da-via": "lado direito direita bordo rua pista andar ficar circular carro carros trânsito sentido meio fio acostamento",
  "faq-sem-ciclovia": "rua via pista estrada sem faixa ciclovia ciclofaixa acostamento",
  "faq-contramao": "contramão sentido contrário direção errada",
  "faq-calcada": "calçada passeio pedestre sidewalk",
  "faq-distancia": "distância lateral ultrapassagem 1,5 metro carros carro",
  "faq-velocidade": "velocidade limite rápido devagar km/h",
  "faq-pedestres": "pedestre prioridade área compartilhada passeio",
  "faq-cruzamentos": "cruzamento semáforo placa virar conversão",
  "faq-ciclovia": "ciclovia ciclofaixa pista bicicleta",
  "faq-cnh-placa": "documento registro licenciamento emplacamento placa habilitação carteira CNH",
  "faq-categorias": "classificação modelo e-bike autopropelido ciclomotor",
  "faq-acelerador": "acelerador gatilho motor pedal assistido",
  "faq-32km": "32 km/h limite velocidade assistência motor",
  "faq-idade": "idade mínima adolescente menor de idade 18 anos",
  "faq-passageiro": "garupa criança passageiro assento",
  "faq-modificacao": "desbloquear modificar motor controlador limitador velocidade",
  "faq-potencia": "watts W potência nominal motor",
  "faq-capacete": "capacete obrigatório proteção cabeça",
  "faq-equipamentos": "campainha retrovisor luz sinalização pneu indicador limitador",
  "faq-check": "checklist revisão antes de sair freio pneus luzes",
  "faq-fones": "fone ouvido música áudio atenção som ambiente",
  "faq-gps": "celular telefone GPS mapa mensagem aplicativo",
  "faq-chuva": "chuva noite pista molhada visibilidade",
  "faq-carga": "mochila compras carga peso bagageiro cesto",
  "faq-carregador": "carregador compatível tomada carregar recarga",
  "faq-recarga": "carregando durante a noite sem supervisão",
  "faq-bateria-quente": "bateria quente inchada fumaça fogo incêndio calor",
  "faq-pane": "pane acabou carga bateria parou rua",
  "faq-queda": "queda colisão acidente socorro SAMU bombeiros",
  "faq-comprar": "comprar nova anúncio ficha técnica fabricante potência",
  "faq-furto": "furto roubo cadeado trava número de série",
  "faq-regra-local": "regra cidade município prefeitura órgão trânsito legislação local",
  "faq-sinalizar": "sinalizar braço virar conversão esquerda direita mão direção",
  "faq-faixa-pedestres": "faixa zebra pedestres travessia atravessar descer empurrar bicicleta",
  "faq-faixa-onibus": "ônibus bus faixa exclusiva corredor transporte coletivo",
  "faq-ciclovia-bloqueada": "ciclovia bloqueada obstruída carro obra desvio desviar",
  "faq-documentos": "nota fiscal documento da bicicleta registro licenciamento CNH emplacamento",
  "faq-velocidade-fabrica": "32 km/h ultrapassa limite fábrica acelerador motor classificação",
  "faq-capacete-ajuste": "capacete ajustar tamanho correia cinta preso firme",
  "faq-freio-falha": "freio falhar freios falha parar manutenção oficina",
  "faq-entre-carros": "corredor carros parados trânsito porta ponto cego",
  "faq-buracos": "buraco poça pista irregular água escorregadio obstáculo",
  "faq-bateria-molhada": "bateria molhada chuva água conector porta de carga recarga",
  "faq-lavar": "lavar limpeza mangueira jato alta pressão água motor",
  "faq-autonomia": "autonomia alcance quilômetros distância bateria carga range",
  "faq-cadeado": "cadeado trava corrente u-lock prender poste quadro roda",
  "faq-transporte-publico": "ônibus trem metrô transporte público embarcar levar bicicleta",
  "faq-usada": "comprar usada segunda mão seminova procedência número de série bateria",
  "faq-roubo": "roubar roubada roubo furto boletim de ocorrência polícia",
  "faq-dados-bicicleta": "nota fiscal número de série comprovante propriedade fotos manual manutenção"
};

const guideRelated = {
  regras: ["bicicleta-eletrica","autopropelido","ciclomotor","velocidade-por-local","perguntas-frequentes"],
  "bicicleta-eletrica": ["bike-equipamentos","bike-velocidade","bike-circulacao","bike-manutencao","antes-de-comprar"],
  "bike-equipamentos": ["seguranca-noite-chuva","bike-manutencao","bateria-recarga","antes-de-comprar"],
  "bike-velocidade": ["bike-circulacao","velocidade-por-local","seguranca-noite-chuva","calcadas-compartilhadas"],
  "bike-circulacao": ["sinalizacao-cruzamentos","circulacao-sem-ciclovia","seguranca-noite-chuva","calcadas-compartilhadas"],
  "bike-manutencao": ["bateria-recarga","pane-acidente","seguranca-noite-chuva","bike-equipamentos"],
  autopropelido: ["autopropelido-equipamentos","autopropelido-velocidade","autopropelido-circulacao","antes-de-comprar"],
  "autopropelido-equipamentos": ["seguranca-noite-chuva","bateria-recarga","autopropelido-circulacao"],
  "autopropelido-velocidade": ["autopropelido-circulacao","velocidade-por-local","seguranca-noite-chuva"],
  "autopropelido-circulacao": ["sinalizacao-cruzamentos","calcadas-compartilhadas","circulacao-sem-ciclovia"],
  ciclomotor: ["ciclomotor-documentacao","ciclomotor-habilitacao","ciclomotor-equipamentos","ciclomotor-circulacao"],
  "ciclomotor-documentacao": ["ciclomotor-habilitacao","ciclomotor-equipamentos","antes-de-comprar"],
  "ciclomotor-habilitacao": ["ciclomotor-documentacao","ciclomotor-equipamentos","ciclomotor-circulacao"],
  "ciclomotor-equipamentos": ["ciclomotor-circulacao","seguranca-noite-chuva","pane-acidente"],
  "ciclomotor-circulacao": ["velocidade-por-local","sinalizacao-cruzamentos","distancia-ultrapassagem"],
  "velocidade-por-local": ["calcadas-compartilhadas","bike-circulacao","autopropelido-velocidade","sinalizacao-cruzamentos"],
  "calcadas-compartilhadas": ["bike-circulacao","autopropelido-circulacao","sinalizacao-cruzamentos","distancia-ultrapassagem"],
  "circulacao-sem-ciclovia": ["bike-circulacao","sinalizacao-cruzamentos","seguranca-noite-chuva","distancia-ultrapassagem"],
  "distancia-ultrapassagem": ["sinalizacao-cruzamentos","circulacao-sem-ciclovia","seguranca-noite-chuva"],
  "seguranca-noite-chuva": ["bike-equipamentos","bike-manutencao","bateria-recarga","sinalizacao-cruzamentos"],
  "celular-fones": ["sinalizacao-cruzamentos","seguranca-noite-chuva","bike-circulacao"],
  "sinalizacao-cruzamentos": ["circulacao-sem-ciclovia","distancia-ultrapassagem","celular-fones","calcadas-compartilhadas"],
  "passageiros-carga": ["antes-de-comprar","autopropelido","bike-manutencao"],
  "bateria-recarga": ["bike-manutencao","pane-acidente","antes-de-comprar","seguranca-noite-chuva"],
  "pane-acidente": ["bateria-recarga","bike-manutencao","estacionar-furtos"],
  "estacionar-furtos": ["bike-manutencao","pane-acidente","perguntas-frequentes"],
  "antes-de-comprar": ["bicicleta-eletrica","autopropelido","ciclomotor","passageiros-carga"],
  "perguntas-frequentes": ["antes-de-comprar","calcadas-compartilhadas","bateria-recarga","celular-fones"]
};
function normalizeGuideText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function initGuideSearch() {
  const sections = [...document.querySelectorAll("section[data-page]")];
  const routeBodies = new Map();
  sections.forEach((section) => {
    const route = section.dataset.page;
    if (!pageTitles[route]) return;
    const existing = routeBodies.get(route) || "";
    routeBodies.set(route, (existing + " " + section.textContent).trim());
  });
  const index = [...routeBodies.entries()].map(([route, rawBody]) => ({
    route,
    title: pageTitles[route],
    body: normalizeGuideText(rawBody + " " + (guideSearchAliases[route] || "")),
    rawBody: rawBody.replace(/\s+/g, " ").trim()
  }));

  // Indexa cada pergunta como resultado próprio, além das páginas completas.
  const faqRoot = document.querySelector('section[data-page="perguntas-frequentes"]');
  faqRoot?.querySelectorAll(".faq-grid article").forEach((article) => {
    const heading = article.querySelector("h3");
    if (!heading || !article.id) return;
    const title = heading.textContent.replace(/^\s*\d+\.\s*/, "").trim();
    const rawBody = [...article.querySelectorAll("p")].map((paragraph) => paragraph.textContent).join(" ").replace(/\s+/g, " ").trim();
    const category = article.closest(".faq-group")?.querySelector(".faq-group-heading h3")?.textContent.trim() || "Perguntas frequentes";
    const aliases = faqSearchAliases[article.id] || "";
    index.push({
      route: "perguntas-frequentes",
      targetId: article.id,
      title,
      category,
      isFaq: true,
      body: normalizeGuideText(title + " " + rawBody + " " + aliases),
      rawBody
    });
  });

  const stopWords = new Set(["a","o","as","os","de","da","do","das","dos","e","em","na","no","nas","nos","para","por","com","um","uma","que","qual","quais","como","posso","pode","podem","devo","deve","preciso","é","ser","ter","meu","minha","se","ao","aos","ou","pra","pro"]);
  document.querySelectorAll("[data-guide-search]").forEach((input) => {
    const results = document.getElementById(input.dataset.searchResults);
    if (!results) return;
    input.addEventListener("input", () => {
      const query = normalizeGuideText(input.value).trim();
      results.replaceChildren();
      results.hidden = true;
      if (!query) return;
      const terms = query.split(/\s+/).filter((term) => term.length > 1 && !stopWords.has(term));
      if (!terms.length) return;
      const scored = index.map((item) => {
        const title = normalizeGuideText(item.title);
        let score = 0;
        let hits = 0;
        terms.forEach((term) => {
          const titleHit = title.includes(term);
          const bodyHit = item.body.includes(term);
          if (titleHit || bodyHit) hits += 1;
          if (titleHit) score += item.isFaq ? 10 : 6;
          if (bodyHit) score += item.isFaq ? 2 : 1;
        });
        if (item.isFaq && terms.some((term) => title.includes(term))) score += 3;
        return {...item, score, hits};
      }).filter((item) => item.hits > 0);
      scored.sort((a,b) => b.score - a.score || Number(Boolean(b.isFaq)) - Number(Boolean(a.isFaq)) || a.title.localeCompare(b.title, "pt-BR"));
      const top = scored.filter((item) => item.hits === terms.length).slice(0, 7);
      const chosen = top.length ? top : scored.slice(0, 7);
      if (!chosen.length) {
        const empty = document.createElement("p");
        empty.className = "guide-search-empty";
        empty.textContent = "Nenhum resultado encontrado. Tente outra expressão, como “lado direito”, “faixa de pedestres”, “bateria molhada” ou “preciso de CNH”.";
        results.append(empty);
        results.hidden = false;
        return;
      }
      chosen.forEach((item) => {
        const link = document.createElement("a");
        link.className = "guide-search-result";
        link.href = "#" + (item.targetId || item.route);
        if (!item.targetId) link.dataset.route = item.route;
        link.setAttribute("role", "listitem");
        if (item.isFaq) {
          const label = document.createElement("small");
          label.textContent = "Pergunta frequente · " + item.category;
          link.append(label);
        }
        const title = document.createElement("strong");
        title.textContent = item.title;
        const snippet = document.createElement("span");
        const sentences = item.rawBody.split(/(?<=[.!?])\s+/);
        const queryTerm = terms.find((term) => normalizeGuideText(item.title + " " + item.rawBody + " " + (item.isFaq ? faqSearchAliases[item.targetId] || "" : "")).includes(term));
        const matchingSentence = sentences.find((sentence) => normalizeGuideText(sentence).includes(queryTerm));
        const excerpt = matchingSentence || item.rawBody;
        snippet.textContent = excerpt.slice(0, 145) + (excerpt.length > 145 ? "…" : "");
        link.append(title, snippet);
        results.append(link);
      });
      results.hidden = false;
    });
  });
}
function initFaqFilters() {
  const root = document.querySelector('section[data-page="perguntas-frequentes"]');
  if (!root) return;
  const buttons = [...root.querySelectorAll("[data-faq-filter]")];
  const groups = [...root.querySelectorAll(".faq-group[data-faq-group]")];
  const status = root.querySelector("#faq-filter-status");
  if (!buttons.length || !groups.length) return;

  const total = groups.reduce((sum, group) => sum + group.querySelectorAll(".faq-grid article").length, 0);
  if (status) status.textContent = `Exibindo todas as ${total} perguntas.`;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.faqFilter;
      groups.forEach((group) => {
        group.hidden = filter !== "all" && group.dataset.faqGroup !== filter;
      });
      buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      if (status) {
        const visibleCount = groups
          .filter((group) => !group.hidden)
          .reduce((sum, group) => sum + group.querySelectorAll(".faq-grid article").length, 0);
        status.textContent = filter === "all"
          ? `Exibindo todas as ${visibleCount} perguntas.`
          : `Exibindo ${visibleCount} perguntas sobre ${button.textContent.trim().toLowerCase()}.`;
      }
    });
  });
}

function appendGuideRelatedLinks() {
  document.querySelectorAll("section[data-page].vehicle-guide-page, section[data-page].rules-section, section[data-page].guide-expansion-page").forEach((section) => {
    const route = section.dataset.page;
    const container = section.querySelector(".container");
    const targets = guideRelated[route];
    if (!container || !targets || container.querySelector(".guide-related-links-block")) return;
    const nav = document.createElement("nav");
    nav.className = "guide-related-links-block";
    nav.setAttribute("aria-label", "Assuntos relacionados");
    const heading = document.createElement("h3");
    heading.textContent = "Continue a consulta";
    const description = document.createElement("p");
    description.textContent = "Acesse um tema relacionado sem precisar voltar ao início.";
    const links = document.createElement("div");
    links.className = "guide-related-links";
    targets.forEach((target) => {
      if (!pageTitles[target]) return;
      const link = document.createElement("a");
      link.href = "#" + target;
      link.dataset.route = target;
      const label = document.createElement("span");
      label.textContent = "→";
      label.setAttribute("aria-hidden", "true");
      const title = document.createElement("span");
      title.textContent = pageTitles[target];
      link.append(title, label);
      links.append(link);
    });
    nav.append(heading, description, links);
    container.append(nav);
  });
}

function changePage(moveFocus = true) {
  const hashRoute = window.location.hash.slice(1);
  const hashTarget = document.getElementById(hashRoute);
  const faqTarget = hashTarget?.matches('article[id^="faq-"]') ? hashTarget : null;
  currentPage = Object.hasOwn(pageTitles, hashRoute) ? hashRoute : faqTarget ? "perguntas-frequentes" : "inicio";
  stopSpeech();
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("[data-page]").forEach((section) => {
    section.hidden = section.dataset.page !== currentPage;
  });
  document.querySelectorAll("[data-route]").forEach((link) => {
    if (link.dataset.route === currentPage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  syncDrawerGroups(currentPage);
  document.title = pageTitles[currentPage] + " | Vá de Boa · Projeto Turma 41";
  if (menuDialog.open) closeDialog(menuDialog);

  if (faqTarget) {
    const faqRoot = document.querySelector('section[data-page="perguntas-frequentes"]');
    faqRoot?.querySelectorAll(".faq-group").forEach((group) => { group.hidden = false; });
    faqRoot?.querySelectorAll("[data-faq-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.faqFilter === "all"));
    });
    const status = faqRoot?.querySelector("#faq-filter-status");
    const question = faqTarget.querySelector("h3")?.textContent.replace(/^\s*\d+\.\s*/, "").trim();
    if (status) status.textContent = question ? "Pergunta localizada: " + question : "Pergunta localizada nas perguntas frequentes.";
  }

  const heading = faqTarget?.querySelector("h3") || document.querySelector('[data-page="' + currentPage + '"] h1, [data-page="' + currentPage + '"] h2');
  if (faqTarget) {
    requestAnimationFrame(() => {
      faqTarget.scrollIntoView({ block: "start", behavior: "instant" });
      if (moveFocus && heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  } else if (moveFocus) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  }
}
function syncDrawerGroups(route = currentPage) {
  document.querySelectorAll(".drawer-group").forEach((group) => {
    const button = group.querySelector("[data-drawer-toggle]");
    const panel = document.getElementById(button?.getAttribute("aria-controls") || "");
    const active = [...group.querySelectorAll("a[data-route]")].some((link) => link.dataset.route === route);
    if (panel && button && active) {
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      group.classList.add("is-active");
    } else if (panel && button) {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      group.classList.remove("is-active");
    }
  });
}

document.querySelectorAll("[data-drawer-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    const shouldOpen = panel.hidden;
    document.querySelectorAll(".drawer-group").forEach((group) => {
      const otherButton = group.querySelector("[data-drawer-toggle]");
      const otherPanel = document.getElementById(otherButton?.getAttribute("aria-controls") || "");
      if (otherButton && otherPanel) {
        otherPanel.hidden = true;
        otherButton.setAttribute("aria-expanded", "false");
        group.classList.remove("is-active");
      }
    });
    if (shouldOpen) {
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.closest(".drawer-group")?.classList.add("is-active");
    }
  });
});

menuToggle.addEventListener("click", () => {
  syncDrawerGroups(currentPage);
  showDialog(menuDialog);
  menuToggle.setAttribute("aria-expanded", "true");
});
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  if (link.classList.contains("skip-link")) {
    event.preventDefault();
    const heading = document.querySelector('[data-page="' + currentPage + '"] h1, [data-page="' + currentPage + '"] h2');
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
    return;
  }

  // Intercepta rotas e perguntas frequentes antes do salto nativo para um alvo oculto.
  // Assim, a página é exibida primeiro e só depois o foco/rolagem é atualizado.
  const hash = link.getAttribute("href").slice(1);
  if (!hash) return;
  const target = document.getElementById(hash);
  const isFaqTarget = target?.matches('article[id^="faq-"]');
  if (!Object.hasOwn(pageTitles, hash) && !isFaqTarget) return;

  event.preventDefault();
  if (window.location.hash !== "#" + hash) {
    window.history.pushState(null, "", "#" + hash);
  }
  changePage();
});
window.addEventListener("hashchange", () => changePage());
window.addEventListener("popstate", () => changePage());

// Leitura sob demanda, com voz em português fornecida pelo navegador/aparelho.
// O texto é preparado para soar como fala, e não como uma página HTML sendo recitada.
const speechPlayer = document.getElementById("speech-player");
const speechPause = document.getElementById("speech-pause");
const speechTitle = document.getElementById("speech-title");
const speechProgress = document.getElementById("speech-progress");
const speechVoice = document.getElementById("speech-voice");
const speechRate = document.getElementById("speech-rate");
const speechServiceNote = document.getElementById("speech-service-note");
const audioNotice = document.getElementById("audio-notice");
const supportsSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let speechGeneration = 0;
let speechChunks = [];
let speechChunkIndex = 0;
let speechPaused = false;
let currentUtterance = null;
let noticeTimer = null;
let speechReturnFocus = null;
let availableVoices = [];

function voiceScore(voice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace("_", "-");
  let points = 0;
  if (lang === "pt-br") points += 200;
  else if (lang.startsWith("pt")) points += 100;
  if (voice.localService) points += 45;
  if (name.includes("natural")) points += 40;
  if (name.includes("google")) points += 28;
  if (name.includes("microsoft")) points += 24;
  if (name.includes("francisca")) points += 14;
  if (name.includes("antonio") || name.includes("antônio")) points += 12;
  if (name.includes("luciana")) points += 10;
  if (voice.default) points += 3;
  return points;
}

function portugueseVoices() {
  return availableVoices
    .filter((voice) => voice.lang.toLowerCase().startsWith("pt"))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

function refreshSpeechVoiceOptions() {
  if (!speechVoice) return;
  const current = speechVoice.value;
  const voices = portugueseVoices();
  speechVoice.replaceChildren();
  if (!voices.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Automática do aparelho";
    speechVoice.append(option);
    speechVoice.disabled = true;
    speechServiceNote.textContent = "Nenhuma voz em português foi listada; o navegador tentará usar a voz padrão.";
    return;
  }
  speechVoice.disabled = false;
  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = voice.voiceURI;
    const location = voice.localService ? "no aparelho" : "serviço do navegador";
    option.textContent = `${voice.name} · ${location}`;
    if ((current && current === voice.voiceURI) || (!current && index === 0)) option.selected = true;
    speechVoice.append(option);
  });
  updateSpeechServiceNote();
}

function refreshSpeechVoices() {
  if (!supportsSpeech) return;
  availableVoices = window.speechSynthesis.getVoices();
  refreshSpeechVoiceOptions();
}

function normalizeSpeechText(text) {
  return String(text || "")
    .replace(/#VADEBOA/gi, "hashtag Vá de Boa")
    .replace(/VÁ DE BOA/gi, "Vá de Boa")
    .replace(/CONTRAN/gi, "Contran")
    .replace(/\bCTB\b/g, "C T B")
    .replace(/\bCNH\b/g, "C N H")
    .replace(/\bACC\b/g, "A C C")
    .replace(/\bRENAVAM\b/gi, "Renavam")
    .replace(/Turma\s+41/gi, "Turma quarenta e um")
    .replace(/n[º°]\s*/gi, "número ")
    .replace(/996\s*\/\s*2023/g, "996 de 2023")
    .replace(/arts\.\s*/gi, "artigos ")
    .replace(/art\.\s*/gi, "artigo ")
    .replace(/1\.000\s*W/gi, "mil watts")
    .replace(/4\s*kW/gi, "quatro quilowatts")
    .replace(/\bkW\b/gi, "quilowatts")
    .replace(/\bW\b/g, "watts")
    .replace(/50\s*km\s*\/\s*h/gi, "cinquenta quilômetros por hora")
    .replace(/32\s*km\s*\/\s*h/gi, "trinta e dois quilômetros por hora")
    .replace(/6\s*km\s*\/\s*h/gi, "seis quilômetros por hora")
    .replace(/km\s*\/\s*h/gi, "quilômetros por hora")
    .replace(/70\s*cm/gi, "setenta centímetros")
    .replace(/130\s*cm/gi, "cento e trinta centímetros")
    .replace(/A4/gi, "A quatro")
    .replace(/\bPDF\b/gi, "P D F")
    .replace(/\bQR\b/gi, "Q R")
    .replace(/\bIP\b/g, "I P")
    .replace(/\bES\b/g, "Espírito Santo")
    .replace(/[•·]/g, ", ")
    .replace(/[→↗]/g, ". ")
    .replace(/\s*\/\s*/g, ", ")
    .replace(/\s*[-–—]\s*/g, ", ")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([,.;!?])(?=[A-Za-zÀ-ÿ0-9])/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function finishSpeechSegment(text) {
  const clean = normalizeSpeechText(text);
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : clean + ".";
}

function speakableText(element) {
  if (!element) return "";
  const copy = element.cloneNode(true);
  copy.querySelectorAll('svg,button,a,script,style,.sr-only,[aria-hidden="true"],.card-actions,.hero-actions,.speech-player').forEach((node) => node.remove());
  copy.querySelectorAll("br").forEach((br) => br.replaceWith(document.createTextNode(" | ")));
  copy.querySelectorAll("h1,h2,h3,p,li,.fact-stack>div,.category-lines>span,.campaign-steps>div,.legal-grid>article,.about-us-grid>article").forEach((node) => {
    node.insertAdjacentText("afterend", " | ");
  });
  const parts = copy.textContent
    .split("|")
    .map((part) => finishSpeechSegment(part))
    .filter(Boolean);
  return parts.join(" ");
}

function cardSpeechText(id) {
  const poster = originalPosters.find((item) => item.id === id);
  if (!poster) return "";
  const title = finishSpeechSegment(poster.dataset.title || "Card educativo");
  const body = speakableText(poster.querySelector(".poster-main"));
  const note = finishSpeechSegment(cardNotes[id] || "");
  return [title, body, note].filter(Boolean).join(" ");
}

function splitSpeech(text) {
  const normalized = normalizeSpeechText(text);
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?;]+[.!?;]?/g) || [normalized];
  const chunks = [];
  let current = "";

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;
    const candidate = current ? current + " " + sentence : sentence;
    if (candidate.length <= 235) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    if (sentence.length <= 235) {
      current = sentence;
      continue;
    }
    let piece = "";
    for (const word of sentence.split(/\s+/)) {
      const next = piece ? piece + " " + word : word;
      if (next.length > 205 && piece) {
        chunks.push(piece + ",");
        piece = word;
      } else {
        piece = next;
      }
    }
    current = piece;
  }
  if (current) chunks.push(current);
  return chunks;
}

function selectedPortugueseVoice() {
  refreshSpeechVoicesWithoutOptions();
  const voices = portugueseVoices();
  if (!voices.length) return null;
  const selected = speechVoice?.value;
  return voices.find((voice) => voice.voiceURI === selected) || voices[0];
}

function refreshSpeechVoicesWithoutOptions() {
  if (!supportsSpeech) return;
  availableVoices = window.speechSynthesis.getVoices();
}

function updateSpeechServiceNote() {
  if (!speechServiceNote) return;
  const selected = portugueseVoices().find((voice) => voice.voiceURI === speechVoice?.value);
  if (!selected) {
    speechServiceNote.textContent = "A voz disponível depende do navegador e do aparelho.";
    return;
  }
  speechServiceNote.textContent = selected.localService
    ? "Esta voz é informada pelo navegador como disponível localmente no aparelho."
    : "Esta voz pode usar um serviço remoto do navegador ou do sistema e pode depender de conexão.";
}

function restartCurrentSpeech() {
  if (!supportsSpeech || !speechChunks.length) return;
  const wasPaused = speechPaused;
  speechGeneration += 1;
  const generation = speechGeneration;
  window.speechSynthesis.cancel();
  currentUtterance = null;
  speechPaused = false;
  if (wasPaused) {
    speechPaused = true;
    speechPause.textContent = "Continuar";
    speechPause.setAttribute("aria-label", "Continuar leitura");
    return;
  }
  speakNext(generation);
}

function showAudioNotice(message) {
  clearTimeout(noticeTimer);
  const openDialog = [cardDialog, scriptDialog].find((dialog) => dialog.open);
  (openDialog?.querySelector(".speech-slot") || document.body).append(audioNotice);
  audioNotice.textContent = message;
  audioNotice.hidden = false;
  noticeTimer = setTimeout(() => { audioNotice.hidden = true; }, 12000);
}

function stopSpeech() {
  const restoreFocus = speechPlayer.contains(document.activeElement);
  speechGeneration += 1;
  if (supportsSpeech) window.speechSynthesis.cancel();
  currentUtterance = null;
  speechChunks = [];
  speechChunkIndex = 0;
  speechPaused = false;
  speechPlayer.hidden = true;
  document.querySelector(".speech-settings")?.removeAttribute("open");
  if (speechProgress) speechProgress.textContent = "Leitura encerrada";
  speechPause.textContent = "Pausar";
  speechPause.setAttribute("aria-label", "Pausar leitura");
  if (speechPlayer.parentElement !== document.body) document.body.append(speechPlayer);
  if (restoreFocus && speechReturnFocus?.isConnected && !speechReturnFocus.closest("[hidden]")) {
    speechReturnFocus.focus({ preventScroll: true });
  }
}

function speakNext(generation) {
  if (generation !== speechGeneration || speechPaused) return;
  if (speechChunkIndex >= speechChunks.length) { stopSpeech(); return; }

  const utterance = new SpeechSynthesisUtterance(speechChunks[speechChunkIndex]);
  const voice = selectedPortugueseVoice();
  utterance.lang = voice?.lang || "pt-BR";
  if (voice) utterance.voice = voice;
  utterance.rate = Number(speechRate?.value || 0.92);
  if (speechProgress) speechProgress.textContent = `Trecho ${speechChunkIndex + 1} de ${speechChunks.length}`;
  utterance.pitch = 1.0;
  utterance.volume = 1;
  currentUtterance = utterance;

  utterance.onend = () => {
    if (generation !== speechGeneration) return;
    speechChunkIndex += 1;
    currentUtterance = null;
    // Uma pausa curta entre blocos evita que frases distintas grudem umas nas outras.
    setTimeout(() => speakNext(generation), 90);
  };
  utterance.onerror = (event) => {
    if (generation !== speechGeneration || event.error === "interrupted" || event.error === "canceled") return;
    stopSpeech();
    showAudioNotice("A voz em português não está disponível neste aparelho. Use uma voz em português nas configurações de fala ou o leitor de tela do sistema.");
  };
  window.speechSynthesis.speak(utterance);
}

function startSpeech(text, title) {
  if (!supportsSpeech) {
    showAudioNotice("Este navegador não oferece leitura em voz alta. O conteúdo continua disponível em texto para leitores de tela.");
    return;
  }
  const trigger = document.activeElement;
  stopSpeech();
  const generation = speechGeneration;
  speechReturnFocus = trigger;
  audioNotice.hidden = true;
  document.querySelectorAll("video").forEach((video) => video.pause());
  speechChunks = splitSpeech(text);
  if (!speechChunks.length) return;

  const openDialog = [cardDialog, scriptDialog].find((dialog) => dialog.open);
  const slot = openDialog?.querySelector(".speech-slot");
  (slot || document.body).append(speechPlayer);
  speechTitle.textContent = title;
  speechPlayer.hidden = false;
  if (speechProgress) speechProgress.textContent = `Preparando ${speechChunks.length} ${speechChunks.length === 1 ? "trecho" : "trechos"}`;
  speechPause.focus({ preventScroll: !slot });
  window.speechSynthesis.resume();

  refreshSpeechVoices();
  if (availableVoices.some((voice) => voice.lang.toLowerCase().startsWith("pt"))) {
    speakNext(generation);
  } else {
    // Alguns navegadores só entregam a lista de vozes alguns milissegundos depois do clique.
    setTimeout(() => {
      if (generation !== speechGeneration) return;
      refreshSpeechVoices();
      speakNext(generation);
    }, 180);
  }
}

function speakCardContent(id) {
  const poster = originalPosters.find((item) => item.id === id);
  if (!poster) return;
  startSpeech(cardSpeechText(id), poster.dataset.title);
}

function speakScriptContent(key) {
  const script = scripts[key];
  if (!script) return;
  const narration = script.scenes.map((scene) => finishSpeechSegment(scene[3])).join(" ");
  startSpeech(finishSpeechSegment(script.title) + " " + narration, "Vídeo: " + script.title);
}

function speakPageContent() {
  if (currentPage === "inicio") {
    const heroTitle = speakableText(document.getElementById("hero-title"));
    const description = finishSpeechSegment(document.querySelector(".hero-description")?.textContent);
    startSpeech(`Projeto independente feito por alunos do curso de Aprendizagem Profissional em Comércio de Bens, Serviços e Turismo. Turma quarenta e um. Campanha Vá de Boa sobre bicicletas elétricas. ${heroTitle} ${description} Use a navegação para consultar as regras, os materiais educativos, os vídeos e as informações sobre o projeto.`, "Início");
    return;
  }

  if (currentPage === "cards") {
    const cardsText = originalPosters.map((poster, index) => `Card ${index + 1}. ${cardSpeechText(poster.id)}`).join(" ");
    startSpeech(`Cards educativos da campanha Vá de Boa. ${cardsText}`, "Todos os cards");
    return;
  }

  if (currentPage === "videos") {
    const videosText = [...document.querySelectorAll("#videos .video-info")].map((info, index) => {
      const title = finishSpeechSegment(info.querySelector("h3")?.textContent);
      const description = finishSpeechSegment(info.querySelector("p")?.textContent);
      return `Vídeo ${index + 1}. ${title} ${description}`;
    }).join(" ");
    startSpeech(`Vídeos da campanha Vá de Boa. Há dois vídeos disponíveis nesta página. ${videosText}`, "Conteúdo dos vídeos");
    return;
  }

  if (currentPage === "sobre-nos") {
    startSpeech("Sobre nós. Somos alunos da Turma quarenta e um do curso de Aprendizagem Profissional em Comércio de Bens, Serviços e Turismo do Senac. Desenvolvemos o Vá de Boa como parte do kit do projeto da turma sobre bicicletas elétricas. O site é um projeto acadêmico independente e não representa comunicação oficial do Senac.", "Sobre nós");
    return;
  }

  const section = document.getElementById(currentPage);
  startSpeech(speakableText(section), pageTitles[currentPage]);
}

if (supportsSpeech) {
  refreshSpeechVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshSpeechVoices);
}

speechVoice?.addEventListener("change", () => {
  updateSpeechServiceNote();
  restartCurrentSpeech();
});
speechRate?.addEventListener("change", restartCurrentSpeech);

speechPause.addEventListener("click", () => {
  if (!supportsSpeech || !speechChunks.length) return;
  speechPaused = !speechPaused;
  if (speechPaused) window.speechSynthesis.pause();
  else {
    window.speechSynthesis.resume();
    if (!currentUtterance) speakNext(speechGeneration);
  }
  speechPause.textContent = speechPaused ? "Continuar" : "Pausar";
  speechPause.setAttribute("aria-label", speechPaused ? "Continuar leitura" : "Pausar leitura");
});
document.getElementById("speech-stop").addEventListener("click", stopSpeech);
document.getElementById("dialog-speak").addEventListener("click", () => speakCardContent(activeCardId));
window.addEventListener("pagehide", stopSpeech);
document.querySelectorAll("video").forEach((video) => video.addEventListener("play", () => {
  stopSpeech();
  document.querySelectorAll("video").forEach((other) => { if (other !== video) other.pause(); });
}));
initGuideSearch();
initFaqFilters();
appendGuideRelatedLinks();
changePage(false);


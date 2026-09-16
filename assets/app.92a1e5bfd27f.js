
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
  "card-6": "Autopropelidos podem ter acelerador, dentro dos limites técnicos da categoria. Ter acelerador, sozinho, não torna um veículo ciclomotor. Ciclomotores têm exigências próprias de habilitação, registro e licenciamento. Consulte o quadro comparativo oficial na seção A campanha."
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
const pageTitles = { inicio: "Início", cards: "Materiais educativos", regras: "Regras", videos: "Vídeos", campanha: "Sobre o projeto", "sobre-nos": "Sobre nós", privacidade: "Privacidade", termos: "Termos de uso", acessibilidade: "Acessibilidade" };

function changePage(moveFocus = true) {
  const route = window.location.hash.slice(1);
  currentPage = Object.hasOwn(pageTitles, route) ? route : "inicio";
  stopSpeech();
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("[data-page]").forEach((section) => {
    section.hidden = section.dataset.page !== currentPage;
  });
  document.querySelectorAll("[data-route]").forEach((link) => {
    if (link.dataset.route === currentPage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.title = pageTitles[currentPage] + " | Vá de Boa · Projeto Turma 41";
  if (menuDialog.open) closeDialog(menuDialog);
  if (moveFocus) {
    const heading = document.querySelector('[data-page="' + currentPage + '"] h1, [data-page="' + currentPage + '"] h2');
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  }
}

menuToggle.addEventListener("click", () => {
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
  const route = link.getAttribute("href").slice(1);
  if (!Object.hasOwn(pageTitles, route)) return;
  if (route === currentPage) {
    event.preventDefault();
    changePage();
  }
});
window.addEventListener("hashchange", () => changePage());

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
changePage(false);


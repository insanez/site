let questions = [];
let wrong = [];
let index = 0;
let tipo = "";
let natureza = "";
let acertos = 0;
let erros = 0;
let review = false;

// lista embaralhada controlada
let currentQuestions = [];

// =======================
// 🔁 SHUFFLE
// =======================
function shuffle(arr){
  return [...arr].sort(()=>Math.random()-0.5);
}

// =======================
// 💾 SALVAR PROGRESSO
// =======================
function saveProgress(){
  const data = {
    questions,
    currentQuestions,
    wrong,
    index,
    acertos,
    erros,
    review
  };

  localStorage.setItem("quizProgress", JSON.stringify(data));
}

// =======================
// 📂 CARREGAR PROGRESSO
// =======================
function loadProgress(){
  const saved = localStorage.getItem("quizProgress");

  if(saved){
    const data = JSON.parse(saved);

    questions = data.questions || [];
    currentQuestions = data.currentQuestions || [];
    wrong = data.wrong || [];
    index = data.index || 0;
    acertos = data.acertos || 0;
    erros = data.erros || 0;
    review = data.review || false;

    return true;
  }

  return false;
}

// =======================
// 🚀 LOAD QUESTIONS
// =======================
async function loadQuestions(){

  // tenta carregar progresso salvo
  if(loadProgress()){
    render();
    updateStats();
    return;
  }

  const res = await fetch("questions.json");
  const data = await res.json();

  questions = data;
  currentQuestions = shuffle(questions);
  index = 0;

  render();
  updateStats();
}

// =======================
// 📋 LISTA ATUAL
// =======================
function currentList(){
  if(review && wrong.length){
    return wrong;
  }
  return currentQuestions;
}

// =======================
// 🖥️ RENDER
// =======================
function render(){
  const list = currentList();
  if(list.length === 0) return;

  const q = list[index];

  document.getElementById("question").innerText = q.name;
  document.getElementById("example").innerText = q.ex;

  const tipos = ["Ativo","Passivo","Patrimônio Líquido","Ativo (Retificadora)","Patrimônio Líquido (Retificadora)","Resultado (Despesa)","Resultado (Receita)"];
  document.getElementById("tipos").innerHTML = tipos.map(t =>
    `<button class="${tipo===t?'selected':''}" onclick="selectTipo('${t}')">${t}</button>`
  ).join("");

  const nat = ["Devedora","Credora"];
  document.getElementById("naturezas").innerHTML = nat.map(n =>
    `<button class="${natureza===n?'selected':''}" onclick="selectNatureza('${n}')">${n}</button>`
  ).join("");

  // trava próxima até responder
  document.getElementById("btn-proxima-quiz").disabled = true;
}

// =======================
// 🎯 SELEÇÃO
// =======================
function selectTipo(t){ tipo = t; render(); }
function selectNatureza(n){ natureza = n; render(); }

// =======================
// ✅ VERIFICAR
// =======================
function checkAnswer(){

  if(!tipo || !natureza){
    alert("Selecione tipo e natureza antes de verificar.");
    return;
  }

  const q = currentList()[index];
  let ok = tipo === q.tipo && natureza === q.natureza;

  if(ok){
    acertos++;
    wrong = wrong.filter(x => x.name !== q.name);
  } else {
    erros++;
    if(!wrong.find(x => x.name === q.name)) wrong.push(q);
  }

  document.getElementById("result").innerHTML = `
    <p class="${ok ? 'green' : 'red'}">${ok ? 'Certo' : 'Errado'}</p>
    <p>${q.exp}</p>
    <p><b>Correto:</b> ${q.tipo} | ${q.natureza}</p>
  `;

  // libera próxima
  document.getElementById("btn-proxima-quiz").disabled = false;

  updateStats();
  saveProgress();
}

// =======================
// ➡️ PRÓXIMA
// =======================
function nextQuestion(){
  const list = currentList();

  index++;

  if(index >= list.length){
    if(review && wrong.length){
      index = 0;
    } else {
      currentQuestions = shuffle(questions);
      index = 0;
    }
  }

  tipo = "";
  natureza = "";
  document.getElementById("result").innerHTML = "";

  render();
  saveProgress();
}

// =======================
// 👁️ EXEMPLO
// =======================
function toggleExample(){
  const el = document.getElementById("example");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// =======================
// 📊 STATS
// =======================
function updateStats(){
  const total = acertos + erros;
  const perc = total ? (acertos / total * 100) : 0;

  document.getElementById("statTotal").innerText = `Respondidas: ${total}`;
  document.getElementById("statAcertos").innerText = `Acertos: ${acertos} (${perc.toFixed(1)}%)`;
  document.getElementById("statErros").innerText = `Erros: ${erros}`;
  document.getElementById("statPendentes").innerText = `Pendentes: ${wrong.length}`;

  document.getElementById("progress").style.width = perc + "%";
}

// =======================
// 🔁 REVISÃO
// =======================
function reviewErrors(){
  review = true;
  index = 0;
  render();
  saveProgress();
}

// =======================
// 🔄 RESET
// =======================
function resetAll(){
  localStorage.removeItem("quizProgress");

  currentQuestions = shuffle(questions);
  wrong = [];
  acertos = 0;
  erros = 0;
  review = false;
  index = 0;

  updateStats();
  render();
}

// =======================
// 🚀 INIT
// =======================
loadQuestions();


// =======================
// 📚 RAZONETES (mantido)
// =======================

let listaExercicios = [];
let exercicioAtual = 0;

async function carregarExercicios() {
    try {
        const response = await fetch('razonetes.json');
        listaExercicios = await response.json();
        exibirExercicio();
    } catch (error) {
        console.error("Erro ao carregar questões:", error);
    }
}

function exibirExercicio() {
    const ex = listaExercicios[exercicioAtual];
    document.getElementById('titulo-exercicio').innerText = `📝 ${ex.titulo}`;
    
    const listaContainer = document.getElementById('lista-dados');
    listaContainer.innerHTML = ex.dados.map(d => `<p>${d.nome}: <b>${d.valor}</b></p>`).join('');
    
    limparCampos();
}

function limparCampos() {
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.getElementById('resultado').innerText = '';
    document.getElementById('btn-proxima').style.display = 'none';
}

function somarInputs(seletor) {
    let soma = 0;
    document.querySelectorAll(seletor).forEach(input => {
        soma += Number(input.value) || 0;
    });
    return soma;
}

function verificar() {
    const ex = listaExercicios[exercicioAtual];
    const somaAtivo = somarInputs('.ativo-input');
    const somaPassivo = somarInputs('.passivo-input');
    const plDigitado = Number(document.getElementById('valorPL').value) || 0;

    const resElement = document.getElementById('resultado');

    const acertou = (somaAtivo === ex.correto.ativo && 
                     somaPassivo === ex.correto.passivo && 
                     plDigitado === ex.correto.pl);

    if (acertou) {
        resElement.innerText = "✅ Perfeito! O Balanço Patrimonial está correto.";
        resElement.className = "green";
        document.getElementById('btn-proxima').style.display = 'block';
    } else {
        resElement.innerText = `❌ Há erros no lançamento.\nDica: Ativo deve ser ${ex.correto.ativo}.`;
        resElement.className = "red";
    }
}

function proximoExercicio() {
    exercicioAtual = (exercicioAtual + 1) % listaExercicios.length;
    exibirExercicio();
}

carregarExercicios();

function clearProgress(){
  localStorage.removeItem("quizProgress");
  alert("Progresso apagado!");
}
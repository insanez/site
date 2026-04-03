let questions = [];
let wrong = [];
let index = 0;
let tipo = "";
let natureza = "";
let acertos = 0;
let erros = 0;
let review = false;

function shuffle(arr){
  return [...arr].sort(()=>Math.random()-0.5);
}

async function loadQuestions(){
  const res = await fetch("questions.json");
  const data = await res.json();
  questions = shuffle(data);
  render();
  updateStats();
}

function currentList(){
  return review && wrong.length ? wrong : questions;
}

function render(){
  const q = currentList()[index % currentList().length];

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
}

function selectTipo(t){ tipo = t; render(); }
function selectNatureza(n){ natureza = n; render(); }

function checkAnswer(){
  const q = currentList()[index % currentList().length];
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

  updateStats();
}

function nextQuestion(){
  index++;
  tipo = "";
  natureza = "";
  document.getElementById("result").innerHTML = "";
  render();
}

function toggleExample(){
  const el = document.getElementById("example");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function updateStats(){
  const total = acertos + erros;
  const perc = total ? (acertos / total * 100) : 0;

  document.getElementById("statTotal").innerText = `Respondidas: ${total}`;
  document.getElementById("statAcertos").innerText = `Acertos: ${acertos} (${perc.toFixed(1)}%)`;
  document.getElementById("statErros").innerText = `Erros: ${erros}`;
  document.getElementById("statPendentes").innerText = `Pendentes: ${wrong.length}`;

  document.getElementById("progress").style.width = perc + "%";
}

function reviewErrors(){
  review = true;
  index = 0;
  render();
}

document.getElementById('btn-proxima').style.display = 'block';

function resetAll(){
  questions = shuffle(questions);
  wrong = [];
  acertos = 0;
  erros = 0;
  review = false;
  index = 0;
  updateStats();
  render();
}

loadQuestions();

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
    
    // Limpa campos anteriores
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

// Inicia o carregamento ao abrir a página
carregarExercicios();
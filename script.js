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
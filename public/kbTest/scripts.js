const TEXTS = {
  en: [
    "the quick brown fox jumps over the lazy dog and keeps on running through the wide open fields",
    "programming is the art of telling another human what one wants the computer to do without any ambiguity",
    "simplicity is the soul of efficiency and every line of code should have a clear and single purpose",
    "practice every day to improve your typing speed and reduce the number of errors you make overall",
    "a good programmer writes code that humans can understand and machines can execute without any trouble"
  ],
  ru: [
    "быстрая коричневая лиса перепрыгивает через ленивую собаку и продолжает бежать по открытому полю",
    "программирование это искусство объяснить компьютеру что нужно сделать точно и без двусмысленности",
    "простота это душа эффективности и каждая строка кода должна иметь чёткую и единственную цель",
    "практикуйтесь каждый день чтобы увеличить скорость набора текста и уменьшить количество ошибок",
    "хороший программист пишет код который понятен людям и выполняется машиной без каких либо проблем"
  ]
};

const TIME_LIMIT = 60;

let lang = 'en';
let currentText = '';
let typed = [];
let startTime = null;
let timerInterval = null;
let timeLeft = TIME_LIMIT;
let started = false;
let finished = false;
let totalTyped = 0;
let errors = 0;

const quoteBox = document.getElementById('quote-box');
const inputArea = document.getElementById('input-area');
const wpmEl = document.getElementById('wpm');
const accEl = document.getElementById('acc');
const timerEl = document.getElementById('timer');
const resultBox = document.getElementById('result-box');
const finalWpm = document.getElementById('final-wpm');
const finalAcc = document.getElementById('final-acc');
const hintEl = document.getElementById('hint');

function pickText() {
  const arr = TEXTS[lang];
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderQuote() {
  const chars = currentText.split('');
  quoteBox.innerHTML = '';
  const input = document.createElement('input');
  input.id = 'input-area';
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocorrect = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  input.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';
  quoteBox.appendChild(input);

  chars.forEach((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch;
    span.dataset.index = i;
    if (i === typed.length) span.classList.add('cursor');
    else if (i < typed.length) {
      span.classList.add(typed[i] === currentText[i] ? 'correct' : 'wrong');
    }
    quoteBox.appendChild(span);
  });

  document.getElementById('input-area').addEventListener('keydown', onKeyDown);
}

function onKeyDown(e) {
  if (finished) return;
  if (e.key === 'Tab') { e.preventDefault(); resetGame(); return; }
  if (e.key === 'Backspace') {
    if (typed.length > 0) { typed.pop(); renderQuote(); updateStats(); }
    return;
  }
  if (e.key.length !== 1) return;

  if (!started) { startTimer(); started = true; hintEl.style.opacity = '0'; }

  const expected = currentText[typed.length];
  if (e.key !== expected) errors++;
  totalTyped++;
  typed.push(e.key);
  renderQuote();
  updateStats();

  if (typed.length === currentText.length) endGame();
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
    updateStats();
  }, 1000);
}

function updateStats() {
  const elapsed = started ? (Date.now() - startTime) / 60000 : 0;
  const words = typed.length / 5;
  const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const acc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
  wpmEl.textContent = wpm;
  accEl.textContent = acc;
}

function endGame() {
  finished = true;
  clearInterval(timerInterval);
  const elapsed = (Date.now() - startTime) / 60000;
  const wpm = Math.round((typed.length / 5) / elapsed);
  const acc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
  resultBox.style.display = 'block';
  finalWpm.textContent = wpm + ' WPM';
  finalAcc.textContent = 'accuracy: ' + acc + '%';
}

function resetGame() {
  clearInterval(timerInterval);
  typed = [];
  started = false;
  finished = false;
  totalTyped = 0;
  errors = 0;
  timeLeft = TIME_LIMIT;
  startTime = null;
  currentText = pickText();
  wpmEl.textContent = '0';
  accEl.textContent = '100';
  timerEl.textContent = TIME_LIMIT;
  resultBox.style.display = 'none';
  hintEl.style.opacity = '1';
  renderQuote();
  document.getElementById('input-area').focus();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    lang = btn.dataset.lang;
    resetGame();
  });
});

document.getElementById('restart-btn').addEventListener('click', resetGame);

quoteBox.addEventListener('click', () => {
  document.getElementById('input-area').focus();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') { e.preventDefault(); resetGame(); }
  else if (!finished && e.key.length === 1) {
    document.getElementById('input-area').focus();
  }
});

resetGame();
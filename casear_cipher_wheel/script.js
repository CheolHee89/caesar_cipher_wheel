/******************************************************
 * 1. TRANSLATIONS & LANGUAGE TOGGLE
 ******************************************************/
let currentLang = "ko"; // 전역에서 한 번만 선언
const translations = {
  en: {
    title: "Caesar Cipher Wheel - Word Guess Game",
    instrBtn: "How to Play",
    instruction: "Rotate the wheel to decode the text.<br/>Then type your guess for the original word below.",
    sliderLabel: "Shift:",
    guessPlaceholder: "Guess the word",
    checkBtn: "Check Word",
    newBtn: "New Puzzle",
    hintBtn: "Show Hint",
    pleaseEnter: "Please enter a guess!",
    correct: "Correct! The hidden word was",
    wrong: "Wrong guess. Try again!",
    instrContent: "1. Use the language toggle button to switch between English and Korean.<br/>2. The top code box shows the encrypted word using Caesar cipher.<br/>3. The outer ring displays fixed plaintext letters (A-Z), and the inner ring displays the shifted letters dynamically as you adjust the slider.<br/>4. Move the slider to update the inner ring and see the shift value next to it.<br/>5. Click 'Show Hint' to reveal the secret shift value (available only once per puzzle).<br/>6. Type your guess in the input field and click 'Check Word' to see if you're correct.<br/>7. Click 'New Puzzle' to generate a new challenge."
  },
  ko: {
    title: "카이사르 암호 휠 - 암호를 풀어보자",
    instrBtn: "게임 방법",
    instruction: "휠을 돌려 텍스트를 해독하세요.<br/>그리고 원본 단어를 아래에 입력하세요.",
    sliderLabel: "시프트:",
    guessPlaceholder: "단어를 입력하세요",
    checkBtn: "단어 확인",
    newBtn: "새 퍼즐",
    hintBtn: "힌트 보기",
    pleaseEnter: "추측 단어를 입력하세요!",
    correct: "정답! 숨겨진 단어는",
    wrong: "오답입니다. 다시 시도하세요!",
    instrContent: "1. 우측 상단의 언어 전환 버튼을 눌러 영어와 한글로 화면을 변경할 수 있습니다.<br/>2. 상단 코드 박스에는 Caesar ㄴ암호로 암호화된 단어가 표시됩니다.<br/>3. 외부 원판은 고정된 평문 알파벳(A~Z)이며, 내부 원판은 슬라이더에 따라 시프트된 암호 문자들이 표시됩니다.<br/>4. 슬라이더를 움직이면 내부 원판의 문자와 옆에 현재 시프트 암호 문자가 업데이트됩니다.<br/>5. '힌트 보기' 버튼을 누르면 실제 시프트 값이 표시 됩니다.<br/>6. 입력창에 원본 단어를 추측하여 입력하고 '단어 확인' 버튼을 누르면 정답 여부가 표시됩니다.<br/>7. '새 퍼즐' 버튼을 눌러 새로운 퍼즐을 생성할 수 있습니다."
  }
};

function updateLanguage() {
  const t = translations[currentLang];
  document.getElementById("titleText").innerText = t.title;
  document.getElementById("instructionText").innerHTML = t.instruction;
  document.getElementById("sliderText").textContent = t.sliderLabel;
  document.getElementById("instrBtn").textContent = t.instrBtn;
  guessInput.placeholder = t.guessPlaceholder;
  checkBtn.innerText = t.checkBtn;
  newBtn.innerText = t.newBtn;
  hintBtn.innerText = t.hintBtn;
  langToggle.innerText = (currentLang === "en") ? "한국어" : "English";
}

document.getElementById("langToggle").addEventListener("click", function() {
  currentLang = (currentLang === "en") ? "ko" : "en";
  updateLanguage();
});

/******************************************************
 * 2. DATA & UTILITIES
 ******************************************************/
const puzzleWords = ["DOG", "LOVE", "CAT", "FISH", "CODE", "KIDS", "LOCK", "MOON", "MATH", "STAR", "PLAN"];
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pickRandomWord() {
  return puzzleWords[Math.floor(Math.random() * puzzleWords.length)];
}
function getRandomShift() {
  return Math.floor(Math.random() * 25) + 1; // 1부터 25까지
}
function caesarEncrypt(word, shift) {
  let result = "";
  for (let ch of word) {
    const baseIdx = letters.indexOf(ch);
    if (baseIdx === -1) {
      result += ch;
    } else {
      result += letters[(baseIdx + shift) % 26];
    }
  }
  return result;
}

/******************************************************
 * 3. DOM ELEMENTS & GLOBAL STATE
 ******************************************************/
const container = document.getElementById("cipherContainer");
const svg = document.getElementById("connectorSVG");
const shiftRange = document.getElementById("shiftRange");
let shiftValue = document.getElementById("shiftValue"); // 고정된 요소
const codeBoxes = document.getElementById("codeBoxes");
const shiftedOutput = document.getElementById("shiftedOutput");
const resultMessage = document.getElementById("resultMessage");
const guessInput = document.getElementById("guessInput");
const checkBtn = document.getElementById("checkBtn");
const newBtn = document.getElementById("newBtn");
const hintBtn = document.getElementById("hintBtn");
const langToggle = document.getElementById("langToggle");
const instrBtn = document.getElementById("instrBtn");

/******************************************************
 * 4. GAME STATE & CAESAR WHEEL SETUP
 ******************************************************/
let originalWord = "";
let shiftSecret = 0;
let ciphered = "";
const SIZE = 400, CENTER = SIZE / 2;
const radiusInner = 95, radiusOuter = 155;
let innerLetterElems = [], outerLetterElems = [], connectorLines = [];

function createOuterRing() {
  for (let i = 0; i < 26; i++) {
    const angleDeg = (360 / 26) * i;
    const x = CENTER + radiusOuter * Math.cos(angleDeg * Math.PI / 180);
    const y = CENTER + radiusOuter * Math.sin(angleDeg * Math.PI / 180);
    const div = document.createElement("div");
    div.classList.add("letter", "outer");
    div.textContent = letters[i];
    container.appendChild(div);
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) rotate(-90deg)`;
    outerLetterElems.push(div);
  }
}
function createInnerRing() {
  for (let i = 0; i < 26; i++) {
    const angleDeg = (360 / 26) * i;
    const x = CENTER + radiusInner * Math.cos(angleDeg * Math.PI / 180);
    const y = CENTER + radiusInner * Math.sin(angleDeg * Math.PI / 180);
    const div = document.createElement("div");
    div.classList.add("letter", "inner");
    div.textContent = letters[i];
    container.appendChild(div);
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) rotate(-90deg)`;
    innerLetterElems.push(div);
  }
}
function createConnectorLines() {
  for (let i = 0; i < 26; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", "rgba(255, 215, 0, 0.5)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
    connectorLines.push(line);
  }
}
function updateShift() {
  const userShift = parseInt(shiftRange.value, 10);
  shiftValue.textContent = userShift;
  for (let i = 0; i < 26; i++) {
    const letterIndex = (i + userShift) % 26;
    innerLetterElems[i].textContent = letters[letterIndex];
  }
  for (let i = 0; i < 26; i++) {
    const angleRad = (i * 2 * Math.PI) / 26;
    const x1 = CENTER + radiusInner * Math.cos(angleRad);
    const y1 = CENTER + radiusInner * Math.sin(angleRad);
    const x2 = CENTER + radiusOuter * Math.cos(angleRad);
    const y2 = CENTER + radiusOuter * Math.sin(angleRad);
    connectorLines[i].setAttribute("x1", x1);
    connectorLines[i].setAttribute("y1", y1);
    connectorLines[i].setAttribute("x2", x2);
    connectorLines[i].setAttribute("y2", y2);
  }
}

/******************************************************
 * 5. GAME LOGIC
 ******************************************************/
function newPuzzle() {
  originalWord = pickRandomWord();
  shiftSecret = getRandomShift();
  document.querySelector(".lock-icon").classList.remove("unlocked");
  ciphered = caesarEncrypt(originalWord, shiftSecret);
  codeBoxes.innerHTML = "";
  for (let ch of ciphered) {
    const div = document.createElement("div");
    div.classList.add("code-box");
    div.textContent = ch;
    codeBoxes.appendChild(div);
  }
  guessInput.value = "";
  resultMessage.textContent = "";
  shiftedOutput.textContent = "";
  shiftRange.value = 0;
  shiftValue.textContent = "0";
  updateShift();
  hintBtn.disabled = false;
}
function checkWord() {
  const guess = guessInput.value.trim().toUpperCase();
  const t = translations[currentLang];
  if (!guess) {
    resultMessage.style.color = "#ff5555";
    resultMessage.textContent = t.pleaseEnter;
    return;
  }
  if (guess === originalWord) {
    resultMessage.style.color = "#00ffcc";
    resultMessage.textContent = `${t.correct} "${originalWord}".`;
    document.querySelector(".lock-icon").classList.add("unlocked");
  } else {
    resultMessage.style.color = "#ff5555";
    resultMessage.textContent = t.wrong;
  }
}
function showHint() {
  shiftedOutput.textContent = `Secret Shift: ${shiftSecret}`;
  hintBtn.disabled = true;
}

/******************************************************
 * 6. 모달 (게임 설명) 관련
 ******************************************************/
const instrModal = document.getElementById("instrModal");
const modalClose = document.getElementById("modalClose");

instrBtn.addEventListener("click", function() {
  const t = translations[currentLang];
  // 모달 내용 업데이트 (게임 방법 설명)
  document.getElementById("modalContent").innerHTML = `<h2>${currentLang === "en" ? "Game Instructions" : "게임 설명"}</h2>
  <p>${t.instrContent}</p>`;
  instrModal.style.display = "block";
});
modalClose.addEventListener("click", function() {
  instrModal.style.display = "none";
});
window.addEventListener("click", function(event) {
  if (event.target == instrModal) {
    instrModal.style.display = "none";
  }
});

/******************************************************
 * 7. INIT & LANGUAGE TOGGLE
 ******************************************************/
function init() {
  createOuterRing();
  createInnerRing();
  createConnectorLines();
  updateShift();
  newPuzzle();
  updateLanguage();
}
shiftRange.addEventListener("input", updateShift);
checkBtn.addEventListener("click", checkWord);
newBtn.addEventListener("click", newPuzzle);
hintBtn.addEventListener("click", showHint);

init();
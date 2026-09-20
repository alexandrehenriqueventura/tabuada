// Telas
const screenLogin = document.getElementById('screen-login');
const screenMap = document.getElementById('screen-map');
const screenGame = document.getElementById('screen-game');
const screenBoss = document.getElementById('screen-boss');
const screenWin = document.getElementById('screen-win');
const screenLose = document.getElementById('screen-lose');
const globalHeader = document.getElementById('global-header');

// Elementos de Login
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');

// Elementos Globais
const displayUsername = document.getElementById('display-username');
const globalLivesEl = document.getElementById('global-lives');
const globalGemsEl = document.getElementById('global-gems');
const globalStreakEl = document.getElementById('global-streak');
const headerPhaseNum = document.getElementById('header-phase-num');

// Elementos do Mapa
const mapNodesContainer = document.getElementById('map-nodes');
const phaseTitleCard = document.getElementById('phase-title-card');
const phaseDescCard = document.getElementById('phase-desc-card');

// Elementos do Jogo Normal
const num1El = document.getElementById('num1');
const num2El = document.getElementById('num2');
const answerDisplay = document.getElementById('answer-display');
const progressFill = document.getElementById('progress-fill');
const feedbackEl = document.getElementById('feedback');

// Teclado Jogo Normal
const numKeys = document.querySelectorAll('#screen-game .num-key');
const keyDel = document.getElementById('key-del');
const keyEnter = document.getElementById('key-enter');

// Elementos Boss
const bossTimerValue = document.getElementById('boss-timer-value');
const bossHealthFill = document.getElementById('boss-health-fill');
const bossHpText = document.getElementById('boss-hp');
const bossHitsText = document.getElementById('boss-hits');
const bossPlayerHearts = document.getElementById('boss-player-hearts');
const bNum1 = document.getElementById('b-num1');
const bNum2 = document.getElementById('b-num2');
const bossAnswerDisplay = document.getElementById('boss-answer-display');

// Teclado Boss
const bNumKeys = document.querySelectorAll('.b-num-key');
const bKeyDel = document.getElementById('b-key-del');
const bKeyEnter = document.getElementById('b-key-enter');
const bossGiveupBtn = document.getElementById('boss-giveup');

// Botoes de Resultado
const btnBackMapWin = document.getElementById('btn-back-map-win');
const btnBackMapLose = document.getElementById('btn-back-map-lose');

// ==========================================
// ESTADO E LOCAL STORAGE
// ==========================================
let currentUser = "";
let isNewUser = false;
let gameState = {
    lives: 3,
    gems: 0,
    streak: 0,
    maxLevelReached: 1,
    history: {},
    inventory: ['green'], // Cores do avatar
    equippedColor: 'green'
};

function saveProgress() {
    if(!currentUser) return;
    localStorage.setItem(`tabuada_user_${currentUser}`, JSON.stringify(gameState));
}

function loadProgress(username) {
    const data = localStorage.getItem(`tabuada_user_${username}`);
    if (data) {
        gameState = JSON.parse(data);
        if (!gameState.history) gameState.history = {};
        if (!gameState.inventory) {
            gameState.inventory = ['green'];
            gameState.equippedColor = 'green';
        }
        isNewUser = false;
    } else {
        // Novo usuario
        gameState = { lives: 3, gems: 0, streak: 0, maxLevelReached: 1, history: {}, inventory: ['green'], equippedColor: 'green' };
        isNewUser = true;
        saveProgress();
    }
    applyAvatarSettings();
}

function applyAvatarSettings() {
    const colorMap = {
        'green': 'var(--success)',
        'blue': 'var(--secondary)',
        'red': 'var(--danger)',
        'purple': 'var(--purple)',
        'yellow': 'var(--primary)'
    };
    const c = colorMap[gameState.equippedColor] || 'var(--success)';
    
    document.getElementById('header-avatar').style.backgroundColor = c;
    
    const bigAv = document.getElementById('big-avatar');
    if (bigAv) bigAv.style.color = c;
}

// Configuração das Fases (Normal -> Boss sempre cumulativo)
const levels = [];
const opsInfo = [
    { op: '+', name: 'Adição', boss: 'Rei da Adição' },
    { op: '-', name: 'Subtração', boss: 'Ladrão de Números' },
    { op: '*', name: 'Multiplicação', boss: 'O Guardião' },
    { op: '/', name: 'Divisão', boss: 'O Fracionador' }
];

let idCounter = 1;
for (const info of opsInfo) {
    for (let i = 1; i <= 20; i++) {
        const isBoss = (i % 5 === 0);
        const stage = Math.ceil(i / 5); // 1 to 4
        const tableValue = 1 + i;
        
        if (isBoss) {
            levels.push({
                id: idCounter++,
                type: 'boss',
                op: info.op,
                min: 2,
                max: 3 + stage,
                time: 60,
                title: `${info.boss} (Nv.${stage})`,
                desc: `Chefão da Fase ${stage}`
            });
        } else {
            levels.push({
                id: idCounter++,
                type: 'normal',
                op: info.op,
                table: tableValue > 9 ? (tableValue % 8) + 2 : tableValue,
                targetScore: 5 + stage,
                title: `${info.name} ${i}`,
                desc: `Treino Prático (${info.op})`
            });
        }
    }
}

let currentInputValue = "";
let currentExpectedAnswer = 0;
let currentPhaseScore = 0;
let currentPhaseTarget = 0;
let activeLevelData = null;

// Variaveis Boss
let bossTimeLeft = 0;
let bossTimerInterval = null;
let bossLives = 3;

// Web Audio API Sound System
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sfx = {
    play: (freq, type, dur, vol=0.1) => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
    },
    correct: () => { sfx.play(440, 'sine', 0.1); setTimeout(() => sfx.play(659, 'sine', 0.2), 100); },
    wrong: () => { sfx.play(250, 'sawtooth', 0.2); setTimeout(() => sfx.play(200, 'sawtooth', 0.3), 150); },
    bossHit: () => { sfx.play(150, 'square', 0.1, 0.2); setTimeout(() => sfx.play(100, 'square', 0.2, 0.2), 50); },
    bossHeal: () => { sfx.play(400, 'sine', 0.2); setTimeout(() => sfx.play(600, 'sine', 0.3), 100); },
    win: () => { [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => sfx.play(f, 'square', 0.2), i*150)); },
    click: () => { sfx.play(600, 'sine', 0.05, 0.05); }
};

// ==========================================
// NAVEGAÇÃO E UI GERAL
// ==========================================
function updateGlobalUI() {
    globalLivesEl.textContent = gameState.lives;
    globalGemsEl.textContent = gameState.gems;
    globalStreakEl.textContent = gameState.streak;
    headerPhaseNum.textContent = gameState.maxLevelReached;
    displayUsername.textContent = currentUser;
    
    const currentLvl = levels.find(l => l.id === gameState.maxLevelReached) || levels[levels.length-1];
    phaseTitleCard.textContent = currentLvl.title;
    phaseDescCard.textContent = currentLvl.desc;
}

function showScreen(screenEl, showHeader = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    screenEl.classList.remove('hidden');
    
    if (showHeader) globalHeader.classList.remove('hidden');
    else globalHeader.classList.add('hidden');
}

// ==========================================
// LOGIN
// ==========================================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if(name) {
        currentUser = name;
        loadProgress(currentUser);
        updateGlobalUI();
        
        if (isNewUser) {
            startAssessment();
        } else {
            renderMap();
            showScreen(screenMap);
        }
    }
});

// ==========================================
// MAPA
// ==========================================
function renderMap() {
    mapNodesContainer.innerHTML = '';
    
    levels.forEach(level => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('node-wrapper');
        const node = document.createElement('div');
        node.classList.add('map-node');
        const label = document.createElement('div');
        label.classList.add('node-label');
        label.textContent = `Fase ${level.id}`;
        
        if (level.type === 'boss') {
            node.classList.add('boss');
            if (level.id <= gameState.maxLevelReached) {
                node.innerHTML = '<i class="fa-solid fa-skull"></i>';
                node.style.backgroundColor = 'var(--purple)';
                node.style.color = 'white';
                node.style.borderColor = 'white';
            } else {
                node.innerHTML = '<i class="fa-solid fa-skull"></i>';
            }
        } else {
            if (level.id < gameState.maxLevelReached) {
                node.classList.add('completed');
                node.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if (level.id === gameState.maxLevelReached) {
                node.classList.add('active');
                node.innerHTML = '<i class="fa-solid fa-star"></i>';
                const startLabel = document.createElement('div');
                startLabel.classList.add('start-label');
                startLabel.textContent = 'COMEÇAR';
                wrapper.appendChild(startLabel);
            } else {
                node.classList.add('locked');
                node.innerHTML = '<i class="fa-solid fa-lock"></i>';
            }
        }

        node.addEventListener('click', () => {
            if (level.id <= gameState.maxLevelReached) {
                startLevel(level);
            }
        });

        wrapper.appendChild(node);
        wrapper.appendChild(label);
        mapNodesContainer.appendChild(wrapper);
    });

    // Auto-scroll to active node
    setTimeout(() => {
        const activeNode = document.querySelector('.map-node.active');
        if (activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

document.getElementById('btn-quit-game').addEventListener('click', () => {
    sfx.click();
    showScreen(screenMap);
});

// ==========================================
// LÓGICA DO JOGO NORMAL
// ==========================================
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function startLevel(levelData) {
    if (gameState.lives <= 0) {
        document.getElementById('lose-reason').textContent = "Você está sem vidas. Volte amanhã!";
        showScreen(screenLose, false);
        return;
    }

    activeLevelData = levelData;
    currentPhaseScore = 0;
    
    if (levelData.type === 'normal') {
        currentPhaseTarget = levelData.targetScore;
        progressFill.style.width = '0%';
        document.getElementById('level-title').textContent = levelData.title;
        document.getElementById('game-lives-count').textContent = gameState.lives;
        generateNormalQuestion();
        showScreen(screenGame, false);
    } else {
        startBossLevel();
    }
}

function getOperatorSymbol(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
}

function registerAnswer(n1, n2, op, isCorrect) {
    // Normaliza chave. Se for +, * a ordem nao importa. Se for -, / importa.
    let key;
    if (op === '+' || op === '*') {
        key = n1 < n2 ? `${n1}${op}${n2}` : `${n2}${op}${n1}`;
    } else {
        key = `${n1}${op}${n2}`;
    }
    
    if (!gameState.history) gameState.history = {};
    if (!gameState.history[key]) gameState.history[key] = { correct: 0, wrong: 0 };
    
    if (isCorrect) gameState.history[key].correct++;
    else gameState.history[key].wrong++;
    
    saveProgress();
}

function calculateExpected(n1, n2, op) {
    if (op === '+') return n1 + n2;
    if (op === '-') return n1 - n2;
    if (op === '*') return n1 * n2;
    if (op === '/') return Math.floor(n1 / n2);
    return 0;
}

function generateNormalQuestion() {
    let n1, n2;
    const op = activeLevelData.op || '*';
    document.getElementById('op-display').textContent = getOperatorSymbol(op);
    
    // Repetição Espaçada: 30% de chance de forçar uma conta que o aluno mais errou
    const mistakes = Object.entries(gameState.history || {}).filter(([k, v]) => v.wrong > v.correct && k.includes(op));
    
    if (mistakes.length > 0 && Math.random() < 0.3) {
        const randomMistake = mistakes[Math.floor(Math.random() * mistakes.length)][0];
        const parts = randomMistake.split(op);
        n1 = parseInt(parts[0]);
        n2 = parseInt(parts[1]);
    } else {
        if (op === '/') {
            // Divisão exata: n2 é a tabuada, o res é aleatório, n1 = n2 * res
            n2 = activeLevelData.table;
            let res = getRandomInt(2, 9);
            n1 = n2 * res;
        } else if (op === '-') {
            // Subtração sem número negativo: n1 maior ou igual a n2
            n2 = activeLevelData.table;
            n1 = getRandomInt(n2, n2 + 9);
        } else {
            n1 = activeLevelData.table;
            n2 = getRandomInt(2, 9);
            if (Math.random() > 0.5) [n1, n2] = [n2, n1];
        }
    }
    
    currentExpectedAnswer = calculateExpected(n1, n2, op);
    num1El.textContent = n1;
    num2El.textContent = n2;
    currentInputValue = "";
    updateNormalDisplay();
}

function updateNormalDisplay() {
    if (currentInputValue === "") {
        answerDisplay.textContent = "?";
        answerDisplay.classList.add('empty');
    } else {
        answerDisplay.textContent = currentInputValue;
        answerDisplay.classList.remove('empty');
    }
}

numKeys.forEach(btn => btn.addEventListener('click', () => {
    if (currentInputValue.length < 3) { currentInputValue += btn.getAttribute('data-val'); updateNormalDisplay(); }
}));
keyDel.addEventListener('click', () => { currentInputValue = currentInputValue.slice(0, -1); updateNormalDisplay(); });
keyEnter.addEventListener('click', () => submitNormalAnswer());

function submitNormalAnswer() {
    if (currentInputValue === "") return;
    const op = activeLevelData.op || '*';
    if (parseInt(currentInputValue) === currentExpectedAnswer) {
        sfx.correct();
        registerAnswer(parseInt(num1El.textContent), parseInt(num2El.textContent), op, true);
        currentPhaseScore++;
        progressFill.style.width = `${(currentPhaseScore / currentPhaseTarget) * 100}%`;
        if (currentPhaseScore >= currentPhaseTarget) { winLevel(); return; }
        generateNormalQuestion();
    } else {
        sfx.wrong();
        registerAnswer(parseInt(num1El.textContent), parseInt(num2El.textContent), op, false);
        loseLife();
        currentInputValue = ""; updateNormalDisplay();
    }
}

function loseLife() {
    gameState.lives--;
    gameState.streak = 0; // Perde ofensiva
    updateGlobalUI();
    document.getElementById('game-lives-count').textContent = gameState.lives;
    
    // Mostra feedback visual
    feedbackEl.textContent = "Errou!";
    feedbackEl.style.color = "var(--danger)";
    setTimeout(() => { feedbackEl.textContent = ""; }, 1000);
    
    if (gameState.lives <= 0) {
        document.getElementById('lose-reason').textContent = "Você ficou sem vidas. Volte amanhã para tentar novamente.";
        showScreen(screenLose, false);
    }
}

// ==========================================
// LÓGICA DO CHEFÃO
// ==========================================
function startBossLevel() {
    bossLives = 3;
    currentPhaseTarget = 10; // Precisa acertar 10 para vencer
    bossTimeLeft = activeLevelData.time;
    updateBossHearts();
    updateBossHealth();
    bossTimerValue.textContent = bossTimeLeft;
    
    bossTimerInterval = setInterval(() => {
        bossTimeLeft--;
        bossTimerValue.textContent = bossTimeLeft;
        if (bossTimeLeft <= 0) { clearInterval(bossTimerInterval); loseLife(); showScreen(screenMap); }
    }, 1000);
    
    generateBossQuestion();
    showScreen(screenBoss, false);
}

function generateBossQuestion() {
    let n1, n2;
    const op = activeLevelData.op || '*';
    document.getElementById('b-op-display').textContent = getOperatorSymbol(op);
    
    const mistakes = Object.entries(gameState.history || {}).filter(([k, v]) => v.wrong > v.correct && k.includes(op));
    
    if (mistakes.length > 0 && Math.random() < 0.4) { // 40% no boss
        const randomMistake = mistakes[Math.floor(Math.random() * mistakes.length)][0];
        const parts = randomMistake.split(op);
        n1 = parseInt(parts[0]);
        n2 = parseInt(parts[1]);
    } else {
        if (op === '/') {
            n2 = getRandomInt(activeLevelData.min, activeLevelData.max);
            let res = getRandomInt(2, 9);
            n1 = n2 * res;
        } else if (op === '-') {
            n2 = getRandomInt(activeLevelData.min, activeLevelData.max);
            n1 = getRandomInt(n2, n2 + 9);
        } else {
            n1 = getRandomInt(activeLevelData.min, activeLevelData.max);
            n2 = getRandomInt(2, 9);
            if (Math.random() > 0.5) [n1, n2] = [n2, n1];
        }
    }
    
    currentExpectedAnswer = calculateExpected(n1, n2, op);
    bNum1.textContent = n1;
    bNum2.textContent = n2;
    currentInputValue = "";
    updateBossDisplay();
}

function updateBossDisplay() {
    if (currentInputValue === "") {
        bossAnswerDisplay.textContent = "?";
        bossAnswerDisplay.classList.add('empty');
    } else {
        bossAnswerDisplay.textContent = currentInputValue;
        bossAnswerDisplay.classList.remove('empty');
    }
}

bNumKeys.forEach(btn => btn.addEventListener('click', () => {
    if (currentInputValue.length < 3) { currentInputValue += btn.getAttribute('data-val'); updateBossDisplay(); }
}));
bKeyDel.addEventListener('click', () => { currentInputValue = currentInputValue.slice(0, -1); updateBossDisplay(); });

bKeyEnter.addEventListener('click', () => {
    if (currentInputValue === "") return;
    
    const bossIcon = document.getElementById('boss-icon');
    bossIcon.classList.remove('boss-anim-hit', 'boss-anim-heal');
    void bossIcon.offsetWidth;

    const op = activeLevelData.op || '*';
    if (parseInt(currentInputValue) === currentExpectedAnswer) {
        sfx.bossHit();
        registerAnswer(parseInt(bNum1.textContent), parseInt(bNum2.textContent), op, true);
        bossIcon.classList.add('boss-anim-hit');
        currentPhaseScore++;
        updateBossHealth();
        if (currentPhaseScore >= currentPhaseTarget) {
            clearInterval(bossTimerInterval);
            winLevel();
            return;
        }
        generateBossQuestion();
    } else {
        sfx.bossHeal();
        registerAnswer(parseInt(bNum1.textContent), parseInt(bNum2.textContent), op, false);
        bossIcon.classList.add('boss-anim-heal');
        currentPhaseScore = Math.max(0, currentPhaseScore - 1);
        updateBossHealth();
        
        bossLives--;
        updateBossHearts();
        currentInputValue = ""; updateBossDisplay();
        
        document.body.style.backgroundColor = '#ef4444';
        setTimeout(() => { document.body.style.backgroundColor = '#0b0f19'; }, 300);

        if (bossLives <= 0) {
            clearInterval(bossTimerInterval);
            loseLife(); 
            if(gameState.lives > 0) showScreen(screenMap);
        }
    }
});

bossGiveupBtn.addEventListener('click', () => {
    clearInterval(bossTimerInterval);
    showScreen(screenMap);
});

function updateBossHealth() {
    const hpLeft = 100 - (currentPhaseScore * 10);
    bossHpText.textContent = hpLeft;
    bossHealthFill.style.width = `${hpLeft}%`;
    bossHitsText.textContent = currentPhaseScore;
}

function updateBossHearts() {
    bossPlayerHearts.innerHTML = '';
    for(let i=0; i<3; i++) {
        if(i < bossLives) bossPlayerHearts.innerHTML += '<i class="fa-solid fa-heart text-red"></i>';
        else bossPlayerHearts.innerHTML += '<i class="fa-regular fa-heart text-gray"></i>';
    }
}

// ==========================================
// RESULTADOS
// ==========================================
function winLevel() {
    sfx.win();
    if (activeLevelData.id === gameState.maxLevelReached) {
        gameState.maxLevelReached++;
        gameState.streak++; // Ganha ofensiva
    }
    
    const gemsReward = activeLevelData.type === 'boss' ? 50 : 10;
    gameState.gems += gemsReward;
    saveProgress();
    
    document.getElementById('win-gems').textContent = gemsReward;
    document.getElementById('win-correct').textContent = currentPhaseScore;
    document.getElementById('win-total').textContent = currentPhaseTarget;
    
    updateGlobalUI();
    showScreen(screenWin, false);
}

btnBackMapWin.addEventListener('click', () => { renderMap(); showScreen(screenMap); });
btnBackMapLose.addEventListener('click', () => { renderMap(); showScreen(screenMap); });

// ==========================================
// TESTE DE NIVELAMENTO (Começa do Ponto Certo)
// ==========================================
const screenAssessment = document.getElementById('screen-assessment');
const aNum1 = document.getElementById('a-num1');
const aNum2 = document.getElementById('a-num2');
const aAnswerDisplay = document.getElementById('assessment-answer-display');
const aNumKeys = document.querySelectorAll('.a-num-key');
const aKeyDel = document.getElementById('a-key-del');
const aKeyEnter = document.getElementById('a-key-enter');
const aProgressFill = document.getElementById('assessment-progress-fill');

let assessmentQuestions = [
    { op: '+', n1: 8, n2: 5 }, // Teste de Soma
    { op: '-', n1: 15, n2: 7 }, // Teste de Subtração
    { op: '*', n1: 4, n2: 8 }, // Multiplicação base
    { op: '/', n1: 24, n2: 4 }, // Divisão
    { op: '*', n1: 8, n2: 9 }  // Multiplicação Dificil
];
let currentAssessmentIdx = 0;
let assessmentCorrectCount = 0;
let aExpected = 0;

function startAssessment() {
    currentAssessmentIdx = 0;
    assessmentCorrectCount = 0;
    currentInputValue = "";
    showScreen(screenAssessment, false);
    loadAssessmentQuestion();
}

function loadAssessmentQuestion() {
    const q = assessmentQuestions[currentAssessmentIdx];
    const op = q.op || '*';
    document.getElementById('a-op-display').textContent = getOperatorSymbol(op);
    aNum1.textContent = q.n1;
    aNum2.textContent = q.n2;
    aExpected = calculateExpected(q.n1, q.n2, op);
    currentInputValue = "";
    updateADisplay();
    aProgressFill.style.width = `${(currentAssessmentIdx / assessmentQuestions.length) * 100}%`;
}

function updateADisplay() {
    if (currentInputValue === "") {
        aAnswerDisplay.textContent = "?";
        aAnswerDisplay.classList.add('empty');
    } else {
        aAnswerDisplay.textContent = currentInputValue;
        aAnswerDisplay.classList.remove('empty');
    }
}

aNumKeys.forEach(btn => btn.addEventListener('click', () => {
    if (currentInputValue.length < 3) { currentInputValue += btn.getAttribute('data-val'); updateADisplay(); }
}));
aKeyDel.addEventListener('click', () => { currentInputValue = currentInputValue.slice(0, -1); updateADisplay(); });

aKeyEnter.addEventListener('click', () => {
    if (currentInputValue === "") return;
    if (parseInt(currentInputValue) === aExpected) {
        assessmentCorrectCount++;
        document.body.style.backgroundColor = '#10b981';
    } else {
        document.body.style.backgroundColor = '#ef4444';
    }
    setTimeout(() => { document.body.style.backgroundColor = '#0b0f19'; }, 300);
    
    currentAssessmentIdx++;
    if (currentAssessmentIdx >= assessmentQuestions.length) {
        finishAssessment();
    } else {
        loadAssessmentQuestion();
    }
});

function finishAssessment() {
    // Define o nível com base nos acertos
    if (assessmentCorrectCount >= 4) gameState.maxLevelReached = 7;
    else if (assessmentCorrectCount === 3) gameState.maxLevelReached = 5;
    else if (assessmentCorrectCount === 2) gameState.maxLevelReached = 3;
    else gameState.maxLevelReached = 1;
    
    gameState.gems += (assessmentCorrectCount * 10);
    saveProgress();
    updateGlobalUI();
    
    alert(`Teste concluído! Você acertou ${assessmentCorrectCount}. O app te colocou no Nível ${gameState.maxLevelReached}.`);
    renderMap();
    showScreen(screenMap);
}

// ==========================================
// LOJA / CUSTOMIZAÇÃO
// ==========================================
const screenStore = document.getElementById('screen-store');
const btnStore = document.getElementById('btn-store');
const closeStore = document.getElementById('close-store');
const storeItemsContainer = document.getElementById('store-items-container');

const shopItems = [
    { id: 'blue', type: 'color', name: 'Azul Espacial', price: 50 },
    { id: 'red', type: 'color', name: 'Vermelho Fogo', price: 50 },
    { id: 'purple', type: 'color', name: 'Roxo Místico', price: 100 },
    { id: 'yellow', type: 'color', name: 'Amarelo Relâmpago', price: 150 }
];

btnStore.addEventListener('click', () => { renderStore(); showScreen(screenStore); });
closeStore.addEventListener('click', () => { showScreen(screenMap); });

function renderStore() {
    storeItemsContainer.innerHTML = '';
    shopItems.forEach(item => {
        const isOwned = gameState.inventory.includes(item.id);
        const isEquipped = gameState.equippedColor === item.id;
        
        const div = document.createElement('div');
        div.className = `store-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;
        
        let actionHtml = '';
        if (isEquipped) actionHtml = `<p class="item-price" style="color:var(--success)">Equipado</p>`;
        else if (isOwned) actionHtml = `<p class="item-price" style="color:var(--gray-light)">Adquirido</p>`;
        else actionHtml = `<p class="item-price"><i class="fa-solid fa-gem"></i> ${item.price}</p>`;
        
        div.innerHTML = `
            <h4>${item.name}</h4>
            ${actionHtml}
        `;
        
        div.addEventListener('click', () => {
            if (isEquipped) return;
            if (isOwned) {
                gameState.equippedColor = item.id;
                saveProgress();
                applyAvatarSettings();
                renderStore();
            } else if (gameState.gems >= item.price) {
                gameState.gems -= item.price;
                gameState.inventory.push(item.id);
                gameState.equippedColor = item.id;
                saveProgress();
                applyAvatarSettings();
                updateGlobalUI();
                renderStore();
            } else {
                alert('Gemas insuficientes!');
            }
        });
        
        storeItemsContainer.appendChild(div);
    });
}

// ==========================================
// CONQUISTAS (MEDALHAS)
// ==========================================
const screenBadges = document.getElementById('screen-badges');
const btnBadges = document.getElementById('btn-badges');
const closeBadges = document.getElementById('close-badges');
const badgesContainer = document.getElementById('badges-container');

btnBadges.addEventListener('click', () => { renderBadges(); showScreen(screenBadges); });
closeBadges.addEventListener('click', () => { showScreen(screenMap); });

function renderBadges() {
    badgesContainer.innerHTML = '';
    const bossLevels = levels.filter(l => l.type === 'boss');
    
    bossLevels.forEach(boss => {
        const isUnlocked = gameState.maxLevelReached > boss.id;
        const div = document.createElement('div');
        div.className = `badge-slot ${isUnlocked ? 'unlocked' : ''}`;
        div.innerHTML = isUnlocked ? `<i class="fa-solid fa-medal"></i>` : `<i class="fa-solid fa-lock"></i>`;
        
        // Add a tooltip or name
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '5px';
        
        const name = document.createElement('span');
        name.style.fontSize = '0.7rem';
        name.style.fontWeight = '800';
        name.style.textAlign = 'center';
        name.textContent = boss.title;
        
        wrapper.appendChild(div);
        wrapper.appendChild(name);
        badgesContainer.appendChild(wrapper);
    });
}

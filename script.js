// Telas
const screenLogin = document.getElementById('screen-login');
const screenAnimalSelect = document.getElementById('screen-animal-select');
const screenOperationSelect = document.getElementById('screen-operation-select');
const screenMap = document.getElementById('screen-map');
const screenGame = document.getElementById('screen-game');
const screenBoss = document.getElementById('screen-boss');
const screenWin = document.getElementById('screen-win');
const screenLose = document.getElementById('screen-lose');
const screenStudySelect = document.getElementById('screen-study-select');
const screenStudyView = document.getElementById('screen-study-view');
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
// ESTADO E LOCAL STORAGE (FIREBASE)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBnubQM46SsuZUz2TncL4uyVhi0tVhH0gU",
    authDomain: "tabuada-4b7d9.firebaseapp.com",
    projectId: "tabuada-4b7d9",
    storageBucket: "tabuada-4b7d9.firebasestorage.app",
    messagingSenderId: "185531304834",
    appId: "1:185531304834:web:a2b92e32991f34c49b5d9b",
    measurementId: "G-QFZH57KLCF"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
let currentDisplayName = "";
let currentEmail = "";


let currentUser = "";
let isNewUser = false;
let currentMode = "+"; 
let gameState = {
    lives: 3, gems: 0, streak: 0, maxLevelReached: 1, 
    history: {}, inventory: ['green'], equippedColor: 'green', animalIcon: 'fa-dog'
};

async function saveProgress() {
    if(!currentUser) return;
    try {
        await db.collection("users").doc(currentUser).set({
            username: currentDisplayName || currentUser,
            email: currentEmail || "",
            gameState: gameState,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Mantém backup local para jogar offline (PWA)
        localStorage.setItem(`tabuada_user_${currentUser}`, JSON.stringify(gameState));
    } catch (e) {
        console.error("Erro ao salvar na nuvem, salvando localmente", e);
        localStorage.setItem(`tabuada_user_${currentUser}`, JSON.stringify(gameState));
    }
}

async function loadProgress(username) {
    const today = new Date().toDateString();
    let dataLoaded = false;
    
    try {
        const docRef = await db.collection("users").doc(username).get();
        if (docRef.exists) {
            gameState = docRef.data().gameState;
            dataLoaded = true;
        }
    } catch(e) {
        console.warn("Erro ao buscar na nuvem, tentando modo offline...");
    }

    // Fallback Offline
    if (!dataLoaded) {
        const localData = localStorage.getItem(`tabuada_user_${username}`);
        if (localData) {
            gameState = JSON.parse(localData);
            dataLoaded = true;
        }
    }
    
const defaultAvatar = {
    skin: 'skin-1',
    hair: 'hair-short',
    clothing: 'shirt-basic',
    accessory: 'acc-none'
};

const defaultInventory = [
    'skin-1', 'skin-2', 'skin-3',
    'hair-short', 'hair-curly',
    'shirt-basic',
    'acc-none'
];

    if (dataLoaded) {
        if (gameState.lastPlayedDate !== today) {
            gameState.lives = 3;
            gameState.lastPlayedDate = today;
        }
        if (!gameState.history) gameState.history = {};
        if (!gameState.avatar) gameState.avatar = {...defaultAvatar};
        if (!gameState.inventory || !Array.isArray(gameState.inventory) || gameState.inventory.includes('green')) {
            gameState.inventory = [...defaultInventory];
        }
        if (!gameState.lastPlayedDate) gameState.lastPlayedDate = today;
        
        isNewUser = false;
    } else {
        // Novo usuário
        isNewUser = true;
        gameState = {
            lives: 3, gems: 0, streak: 0, maxLevelReached: 1,
            history: {}, inventory: [...defaultInventory], avatar: {...defaultAvatar},
            lastPlayedDate: today
        };
        saveProgress();
    }
    applyAvatarSettings();
}

function generateAvatarSVG(avatar = {}, size = 100) {
    const skinMap = {
        'skin-1': '#fcd34d',
        'skin-2': '#f59e0b',
        'skin-3': '#854d0e',
        'skin-4': '#38bdf8',
        'skin-5': '#4ade80'
    };
    
    const skinColor = skinMap[avatar.skin] || skinMap['skin-1'];
    const hair = avatar.hair || 'hair-short';
    const clothing = avatar.clothing || 'shirt-basic';
    const accessory = avatar.accessory || 'acc-none';

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    
    svg += `
        <defs>
            <linearGradient id="gradFire" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="100%" stop-color="#facc15" />
            </linearGradient>
            <linearGradient id="gradKnight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#cbd5e1" />
                <stop offset="100%" stop-color="#475569" />
            </linearGradient>
        </defs>
    `;

    // 1. NECK & SHIRT
    svg += `<rect x="43" y="62" width="14" height="12" fill="${skinColor}" rx="3" />`;

    if (clothing === 'shirt-basic') {
        svg += `<path d="M 24 82 Q 50 72 76 82 L 80 100 L 20 100 Z" fill="#ef4444" />`;
        svg += `<path d="M 42 75 Q 50 80 58 75" stroke="#ffffff" stroke-width="2" fill="none" />`;
    } else if (clothing === 'shirt-hero') {
        svg += `<path d="M 24 82 Q 50 72 76 82 L 80 100 L 20 100 Z" fill="#2563eb" />`;
        svg += `<polygon points="50,78 52,83 57,83 53,86 55,91 50,88 45,91 47,86 43,83 48,83" fill="#facc15" />`;
    } else if (clothing === 'shirt-wizard') {
        svg += `<path d="M 22 80 Q 50 70 78 80 L 82 100 L 18 100 Z" fill="#7c3aed" />`;
        svg += `<circle cx="35" cy="88" r="1.5" fill="#facc15" /><circle cx="65" cy="86" r="2" fill="#facc15" /><circle cx="50" cy="92" r="1.5" fill="#ffffff" />`;
    } else if (clothing === 'shirt-school') {
        svg += `<path d="M 24 82 Q 50 72 76 82 L 80 100 L 20 100 Z" fill="#059669" />`;
        svg += `<polygon points="47,75 53,75 51,92 49,92" fill="#ef4444" />`;
    } else if (clothing === 'shirt-knight') {
        svg += `<path d="M 22 80 Q 50 70 78 80 L 82 100 L 18 100 Z" fill="url(#gradKnight)" />`;
        svg += `<path d="M 50 74 L 50 96" stroke="#1e293b" stroke-width="2" />`;
        svg += `<circle cx="50" cy="85" r="4" fill="#ef4444" />`;
    }

    // 2. HEAD BASE & EARS
    svg += `<circle cx="50" cy="45" r="24" fill="${skinColor}" />`;
    svg += `<circle cx="25" cy="45" r="4.5" fill="${skinColor}" />`;
    svg += `<circle cx="75" cy="45" r="4.5" fill="${skinColor}" />`;

    // 3. FACE EXPRESSION
    svg += `<ellipse cx="40" cy="43" rx="3.5" ry="4.5" fill="#1e293b" />`;
    svg += `<ellipse cx="60" cy="43" rx="3.5" ry="4.5" fill="#1e293b" />`;
    svg += `<circle cx="41.5" cy="41.5" r="1.3" fill="#ffffff" />`;
    svg += `<circle cx="61.5" cy="41.5" r="1.3" fill="#ffffff" />`;
    svg += `<ellipse cx="33" cy="48" rx="3.5" ry="2" fill="#f472b6" opacity="0.65" />`;
    svg += `<ellipse cx="67" cy="48" rx="3.5" ry="2" fill="#f472b6" opacity="0.65" />`;
    svg += `<path d="M 43 50 Q 50 56 57 50" stroke="#1e293b" stroke-width="2.2" fill="none" stroke-linecap="round" />`;

    // 4. HAIR LAYER
    if (hair === 'hair-short') {
        svg += `<path d="M 25 43 Q 24 21 50 21 Q 76 21 75 43 Q 66 31 50 33 Q 34 31 25 43 Z" fill="#334155" />`;
    } else if (hair === 'hair-curly') {
        svg += `
            <circle cx="32" cy="27" r="9" fill="#1e293b" />
            <circle cx="44" cy="22" r="10" fill="#1e293b" />
            <circle cx="56" cy="22" r="10" fill="#1e293b" />
            <circle cx="68" cy="27" r="9" fill="#1e293b" />
            <circle cx="26" cy="36" r="8" fill="#1e293b" />
            <circle cx="74" cy="36" r="8" fill="#1e293b" />
        `;
    } else if (hair === 'hair-long') {
        svg += `
            <path d="M 23 45 Q 23 18 50 18 Q 77 18 77 45 L 79 65 Q 73 65 74 45 Q 65 28 50 30 Q 35 28 26 45 Q 27 65 21 65 Z" fill="#ca8a04" />
        `;
    } else if (hair === 'hair-spiky-fire') {
        svg += `
            <path d="M 25 40 Q 20 25 35 20 Q 30 10 48 5 Q 52 15 62 10 Q 70 20 75 40 Q 64 30 50 32 Q 36 30 25 40 Z" fill="url(#gradFire)" />
        `;
    }

    // 5. ACCESSORY LAYER
    if (accessory === 'acc-glasses') {
        svg += `
            <rect x="31" y="37" width="16" height="12" rx="3" fill="rgba(56,189,248,0.25)" stroke="#1e293b" stroke-width="2.5" />
            <rect x="53" y="37" width="16" height="12" rx="3" fill="rgba(56,189,248,0.25)" stroke="#1e293b" stroke-width="2.5" />
            <line x1="47" y1="42" x2="53" y2="42" stroke="#1e293b" stroke-width="2.5" />
            <line x1="25" y1="42" x2="31" y2="42" stroke="#1e293b" stroke-width="2" />
            <line x1="69" y1="42" x2="75" y2="42" stroke="#1e293b" stroke-width="2" />
        `;
    } else if (accessory === 'acc-sunglasses') {
        svg += `
            <path d="M 30 37 L 47 37 L 45 49 L 32 49 Z" fill="#0f172a" />
            <path d="M 53 37 L 70 37 L 68 49 L 55 49 Z" fill="#0f172a" />
            <line x1="47" y1="40" x2="53" y2="40" stroke="#0f172a" stroke-width="3" />
            <line x1="24" y1="40" x2="30" y2="40" stroke="#0f172a" stroke-width="2.5" />
            <line x1="70" y1="40" x2="76" y2="40" stroke="#0f172a" stroke-width="2.5" />
        `;
    } else if (accessory === 'acc-crown') {
        svg += `
            <polygon points="30,24 35,10 42,18 50,6 58,18 65,10 70,24" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
            <rect x="30" y="24" width="40" height="5" fill="#eab308" />
            <circle cx="50" cy="12" r="2" fill="#ef4444" />
            <circle cx="35" cy="15" r="1.5" fill="#3b82f6" />
            <circle cx="65" cy="15" r="1.5" fill="#10b981" />
        `;
    } else if (accessory === 'acc-wizard-hat') {
        svg += `
            <path d="M 18 26 Q 50 20 82 26 Q 50 24 18 26 Z" fill="#4338ca" />
            <path d="M 30 24 Q 50 -10 68 5 Q 60 16 70 24 Z" fill="#6366f1" />
            <rect x="33" y="21" width="34" height="4" fill="#facc15" />
            <polygon points="50,18 52,22 56,22 53,24 54,28 50,25 46,28 47,24 44,22 48,22" fill="#ffffff" />
        `;
    } else if (accessory === 'acc-headphones') {
        svg += `
            <path d="M 24 45 A 27 27 0 0 1 76 45" fill="none" stroke="#ec4899" stroke-width="4.5" stroke-linecap="round" />
            <rect x="20" y="38" width="8" height="15" rx="3" fill="#38bdf8" />
            <rect x="72" y="38" width="8" height="15" rx="3" fill="#38bdf8" />
        `;
    } else if (accessory === 'acc-bow') {
        svg += `
            <polygon points="62,22 74,16 70,26" fill="#f472b6" />
            <polygon points="62,22 74,28 70,18" fill="#f472b6" />
            <circle cx="62" cy="22" r="3" fill="#fb7185" />
        `;
    }

    svg += `</svg>`;
    return svg;
}

function applyAvatarSettings() {
    if (!gameState.avatar) gameState.avatar = {...defaultAvatar};
    
    const headerAvatar = document.getElementById('header-avatar');
    if (headerAvatar) {
        headerAvatar.style.backgroundColor = 'transparent';
        headerAvatar.innerHTML = generateAvatarSVG(gameState.avatar, 40);
    }
    
    const bigAvContainer = document.getElementById('big-avatar-container');
    if (bigAvContainer) {
        bigAvContainer.innerHTML = generateAvatarSVG(gameState.avatar, 130);
    }
}

// Configuração das Fases (Normal -> Boss sempre cumulativo)
const levels = [];
const opsInfo = [
    { op: '+', name: 'Adição', boss: 'Rei da Adição', icon: 'fa-robot' },
    { op: '-', name: 'Subtração', boss: 'Ladrão Fantasma', icon: 'fa-ghost' },
    { op: '*', name: 'Multiplicação', boss: 'Dragão Multiplicador', icon: 'fa-dragon' },
    { op: '/', name: 'Divisão', boss: 'Aranha Fracionadora', icon: 'fa-spider' }
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
                icon: info.icon,
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
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Destrava áudio em dispositivos móveis no primeiro toque
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

const sfx = {
    play: (freq, type, dur, vol=0.3) => {
        try {
            const ctx = initAudio();
            if (ctx.state === 'suspended') ctx.resume();
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type; 
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            
            osc.connect(gain); 
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime); 
            osc.stop(ctx.currentTime + dur);
        } catch(e) {
            console.warn("Audio play failed:", e);
        }
    },
    correct: () => { sfx.play(440, 'sine', 0.1, 0.4); setTimeout(() => sfx.play(659, 'sine', 0.2, 0.4), 100); },
    wrong: () => { sfx.play(250, 'sawtooth', 0.2, 0.4); setTimeout(() => sfx.play(200, 'sawtooth', 0.3, 0.4), 150); },
    bossHit: () => { sfx.play(150, 'square', 0.1, 0.5); setTimeout(() => sfx.play(100, 'square', 0.2, 0.5), 50); },
    bossHeal: () => { sfx.play(400, 'sine', 0.2, 0.4); setTimeout(() => sfx.play(600, 'sine', 0.3, 0.4), 100); },
    win: () => { [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => sfx.play(f, 'square', 0.2, 0.4), i*150)); },
    click: () => { sfx.play(600, 'sine', 0.05, 0.1); }
};

// ==========================================
// NAVEGAÇÃO E UI GERAL
// ==========================================
function updateGlobalUI() {
    globalLivesEl.textContent = gameState.lives;
    globalGemsEl.textContent = gameState.gems;
    globalStreakEl.textContent = gameState.streak;
    headerPhaseNum.textContent = gameState.maxLevelReached;
    displayUsername.textContent = (currentDisplayName || currentUser).split(" ")[0];
    
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
// LOGIN E NAVEGAÇÃO INICIAL
// ==========================================
const btnGoogleLogin = document.getElementById('btn-google-login');
const loginLoadingMsg = document.getElementById('login-loading-msg');

btnGoogleLogin.addEventListener('click', async () => {
    sfx.click();
    const provider = new firebase.auth.GoogleAuthProvider();
    btnGoogleLogin.disabled = true;
    loginLoadingMsg.classList.remove('hidden');
    
    try {
        await auth.signInWithPopup(provider);
        // O restante será tratado pelo onAuthStateChanged abaixo
    } catch(error) {
        console.error("Erro no login com Google:", error);
        alert("Ocorreu um erro ao fazer login. Tente novamente.");
        btnGoogleLogin.disabled = false;
        loginLoadingMsg.classList.add('hidden');
    }
});

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Usuário logado!
        btnGoogleLogin.disabled = true;
        loginLoadingMsg.classList.remove('hidden');
        loginLoadingMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Bem-vindo, ${user.displayName.split(' ')[0]}! Carregando...`;

        currentUser = user.uid;
        currentDisplayName = user.displayName;
        currentEmail = user.email;

        // Atualiza o display name da tela global
        displayUsername.textContent = currentDisplayName.split(' ')[0];

        await loadProgress(currentUser);
        updateGlobalUI();
        
        if (isNewUser) {
            showScreen(screenAnimalSelect, false);
        } else {
            showScreen(screenOperationSelect, true);
        }
    } else {
        // Usuário deslogado
        btnGoogleLogin.disabled = false;
        loginLoadingMsg.classList.add('hidden');
        showScreen(document.getElementById('screen-login'), false);
    }
});

// Seleção do Estilo do Herói (Primeiro Acesso)
const heroStyleOptions = document.querySelectorAll('.hero-style-option');
heroStyleOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        sfx.click();
        heroStyleOptions.forEach(o => {
            o.classList.remove('selected');
            o.style.borderColor = 'transparent';
        });
        opt.classList.add('selected');
        opt.style.borderColor = 'white';
    });
});

document.getElementById('btn-confirm-animal').addEventListener('click', () => {
    const selected = document.querySelector('.hero-style-option.selected') || heroStyleOptions[0];
    if (selected) {
        sfx.click();
        const style = selected.dataset.hero;
        if (style === 'boy') {
            gameState.avatar = { skin: 'skin-1', hair: 'hair-short', clothing: 'shirt-basic', accessory: 'acc-none' };
        } else if (style === 'girl') {
            gameState.avatar = { skin: 'skin-1', hair: 'hair-long', clothing: 'shirt-basic', accessory: 'acc-bow' };
        } else if (style === 'hero') {
            gameState.avatar = { skin: 'skin-2', hair: 'hair-spiky-fire', clothing: 'shirt-hero', accessory: 'acc-none' };
        } else if (style === 'wizard') {
            gameState.avatar = { skin: 'skin-1', hair: 'hair-curly', clothing: 'shirt-wizard', accessory: 'acc-wizard-hat' };
        }
        
        saveProgress();
        applyAvatarSettings();
        startAssessment();
    }
});

// Seleção de Operação (Lobby)
document.querySelectorAll('.op-card').forEach(card => {
    card.addEventListener('click', () => {
        sfx.click();
        currentMode = card.dataset.op;
        renderMap();
        showScreen(screenMap, true);
    });
});

document.getElementById('btn-back-hub').addEventListener('click', () => {
    sfx.click();
    showScreen(screenOperationSelect, true);
});

// ==========================================
// MODO ESTUDO (TABUADA LIVRE)
// ==========================================
let currentStudyOp = '*';

document.querySelectorAll('.study-op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sfx.click();
        document.querySelectorAll('.study-op-btn').forEach(b => {
            b.style.border = 'none';
            b.style.transform = 'scale(1)';
            b.classList.remove('selected');
        });
        btn.style.border = '3px solid white';
        btn.style.transform = 'scale(1.1)';
        btn.classList.add('selected');
        currentStudyOp = btn.dataset.op;
    });
});

document.getElementById('btn-open-study').addEventListener('click', () => {
    sfx.click();
    
    // Gerar grid 1 a 10
    const studyGrid = document.getElementById('study-select-grid');
    studyGrid.innerHTML = '';
    for(let i = 1; i <= 10; i++) {
        const btn = document.createElement('div');
        btn.classList.add('study-number-btn');
        btn.textContent = i;
        btn.addEventListener('click', () => {
            sfx.click();
            openStudyView(i);
        });
        studyGrid.appendChild(btn);
    }
    
    showScreen(screenStudySelect, true);
});

document.getElementById('btn-back-study-hub').addEventListener('click', () => {
    sfx.click();
    showScreen(screenOperationSelect, true);
});

document.getElementById('btn-back-study-select').addEventListener('click', () => {
    sfx.click();
    showScreen(screenStudySelect, true);
});

function openStudyView(num) {
    const opNames = {'+': 'Adição', '-': 'Subtração', '*': 'Multiplicação', '/': 'Divisão'};
    document.getElementById('study-title').textContent = `${opNames[currentStudyOp]} do ${num}`;
    
    const listContainer = document.getElementById('study-list-container');
    listContainer.innerHTML = '';
    
    for(let i = 1; i <= 10; i++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.padding = '5px 0';
        row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
        
        let n1, n2, res, sym;
        if (currentStudyOp === '+') {
            n1 = num; n2 = i; sym = '+'; res = num + i;
        } else if (currentStudyOp === '-') {
            n1 = num + i; n2 = num; sym = '-'; res = i;
        } else if (currentStudyOp === '*') {
            n1 = num; n2 = i; sym = '×'; res = num * i;
        } else if (currentStudyOp === '/') {
            n1 = num * i; n2 = num; sym = '÷'; res = i;
        }
        
        row.innerHTML = `
            <span style="color:var(--text-light);">${n1} <span style="color:var(--primary); margin:0 5px;">${sym}</span> ${n2}</span>
            <span style="color:var(--text-light);"><span style="color:var(--primary); margin:0 5px;">=</span> ${res}</span>
        `;
        listContainer.appendChild(row);
    }
    
    showScreen(screenStudyView, true);
}

// ==========================================
// MODO SELEÇÃO DE TREINO (CUSTOMIZADO)
// ==========================================
const screenCustomSelect = document.getElementById('screen-custom-select');
let customSelectedOps = [];
let customSelectedNums = [];

const btnOpenCustomPractice = document.getElementById('btn-open-custom-practice');
if (btnOpenCustomPractice) {
    btnOpenCustomPractice.addEventListener('click', () => {
        sfx.click();
        initCustomSelectScreen();
        showScreen(screenCustomSelect, true);
    });
}

const btnBackCustomHub = document.getElementById('btn-back-custom-hub');
if (btnBackCustomHub) {
    btnBackCustomHub.addEventListener('click', () => {
        sfx.click();
        showScreen(screenOperationSelect, true);
    });
}

function initCustomSelectScreen() {
    // Operações
    document.querySelectorAll('.custom-op-btn').forEach(btn => {
        const op = btn.dataset.op;
        if (customSelectedOps.includes(op)) {
            btn.classList.add('active');
            btn.style.opacity = '1';
            btn.style.border = '3px solid white';
            btn.style.transform = 'scale(1)';
        } else {
            btn.classList.remove('active');
            btn.style.opacity = '0.35';
            btn.style.border = '3px solid transparent';
            btn.style.transform = 'scale(0.95)';
        }
    });

    // Números Grid
    const numsGrid = document.getElementById('custom-nums-grid');
    if (numsGrid) {
        numsGrid.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.classList.add('study-number-btn');
            btn.textContent = i;
            btn.dataset.num = i;
            
            if (customSelectedNums.includes(i)) {
                btn.classList.add('active');
                btn.style.opacity = '1';
                btn.style.border = '3px solid white';
                btn.style.background = 'var(--purple)';
            } else {
                btn.classList.remove('active');
                btn.style.opacity = '0.35';
                btn.style.border = '3px solid transparent';
                btn.style.background = 'var(--gray-dark)';
            }

            btn.addEventListener('click', () => {
                sfx.click();
                const num = parseInt(btn.dataset.num);
                if (customSelectedNums.includes(num)) {
                    customSelectedNums = customSelectedNums.filter(n => n !== num);
                    btn.classList.remove('active');
                    btn.style.opacity = '0.35';
                    btn.style.border = '3px solid transparent';
                    btn.style.background = 'var(--gray-dark)';
                } else {
                    customSelectedNums.push(num);
                    btn.classList.add('active');
                    btn.style.opacity = '1';
                    btn.style.border = '3px solid white';
                    btn.style.background = 'var(--purple)';
                }
                updateToggleAllBtn();
            });

            numsGrid.appendChild(btn);
        }
    }
    updateToggleAllBtn();
}

// Toggle operacoes
document.querySelectorAll('.custom-op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sfx.click();
        const op = btn.dataset.op;
        if (customSelectedOps.includes(op)) {
            customSelectedOps = customSelectedOps.filter(o => o !== op);
            btn.classList.remove('active');
            btn.style.opacity = '0.35';
            btn.style.border = '3px solid transparent';
            btn.style.transform = 'scale(0.95)';
        } else {
            customSelectedOps.push(op);
            btn.classList.add('active');
            btn.style.opacity = '1';
            btn.style.border = '3px solid white';
            btn.style.transform = 'scale(1)';
        }
    });
});

const toggleAllBtn = document.getElementById('btn-toggle-all-nums');
if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
        sfx.click();
        if (customSelectedNums.length === 10) {
            customSelectedNums = [];
        } else {
            customSelectedNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }
        initCustomSelectScreen();
    });
}

function updateToggleAllBtn() {
    if (toggleAllBtn) {
        if (customSelectedNums.length === 10) {
            toggleAllBtn.textContent = "Desmarcar Todos";
        } else {
            toggleAllBtn.textContent = "Selecionar Todos";
        }
    }
}

const btnStartCustomGame = document.getElementById('btn-start-custom-game');
if (btnStartCustomGame) {
    btnStartCustomGame.addEventListener('click', () => {
        if (customSelectedOps.length === 0 || customSelectedNums.length === 0) {
            sfx.wrong();
            alert("Selecione pelo menos 1 operação e 1 número para começar o treino!");
            return;
        }
        sfx.click();
        
        const customLevelData = {
            type: 'normal',
            op: 'custom',
            isCustom: true,
            targetScore: 10,
            title: 'Seleção de Treino',
            desc: 'Treino Personalizado'
        };
        startLevel(customLevelData);
    });
}

// ==========================================
// MAPA
// ==========================================
function renderMap() {
    mapNodesContainer.innerHTML = '';
    
    // Filtra as fases com base na operação escolhida, ou gera um mapa misto na hora
    let displayLevels = [];
    if (currentMode === 'mixed') {
        // Pega as 20 primeiras fases como molde, mas transforma elas em mixed
        displayLevels = levels.slice(0, 20).map(l => ({...l, op: 'mixed', title: l.type==='boss'? 'Chefão Misto' : `Misto Fase ${l.id}`}));
    } else {
        displayLevels = levels.filter(l => l.op === currentMode);
    }
    
    displayLevels.forEach((level, index) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('node-wrapper');
        const node = document.createElement('div');
        node.classList.add('map-node');
        const label = document.createElement('div');
        label.classList.add('node-label');
        
        // Fase visual é apenas o indice (1 a 20)
        const visualPhaseId = index + 1;
        label.textContent = `Fase ${visualPhaseId}`;
        
        // Para progresso, como temos um maxLevelReached universal por enquanto, vamos usar o index
        // O ideal no futuro seria salvar progresso por modo, mas por enquanto:
        const isUnlocked = visualPhaseId <= gameState.maxLevelReached;
        const isActive = visualPhaseId === gameState.maxLevelReached;

        if (level.type === 'boss') {
            node.classList.add('boss');
            if (isUnlocked) {
                node.innerHTML = '<i class="fa-solid fa-skull"></i>';
                node.style.backgroundColor = 'var(--purple)';
                node.style.color = 'white';
                node.style.borderColor = 'white';
            } else {
                node.innerHTML = '<i class="fa-solid fa-skull"></i>';
            }
        } else {
            if (visualPhaseId < gameState.maxLevelReached) {
                node.classList.add('completed');
                node.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if (isActive) {
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
            if (isUnlocked) {
                // Passa visualPhaseId para poder salvar o progresso corretamente
                startLevel({...level, visualPhaseId});
            }
        });

        wrapper.appendChild(node);
        wrapper.appendChild(label);
        mapNodesContainer.appendChild(wrapper);
    });

    setTimeout(() => {
        const activeNode = document.querySelector('.map-node.active');
        if (activeNode) activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

let lastQuestionStr = "";

function generateNormalQuestion() {
    let n1, n2, op;
    let newStr = "";
    
    do {
        if (activeLevelData.op === 'custom' || activeLevelData.isCustom) {
            const validOps = customSelectedOps.length > 0 ? customSelectedOps : ['*'];
            const validNums = customSelectedNums.length > 0 ? customSelectedNums : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            op = validOps[getRandomInt(0, validOps.length - 1)];
            const chosenNum = validNums[getRandomInt(0, validNums.length - 1)];
            
            if (op === '+') {
                n1 = chosenNum;
                n2 = getRandomInt(1, 10);
                if (Math.random() > 0.5) [n1, n2] = [n2, n1];
            } else if (op === '-') {
                n2 = chosenNum;
                let res = getRandomInt(1, 10);
                n1 = n2 + res;
            } else if (op === '*') {
                n1 = chosenNum;
                n2 = getRandomInt(1, 10);
                if (Math.random() > 0.5) [n1, n2] = [n2, n1];
            } else if (op === '/') {
                n2 = chosenNum;
                let res = getRandomInt(1, 10);
                n1 = n2 * res;
            }
        } else {
            op = activeLevelData.op === 'mixed' ? ['+', '-', '*', '/'][getRandomInt(0, 3)] : (activeLevelData.op || '*');
            
            // Repetição Espaçada: 30% de chance de forçar uma conta que o aluno mais errou
            const mistakes = Object.entries(gameState.history || {}).filter(([k, v]) => v.wrong > v.correct && k.includes(op));
            
            if (mistakes.length > 0 && Math.random() < 0.3) {
                const randomMistake = mistakes[Math.floor(Math.random() * mistakes.length)][0];
                const parts = randomMistake.split(op);
                n1 = parseInt(parts[0]);
                n2 = parseInt(parts[1]);
            } else {
                if (op === '/') {
                    n2 = activeLevelData.table;
                    let res = getRandomInt(2, 9);
                    n1 = n2 * res;
                } else if (op === '-') {
                    n2 = activeLevelData.table;
                    n1 = getRandomInt(n2, n2 + 9);
                } else {
                    n1 = activeLevelData.table;
                    n2 = getRandomInt(2, 9);
                    if (Math.random() > 0.5) [n1, n2] = [n2, n1];
                }
            }
        }
        newStr = `${n1}${op}${n2}`;
    } while (newStr === lastQuestionStr);
    
    lastQuestionStr = newStr;
    document.getElementById('op-display').textContent = getOperatorSymbol(op);
    currentExpectedAnswer = calculateExpected(n1, n2, op);
    
    // Save current operation so submit function knows
    activeLevelData.currentOp = op; 
    
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
    const op = activeLevelData.currentOp || '*';
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
    
    document.getElementById('boss-name').textContent = activeLevelData.title;
    
    const bIcon = document.getElementById('boss-icon');
    if (bIcon) {
        const bossIconClass = activeLevelData.icon || 'fa-ghost';
        bIcon.className = `fa-solid ${bossIconClass}`;
        
        if (bossIconClass === 'fa-robot') bIcon.style.color = 'var(--success)';
        else if (bossIconClass === 'fa-ghost') bIcon.style.color = 'var(--purple)';
        else if (bossIconClass === 'fa-dragon') bIcon.style.color = 'var(--danger)';
        else bIcon.style.color = 'var(--orange)';
    }

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
    let n1, n2, op;
    let newStr = "";
    
    do {
        op = activeLevelData.op === 'mixed' ? ['+', '-', '*', '/'][getRandomInt(0, 3)] : (activeLevelData.op || '*');
        const mistakes = Object.entries(gameState.history || {}).filter(([k, v]) => v.wrong > v.correct && k.includes(op));
        
        if (mistakes.length > 0 && Math.random() < 0.4) {
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
        newStr = `${n1}${op}${n2}`;
    } while (newStr === lastQuestionStr);
    
    lastQuestionStr = newStr;
    document.getElementById('b-op-display').textContent = getOperatorSymbol(op);
    currentExpectedAnswer = calculateExpected(n1, n2, op);
    
    activeLevelData.currentOp = op;

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

    const op = activeLevelData.currentOp || '*';
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
    const isCustom = activeLevelData && activeLevelData.isCustom;
    const gemsReward = (activeLevelData.type === 'boss') ? 10 : (isCustom ? 10 : 5);
    
    if (activeLevelData.type === 'boss') {
        document.getElementById('win-title-text').textContent = 'Chefão Derrotado!';
    } else if (isCustom) {
        document.getElementById('win-title-text').textContent = 'Treino Concluído!';
    } else {
        document.getElementById('win-title-text').textContent = 'Fase Concluída!';
    }

    document.getElementById('win-correct').textContent = currentPhaseTarget;
    document.getElementById('win-total').textContent = currentPhaseTarget;
    document.getElementById('win-gems').textContent = gemsReward;
    
    gameState.gems += gemsReward;
    
    if (!isCustom && activeLevelData.visualPhaseId === gameState.maxLevelReached) {
        gameState.maxLevelReached++;
        gameState.streak++; // Ganha ofensiva
    }
    
    const winAv = document.getElementById('win-avatar-container');
    if (winAv) {
        winAv.innerHTML = generateAvatarSVG(gameState.avatar, 100);
    }

    saveProgress();
    updateGlobalUI();
    showScreen(screenWin, false);
}

btnBackMapWin.addEventListener('click', () => { 
    sfx.click();
    if (activeLevelData && activeLevelData.isCustom) {
        showScreen(screenCustomSelect, true);
    } else {
        renderMap(); 
        showScreen(screenMap, true);
    }
});

btnBackMapLose.addEventListener('click', () => { 
    sfx.click();
    if (activeLevelData && activeLevelData.isCustom) {
        showScreen(screenCustomSelect, true);
    } else if (gameState.lives <= 0) {
        showScreen(screenOperationSelect, true); 
    } else {
        renderMap(); 
        showScreen(screenMap, true);
    }
});

document.getElementById('btn-buy-lives').addEventListener('click', () => {
    if (gameState.gems >= 20) {
        sfx.correct();
        gameState.gems -= 20;
        gameState.lives = 3;
        saveProgress();
        updateGlobalUI();
        alert("Vidas restauradas com sucesso!");
        showScreen(screenOperationSelect, true);
    } else {
        sfx.wrong();
        alert("Gemas insuficientes! Você precisa de 20 gemas.");
    }
});

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
    gameState.maxLevelReached = 1;
    if (assessmentCorrectCount >= 5) gameState.maxLevelReached = 7;
    else if (assessmentCorrectCount >= 4) gameState.maxLevelReached = 5;
    else if (assessmentCorrectCount >= 3) gameState.maxLevelReached = 3;
    
    gameState.gems += (assessmentCorrectCount * 10);
    saveProgress();
    updateGlobalUI();
    isNewUser = false;
    
    alert(`Teste concluído! Você acertou ${assessmentCorrectCount} de 5.`);
    showScreen(screenOperationSelect, true);
}

// ==========================================
// LOJA / CUSTOMIZAÇÃO DO BONECO
// ==========================================
const screenStore = document.getElementById('screen-store');
const btnStore = document.getElementById('btn-store');
const closeStore = document.getElementById('close-store');
const storeItemsContainer = document.getElementById('store-items-container');

const avatarStoreCatalog = [
    // PELES
    { id: 'skin-1', cat: 'skin', name: 'Tom Dourado', price: 0, preview: '#fcd34d' },
    { id: 'skin-2', cat: 'skin', name: 'Tom Tan', price: 0, preview: '#f59e0b' },
    { id: 'skin-3', cat: 'skin', name: 'Tom Castanho', price: 0, preview: '#854d0e' },
    { id: 'skin-4', cat: 'skin', name: 'Azul Estelar', price: 30, preview: '#38bdf8' },
    { id: 'skin-5', cat: 'skin', name: 'Verde Alien', price: 30, preview: '#4ade80' },

    // CABELOS
    { id: 'hair-short', cat: 'hair', name: 'Curto Espetado', price: 0, icon: 'fa-scissors' },
    { id: 'hair-curly', cat: 'hair', name: 'Cabelo Cacheado', price: 0, icon: 'fa-user' },
    { id: 'hair-long', cat: 'hair', name: 'Liso com Franja', price: 25, icon: 'fa-wand-magic' },
    { id: 'hair-spiky-fire', cat: 'hair', name: 'Super Flamejante', price: 50, icon: 'fa-fire' },

    // ROUPAS
    { id: 'shirt-basic', cat: 'clothing', name: 'Camiseta Padrão', price: 0, icon: 'fa-shirt' },
    { id: 'shirt-school', cat: 'clothing', name: 'Uniforme Escolar', price: 25, icon: 'fa-graduation-cap' },
    { id: 'shirt-hero', cat: 'clothing', name: 'Traje de Herói', price: 40, icon: 'fa-shield-halved' },
    { id: 'shirt-wizard', cat: 'clothing', name: 'Manto de Mago', price: 60, icon: 'fa-wand-sparkles' },
    { id: 'shirt-knight', cat: 'clothing', name: 'Armadura Real', price: 80, icon: 'fa-chess-knight' },

    // ACESSÓRIOS
    { id: 'acc-none', cat: 'accessory', name: 'Sem Acessório', price: 0, icon: 'fa-xmark' },
    { id: 'acc-glasses', cat: 'accessory', name: 'Óculos Nerd', price: 20, icon: 'fa-glasses' },
    { id: 'acc-sunglasses', cat: 'accessory', name: 'Óculos de Sol', price: 35, icon: 'fa-glasses' },
    { id: 'acc-headphones', cat: 'accessory', name: 'Fone Gamer', price: 45, icon: 'fa-headphones' },
    { id: 'acc-wizard-hat', cat: 'accessory', name: 'Chapéu de Mago', price: 60, icon: 'fa-hat-wizard' },
    { id: 'acc-crown', cat: 'accessory', name: 'Coroa de Ouro', price: 100, icon: 'fa-crown' }
];

let activeStoreTab = 'skin';

document.querySelectorAll('.store-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sfx.click();
        document.querySelectorAll('.store-tab-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'var(--gray-dark)';
            b.style.color = 'white';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = 'var(--bg-dark)';
        activeStoreTab = btn.dataset.tab;
        renderStore();
    });
});

btnStore.addEventListener('click', () => {
    sfx.click();
    renderStore();
    applyAvatarSettings();
    showScreen(screenStore);
});

closeStore.addEventListener('click', () => {
    sfx.click();
    renderMap();
    showScreen(screenMap, true);
});

function renderStore() {
    storeItemsContainer.innerHTML = '';
    applyAvatarSettings();

    const filteredItems = avatarStoreCatalog.filter(i => i.cat === activeStoreTab);

    filteredItems.forEach(item => {
        const isOwned = gameState.inventory.includes(item.id);
        const isEquipped = gameState.avatar && gameState.avatar[item.cat] === item.id;
        
        const div = document.createElement('div');
        div.className = `store-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;
        div.style.background = 'var(--bg-card)';
        div.style.padding = '14px 10px';
        div.style.borderRadius = '16px';
        div.style.textAlign = 'center';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.minHeight = '105px';
        div.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)';
        div.style.border = isEquipped ? '3px solid white' : (isOwned ? '3px solid rgba(255,255,255,0.3)' : '3px solid transparent');
        div.style.opacity = (isOwned || isEquipped) ? '1' : '0.9';

        let iconOrPreview = '';
        if (item.preview) {
            iconOrPreview = `<div style="width:28px; height:28px; border-radius:50%; background:${item.preview}; margin:0 auto 4px auto; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`;
        } else {
            iconOrPreview = `<i class="fa-solid ${item.icon || 'fa-star'}" style="font-size:1.6rem; margin-bottom:4px; display:block; color:white;"></i>`;
        }

        let actionHtml = '';
        if (isEquipped) actionHtml = `<p class="item-price" style="color:white; font-weight:900; font-size:0.8rem; margin-top:4px;"><i class="fa-solid fa-circle-check"></i> Equipado</p>`;
        else if (isOwned) actionHtml = `<p class="item-price" style="color:rgba(255,255,255,0.8); font-weight:800; font-size:0.8rem; margin-top:4px;">No Armário</p>`;
        else actionHtml = `<p class="item-price" style="color:var(--primary); font-weight:900; font-size:0.9rem; margin-top:4px;"><i class="fa-solid fa-gem"></i> ${item.price}</p>`;
        
        div.innerHTML = `
            ${iconOrPreview}
            <h4 style="font-size:0.9rem; font-weight:900; color:white; line-height:1.2;">${item.name}</h4>
            ${actionHtml}
        `;
        
        div.addEventListener('click', () => {
            if (isEquipped) return;
            if (isOwned) {
                sfx.click();
                gameState.avatar[item.cat] = item.id;
                saveProgress();
                applyAvatarSettings();
                renderStore();
            } else if (gameState.gems >= item.price) {
                sfx.win();
                gameState.gems -= item.price;
                gameState.inventory.push(item.id);
                gameState.avatar[item.cat] = item.id;
                saveProgress();
                applyAvatarSettings();
                updateGlobalUI();
                renderStore();
                alert(`Parabéns! Você adquiriu: ${item.name}! 🎉`);
            } else {
                sfx.wrong();
                alert(`Gemas insuficientes! Você precisa de ${item.price} gemas para comprar ${item.name}.`);
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

btnBadges.addEventListener('click', () => { sfx.click(); renderBadges(); showScreen(screenBadges, false); });
closeBadges.addEventListener('click', () => { sfx.click(); renderMap(); showScreen(screenMap, true); });

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

// ==========================================
// RANKING DOS HERÓIS (LEADERBOARD)
// ==========================================
const screenLeaderboard = document.getElementById('screen-leaderboard');
const btnLeaderboard = document.getElementById('btn-leaderboard');
const closeLeaderboard = document.getElementById('close-leaderboard');
const leaderboardListContainer = document.getElementById('leaderboard-list-container');

let activeLeaderboardType = 'streak';

if (btnLeaderboard) {
    btnLeaderboard.addEventListener('click', () => {
        sfx.click();
        renderLeaderboard();
        showScreen(screenLeaderboard, false);
    });
}

if (closeLeaderboard) {
    closeLeaderboard.addEventListener('click', () => {
        sfx.click();
        renderMap();
        showScreen(screenMap, true);
    });
}

document.querySelectorAll('.lb-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sfx.click();
        document.querySelectorAll('.lb-tab-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'var(--gray-dark)';
            b.style.color = 'white';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = 'var(--bg-dark)';
        activeLeaderboardType = btn.dataset.type;
        renderLeaderboard();
    });
});

async function renderLeaderboard() {
    leaderboardListContainer.innerHTML = '<p style="text-align:center; color:var(--primary); padding:2rem; font-weight:800;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando Ranking...</p>';
    
    let usersList = [];

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const snapshot = await firebase.firestore().collection("users").get();
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data) {
                    const state = data.gameState || {};
                    usersList.push({
                        name: data.username || 'Aventureiro',
                        avatar: state.avatar || defaultAvatar,
                        streak: state.streak || 0,
                        maxLevel: state.maxLevelReached || 1,
                        gems: state.gems || 0
                    });
                }
            });
        }
    } catch(e) {
        console.warn("Erro ao buscar ranking no Firestore:", e);
    }

    if (usersList.length === 0) {
        usersList.push({
            name: (currentDisplayName || currentUser || 'Você').split(' ')[0],
            avatar: gameState.avatar || defaultAvatar,
            streak: gameState.streak || 0,
            maxLevel: gameState.maxLevelReached || 1,
            gems: gameState.gems || 0
        });
    }

    // Ordenação
    if (activeLeaderboardType === 'streak') {
        usersList.sort((a, b) => b.streak - a.streak);
    } else if (activeLeaderboardType === 'phase') {
        usersList.sort((a, b) => b.maxLevel - a.maxLevel);
    } else if (activeLeaderboardType === 'gems') {
        usersList.sort((a, b) => b.gems - a.gems);
    }

    leaderboardListContainer.innerHTML = '';

    const medals = ['🥇', '🥈', '🥉'];

    usersList.forEach((user, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.background = 'var(--bg-card)';
        div.style.padding = '10px 14px';
        div.style.borderRadius = '16px';
        div.style.border = '2px solid rgba(255,255,255,0.15)';
        div.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';

        const rankIcon = medals[index] || `${index + 1}º`;
        const avatarSvg = generateAvatarSVG(user.avatar, 38);

        let valueDisplay = '';
        if (activeLeaderboardType === 'streak') {
            valueDisplay = `<i class="fa-solid fa-fire text-orange"></i> ${user.streak}d`;
        } else if (activeLeaderboardType === 'phase') {
            valueDisplay = `<i class="fa-solid fa-medal text-secondary"></i> Fase ${user.maxLevel}`;
        } else if (activeLeaderboardType === 'gems') {
            valueDisplay = `<i class="fa-solid fa-gem text-purple"></i> ${user.gems}`;
        }

        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem; font-weight: 900; width: 26px; text-align: center;">${rankIcon}</span>
                <div style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2);">
                    ${avatarSvg}
                </div>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 900; font-size: 0.95rem; color: white;">${user.name}</span>
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.8);">Fase ${user.maxLevel} • ${user.gems} gemas</span>
                </div>
            </div>
            <div style="font-weight: 900; font-size: 1rem; color: var(--primary); display: flex; align-items: center; gap: 4px;">
                ${valueDisplay}
            </div>
        `;

        leaderboardListContainer.appendChild(div);
    });
}

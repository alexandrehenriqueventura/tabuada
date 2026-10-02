const firebaseConfig = {
    apiKey: "AIzaSyBnubQM46SsuZUz2TncL4uyVhi0tVhH0gU",
    authDomain: "tabuada-4b7d9.firebaseapp.com",
    projectId: "tabuada-4b7d9",
    storageBucket: "tabuada-4b7d9.firebasestorage.app",
    messagingSenderId: "185531304834",
    appId: "1:185531304834:web:a2b92e32991f34c49b5d9b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function generateAvatarSVG(avatar = {}, size = 40) {
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
    svg += `<rect x="43" y="62" width="14" height="12" fill="${skinColor}" rx="3" />`;

    if (clothing === 'shirt-basic') {
        svg += `<path d="M 24 82 Q 50 72 76 82 L 80 100 L 20 100 Z" fill="#ef4444" />`;
    } else if (clothing === 'shirt-hero') {
        svg += `<path d="M 24 82 Q 50 72 76 82 L 80 100 L 20 100 Z" fill="#2563eb" />`;
        svg += `<polygon points="50,78 52,83 57,83 53,86 55,91 50,88 45,91 47,86 43,83 48,83" fill="#facc15" />`;
    } else if (clothing === 'shirt-wizard') {
        svg += `<path d="M 22 80 Q 50 70 78 80 L 82 100 L 18 100 Z" fill="#7c3aed" />`;
    } else if (clothing === 'shirt-school') {
        svg += `<path d="M 24 82 Q 50 72 76 82 L 80 100 L 20 100 Z" fill="#059669" />`;
    } else {
        svg += `<path d="M 22 80 Q 50 70 78 80 L 82 100 L 18 100 Z" fill="#64748b" />`;
    }

    svg += `<circle cx="50" cy="45" r="24" fill="${skinColor}" />`;
    svg += `<circle cx="25" cy="45" r="4.5" fill="${skinColor}" />`;
    svg += `<circle cx="75" cy="45" r="4.5" fill="${skinColor}" />`;

    svg += `<ellipse cx="40" cy="43" rx="3.5" ry="4.5" fill="#1e293b" />`;
    svg += `<ellipse cx="60" cy="43" rx="3.5" ry="4.5" fill="#1e293b" />`;
    svg += `<circle cx="41.5" cy="41.5" r="1.3" fill="#ffffff" />`;
    svg += `<circle cx="61.5" cy="41.5" r="1.3" fill="#ffffff" />`;
    svg += `<ellipse cx="33" cy="48" rx="3.5" ry="2" fill="#f472b6" opacity="0.65" />`;
    svg += `<ellipse cx="67" cy="48" rx="3.5" ry="2" fill="#f472b6" opacity="0.65" />`;
    svg += `<path d="M 43 50 Q 50 56 57 50" stroke="#1e293b" stroke-width="2.2" fill="none" stroke-linecap="round" />`;

    if (hair === 'hair-short') {
        svg += `<path d="M 25 43 Q 24 21 50 21 Q 76 21 75 43 Q 66 31 50 33 Q 34 31 25 43 Z" fill="#334155" />`;
    } else if (hair === 'hair-curly') {
        svg += `<circle cx="32" cy="27" r="9" fill="#1e293b" /><circle cx="44" cy="22" r="10" fill="#1e293b" /><circle cx="56" cy="22" r="10" fill="#1e293b" /><circle cx="68" cy="27" r="9" fill="#1e293b" />`;
    } else if (hair === 'hair-long') {
        svg += `<path d="M 23 45 Q 23 18 50 18 Q 77 18 77 45 L 79 65 Q 73 65 74 45 Q 65 28 50 30 Q 35 28 26 45 Q 27 65 21 65 Z" fill="#ca8a04" />`;
    } else if (hair === 'hair-spiky-fire') {
        svg += `<path d="M 25 40 Q 20 25 35 20 Q 30 10 48 5 Q 52 15 62 10 Q 70 20 75 40 Q 64 30 50 32 Q 36 30 25 40 Z" fill="#ef4444" />`;
    }

    if (accessory === 'acc-glasses') {
        svg += `<rect x="31" y="37" width="16" height="12" rx="3" fill="rgba(56,189,248,0.25)" stroke="#1e293b" stroke-width="2.5" /><rect x="53" y="37" width="16" height="12" rx="3" fill="rgba(56,189,248,0.25)" stroke="#1e293b" stroke-width="2.5" />`;
    } else if (accessory === 'acc-sunglasses') {
        svg += `<path d="M 30 37 L 47 37 L 45 49 L 32 49 Z" fill="#0f172a" /><path d="M 53 37 L 70 37 L 68 49 L 55 49 Z" fill="#0f172a" />`;
    } else if (accessory === 'acc-crown') {
        svg += `<polygon points="30,24 35,10 42,18 50,6 58,18 65,10 70,24" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />`;
    } else if (accessory === 'acc-wizard-hat') {
        svg += `<path d="M 18 26 Q 50 20 82 26 Q 50 24 18 26 Z" fill="#4338ca" /><path d="M 30 24 Q 50 -10 68 5 Q 60 16 70 24 Z" fill="#6366f1" />`;
    } else if (accessory === 'acc-headphones') {
        svg += `<path d="M 24 45 A 27 27 0 0 1 76 45" fill="none" stroke="#ec4899" stroke-width="4.5" stroke-linecap="round" />`;
    } else if (accessory === 'acc-bow') {
        svg += `<polygon points="62,22 74,16 70,26" fill="#f472b6" /><polygon points="62,22 74,28 70,18" fill="#f472b6" />`;
    }

    svg += `</svg>`;
    return svg;
}

async function loadDashboard() {
    const studentsList = document.getElementById('students-list');
    const loading = document.getElementById('loading');
    
    try {
        const snapshot = await db.collection('users').get();
        loading.style.display = 'none';
        
        if (snapshot.empty) {
            studentsList.innerHTML = "<p>Nenhum aluno encontrado ainda.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const state = data.gameState || {};
            const avatarSvg = generateAvatarSVG(state.avatar, 42);
            
            // Analisa as maiores deficiências
            let deficienciesHtml = '';
            if (state.history) {
                const errors = [];
                for (const [key, stats] of Object.entries(state.history)) {
                    if (stats.wrong >= 2 && stats.wrong >= (stats.correct * 0.5)) {
                        errors.push({ key, wrong: stats.wrong });
                    }
                }
                
                if (errors.length > 0) {
                    errors.sort((a, b) => b.wrong - a.wrong);
                    const tags = errors.map(e => `<span class="def-tag">${e.key} (${e.wrong} erros)</span>`).join('');
                    deficienciesHtml = `
                        <div class="deficiencies-box">
                            <h4><i class="fa-solid fa-triangle-exclamation"></i> Precisa de Atenção:</h4>
                            ${tags}
                        </div>
                    `;
                }
            }
            
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <div class="student-header" style="display:flex; align-items:center; justify-content:space-between;">
                    <div class="student-name" style="display:flex; align-items:center; gap:10px;">
                        <div style="width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">
                            ${avatarSvg}
                        </div>
                        <span>${data.username}</span>
                    </div>
                    <div style="color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: bold;">
                        Último acesso: ${state.lastPlayedDate || 'Hoje'}
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-title">Fase Max</div>
                        <span class="text-primary">${state.maxLevelReached || 1}</span>
                    </div>
                    <div class="stat-box">
                        <div class="stat-title">Gemas</div>
                        <span class="text-secondary"><i class="fa-solid fa-gem"></i> ${state.gems || 0}</span>
                    </div>
                    <div class="stat-box">
                        <div class="stat-title">Ofensiva</div>
                        <span class="text-orange"><i class="fa-solid fa-fire"></i> ${state.streak || 0} dias</span>
                    </div>
                </div>
                ${deficienciesHtml}
            `;
            studentsList.appendChild(card);
        });
        
    } catch(e) {
        console.error(e);
        loading.innerHTML = `<p style="color:red;">Erro ao buscar dados: ${e.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);

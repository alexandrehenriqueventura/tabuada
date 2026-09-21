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
            
            // Analisa as maiores deficiências
            let deficienciesHtml = '';
            if (state.history) {
                // Filtra apenas contas que o aluno errou mais de 2 vezes, ou que errou mais do que acertou
                const errors = [];
                for (const [key, stats] of Object.entries(state.history)) {
                    if (stats.wrong >= 2 && stats.wrong >= (stats.correct * 0.5)) {
                        errors.push({ key, wrong: stats.wrong });
                    }
                }
                
                if (errors.length > 0) {
                    // Ordena pelos que mais errou
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
                <div class="student-header">
                    <div class="student-name"><i class="fa-solid ${state.animalIcon || 'fa-user'}"></i> ${data.username}</div>
                    <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; font-weight: bold;">
                        Último acesso: ${state.lastPlayedDate || 'Desconhecido'}
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-title">Fase Max</div>
                        <span class="text-primary">${state.maxLevelReached || 1}</span>
                    </div>
                    <div class="stat-box">
                        <div class="stat-title">Gemas</div>
                        <span class="text-secondary"><i class="fa-solid fa-bolt"></i> ${state.gems || 0}</span>
                    </div>
                    <div class="stat-box">
                        <div class="stat-title">Ofensiva</div>
                        <span class="text-orange"><i class="fa-solid fa-medal"></i> ${state.streak || 0} dias</span>
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

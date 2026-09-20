document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('students-tbody');
    const totalStudentsEl = document.getElementById('total-students');
    const totalCompletedEl = document.getElementById('total-completed');

    let studentsCount = 0;
    let phasesCompletedCount = 0;

    // Busca no LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('tabuada_user_')) {
            const username = key.replace('tabuada_user_', '');
            const data = JSON.parse(localStorage.getItem(key));
            
            studentsCount++;
            phasesCompletedCount += (data.maxLevelReached - 1);

            let statusHtml = '';
            if (data.lives === 0) {
                statusHtml = '<span class="status-badge status-warning">Sem Energia</span>';
            } else if (data.streak >= 3) {
                statusHtml = '<span class="status-badge status-good">Em chamas 🔥</span>';
            } else {
                statusHtml = '<span class="status-badge status-good">Regular</span>';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${username}</td>
                <td>Nível ${data.maxLevelReached}</td>
                <td><i class="fa-solid fa-fire" style="color:#f97316;"></i> ${data.streak}</td>
                <td><i class="fa-solid fa-gem" style="color:#a855f7;"></i> ${data.gems}</td>
                <td>${statusHtml}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    if (studentsCount === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">Nenhum aluno cadastrado ainda. Peça para que eles acessem o app e criem um perfil!</td></tr>`;
    }

    totalStudentsEl.textContent = studentsCount;
    totalCompletedEl.textContent = phasesCompletedCount;
});

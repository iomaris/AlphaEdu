document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os ícones do Lucide
    lucide.createIcons();

    // --- SELETORES DE ELEMENTOS ---
    const painelAvisos = document.getElementById('class-panel');
    const openModalBtn = document.getElementById('openJoinModalBtn');
    const welcomeMessage = document.getElementById('welcome-message');
    const leaveClassBtn = document.getElementById('leave-class-btn');
    const closeModalBtn = document.getElementById('closeJoinModalBtn');
    const modal = document.getElementById('joinClassModal');
    const joinForm = document.getElementById('joinClassForm');
    const codeInput = document.getElementById('class-code-input');
    const profileMenuContainer = document.getElementById('profile-menu-container');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    // --- FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO DA UI (Layout) ---
    function updateUserInterface() {
        const userHasCode = localStorage.getItem('userHasTurmaCode') === 'true';
        const rightColumn = document.querySelector('.right-column');

        if (userHasCode) {
            if (painelAvisos) painelAvisos.style.display = 'block';
            if (rightColumn) rightColumn.style.gridColumn = '2 / 3';
            if (openModalBtn) openModalBtn.style.display = 'none';
            if (leaveClassBtn) leaveClassBtn.style.display = 'flex';
            if (welcomeMessage) welcomeMessage.textContent = 'Bem-vindo(a) de volta, Aluno Teste!';
        } else {
            if (painelAvisos) painelAvisos.style.display = 'none';
            if (rightColumn) rightColumn.style.gridColumn = '1 / 2';
            if (openModalBtn) openModalBtn.style.display = 'flex';
            if (leaveClassBtn) leaveClassBtn.style.display = 'none';
            if (welcomeMessage) welcomeMessage.textContent = 'Bem-vindo(a) ao seu espaço de estudos!';
        }
    }

    // --- LÓGICA DO MODAL PARA ENTRAR NA TURMA ---
    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => modal.classList.add('show'));
    }
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    }
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) modal.classList.remove('show');
        });
    }
    if (joinForm) {
        joinForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const classCode = codeInput.value.trim();
            if (classCode) {
                alert(`Código "${classCode}" aceito! Bem-vindo(a) à turma.`);
                localStorage.setItem('userHasTurmaCode', 'true');
                updateUserInterface();
                modal.classList.remove('show');
            } else {
                alert('Por favor, insira um código de turma.');
            }
        });
    }

    // --- LÓGICA PARA SAIR DA TURMA ---
    if (leaveClassBtn) {
        leaveClassBtn.addEventListener('click', function(event) {
            event.preventDefault();
            if (confirm('Tem certeza que deseja sair da turma? Você perderá o acesso aos avisos e ao calendário compartilhado.')) {
                localStorage.removeItem('userHasTurmaCode');
                updateUserInterface();
                alert('Você saiu da turma.');
            }
        });
    }

    // --- LÓGICA DO MENU DE PERFIL ---
    if (profileMenuContainer && profileMenuButton && profileDropdown) {
        profileMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        window.addEventListener('click', (event) => {
            if (!profileMenuContainer.contains(event.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // --- LÓGICA PARA O MINI CALENDÁRIO ---
    const miniMonthYearEl = document.getElementById('mini-month-year');
    const miniDaysEl = document.getElementById('mini-calendar-days');
    const miniPrevBtn = document.getElementById('mini-prev-month');
    const miniNextBtn = document.getElementById('mini-next-month');
    let miniCurrentDate = new Date();

    function renderMiniCalendar() {
        if (!miniMonthYearEl || !miniDaysEl) return;

        const year = miniCurrentDate.getFullYear();
        const month = miniCurrentDate.getMonth();
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        miniMonthYearEl.textContent = `${monthNames[month]} ${year}`;
        miniDaysEl.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDay; i > 0; i--) {
            miniDaysEl.innerHTML += `<div class="mini-day other-month">${lastDayOfPrevMonth - i + 1}</div>`;
        }

        for (let i = 1; i <= lastDate; i++) {
            let isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? 'today' : '';
            miniDaysEl.innerHTML += `<div class="mini-day current-month ${isToday}">${i}</div>`;
        }
        
        const totalDays = firstDay + lastDate;
        const remainingDays = 35 - totalDays >= 0 ? 35 - totalDays : 42 - totalDays;
        for (let i = 1; i <= remainingDays; i++) {
            miniDaysEl.innerHTML += `<div class="mini-day other-month">${i}</div>`;
        }
    }

    if (miniPrevBtn) {
        miniPrevBtn.addEventListener('click', () => {
            miniCurrentDate.setMonth(miniCurrentDate.getMonth() - 1);
            renderMiniCalendar();
        });
    }
    if (miniNextBtn) {
        miniNextBtn.addEventListener('click', () => {
            miniCurrentDate.setMonth(miniCurrentDate.getMonth() + 1);
            renderMiniCalendar();
        });
    }

    // --- ✅ ATIVIDADE 1 e 2: LÓGICA PARA RENDERIZAR AS NOTAS NO WIDGET ---
    function renderMiniNotes() {
        const miniNotesList = document.getElementById('mini-notes-list');
        if (!miniNotesList) return;

        // Busca as notas do localStorage (a mesma fonte de dados do scriptNotas.js)
        const notes = JSON.parse(localStorage.getItem('notes')) || [];

        miniNotesList.innerHTML = ''; // Limpa a lista antes de adicionar as notas

        if (notes.length > 0) {
            // Pega as 3 notas mais recentes (as últimas do array)
            const recentNotes = notes.slice(-3).reverse();

            recentNotes.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'mini-note-card';

                const noteTitle = document.createElement('h5');
                noteTitle.textContent = note.title || 'Nota sem título';

                const noteDate = document.createElement('p');
                noteDate.textContent = new Date(note.id).toLocaleDateString('pt-BR');

                noteCard.appendChild(noteTitle);
                noteCard.appendChild(noteDate);
                miniNotesList.appendChild(noteCard);
            });
        } else {
            // Mensagem exibida se não houver notas
            miniNotesList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma nota encontrada.</p>';
        }
    }

    // --- PONTO DE PARTIDA: Chama todas as funções de inicialização ---
    updateUserInterface();
    renderMiniCalendar();
    renderMiniNotes(); // Chama a nova função para carregar as notas
});

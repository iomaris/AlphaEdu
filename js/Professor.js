import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Sua configuração do Firebase (certifique-se de que está correta para sua nova conta)
const firebaseConfig = {
  apiKey: "AIzaSyBdXV5FGtIgGulzCoOGO7humceFOmA5KVU",
  authDomain: "alphaedu-1a738.firebaseapp.com",
  databaseURL: "https://alphaedu-1a738-default-rtdb.firebaseio.com/",
  projectId: "alphaedu-1a738",
  storageBucket: "alphaedu-1a738.firebasestorage.app",
  messagingSenderId: "570881564591",
  appId: "1:570881564591:web:60c1ed6f8aaa414b27995a",
  measurementId: "G-M36B97ZQVY"
};
const app = initializeApp(firebaseConfig );
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA GLOBAL (SIDEBAR, PERFIL, AUTH) ---
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileUsername = document.querySelector('.profile-info .username');
    const profileEmail = document.querySelector('.profile-info .email');
    const dropdownUsername = document.querySelector('#profile-dropdown .username');
    const dropdownEmail = document.querySelector('#profile-dropdown .email');
    const welcomeMessage = document.getElementById('welcome-message');
    const headerToggleBtn = document.getElementById('header-toggle-btn');
    const logoutButton = document.querySelector('.logout');

    if (headerToggleBtn) {
        headerToggleBtn.addEventListener('click', () => {
            sidebar.style.display = 'flex';
            sidebar.classList.toggle('hidden');
            const isHidden = sidebar.classList.contains('hidden');
            localStorage.setItem('sidebarState', isHidden ? 'hidden' : 'visible');
        });
    }

    if (toggleBtn && sidebar && mainContent) {
        const setSidebarState = (isHidden) => {
            sidebar.classList.toggle('hidden', isHidden);
            mainContent.style.paddingLeft = isHidden ? '118px' : '290px';
            localStorage.setItem('sidebarState', isHidden ? 'hidden' : 'visible');
        };
        toggleBtn.addEventListener('click', () => setSidebarState(!sidebar.classList.contains('hidden')));
        const savedState = localStorage.getItem('sidebarState');
        setSidebarState(savedState === 'hidden');
    }

    if (profileMenuButton) {
        profileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }
    window.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
    });

    // Lógica de Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = 'inicial.html'; // Redirecionar para a página inicial ou de login
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Erro ao fazer logout. Tente novamente.');
            }
        });
    }

    // Lógica de autenticação e carregamento de dados do usuário
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid;
            const dbRef = ref(db);
            try {
                const snapshot = await get(child(dbRef, `users/${userId}`));
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    console.log("Dados do usuário:", userData);

                    // Verificar se o usuário é realmente um professor
                    if (userData.userType !== 'professor') {
                        alert('Acesso negado. Você não tem permissão de professor.');
                        window.location.href = 'painel.html'; // Redirecionar para o painel do aluno
                        return;
                    }

                    // Atualizar informações do perfil na sidebar
                    const username = userData.username;
                    const email = userData.email;
                    const avatarInitials = (username.split(' ')[0][0] || '') + (username.split(' ')[1]?.[0] || '');

                    if (profileAvatar) profileAvatar.textContent = avatarInitials;
                    if (profileUsername) profileUsername.textContent = username;
                    if (profileEmail) profileEmail.textContent = email;
                    if (dropdownUsername) dropdownUsername.textContent = username;
                    if (dropdownEmail) dropdownEmail.textContent = email;
                    if (welcomeMessage) welcomeMessage.textContent = `Bem-vindo(a), Professor(a) ${username}!`;

                    // Exibir informações adicionais do professor (se existirem elementos para isso no HTML)
                    // Exemplo: se você tiver <span id="professorDisciplina"></span> no seu HTML
                    // const professorDisciplinaEl = document.getElementById('professorDisciplina');
                    // if (professorDisciplinaEl && userData.disciplina) professorDisciplinaEl.textContent = userData.disciplina;
                    // const professorMatriculaEl = document.getElementById('professorMatricula');
                    // if (professorMatriculaEl && userData.matricula) professorMatriculaEl.textContent = userData.matricula;
                    // const professorDepartamentoEl = document.getElementById('professorDepartamento');
                    // if (professorDepartamentoEl && userData.departamento) professorDepartamentoEl.textContent = userData.departamento;

                } else {
                    console.log("Nenhum dado disponível para este usuário.");
                    alert('Dados do usuário não encontrados. Faça login novamente.');
                    window.location.href = 'Login.html';
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                alert('Erro ao carregar dados do usuário. Faça login novamente.');
                window.location.href = 'Login.html';
            }
        } else {
            // Usuário não está logado, redirecionar para a página de login
            window.location.href = 'Login.html';
        }
    });

    // --- 2. LÓGICA ESPECÍFICA DA PÁGINA DO PROFESSOR ---
    
    // Navegação entre seções
    window.showPage = (pageId) => {
        document.querySelectorAll('.main > section').forEach(section => section.classList.add('hidden'));
        const activeSection = document.getElementById(pageId);
        if (activeSection) activeSection.classList.remove('hidden');
        document.querySelectorAll('.sidebar nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick').includes(`'${pageId}'`)) {
                link.classList.add('active');
            }
        });
    };

    // Renderização de Turmas
    const turmasGrid = document.getElementById('turmas-grid');
    const turmasData = [
        { nome: "Turma 101A", disciplina: "Matemática Avançada", horario: "Segundas e Quartas, 08:00 - 09:30", ano: "2024" },
        { nome: "Turma 102A", disciplina: "Física Moderna", horario: "Segundas e Quartas, 10:00 - 11:30", ano: "2024" },
        { nome: "Turma 202B", disciplina: "História do Brasil", horario: "Terças e Quintas, 10:00 - 11:30", ano: "2024" },
        { nome: "Turma 301C", disciplina: "Literatura Clássica", horario: "Sextas, 14:00 - 15:30", ano: "2024" }
    ];

    function renderTurmas() {
        if (!turmasGrid) return;
        turmasGrid.innerHTML = turmasData.map(turma => `
            <div class="turma-card">
                <h4><i data-lucide="book-marked"></i> ${turma.nome}</h4>
                <p><strong>Disciplina:</strong> ${turma.disciplina}</p>
                <p><strong>Horário:</strong> ${turma.horario}</p>
                <p><strong>Ano:</strong> ${turma.ano}</p>
            </div>
        `).join('');
        lucide.createIcons();
    }

    // Lógica do Calendário
    const monthYearEl = document.getElementById('monthYear');
    const calendarDatesEl = document.getElementById('calendar-dates');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventListEl = document.getElementById('event-list');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventTitleDisplay = document.getElementById('event-title-display');

    let currentDate = new Date();
    let selectedDate = new Date();
    let events = {};

    function renderCalendar() {
        if (!monthYearEl || !calendarDatesEl) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        monthYearEl.textContent = `${monthNames[month]} ${year}`;
        calendarDatesEl.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfLastMonth = new Date(year, month, 0).getDate();

        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.textContent = lastDateOfLastMonth - i + 1;
            dayEl.classList.add('other-month');
            calendarDatesEl.appendChild(dayEl);
        }

        for (let day = 1; day <= lastDateOfMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            const thisDate = new Date(year, month, day);
            if (thisDate.toDateString() === selectedDate.toDateString()) {
                dayEl.classList.add('selected');
            }
            dayEl.addEventListener('click', () => {
                selectedDate = thisDate;
                renderCalendar();
                renderEvents();
            });
            calendarDatesEl.appendChild(dayEl);
        }

        const totalCells = calendarDatesEl.children.length;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = i;
            dayEl.classList.add('other-month');
            calendarDatesEl.appendChild(dayEl);
        }
    }

    function renderEvents() {
        if (!eventListEl || !eventTitleDisplay) return;
        const dateKey = selectedDate.toISOString().split('T')[0];
        const dateEvents = events[dateKey] || [];
        eventTitleDisplay.textContent = `Eventos do dia ${selectedDate.toLocaleDateString('pt-BR')}`;
        eventListEl.innerHTML = '';
        if (dateEvents.length === 0) {
            eventListEl.innerHTML = '<li class="empty">Nenhum evento para esta data.</li>';
        } else {
            dateEvents.forEach(eventText => {
                const li = document.createElement('li');
                li.textContent = `• ${eventText}`;
                eventListEl.appendChild(li);
            });
        }
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    if (addEventBtn) addEventBtn.addEventListener('click', () => {
        const eventText = prompt("Digite o título do evento:");
        if (!eventText) return;
        const dateKey = selectedDate.toISOString().split('T')[0];
        if (!events[dateKey]) events[dateKey] = [];
        events[dateKey].push(eventText);
        renderEvents();
    });

    // Lógica de Avisos
    const avisosList = document.getElementById('avisos-list');
    function renderAvisos() {
        if (!avisosList) return;
        avisosList.innerHTML = `
            <div class="aviso-card">
                <div class="aviso-card-content">
                    <h4>Entrega de Trabalhos de Ciências</h4>
                    <div class="meta">Publicado em 11/07/2024</div>
                    <p>O prazo final para entrega dos trabalhos de Ciências é dia 20/07.</p>
                </div>
                <div class="aviso-actions">
                    <button class="edit-btn" title="Editar"><i data-lucide="edit"></i></button>
                    <button class="delete-btn" title="Excluir"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    // --- INICIALIZAÇÃO ---
    renderTurmas();
    renderCalendar();
    renderEvents();
    renderAvisos();
    showPage('painel'); // Mostra a página inicial do painel por padrão
});


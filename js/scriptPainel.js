// ==================================================
// ===== SCRIPTPAINEL.JS - VERSÃO ÚNICA E COMPLETA =====
// ==================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC02F-Ka3ftBr4k-uNzUU3d7znjMgQ-zdk",
    authDomain: "alphaedu-60ef2.firebaseapp.com",
    databaseURL: "https://alphaedu-60ef2-default-rtdb.firebaseio.com",
    projectId: "alphaedu-60ef2",
    storageBucket: "alphaedu-60ef2.appspot.com",
    messagingSenderId: "850593200345",
    appId: "1:850593200345:web:abf53a5b5cd6c255f4e6c8"
};

const app = initializeApp(firebaseConfig );
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const welcomeMessage = document.getElementById('welcome-message');
    const profileAvatar = document.querySelector('.profile-avatar');
    const dropdownUsername = document.querySelector('#profile-dropdown .username');
    const dropdownEmail = document.querySelector('#profile-dropdown .email');
    const leaveClassBtn = document.getElementById('leave-class-btn');
    const openModalBtn = document.getElementById('openJoinModalBtn');
    const modal = document.getElementById('joinClassModal');
    const closeModalBtn = document.getElementById('closeJoinModalBtn');
    const joinForm = document.getElementById('joinClassForm');
    const codeInput = document.getElementById('class-code-input');
    const customModalOverlay = document.getElementById('custom-modal-overlay');
    const customModalTitle = document.getElementById('custom-modal-title');
    const customModalText = document.getElementById('custom-modal-text');
    const customModalOkBtn = document.getElementById('custom-modal-ok-btn');
    const customModalCancelBtn = document.getElementById('custom-modal-cancel-btn');
    const miniNotesList = document.getElementById('mini-notes-list');
    const miniMonthYearEl = document.getElementById('mini-month-year');
    const miniDaysEl = document.getElementById('mini-calendar-days');
    const miniPrevBtn = document.getElementById('mini-prev-month');
    const miniNextBtn = document.getElementById('mini-next-month');
    const painelAvisos = document.getElementById('class-panel');
    const dashboardGrid = document.querySelector('.dashboard-grid');

    let miniCurrentDate = new Date();

    // --- LÓGICA DA SIDEBAR E PERFIL ---
    if (toggleBtn) {
        const setSidebarState = (isHidden) => {
            if (sidebar && mainContent) {
                sidebar.classList.toggle('hidden', isHidden);
                mainContent.classList.toggle('full-width', isHidden);
                localStorage.setItem('sidebarState', isHidden ? 'hidden' : 'visible');
            }
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

    // --- AUTENTICAÇÃO E CARREGAMENTO DE DADOS ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            lucide.createIcons();
            loadPageData(user);
        } else {
            window.location.href = 'Login.html';
        }
    });

    async function loadPageData(user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.exists() ? snapshot.val() : {};
        
        // Atualiza UI Global
        const username = userData.username || 'Usuário';
        if (welcomeMessage) welcomeMessage.textContent = `Bem-vindo(a) de volta, ${username}!`;
        if (profileAvatar) profileAvatar.textContent = (username[0] || 'U') + (username.split(' ')[1]?.[0] || '');
        if (dropdownUsername) dropdownUsername.textContent = username;
        if (dropdownEmail) dropdownEmail.textContent = user.email;
        
        const userHasCode = !!userData.classCode;
        if (leaveClassBtn) leaveClassBtn.style.display = userHasCode ? 'flex' : 'none';
        if (openModalBtn) openModalBtn.style.display = userHasCode ? 'none' : 'flex';

        // Atualiza UI Específica do Painel
        if (painelAvisos) painelAvisos.style.display = userHasCode ? 'block' : 'none';
        if (dashboardGrid) dashboardGrid.classList.toggle('full-width', !userHasCode);
        renderMiniCalendar(userData.calendarEvents || {});
        renderMiniNotes(userData.notes || {});
    }

    // --- FUNÇÕES ESPECÍFICAS DO PAINEL ---
    function renderMiniCalendar(userEvents) {
        if (!miniMonthYearEl || !miniDaysEl) return;
        const year = miniCurrentDate.getFullYear();
        const month = miniCurrentDate.getMonth();
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        miniMonthYearEl.textContent = `${monthNames[month]} ${year}`;
        miniDaysEl.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) { miniDaysEl.innerHTML += `<div class="mini-day"></div>`; }
        for (let i = 1; i <= lastDate; i++) {
            const isToday = new Date(year, month, i).toDateString() === new Date().toDateString() ? 'today' : '';
            miniDaysEl.innerHTML += `<div class="mini-day current-month ${isToday}">${i}</div>`;
        }
    }

    function renderMiniNotes(notes = {}) {
        if (!miniNotesList) return;
        const notesArray = Object.values(notes).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        miniNotesList.innerHTML = '';
        if (notesArray.length > 0) {
            notesArray.slice(0, 3).forEach(note => {
                miniNotesList.innerHTML += `<div class="mini-note-card"><h5>${note.title || 'Nota sem título'}</h5><p>${new Date(note.rawDate).toLocaleDateString('pt-BR')}</p></div>`;
            });
        } else {
            miniNotesList.innerHTML = '<p>Nenhuma nota encontrada.</p>';
        }
    }

    // --- EVENT LISTENERS ---
    if (miniPrevBtn) miniPrevBtn.addEventListener('click', () => { miniCurrentDate.setMonth(miniCurrentDate.getMonth() - 1); loadPageData(auth.currentUser); });
    if (miniNextBtn) miniNextBtn.addEventListener('click', () => { miniCurrentDate.setMonth(miniCurrentDate.getMonth() + 1); loadPageData(auth.currentUser); });

    // --- LÓGICA DOS MODAIS ---
    function showAlert(title, message) { /* ...código do showAlert... */ }
    function showConfirm(title, message) { /* ...código do showConfirm... */ }
    // (O código completo das funções está abaixo)

    if (openModalBtn) openModalBtn.addEventListener('click', () => modal.classList.add('show'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const classCode = codeInput.value.trim();
            const user = auth.currentUser;
            if (classCode && user) {
                await set(ref(db, `users/${user.uid}/classCode`), classCode);
                modal.classList.remove('show');
                await showAlert('Sucesso!', `Código "${classCode}" aceito! Bem-vindo(a) à turma.`);
                loadPageData(user);
            } else {
                await showAlert('Atenção', 'Por favor, insira um código de turma.');
            }
        });
    }

    if (leaveClassBtn) {
        leaveClassBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            const confirmed = await showConfirm('Sair da Turma', 'Tem certeza que deseja sair da turma?');
            if (confirmed && user) {
                await set(ref(db, `users/${user.uid}/classCode`), null);
                await showAlert('Aviso', 'Você saiu da turma.');
                loadPageData(user);
            }
        });
    }

    function showAlert(title, message) {
        customModalTitle.textContent = title;
        customModalText.textContent = message;
        customModalCancelBtn.style.display = 'none';
        customModalOkBtn.textContent = 'OK';
        customModalOverlay.classList.add('show');
        return new Promise((resolve) => {
            customModalOkBtn.onclick = () => {
                customModalOverlay.classList.remove('show');
                resolve(true);
            };
        });
    }

    function showConfirm(title, message) {
        customModalTitle.textContent = title;
        customModalText.textContent = message;
        customModalCancelBtn.style.display = 'inline-block';
        customModalOkBtn.textContent = 'Confirmar';
        customModalCancelBtn.textContent = 'Cancelar';
        customModalOverlay.classList.add('show');
        return new Promise((resolve) => {
            customModalOkBtn.onclick = () => {
                customModalOverlay.classList.remove('show');
                resolve(true);
            };
            customModalCancelBtn.onclick = () => {
                customModalOverlay.classList.remove('show');
                resolve(false);
            };
        });
    }
});

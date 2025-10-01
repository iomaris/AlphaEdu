// =======================================================================
// 1. SETUP DO FIREBASE (Adicionado)
// =======================================================================
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

// =======================================================================
// 2. ELEMENTOS DO DOM E ESTADO (Sua lógica original, com adaptações)
// =======================================================================
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
const miniNotesList = document.getElementById('mini-notes-list');
const miniMonthYearEl = document.getElementById('mini-month-year');
const miniDaysEl = document.getElementById('mini-calendar-days');
const miniPrevBtn = document.getElementById('mini-prev-month');
const miniNextBtn = document.getElementById('mini-next-month');

let currentUser = null;
let userData = {};
let miniCurrentDate = new Date();
let userEvents = {}; // Para armazenar os eventos do calendário

// =======================================================================
// 3. FUNÇÕES DE DADOS (Adicionadas para usar Firebase)
// =======================================================================

/**
 * Carrega todos os dados necessários do usuário do Firebase.
 */
async function loadAllUserData() {
    if (!currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            userData = snapshot.val();
            // Carrega os dados específicos dos widgets
            userEvents = userData.calendarEvents || {};
        }
    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
    }
    // Após carregar os dados, atualiza toda a UI
    updateUserInterface();
    renderMiniCalendar();
    renderMiniNotes();
}

/**
 * Salva o código da turma no perfil do usuário no Firebase.
 */
async function saveClassCode(classCode) {
    if (!currentUser) return;
    const classCodeRef = ref(db, `users/${currentUser.uid}/classCode`);
    await set(classCodeRef, classCode);
    userData.classCode = classCode; // Atualiza o objeto local
    updateUserInterface();
}

/**
 * Remove o código da turma do perfil do usuário.
 */
async function removeClassCode() {
    if (!currentUser) return;
    const classCodeRef = ref(db, `users/${currentUser.uid}/classCode`);
    await set(classCodeRef, null); // Usar set(null) é o mesmo que remover
    delete userData.classCode; // Remove do objeto local
    updateUserInterface();
}

// =======================================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO E UI (Sua lógica original, adaptada para Firebase)
// =======================================================================

function updateUserInterface() {
    const userHasCode = !!userData.classCode;
    const rightColumn = document.querySelector('.right-column');

    // Atualiza a mensagem de boas-vindas e o menu de perfil
    welcomeMessage.textContent = `Bem-vindo(a) de volta, ${userData.username || 'Usuário'}!`;
    profileDropdown.querySelector('.username').textContent = userData.username || 'Usuário';
    profileDropdown.querySelector('.email').textContent = currentUser.email;
    profileMenuButton.querySelector('.profile-avatar').textContent = (userData.username || 'U').substring(0, 2).toUpperCase();

    // Lógica para exibir/ocultar painéis baseada no código da turma
    if (userHasCode) {
        painelAvisos.style.display = 'block';
        rightColumn.style.gridColumn = '2 / 3';
        openModalBtn.style.display = 'none';
        leaveClassBtn.style.display = 'flex';
    } else {
        painelAvisos.style.display = 'none';
        rightColumn.style.gridColumn = '1 / 2';
        openModalBtn.style.display = 'flex';
        leaveClassBtn.style.display = 'none';
    }
}

function renderMiniCalendar() {
    if (!miniMonthYearEl || !miniDaysEl) return;
    const year = miniCurrentDate.getFullYear();
    const month = miniCurrentDate.getMonth();
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    miniMonthYearEl.textContent = `${monthNames[month]} ${year}`;
    miniDaysEl.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        miniDaysEl.innerHTML += `<div class="mini-day other-month"></div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
        const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = userEvents[dayKey] && userEvents[dayKey].length > 0;
        const isToday = new Date(year, month, i).toDateString() === new Date().toDateString() ? 'today' : '';
        const eventClass = hasEvent ? 'has-event' : '';
        miniDaysEl.innerHTML += `<div class="mini-day current-month ${isToday} ${eventClass}">${i}</div>`;
    }
}

function renderMiniNotes() {
    if (!miniNotesList) return;
    const notes = userData.notes || {};
    const notesArray = Object.values(notes).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    
    miniNotesList.innerHTML = '';

    if (notesArray.length > 0) {
        const recentNotes = notesArray.slice(0, 3);
        recentNotes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'mini-note-card';
            noteCard.innerHTML = `
                <h5>${note.title || 'Nota sem título'}</h5>
                <p>${new Date(note.rawDate).toLocaleDateString('pt-BR')}</p>
            `;
            miniNotesList.appendChild(noteCard);
        });
    } else {
        miniNotesList.innerHTML = '<p class="no-items-message">Nenhuma nota encontrada.</p>';
    }
}

// =======================================================================
// 5. EVENT LISTENERS (Sua lógica original, adaptada para Firebase)
// =======================================================================

openModalBtn?.addEventListener('click', () => modal.classList.add('show'));
closeModalBtn?.addEventListener('click', () => modal.classList.remove('show'));
modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

joinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const classCode = codeInput.value.trim();
    if (classCode) {
        await saveClassCode(classCode);
        alert(`Código "${classCode}" aceito! Bem-vindo(a) à turma.`);
        modal.classList.remove('show');
    } else {
        alert('Por favor, insira um código de turma.');
    }
});

leaveClassBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair da turma?')) {
        await removeClassCode();
        alert('Você saiu da turma.');
    }
});

miniPrevBtn?.addEventListener('click', () => {
    miniCurrentDate.setMonth(miniCurrentDate.getMonth() - 1);
    renderMiniCalendar();
});

miniNextBtn?.addEventListener('click', () => {
    miniCurrentDate.setMonth(miniCurrentDate.getMonth() + 1);
    renderMiniCalendar();
});

if (profileMenuContainer) {
    profileMenuButton.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('show'); });
    window.addEventListener('click', (e) => { if (!profileMenuContainer.contains(e.target)) profileDropdown.classList.remove('show'); });
}

// =======================================================================
// 6. INICIALIZAÇÃO (Modificada para usar Firebase)
// =======================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        lucide.createIcons();
        loadAllUserData(); // Ponto de entrada principal
    } else {
        window.location.href = 'Login.html';
    }
});

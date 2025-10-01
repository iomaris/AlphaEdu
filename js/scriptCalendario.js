// Importa as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC02F-Ka3ftBr4k-uNzUU3d7znjMgQ-zdk",
    authDomain: "alphaedu-60ef2.firebaseapp.com",
    databaseURL: "https://alphaedu-60ef2-default-rtdb.firebaseio.com",
    projectId: "alphaedu-60ef2",
    storageBucket: "alphaedu-60ef2.appspot.com",
    messagingSenderId: "850593200345",
    appId: "1:850593200345:web:abf53a5b5cd6c255f4e6c8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig );
const auth = getAuth(app);
const db = getDatabase(app);

// --- VARIÁVEIS GLOBAIS ---
let currentUser = null;
let currentDate = new Date();
let selectedDate = new Date();
let personalEvents = {};
let editingEvent = null;
let eventToDelete = null;

// --- ELEMENTOS DO DOM ---
const monthYearElement = document.getElementById('month-year');
const calendarDaysElement = document.getElementById('calendar-days');
const eventsTitleElement = document.getElementById('events-title');
const eventListElement = document.getElementById('event-list');
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// --- FUNÇÕES PRINCIPAIS (FIREBASE E RENDERIZAÇÃO) ---

async function loadUserEvents() {
    if (!currentUser) return;
    const eventsRef = ref(db, `users/${currentUser.uid}/calendarEvents`);
    try {
        const snapshot = await get(eventsRef);
        personalEvents = snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        personalEvents = {};
    }
    renderCalendar();
    renderEvents();
}

async function saveEventsToFirebase() {
    if (!currentUser) return;
    const eventsRef = ref(db, `users/${currentUser.uid}/calendarEvents`);
    try {
        await set(eventsRef, personalEvents);
    } catch (error) {
        console.error("Erro ao salvar eventos:", error);
    }
}

function renderCalendar() {
    if (!monthYearElement || !calendarDaysElement) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    calendarDaysElement.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

    for (let i = firstDayOfMonth; i > 0; i--) {
        calendarDaysElement.innerHTML += `<div class="day other-month">${lastDayOfPrevMonth - i + 1}</div>`;
    }

    for (let day = 1; day <= lastDayOfMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayKey = getDateKey(dayDate);
        let dayClasses = 'day';
        if (dayDate.toDateString() === new Date().toDateString()) dayClasses += ' today';
        if (dayDate.toDateString() === selectedDate.toDateString()) dayClasses += ' selected';

        let dayHTML = `<div class="${dayClasses}" data-date="${dayKey}">${day}`;
        if (personalEvents[dayKey] && Object.keys(personalEvents[dayKey]).length > 0) {
            dayHTML += '<div class="event-dot"></div>';
        }
        dayHTML += '</div>';
        calendarDaysElement.innerHTML += dayHTML;
    }
    
    const totalDaysRendered = firstDayOfMonth + lastDayOfMonth;
    const remainingSlots = totalDaysRendered > 35 ? 42 - totalDaysRendered : 35 - totalDaysRendered;
    for (let i = 1; i <= remainingSlots; i++) {
        calendarDaysElement.innerHTML += `<div class="day other-month">${i}</div>`;
    }

    document.querySelectorAll('.day[data-date]').forEach(dayElement => {
        dayElement.addEventListener('click', () => {
            const [y, m, d] = dayElement.dataset.date.split('-');
            selectedDate = new Date(y, m - 1, d);
            renderCalendar();
            renderEvents();
        });
    });
}

function renderEvents() {
    if (!eventsTitleElement || !eventListElement) return;
    const dateKey = getDateKey(selectedDate);
    eventsTitleElement.textContent = `Eventos para ${formatDate(selectedDate)}`;
    const dayEvents = personalEvents[dateKey] ? Object.values(personalEvents[dateKey]) : [];
    const dayEventKeys = personalEvents[dateKey] ? Object.keys(personalEvents[dateKey]) : [];

    if (dayEvents.length === 0) {
        eventListElement.innerHTML = `<p class="no-events-message">Nenhum evento para esta data.</p>`;
    } else {
        eventListElement.innerHTML = dayEvents.map((event, index) => `
            <div class="event-card" data-key="${dayEventKeys[index]}">
                <div class="event-type">${event.eventType || 'Pessoal'}</div>
                <div class="event-title">${event.title}</div>
                ${event.description ? `<div class="event-desc">${event.description}</div>` : ''}
                <div class="event-card-footer">
                    <button class="event-action-btn edit" title="Editar"><i data-lucide="pencil"></i></button>
                    <button class="event-action-btn delete" title="Excluir"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        `).join('');
    }
    lucide.createIcons();
    addEventListenersToEventActions();
}

function addEventListenersToEventActions() {
    eventListElement.querySelectorAll('.event-action-btn.delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.event-card');
            const eventKey = card.dataset.key;
            openConfirmModal(getDateKey(selectedDate), eventKey);
        });
    });
    eventListElement.querySelectorAll('.event-action-btn.edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.event-card');
            const eventKey = card.dataset.key;
            openEditModal(getDateKey(selectedDate), eventKey);
        });
    });
}

// --- FUNÇÕES AUXILIARES E DE MODAL ---

function formatDate(date) { return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function getDateKey(date) { return date.toISOString().split('T')[0]; }

function openModal(modalElement) { modalElement.classList.add('show'); }
function closeModal(modalElement) { modalElement.classList.remove('show'); }

function openEditModal(dateKey, eventKey) {
    editingEvent = { dateKey, eventKey };
    const event = personalEvents[dateKey][eventKey];
    eventModal.querySelector('.modal-header h4').textContent = 'Editar Evento';
    document.getElementById('event-title-input').value = event.title;
    document.getElementById('event-date').value = dateKey;
    document.getElementById('event-type').value = event.eventType;
    document.getElementById('event-desc').value = event.description || '';
    eventModal.querySelector('.btn-save').textContent = 'Salvar Alterações';
    openModal(eventModal);
}

function openConfirmModal(dateKey, eventKey) {
    eventToDelete = { dateKey, eventKey };
    const eventTitle = personalEvents[dateKey][eventKey].title;
    document.getElementById('confirm-modal-text').textContent = `Tem certeza que deseja excluir o evento "${eventTitle}"?`;
    openModal(confirmDeleteModal);
}

// --- LÓGICA DE INICIALIZAÇÃO E EVENT LISTENERS ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initializePage();
    } else {
        window.location.href = 'Login.html';
    }
});

async function initializePage() {
    lucide.createIcons();
    setupEventListeners();
    await loadUserEvents();
}

function setupEventListeners() {
    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    document.getElementById('add-event-btn')?.addEventListener('click', () => {
        editingEvent = null;
        eventForm.reset();
        eventModal.querySelector('.modal-header h4').textContent = 'Novo Evento';
        eventModal.querySelector('.btn-save').textContent = 'Adicionar';
        document.getElementById('event-date').value = getDateKey(selectedDate);
        openModal(eventModal);
    });
    document.getElementById('close-modal')?.addEventListener('click', () => closeModal(eventModal));
    document.getElementById('cancel-btn')?.addEventListener('click', () => closeModal(eventModal));
    eventModal?.addEventListener('click', (e) => { if (e.target === eventModal) closeModal(eventModal); });
    eventForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('event-title-input').value;
        const date = document.getElementById('event-date').value;
        const eventType = document.getElementById('event-type').value;
        const description = document.getElementById('event-desc').value;
        const newEvent = { title, eventType, description };
        
        let eventKey;
        if (editingEvent) {
            eventKey = editingEvent.eventKey;
            const oldDateKey = editingEvent.dateKey;
            if (oldDateKey !== date) {
                delete personalEvents[oldDateKey][eventKey];
                if (Object.keys(personalEvents[oldDateKey]).length === 0) delete personalEvents[oldDateKey];
            }
        } else {
            eventKey = `event_${Date.now()}`;
        }
        if (!personalEvents[date]) personalEvents[date] = {};
        personalEvents[date][eventKey] = newEvent;

        await saveEventsToFirebase();
        closeModal(eventModal);
        
        const [year, month, day] = date.split('-');
        currentDate = new Date(year, month - 1, 1);
        selectedDate = new Date(year, month - 1, day);
        renderCalendar();
        renderEvents();
    });
    document.getElementById('close-confirm-modal-btn')?.addEventListener('click', () => closeModal(confirmDeleteModal));
    document.getElementById('cancel-delete-btn')?.addEventListener('click', () => closeModal(confirmDeleteModal));
    confirmDeleteModal?.addEventListener('click', (e) => { if (e.target === confirmDeleteModal) closeModal(confirmDeleteModal); });
    document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
        if (!eventToDelete) return;
        const { dateKey, eventKey } = eventToDelete;
        
        delete personalEvents[dateKey][eventKey];
        if (Object.keys(personalEvents[dateKey]).length === 0) {
            delete personalEvents[dateKey];
        }

        await saveEventsToFirebase();
        closeModal(confirmDeleteModal);
        renderCalendar();
        renderEvents();
    });
}

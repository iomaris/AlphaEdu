// Inicializa os ícones da biblioteca Lucide
lucide.createIcons();

// --- VARIÁVEIS GLOBAIS ---
let currentDate = new Date();
let selectedDate = new Date();
let events = JSON.parse(localStorage.getItem('events')) || {};

// --- ELEMENTOS DO DOM ---
const monthYearElement = document.getElementById('month-year');
const calendarDaysElement = document.getElementById('calendar-days');
const eventsTitleElement = document.getElementById('events-title');
const eventListElement = document.getElementById('event-list');
const modal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// --- FUNÇÕES AUXILIARES ---
function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function getDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// --- FUNÇÕES PRINCIPAIS ---
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    calendarDaysElement.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastDayOfPrevMonth = new Date(year, month, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();

    // Dias do mês anterior
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day other-month';
        dayElement.textContent = daysInPrevMonth - i;
        calendarDaysElement.appendChild(dayElement);
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;

        const dayDate = new Date(year, month, day);
        const dayKey = getDateKey(dayDate);

        if (dayDate.toDateString() === new Date().toDateString()) {
            dayElement.classList.add('today');
        }
        if (dayDate.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        if (events[dayKey] && events[dayKey].length > 0) {
            const eventDot = document.createElement('div');
            eventDot.className = 'event-dot';
            dayElement.appendChild(eventDot);
        }

        dayElement.addEventListener('click', () => {
            selectedDate = new Date(year, month, day);
            renderCalendar();
            renderEvents();
        });

        calendarDaysElement.appendChild(dayElement);
    }

    // Dias do próximo mês
    const totalDaysRendered = calendarDaysElement.children.length;
    for (let day = 1; day <= 42 - totalDaysRendered; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day other-month';
        dayElement.textContent = day;
        calendarDaysElement.appendChild(dayElement);
    }
}

function renderEvents() {
    const key = getDateKey(selectedDate);
    const formattedDate = formatDate(selectedDate);
    eventsTitleElement.textContent = `Eventos para ${formattedDate}`;

    const dayEvents = events[key] || [];

    if (dayEvents.length === 0) {
        eventListElement.innerHTML = `<i data-lucide="info"></i><p>Nenhum evento para esta data.</p>`;
    } else {
        eventListElement.innerHTML = dayEvents.map(event => `
            <div class="event-card">
                <div class="event-title">${event.title}</div>
                <div class="event-type">${event.type}</div>
                ${event.description ? `<div class="event-desc">${event.description}</div>` : ''}
            </div>
        `).join('');
    }
    lucide.createIcons(); // Recria ícones se houver algum na lista de eventos
}

// --- EVENT LISTENERS ---
document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('add-event-btn').addEventListener('click', () => {
    document.getElementById('event-date').value = getDateKey(selectedDate);
    modal.classList.add('show');
});

document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('show'));
document.getElementById('cancel-btn').addEventListener('click', () => modal.classList.remove('show'));

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title-input').value;
    const date = document.getElementById('event-date').value;
    const type = document.getElementById('event-type').value;
    const description = document.getElementById('event-desc').value;

    if (!events[date]) {
        events[date] = [];
    }
    events[date].push({ title, type, description });

    localStorage.setItem('events', JSON.stringify(events));
    eventForm.reset();
    modal.classList.remove('show');

    const [year, month, day] = date.split('-');
    selectedDate = new Date(year, month - 1, day);
    currentDate = new Date(year, month - 1, 1);

    renderCalendar();
    renderEvents();
});

// --- INICIALIZAÇÃO ---
renderCalendar();
renderEvents();

/* ======================================================= */
/* ===== CÓDIGO PARA ADICIONAR EM TODOS OS ARQUIVOS JS ===== */
/* ======================================================= */

// --- LÓGICA DO MENU DE PERFIL NA SIDEBAR ---
const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

// Verifica se os elementos existem na página antes de adicionar os eventos
if (profileMenuContainer && profileMenuButton && profileDropdown) {
    
    profileMenuButton.addEventListener('click', function(event) {
        // Impede que o clique no botão feche o menu imediatamente
        event.stopPropagation(); 
        profileDropdown.classList.toggle('show');
    });

    // Fecha o dropdown se o usuário clicar em qualquer outro lugar da tela
    window.addEventListener('click', function(event) {
        // Verifica se o clique não foi dentro do menu
        if (!profileMenuContainer.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
}

// Não se esqueça de chamar lucide.createIcons() para que os ícones funcionem
lucide.createIcons();


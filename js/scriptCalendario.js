document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os ícones Lucide
    lucide.createIcons();

    // --- VARIÁVEIS GLOBAIS ---
    let currentDate = new Date();
    let selectedDate = new Date();
    let personalEvents = JSON.parse(localStorage.getItem('personalEvents')) || {};
    let classEvents = {};
    const userHasCode = localStorage.getItem('userHasTurmaCode') === 'true';
    let editingEvent = null;
    let eventToDelete = null;

    // --- ELEMENTOS DO DOM ---
    const monthYearElement = document.getElementById('month-year');
    const calendarDaysElement = document.getElementById('calendar-days');
    const eventsTitleElement = document.getElementById('events-title');
    const eventListElement = document.getElementById('event-list');
    const modal = document.getElementById('event-modal');
    const eventForm = document.getElementById('event-form');
    
    const confirmModal = document.getElementById('confirm-delete-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

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

    function loadClassEvents() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        classEvents = {
            [`${year}-${month}-15`]: [{ title: 'Entrega de Trabalho de Ciências', description: 'Prazo final para o trabalho sobre o sistema solar.' }],
            [`${year}-${month}-22`]: [{ title: 'Prova de Matemática', description: 'Assuntos: Álgebra e Geometria.' }],
        };
    }

    // --- FUNÇÕES PRINCIPAIS DE RENDERIZAÇÃO ---
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
            const dayElement = document.createElement('div');
            dayElement.className = 'day other-month';
            dayElement.textContent = lastDayOfPrevMonth - i + 1;
            calendarDaysElement.appendChild(dayElement);
        }

        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;
            const dayDate = new Date(year, month, day);
            const dayKey = getDateKey(dayDate);

            if (dayDate.toDateString() === new Date().toDateString()) dayElement.classList.add('today');
            if (dayDate.toDateString() === selectedDate.toDateString()) dayElement.classList.add('selected');
            
            const hasPersonalEvent = personalEvents[dayKey] && personalEvents[dayKey].length > 0;
            const hasClassEvent = userHasCode && classEvents[dayKey] && classEvents[dayKey].length > 0;
            if (hasPersonalEvent || hasClassEvent) {
                const dot = document.createElement('div');
                dot.className = 'event-dot';
                dayElement.appendChild(dot);
            }

            dayElement.addEventListener('click', () => {
                selectedDate = new Date(year, month, day);
                renderCalendar();
                renderEvents();
            });
            calendarDaysElement.appendChild(dayElement);
        }

        const totalDaysRendered = calendarDaysElement.children.length;
        const remainingSlots = 42 - totalDaysRendered;
        for (let day = 1; day <= remainingSlots; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day other-month';
            dayElement.textContent = day;
            calendarDaysElement.appendChild(dayElement);
        }
    }

    function renderEvents() {
        if (!eventsTitleElement || !eventListElement) return;
        const dateKey = getDateKey(selectedDate);
        eventsTitleElement.textContent = `Eventos para ${formatDate(selectedDate)}`;
        
        const personalDayEvents = (personalEvents[dateKey] || []).map((e, index) => ({...e, tag: 'personal', originalIndex: index }));
        const classDayEvents = userHasCode ? (classEvents[dateKey] || []).map(e => ({...e, tag: 'class'})) : [];
        const allEvents = [...classDayEvents, ...personalDayEvents];

        if (allEvents.length === 0) {
            eventListElement.innerHTML = `<p style="text-align: center; width: 100%;">Nenhum evento para esta data.</p>`;
        } else {
            eventListElement.innerHTML = allEvents.map(event => `
                <div class="event-card" data-index="${event.originalIndex}">
                    <div class="event-tag ${event.tag}">${event.tag === 'personal' ? 'Pessoal' : 'Turma'}</div>
                    ${event.eventType ? `<div class="event-type">${event.eventType}</div>` : ''}
                    <div class="event-title">${event.title}</div>
                    ${event.description ? `<div class="event-desc">${event.description}</div>` : ''}
                    
                    ${event.tag === 'personal' ? `
                    <div class="event-card-footer">
                        <button class="event-action-btn edit" title="Editar Evento">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="event-action-btn delete" title="Excluir Evento">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                    ` : ''}
                </div>
            `).join('');
        }
        lucide.createIcons();
        addEventListenersToEventActions();
    }

    // --- FUNÇÕES DE AÇÃO (EDITAR E EXCLUIR) ---

    function addEventListenersToEventActions() {
        document.querySelectorAll('.event-action-btn.delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.event-card');
                const index = parseInt(card.dataset.index, 10);
                const dateKey = getDateKey(selectedDate);
                openConfirmModal(dateKey, index);
            });
        });

        document.querySelectorAll('.event-action-btn.edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.event-card');
                const index = parseInt(card.dataset.index, 10);
                const dateKey = getDateKey(selectedDate);
                openEditModal(dateKey, index);
            });
        });
    }

    function deleteEvent(dateKey, index) {
        personalEvents[dateKey].splice(index, 1);
        if (personalEvents[dateKey].length === 0) {
            delete personalEvents[dateKey];
        }
        localStorage.setItem('personalEvents', JSON.stringify(personalEvents));
        renderCalendar();
        renderEvents();
    }

    function openEditModal(dateKey, index) {
        editingEvent = { dateKey, index };
        const event = personalEvents[dateKey][index];
        document.querySelector('#event-modal .modal-header h4').textContent = 'Editar Evento';
        document.getElementById('event-title-input').value = event.title;
        document.getElementById('event-date').value = dateKey;
        document.getElementById('event-type').value = event.eventType;
        document.getElementById('event-desc').value = event.description;
        document.querySelector('#event-modal .btn-save').textContent = 'Salvar Alterações';
        modal.classList.add('show');
    }

    function openConfirmModal(dateKey, index) {
        eventToDelete = { dateKey, index };
        const event = personalEvents[dateKey][index];
        if (confirmModalText) confirmModalText.textContent = `Tem certeza que deseja excluir o evento "${event.title}"?`;
        if (confirmModal) confirmModal.classList.add('show');
    }

    function closeConfirmModal() {
        if (confirmModal) confirmModal.classList.remove('show');
    }

    function handleDelete() {
        if (!eventToDelete) return;
        const { dateKey, index } = eventToDelete;
        deleteEvent(dateKey, index);
        closeConfirmModal();
    }

    // --- EVENT LISTENERS GERAIS ---
    const prevMonthBtn = document.getElementById('prev-month');
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        renderEvents();
    });

    const nextMonthBtn = document.getElementById('next-month');
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        renderEvents();
    });

    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) addEventBtn.addEventListener('click', () => {
        editingEvent = null;
        eventForm.reset();
        document.querySelector('#event-modal .modal-header h4').textContent = 'Novo Evento';
        document.querySelector('#event-modal .btn-save').textContent = 'Adicionar';
        document.getElementById('event-date').value = getDateKey(selectedDate);
        modal.classList.add('show');
    });

    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('show'));
    
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    if (eventForm) eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('event-title-input').value;
        const date = document.getElementById('event-date').value;
        const eventType = document.getElementById('event-type').value;
        const description = document.getElementById('event-desc').value;
        const newEvent = { title, eventType, description };

        if (editingEvent) {
            const { dateKey, index } = editingEvent;
            if (dateKey !== date) {
                personalEvents[dateKey].splice(index, 1);
                if (personalEvents[dateKey].length === 0) delete personalEvents[dateKey];
                if (!personalEvents[date]) personalEvents[date] = [];
                personalEvents[date].push(newEvent);
            } else {
                personalEvents[dateKey][index] = newEvent;
            }
        } else {
            if (!personalEvents[date]) personalEvents[date] = [];
            personalEvents[date].push(newEvent);
        }

        localStorage.setItem('personalEvents', JSON.stringify(personalEvents));
        modal.classList.remove('show');
        const [year, month, day] = date.split('-');
        selectedDate = new Date(year, month - 1, day);
        currentDate = new Date(year, month - 1, 1);
        renderCalendar();
        renderEvents();
    });
    
    if(closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
    if(cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeConfirmModal);
    if(confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDelete);
    if(confirmModal) confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirmModal(); });

    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // CORREÇÃO: LÓGICA DO MENU DE PERFIL AGORA DENTRO DO DOMCONTENTLOADED
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const profileMenuContainer = document.getElementById('profile-menu-container');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileMenuContainer && profileMenuButton && profileDropdown) {
        profileMenuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        window.addEventListener('click', function(event) {
            if (!profileMenuContainer.contains(event.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    function initialize() {
        if (userHasCode) loadClassEvents();
        renderCalendar();
        renderEvents();
    }
    initialize();
});

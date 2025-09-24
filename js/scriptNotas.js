document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os ícones da biblioteca Lucide
    lucide.createIcons();

    // --- ELEMENTOS DO DOM ---
    const newNoteBtn = document.getElementById('newNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const closeModalBtn = document.getElementById('closeModal');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const notesContainer = document.getElementById('notesContainer');
    const searchInput = document.getElementById('searchInput');
    const modalTitle = document.getElementById('modalTitle');
    const noteTitleInput = document.getElementById('noteTitleInput');
    const noteContentInput = document.getElementById('noteContentInput');
    const deleteModal = document.getElementById("deleteModal");

    // --- VARIÁVEIS DE ESTADO ---
    let notes = [];
    let isEditing = false;
    let editingNoteId = null;
    let noteToDelete = null;

    // --- FUNÇÕES DE DADOS ---
    function loadNotes() {
        const storedNotes = localStorage.getItem('notes');
        notes = storedNotes ? JSON.parse(storedNotes) : [];
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E UI ---
    function createNoteHTML(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note-card');
        noteElement.setAttribute('data-id', note.id);

        const previewContent = note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content;
        const formattedContent = previewContent.replace(/\n/g, '  ');

        noteElement.innerHTML = `
            <div>
                <h3 class="note-title">${note.title}</h3>
                <span class="note-date">Criada em: ${note.date}</span>
                <div class="note-content"><p>${formattedContent}</p></div>
            </div>
            <div class="note-actions">
                <button class="action-btn edit-btn" title="Editar"><i data-lucide="pencil"></i></button>
                <button class="action-btn delete-btn" title="Excluir"><i data-lucide="trash-2"></i></button>
            </div>
        `;

        noteElement.querySelector('.edit-btn').addEventListener('click', () => openEditModal(note.id));
        noteElement.querySelector('.delete-btn').addEventListener('click', () => openDeleteConfirmation(note.id));

        return noteElement;
    }

    function renderNotes(filter = '') {
        notesContainer.innerHTML = '';
        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(filter.toLowerCase()) ||
            note.content.toLowerCase().includes(filter.toLowerCase())
        ).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        if (filteredNotes.length === 0) {
            notesContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; width: 100%;">Nenhuma nota encontrada.</p>`;
            return;
        }

        filteredNotes.forEach(note => {
            const noteHTML = createNoteHTML(note);
            notesContainer.appendChild(noteHTML);
        });

        lucide.createIcons();
    }

    // --- FUNÇÕES DO MODAL (CRIAR/EDITAR) ---
    function openNewModal() {
        isEditing = false;
        editingNoteId = null;
        modalTitle.textContent = 'Nova Nota';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteModal.classList.add('show');
    }

    function openEditModal(id) {
        isEditing = true;
        editingNoteId = id;
        modalTitle.textContent = 'Editar Nota';
        const note = notes.find(n => n.id === id);
        if (!note) return;

        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        noteModal.classList.add('show');
    }

    function closeModal() {
        noteModal.classList.remove('show');
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!title) {
            alert('Por favor, insira um título para a nota.');
            return;
        }

        const date = new Date();

        if (isEditing) {
            const noteIndex = notes.findIndex(n => n.id === editingNoteId);
            if (noteIndex === -1) return;
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
            notes[noteIndex].date = formatDate(date);
            notes[noteIndex].rawDate = date.toISOString();
        } else {
            const newNote = {
                id: generateId(),
                title: title,
                content: content,
                date: formatDate(date),
                rawDate: date.toISOString()
            };
            notes.push(newNote);
        }

        saveNotes();
        renderNotes(searchInput.value.trim());
        closeModal();
    }

    // --- FUNÇÕES DO MODAL (EXCLUIR) ---
    function openDeleteConfirmation(id) {
        noteToDelete = id;
        deleteModal.classList.add("show");
    }

    function confirmDelete() {
        if (noteToDelete) {
            notes = notes.filter(note => note.id !== noteToDelete);
            saveNotes();
            renderNotes(searchInput.value.trim());
            closeDeleteModal();
        }
    }

    function closeDeleteModal() {
        noteToDelete = null;
        deleteModal.classList.remove("show");
    }

    // --- FUNÇÕES AUXILIARES ---
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function formatDate(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const M = String(date.getMonth() + 1).padStart(2, '0');
        const Y = date.getFullYear();
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${d}/${M}/${Y} às ${h}:${m}`;
    }

    // --- EVENT LISTENERS ---
    newNoteBtn.addEventListener('click', openNewModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
    searchInput.addEventListener('input', () => renderNotes(searchInput.value.trim()));

    document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);
    document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteModal);
    document.getElementById("closeDeleteModal").addEventListener("click", closeDeleteModal);

    window.addEventListener('click', (event) => {
        if (event.target === noteModal) closeModal();
        if (event.target === deleteModal) closeDeleteModal();
    });

    // --- LÓGICA DO MENU DE PERFIL NA SIDEBAR ---
    const profileMenuContainer = document.getElementById('profile-menu-container');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileMenuContainer && profileMenuButton && profileDropdown) {
        profileMenuButton.addEventListener('click', function (event) {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        window.addEventListener('click', function (event) {
            if (!profileMenuContainer.contains(event.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    loadNotes();
    renderNotes();
});

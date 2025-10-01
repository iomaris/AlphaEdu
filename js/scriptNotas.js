// =======================================================================
// 1. SETUP DO FIREBASE
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
// 2. ELEMENTOS DO DOM E ESTADO DA APLICAÇÃO
// =======================================================================
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

let currentUser = null;
let notes = {};
let isEditing = false;
let editingNoteId = null;
let noteToDeleteId = null;

// =======================================================================
// 3. FUNÇÕES DE DADOS
// =======================================================================

async function loadNotes() {
    if (!currentUser) return;
    const notesRef = ref(db, `users/${currentUser.uid}/notes`);
    try {
        const snapshot = await get(notesRef);
        notes = snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.error("Erro ao carregar notas:", error);
        notes = {};
    }
}

async function saveNoteToFirebase(noteId, noteData) {
    if (!currentUser) return;
    const noteRef = ref(db, `users/${currentUser.uid}/notes/${noteId}`);
    await set(noteRef, noteData);
}

async function deleteNoteFromFirebase(noteId) {
    if (!currentUser) return;
    const noteRef = ref(db, `users/${currentUser.uid}/notes/${noteId}`);
    await remove(noteRef);
}

// =======================================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO E UI
// =======================================================================



function renderNotes(filter = '') {
    notesContainer.innerHTML = '';
    const notesArray = Object.values(notes);
    const filteredNotes = notesArray.filter(note =>
        note.title.toLowerCase().includes(filter.toLowerCase()) ||
        note.content.toLowerCase().includes(filter.toLowerCase())
    ).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = `<p class="no-notes-message">Nenhuma nota encontrada.</p>`;
        return;
    }
    filteredNotes.forEach(note => {
        const noteHTML = createNoteHTML(note);
        notesContainer.appendChild(noteHTML);
    });
    lucide.createIcons();
}

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
    const note = notes[id];
    if (!note) return;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteModal.classList.add('show');
}

function closeModal() { noteModal.classList.remove('show'); }

function openDeleteConfirmation(id) {
    noteToDeleteId = id;
    deleteModal.classList.add("show");
}

function closeDeleteModal() {
    noteToDeleteId = null;
    deleteModal.classList.remove("show");
}

function generateId() { return `note_${Date.now()}`; }
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).format(date).replace(',', ' às');
}

// =======================================================================
// 5. EVENT LISTENERS
// =======================================================================

newNoteBtn.addEventListener('click', openNewModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
searchInput.addEventListener('input', () => renderNotes(searchInput.value.trim()));

saveNoteBtn.addEventListener('click', async () => {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (!title) { alert('Por favor, insira um título para a nota.'); return; }
    const date = new Date();
    const noteId = isEditing ? editingNoteId : generateId();
    const noteData = {
        id: noteId,
        title: title,
        content: content,
        date: formatDate(date),
        rawDate: date.toISOString()
    };
    notes[noteId] = noteData;
    await saveNoteToFirebase(noteId, noteData);
    renderNotes(searchInput.value.trim());
    closeModal();
});

document.getElementById("confirmDeleteBtn").addEventListener('click', async () => {
    if (noteToDeleteId) {
        await deleteNoteFromFirebase(noteToDeleteId);
        delete notes[noteToDeleteId];
        renderNotes(searchInput.value.trim());
        closeDeleteModal();
    }
});

document.getElementById("cancelDeleteBtn").addEventListener('click', closeDeleteModal);
document.getElementById("closeDeleteModal").addEventListener('click', closeDeleteModal);

window.addEventListener('click', (event) => {
    if (event.target === noteModal) closeModal();
    if (event.target === deleteModal) closeDeleteModal();
});

const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');
if (profileMenuContainer) {
    profileMenuButton.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('show'); });
    window.addEventListener('click', (e) => { if (!profileMenuContainer.contains(e.target)) profileDropdown.classList.remove('show'); });
}

// =======================================================================
// 6. INICIALIZAÇÃO
// =======================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        lucide.createIcons();
        loadNotes();
        renderNotes();
    } else {
        // CORREÇÃO DEFINITIVA: O nome do arquivo agora está com "L" maiúsculo
        window.location.href = 'Login.html';
    }
});

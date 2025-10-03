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
// 2. ELEMENTOS DO DOM E ESTADO DA APLICAÇÃO (Sua lógica original, mantida)
// =======================================================================
lucide.createIcons();

const collectionsGrid = document.getElementById('collections-grid');
const addCollectionBtn = document.getElementById('add-collection-btn');
const searchInput = document.getElementById('search-input');
const collectionModal = document.getElementById('collection-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const collectionForm = document.getElementById('collection-form');
const modalTitle = document.getElementById('modal-title');
const collectionNameInput = document.getElementById('collection-name');
const collectionDescriptionInput = document.getElementById('collection-description');
const confirmModal = document.getElementById('confirm-delete-modal');

let currentUser = null; // (Adicionado)
let collections = {}; // Modificado para objeto, para se alinhar ao Firebase
let editingCollectionId = null;
let collectionToDeleteId = null;

// =======================================================================
// 3. FUNÇÕES DE DADOS (Modificadas para usar Firebase)
// =======================================================================

/**
 * Carrega as coleções do usuário a partir do Firebase.
 */
async function loadCollectionsFromFirebase() {
    if (!currentUser) return;
    const collectionsRef = ref(db, `users/${currentUser.uid}/flashcardCollections`);
    try {
        const snapshot = await get(collectionsRef);
        collections = snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.error("Erro ao carregar coleções:", error);
        collections = {};
    }
    renderCollections(); // Renderiza as coleções após carregar
}

/**
 * Salva o objeto de coleções completo do usuário no Firebase.
 */
async function saveCollectionsToFirebase() {
    if (!currentUser) return;
    const collectionsRef = ref(db, `users/${currentUser.uid}/flashcardCollections`);
    try {
        await set(collectionsRef, collections);
    } catch (error) {
        console.error("Erro ao salvar coleções:", error);
    }
}

// =======================================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO E MODAL (Sua lógica original, com pequenas adaptações)
// =======================================================================

function renderCollections(filter = '') {
    // Sua função de renderização está perfeita. Apenas adaptamos para lidar com um objeto em vez de um array.
    collectionsGrid.innerHTML = '';
    const collectionsArray = Object.values(collections); // Converte o objeto para array para filtrar e mapear

    const filteredCollections = collectionsArray.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(filter.toLowerCase()))
    );

    if (filteredCollections.length === 0) {
        collectionsGrid.innerHTML = '<p class="no-collections-message">Nenhuma coleção encontrada. Crie uma nova para começar!</p>';
        return;
    }

    filteredCollections.forEach(collection => {
        const card = document.createElement('div');
        card.className = 'collection-card';
        card.dataset.id = collection.id;
        const cardCount = collection.cards ? Object.keys(collection.cards).length : 0;

        card.innerHTML = `
            <div>
                <h4>${collection.name}</h4>
                <p>${collection.description || 'Sem descrição.'}</p>
            </div>
            <div class="card-footer">
                <span class="card-info">${cardCount} flashcards</span>
                <div class="card-actions">
                    <a href="flashcards.html?collection=${collection.id}" class="study-btn">Estudar</a>
                    <button class="edit-btn" title="Editar Coleção"><i data-lucide="edit"></i></button>
                    <button class="delete-btn" title="Excluir Coleção"><i data-lucide="trash-2"></i></button>
                </div>
            </div>`;
        collectionsGrid.appendChild(card);
    });
    lucide.createIcons();
}

// Suas funções de modal estão perfeitas e foram mantidas.
function openCollectionModal(collection = null) {
    if (collection) {
        editingCollectionId = collection.id;
        modalTitle.textContent = 'Editar Coleção';
        collectionNameInput.value = collection.name;
        collectionDescriptionInput.value = collection.description;
    } else {
        editingCollectionId = null;
        modalTitle.textContent = 'Nova Coleção';
        collectionForm.reset();
    }
    collectionModal.classList.add('show');
}

function closeCollectionModal() { collectionModal.classList.remove('show'); }

function openConfirmModal(collectionId) {
    collectionToDeleteId = collectionId;
    const collectionKey = Object.keys(collections).find(key => collections[key].id === collectionId);
    const collectionName = collections[collectionKey].name;
    confirmModal.querySelector('#confirm-modal-text').textContent = `Tem certeza que deseja excluir a coleção "${collectionName}"? Todos os seus flashcards serão perdidos.`;
    confirmModal.classList.add('show');
}

function closeConfirmModal() { confirmModal.classList.remove('show'); }

// =======================================================================
// 5. EVENT LISTENERS (Modificados para usar Firebase)
// =======================================================================

addCollectionBtn?.addEventListener('click', () => openCollectionModal());
closeModalBtn?.addEventListener('click', closeCollectionModal);
cancelBtn?.addEventListener('click', closeCollectionModal);
collectionModal?.addEventListener('click', (e) => { if (e.target === collectionModal) closeCollectionModal(); });

collectionForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = collectionNameInput.value.trim();
    const description = collectionDescriptionInput.value.trim();
    if (!name) { alert('O nome da coleção é obrigatório.'); return; }

    if (editingCollectionId) {
        const collectionKey = Object.keys(collections).find(key => collections[key].id === editingCollectionId);
        collections[collectionKey].name = name;
        collections[collectionKey].description = description;
    } else {
        const newCollectionId = `col_${Date.now()}`;
        const newCollection = { id: newCollectionId, name, description, cards: {} }; // Inicia com 'cards' vazio
        collections[newCollectionId] = newCollection;
    }
    
    await saveCollectionsToFirebase();
    renderCollections(searchInput.value);
    closeCollectionModal();
});

collectionsGrid?.addEventListener('click', (e) => {
    const editButton = e.target.closest('.edit-btn');
    const deleteButton = e.target.closest('.delete-btn');
    
    if (editButton) {
        const card = editButton.closest('.collection-card');
        const collectionId = card.dataset.id;
        const collectionKey = Object.keys(collections).find(key => collections[key].id === collectionId);
        openCollectionModal(collections[collectionKey]);
    }
    
    if (deleteButton) {
        const card = deleteButton.closest('.collection-card');
        const collectionId = card.dataset.id;
        openConfirmModal(collectionId);
    }
});

searchInput?.addEventListener('input', () => renderCollections(searchInput.value));

document.getElementById('close-confirm-modal-btn')?.addEventListener('click', closeConfirmModal);
document.getElementById('cancel-delete-btn')?.addEventListener('click', closeConfirmModal);
confirmModal?.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirmModal(); });

document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    const collectionKey = Object.keys(collections).find(key => collections[key].id === collectionToDeleteId);
    delete collections[collectionKey];
    await saveCollectionsToFirebase();
    renderCollections(searchInput.value);
    closeConfirmModal();
});

// Sua lógica de menu de perfil, mantida intacta
const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');
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
        loadCollectionsFromFirebase(); // Ponto de entrada principal
    } else {
        window.location.href = 'Login.html';
    }
});

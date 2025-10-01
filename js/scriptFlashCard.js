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

const front = document.getElementById("card-front");
const back = document.getElementById("card-back");
const flashcard = document.getElementById("flashcard");
const tagsContainer = document.getElementById("tags");
const counter = document.getElementById("counter");
const cardModal = document.getElementById("modal");
const cardForm = document.getElementById("card-form");
const modalTitle = document.getElementById("modal-title");
const modalPergunta = document.getElementById("modal-pergunta");
const modalResposta = document.getElementById("modal-resposta");
const modalTags = document.getElementById("modal-tags");
const saveBtn = document.getElementById("save");
const confirmModal = document.getElementById('confirm-delete-modal');

let currentUser = null; // (Adicionado)
let allCollections = [];
let currentCollection = null;
let currentCards = [];
let currentIndex = 0;
let isEditMode = false;
let editingCardKey = null; // Modificado de index para key
let cardToDeleteKey = null; // Modificado de index para key

// =======================================================================
// 3. FUNÇÕES DE DADOS (Modificadas para usar Firebase)
// =======================================================================

/**
 * Carrega todas as coleções do usuário a partir do Firebase.
 */
async function loadDataFromFirebase() {
    if (!currentUser) return;
    const collectionsRef = ref(db, `users/${currentUser.uid}/flashcardCollections`);
    try {
        const snapshot = await get(collectionsRef);
        allCollections = snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
        console.error("Erro ao carregar coleções:", error);
        allCollections = [];
    }
    
    // O resto da sua lógica de encontrar a coleção atual permanece
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get('collection');
    
    if (collectionId) {
        // A estrutura do Firebase é um objeto, então precisamos encontrar pelo ID
        const collectionKey = Object.keys(allCollections).find(key => allCollections[key].id === collectionId);
        currentCollection = collectionKey ? allCollections[collectionKey] : null;
    }
    
    if (currentCollection) {
        // Os cards podem ser um objeto ou um array, normalizamos para array
        currentCards = currentCollection.cards ? Object.values(currentCollection.cards) : [];
        document.querySelector('.banner h3').textContent = currentCollection.name;
        document.querySelector('.banner p').textContent = currentCollection.description || 'Revise os flashcards desta coleção.';
    } else {
        // Sua lógica de "coleção não encontrada" é perfeita e foi mantida
        const contentElements = document.querySelectorAll('.toolbar, .flashcard-container, .tags, .counter, .controls');
        contentElements.forEach(el => el.style.display = 'none');
        document.querySelector('.banner').innerHTML = `
            <i data-lucide="alert-circle"></i>
            <h3>Coleção não encontrada</h3>
            <p>A coleção que você está tentando acessar não existe ou foi removida.</p>`;
        lucide.createIcons();
        return;
    }
    renderCard();
}

/**
 * Salva todas as coleções do usuário no Firebase.
 */
async function saveAllCollectionsToFirebase() {
    if (!currentUser) return;
    const collectionsRef = ref(db, `users/${currentUser.uid}/flashcardCollections`);
    try {
        await set(collectionsRef, allCollections);
    } catch (error) {
        console.error("Erro ao salvar coleções:", error);
    }
}

// =======================================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO E MODAL (Sua lógica original, mantida)
// =======================================================================

function renderCard() {
    // Sua função renderCard original está perfeita. Nenhuma alteração necessária.
    if (!front || !back) return;
    if (currentCards.length === 0) {
        front.textContent = "Nenhum flashcard nesta coleção.";
        back.textContent = "Clique em 'Novo Flashcard' para começar.";
        tagsContainer.innerHTML = "";
        counter.textContent = "0 / 0";
        return;
    }
    const card = currentCards[currentIndex];
    front.textContent = card.pergunta;
    back.textContent = card.resposta;
    tagsContainer.innerHTML = (card.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
    counter.textContent = `${currentIndex + 1} / ${currentCards.length}`;
}

function openCardModal(card = null, key = null) {
    // Modificado para usar a 'key' do Firebase em vez do 'index'
    if (card) {
        isEditMode = true;
        editingCardKey = key;
        modalTitle.textContent = "Editar Flashcard";
        modalPergunta.value = card.pergunta;
        modalResposta.value = card.resposta;
        modalTags.value = (card.tags || []).join(", ");
        saveBtn.textContent = "Salvar Alterações";
    } else {
        isEditMode = false;
        editingCardKey = null;
        modalTitle.textContent = "Novo Flashcard";
        cardForm.reset();
        saveBtn.textContent = "Criar Flashcard";
    }
    cardModal.classList.add("show");
}

function closeCardModal() { cardModal.classList.remove("show"); }
function openConfirmModal(key) {
    cardToDeleteKey = key;
    confirmModal.querySelector('#confirm-modal-text').textContent = `Tem certeza que deseja excluir este flashcard?`;
    confirmModal.classList.add('show');
}
function closeConfirmModal() { confirmModal.classList.remove('show'); }

// =======================================================================
// 5. EVENT LISTENERS (Modificados para usar Firebase)
// =======================================================================

// A maioria dos seus listeners não precisa de alteração
flashcard?.addEventListener("click", () => flashcard.classList.toggle("is-flipped"));
document.getElementById("add")?.addEventListener("click", () => openCardModal());
document.getElementById("cancel")?.addEventListener("click", closeCardModal);
document.getElementById("close-modal-btn")?.addEventListener("click", closeCardModal);
cardModal?.addEventListener("click", (e) => { if (e.target === cardModal) closeCardModal(); });
document.getElementById("prev")?.addEventListener("click", () => { if (currentCards.length > 0) { currentIndex = (currentIndex - 1 + currentCards.length) % currentCards.length; flashcard.classList.remove("is-flipped"); renderCard(); } });
document.getElementById("next")?.addEventListener("click", () => { if (currentCards.length > 0) { currentIndex = (currentIndex + 1) % currentCards.length; flashcard.classList.remove("is-flipped"); renderCard(); } });
document.getElementById("shuffle")?.addEventListener("click", () => { if (currentCards.length > 1) { let oldIndex = currentIndex; while (currentIndex === oldIndex) { currentIndex = Math.floor(Math.random() * currentCards.length); } flashcard.classList.remove("is-flipped"); renderCard(); } });

// Listener de Editar (modificado para passar a key)
document.getElementById("edit")?.addEventListener("click", () => {
    if (currentCards.length > 0) {
        const cardKey = Object.keys(currentCollection.cards || {})[currentIndex];
        openCardModal(currentCards[currentIndex], cardKey);
    }
});

// Listener de Excluir (modificado para passar a key)
document.getElementById("delete")?.addEventListener("click", () => {
    if (currentCards.length > 0) {
        const cardKey = Object.keys(currentCollection.cards || {})[currentIndex];
        openConfirmModal(cardKey);
    }
});

// Listener do Formulário (modificado para usar Firebase)
cardForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pergunta = modalPergunta.value.trim();
    const resposta = modalResposta.value.trim();
    const tags = modalTags.value.split(",").map(t => t.trim()).filter(t => t !== "");
    if (!pergunta || !resposta) { alert("Por favor, preencha a pergunta e a resposta."); return; }

    const collectionKey = Object.keys(allCollections).find(key => allCollections[key].id === currentCollection.id);
    if (!allCollections[collectionKey].cards) {
        allCollections[collectionKey].cards = {};
    }

    if (isEditMode) {
        allCollections[collectionKey].cards[editingCardKey] = { pergunta, resposta, tags };
    } else {
        const newCardKey = `card_${Date.now()}`;
        allCollections[collectionKey].cards[newCardKey] = { pergunta, resposta, tags };
        // Atualiza o índice para mostrar o novo card
        currentCards = Object.values(allCollections[collectionKey].cards);
        currentIndex = currentCards.length - 1;
    }
    
    await saveAllCollectionsToFirebase();
    closeCardModal();
    flashcard?.classList.remove("is-flipped");
    // Recarrega os dados para garantir consistência
    await loadDataFromFirebase();
});

// Listener de Confirmação de Exclusão (modificado para usar Firebase)
document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    const collectionKey = Object.keys(allCollections).find(key => allCollections[key].id === currentCollection.id);
    delete allCollections[collectionKey].cards[cardToDeleteKey];
    
    await saveAllCollectionsToFirebase();
    
    if (currentIndex >= Object.keys(allCollections[collectionKey].cards || {}).length) {
        currentIndex = Math.max(0, Object.keys(allCollections[collectionKey].cards || {}).length - 1);
    }
    
    flashcard?.classList.remove("is-flipped");
    closeConfirmModal();
    await loadDataFromFirebase(); // Recarrega para mostrar o estado atual
});

document.getElementById('close-confirm-modal-btn')?.addEventListener('click', closeConfirmModal);
document.getElementById('cancel-delete-btn')?.addEventListener('click', closeConfirmModal);
confirmModal?.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirmModal(); });

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
        loadDataFromFirebase(); // Ponto de entrada principal
    } else {
        window.location.href = 'Login.html';
    }
});

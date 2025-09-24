document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // --- ELEMENTOS DO DOM ---
    const front = document.getElementById("card-front");
    const back = document.getElementById("card-back");
    const flashcard = document.getElementById("flashcard");
    const tagsContainer = document.getElementById("tags");
    const counter = document.getElementById("counter");
    
    // Modal de Criar/Editar
    const cardModal = document.getElementById("modal");
    const cardForm = document.getElementById("card-form");
    const modalTitle = document.getElementById("modal-title");
    const modalPergunta = document.getElementById("modal-pergunta");
    const modalResposta = document.getElementById("modal-resposta");
    const modalTags = document.getElementById("modal-tags");
    const saveBtn = document.getElementById("save");
    const cancelCardBtn = document.getElementById("cancel");
    const closeModalBtn = document.getElementById("close-modal-btn");

    // Modal de Confirmação
    const confirmModal = document.getElementById('confirm-delete-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // --- ESTADO DA APLICAÇÃO ---
    let allCollections = [];
    let currentCollection = null;
    let currentCards = [];
    let currentIndex = 0;
    let isEditMode = false;
    let editingCardIndex = -1;
    let cardToDeleteIndex = -1;

    // --- FUNÇÕES ---
    function loadData() {
        const urlParams = new URLSearchParams(window.location.search);
        const collectionId = urlParams.get('collection');
        const storedCollections = localStorage.getItem('flashcard_collections');
        allCollections = storedCollections ? JSON.parse(storedCollections) : [];
        
        if (collectionId) {
            currentCollection = allCollections.find(c => c.id === collectionId);
        }
        
        if (currentCollection) {
            currentCards = currentCollection.cards;
            document.querySelector('.banner h3').textContent = currentCollection.name;
            document.querySelector('.banner p').textContent = currentCollection.description || 'Revise os flashcards desta coleção.';
        } else {
            const contentElements = document.querySelectorAll('.toolbar, .flashcard-container, .tags, .counter, .controls');
            contentElements.forEach(el => el.style.display = 'none');
            const banner = document.querySelector('.banner');
            banner.innerHTML = `
                <i data-lucide="alert-circle"></i>
                <h3>Coleção não encontrada</h3>
                <p>A coleção que você está tentando acessar não existe ou foi removida.</p>
            `;
            lucide.createIcons();
            return;
        }
        renderCard();
    }

    function saveAllCollections() {
        localStorage.setItem('flashcard_collections', JSON.stringify(allCollections));
    }

    function renderCard() {
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

    function openCardModal(card = null, index = -1) {
        if (card) {
            isEditMode = true;
            editingCardIndex = index;
            modalTitle.textContent = "Editar Flashcard";
            modalPergunta.value = card.pergunta;
            modalResposta.value = card.resposta;
            modalTags.value = (card.tags || []).join(", ");
            saveBtn.textContent = "Salvar Alterações";
        } else {
            isEditMode = false;
            editingCardIndex = -1;
            modalTitle.textContent = "Novo Flashcard";
            cardForm.reset();
            saveBtn.textContent = "Criar Flashcard";
        }
        cardModal.classList.add("show");
    }

    function closeCardModal() {
        cardModal.classList.remove("show");
    }

    function openConfirmModal(index) {
        cardToDeleteIndex = index;
        confirmModalText.textContent = `Tem certeza que deseja excluir este flashcard?`;
        confirmModal.classList.add('show');
    }

    function closeConfirmModal() {
        confirmModal.classList.remove('show');
    }

    function handleDelete() {
        currentCards.splice(cardToDeleteIndex, 1);
        if (currentIndex >= currentCards.length) {
            currentIndex = Math.max(0, currentCards.length - 1);
        }
        saveAllCollections();
        if (flashcard) flashcard.classList.remove("is-flipped");
        renderCard();
        closeConfirmModal();
    }

    // --- EVENT LISTENERS ---
    if (flashcard) flashcard.addEventListener("click", () => flashcard.classList.toggle("is-flipped"));
    
    const addBtn = document.getElementById("add");
    if (addBtn) addBtn.addEventListener("click", () => openCardModal());
    
    if (cancelCardBtn) cancelCardBtn.addEventListener("click", closeCardModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeCardModal);
    if (cardModal) cardModal.addEventListener("click", (e) => { if (e.target === cardModal) closeCardModal(); });

    const prevBtn = document.getElementById("prev");
    if(prevBtn) prevBtn.addEventListener("click", () => { if (currentCards.length > 0) { currentIndex = (currentIndex - 1 + currentCards.length) % currentCards.length; flashcard.classList.remove("is-flipped"); renderCard(); } });
    
    const nextBtn = document.getElementById("next");
    if(nextBtn) nextBtn.addEventListener("click", () => { if (currentCards.length > 0) { currentIndex = (currentIndex + 1) % currentCards.length; flashcard.classList.remove("is-flipped"); renderCard(); } });

    const shuffleBtn = document.getElementById("shuffle");
    if(shuffleBtn) shuffleBtn.addEventListener("click", () => { if (currentCards.length > 1) { let oldIndex = currentIndex; while (currentIndex === oldIndex) { currentIndex = Math.floor(Math.random() * currentCards.length); } flashcard.classList.remove("is-flipped"); renderCard(); } });

    const editBtn = document.getElementById("edit");
    if(editBtn) editBtn.addEventListener("click", () => { if (currentCards.length > 0) { openCardModal(currentCards[currentIndex], currentIndex); } });

    const deleteBtn = document.getElementById("delete");
    if(deleteBtn) deleteBtn.addEventListener("click", () => { if (currentCards.length > 0) { openConfirmModal(currentIndex); } });

    if (cardForm) {
        cardForm.addEventListener("submit", (event) => {
            event.preventDefault(); 
            const pergunta = modalPergunta.value.trim();
            const resposta = modalResposta.value.trim();
            const tags = modalTags.value.split(",").map(t => t.trim()).filter(t => t !== "");
            if (!pergunta || !resposta) { alert("Por favor, preencha a pergunta e a resposta."); return; }
            if (isEditMode) {
                currentCards[editingCardIndex] = { pergunta, resposta, tags };
            } else {
                currentCards.push({ pergunta, resposta, tags });
                currentIndex = currentCards.length - 1;
            }
            saveAllCollections();
            closeCardModal();
            if (flashcard) flashcard.classList.remove("is-flipped");
            renderCard();
        });
    }

    if(closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
    if(cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeConfirmModal);
    if(confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDelete);
    if(confirmModal) confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirmModal(); });

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
    loadData();
});

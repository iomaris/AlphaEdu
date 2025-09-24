document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // --- ELEMENTOS DO DOM ---
    const collectionsGrid = document.getElementById('collections-grid');
    const addCollectionBtn = document.getElementById('add-collection-btn');
    const searchInput = document.getElementById('search-input');

    // Modal de Criar/Editar Coleção
    const collectionModal = document.getElementById('collection-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const collectionForm = document.getElementById('collection-form');
    const modalTitle = document.getElementById('modal-title');
    const collectionNameInput = document.getElementById('collection-name');
    const collectionDescriptionInput = document.getElementById('collection-description');

    // Modal de Confirmação
    const confirmModal = document.getElementById('confirm-delete-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // --- ESTADO DA APLICAÇÃO ---
    let collections = [];
    let editingCollectionId = null;
    let collectionToDeleteId = null;

    // --- FUNÇÕES ---
    function loadCollections() {
        const storedCollections = localStorage.getItem('flashcard_collections');
        collections = storedCollections ? JSON.parse(storedCollections) : [];
        renderCollections();
    }

    function saveCollections() {
        localStorage.setItem('flashcard_collections', JSON.stringify(collections));
    }

    function renderCollections(filter = '') {
        collectionsGrid.innerHTML = '';
        const filteredCollections = collections.filter(c => 
            c.name.toLowerCase().includes(filter.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(filter.toLowerCase()))
        );

        if (filteredCollections.length === 0) {
            collectionsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center;">Nenhuma coleção encontrada. Crie uma nova para começar!</p>';
            return;
        }

        filteredCollections.forEach(collection => {
            const card = document.createElement('div');
            card.className = 'collection-card';
            card.dataset.id = collection.id;
            card.innerHTML = `
                <div>
                    <h4>${collection.name}</h4>
                    <p>${collection.description || 'Sem descrição.'}</p>
                </div>
                <div class="card-footer">
                    <span class="card-info">${collection.cards.length} flashcards</span>
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

    function closeCollectionModal() {
        collectionModal.classList.remove('show');
    }

    function openConfirmModal(collectionId) {
        collectionToDeleteId = collectionId;
        const collection = collections.find(c => c.id === collectionId);
        confirmModalText.textContent = `Tem certeza que deseja excluir a coleção "${collection.name}"? Todos os seus flashcards serão perdidos.`;
        confirmModal.classList.add('show');
    }

    function closeConfirmModal() {
        confirmModal.classList.remove('show');
    }

    function handleDelete() {
        collections = collections.filter(c => c.id !== collectionToDeleteId);
        saveCollections();
        renderCollections(searchInput.value);
        closeConfirmModal();
    }

    // --- EVENT LISTENERS ---
    addCollectionBtn.addEventListener('click', () => openCollectionModal());
    closeModalBtn.addEventListener('click', closeCollectionModal);
    cancelBtn.addEventListener('click', closeCollectionModal);
    collectionModal.addEventListener('click', (e) => { if (e.target === collectionModal) closeCollectionModal(); });

    collectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = collectionNameInput.value.trim();
        const description = collectionDescriptionInput.value.trim();
        if (!name) { alert('O nome da coleção é obrigatório.'); return; }

        if (editingCollectionId) {
            const collection = collections.find(c => c.id === editingCollectionId);
            collection.name = name;
            collection.description = description;
        } else {
            const newCollection = { id: `c${Date.now()}`, name, description, cards: [] };
            collections.push(newCollection);
        }
        
        saveCollections();
        renderCollections(searchInput.value);
        closeCollectionModal();
    });

    collectionsGrid.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');
        
        if (editButton) {
            const card = editButton.closest('.collection-card');
            const collectionId = card.dataset.id;
            const collection = collections.find(c => c.id === collectionId);
            openCollectionModal(collection);
        }
        
        if (deleteButton) {
            const card = deleteButton.closest('.collection-card');
            const collectionId = card.dataset.id;
            openConfirmModal(collectionId);
        }
    });
    
    searchInput.addEventListener('input', () => renderCollections(searchInput.value));

    closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
    cancelDeleteBtn.addEventListener('click', closeConfirmModal);
    confirmDeleteBtn.addEventListener('click', handleDelete);
    confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirmModal(); });

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
    loadCollections();
});

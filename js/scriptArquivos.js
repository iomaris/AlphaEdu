document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // --- SELETORES DE ELEMENTOS ---
    const addFileBtn = document.getElementById('addFileBtn');
    const fileModal = document.getElementById('fileModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const fileForm = document.getElementById('fileForm');
    const filesContainer = document.getElementById('filesContainer');
    const fileInput = document.getElementById('fileInput');
    const fileNameEl = document.getElementById('fileName');
    
    // Seletores do Modal de Exclusão
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // ✅ CORREÇÃO 2: Seletores do Menu de Perfil
    const profileMenuContainer = document.getElementById('profile-menu-container');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    let fileToDelete = null;

    // --- FUNÇÕES DO MODAL ---
    const showModal = (modal) => modal.style.display = 'flex';
    const hideModal = (modal) => modal.style.display = 'none';

    addFileBtn.addEventListener('click', () => {
        fileForm.reset();
        fileNameEl.textContent = 'Clique para selecionar um arquivo PDF';
        document.getElementById('modalTitle').textContent = 'Adicionar Novo Arquivo';
        showModal(fileModal);
    });

    closeModal.addEventListener('click', () => hideModal(fileModal));
    cancelBtn.addEventListener('click', () => hideModal(fileModal));
    fileModal.addEventListener('click', (e) => {
        if (e.target === fileModal) hideModal(fileModal);
    });

    // --- LÓGICA DO INPUT DE ARQUIVO ---
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameEl.textContent = fileInput.files[0].name;
        } else {
            fileNameEl.textContent = 'Clique para selecionar um arquivo PDF';
        }
    });

    // --- LÓGICA DE SALVAR E RENDERIZAR ---
    const getFiles = () => JSON.parse(localStorage.getItem('savedFiles')) || [];
    const saveFiles = (files) => localStorage.setItem('savedFiles', JSON.stringify(files));

    // ✅ CORREÇÃO 1: Função para abrir o arquivo em nova aba
    const openFile = (fileId) => {
        const files = getFiles();
        const fileToOpen = files.find(file => file.id == fileId);
        if (fileToOpen && fileToOpen.fileData) {
            // Converte a string Base64 de volta para um formato que o navegador pode abrir
            const byteCharacters = atob(fileToOpen.fileData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } else {
            alert('Não foi possível encontrar os dados do arquivo.');
        }
    };

    const renderFiles = () => {
        const files = getFiles();
        filesContainer.innerHTML = '';
        if (files.length === 0) {
            filesContainer.innerHTML = '<p class="empty-message" style="color: var(--text-muted); grid-column: 1 / -1; text-align: center;">Nenhum arquivo salvo. Clique em "Adicionar Arquivo" para começar.</p>';
            return;
        }

        files.forEach(file => {
            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            fileCard.dataset.id = file.id;
            // Adiciona um cursor de ponteiro para indicar que é clicável
            fileCard.style.cursor = 'pointer';

            fileCard.innerHTML = `
                <div class="file-card-header">
                    <i data-lucide="file-text"></i>
                    <div>
                        <h4 class="file-title">${file.title}</h4>
                    </div>
                </div>
                <p class="file-description">${file.description || 'Sem descrição.'}</p>
                <div class="file-meta">
                    <span class="file-date">Salvo em: ${new Date(file.id).toLocaleDateString('pt-BR')}</span>
                    <div class="file-actions">
                        <button class="delete-btn" data-id="${file.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
            
            // ✅ CORREÇÃO 1: Adiciona o evento de clique no card para abrir o arquivo
            fileCard.addEventListener('click', (e) => {
                // Impede que o clique no botão de deletar também abra o arquivo
                if (!e.target.closest('.delete-btn')) {
                    openFile(file.id);
                }
            });

            filesContainer.appendChild(fileCard);
        });
        lucide.createIcons();
    };

    fileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const files = getFiles();
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor, selecione um arquivo.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file); // Lê o arquivo como uma string Base64
        reader.onload = () => {
            const newFile = {
                id: new Date().getTime(),
                title: document.getElementById('fileTitleInput').value,
                description: document.getElementById('fileDescriptionInput').value,
                fileName: file.name,
                fileData: reader.result // ✅ CORREÇÃO 1: Salva o conteúdo do arquivo
            };
            
            saveFiles([newFile, ...files]);
            renderFiles();
            hideModal(fileModal);
        };
    });

    // --- LÓGICA DE EXCLUSÃO ---
    filesContainer.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            e.stopPropagation(); // Impede que o evento de clique se propague para o card
            fileToDelete = deleteButton.dataset.id;
            showModal(deleteModal);
        }
    });

    confirmDeleteBtn.addEventListener('click', () => {
        let files = getFiles();
        files = files.filter(file => file.id != fileToDelete);
        saveFiles(files);
        renderFiles();
        hideModal(deleteModal);
        fileToDelete = null;
    });

    closeDeleteModal.addEventListener('click', () => hideModal(deleteModal));
    cancelDeleteBtn.addEventListener('click', () => hideModal(deleteModal));
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) hideModal(deleteModal);
    });

    // ✅ CORREÇÃO 2: Lógica do Menu de Perfil
    if (profileMenuContainer && profileMenuButton && profileDropdown) {
        profileMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        window.addEventListener('click', (event) => {
            if (!profileMenuContainer.contains(event.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // --- PONTO DE PARTIDA ---
    renderFiles();
});

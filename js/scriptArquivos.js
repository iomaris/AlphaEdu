// =======================================================================
// 1. SETUP DO FIREBASE (Adicionado Storage)
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref as dbRef, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyC02F-Ka3ftBr4k-uNzUU3d7znjMgQ-zdk",
    authDomain: "alphaedu-60ef2.firebaseapp.com",
    databaseURL: "https://alphaedu-60ef2-default-rtdb.firebaseio.com",
    projectId: "alphaedu-60ef2",
    storageBucket: "alphaedu-60ef2.appspot.com", // Essencial para o Storage
    messagingSenderId: "850593200345",
    appId: "1:850593200345:web:abf53a5b5cd6c255f4e6c8"
};

const app = initializeApp(firebaseConfig );
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// =======================================================================
// 2. ELEMENTOS DO DOM E ESTADO (Sua lógica original, mantida)
// =======================================================================
const addFileBtn = document.getElementById('addFileBtn');
const fileModal = document.getElementById('fileModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const fileForm = document.getElementById('fileForm');
const filesContainer = document.getElementById('filesContainer');
const fileInput = document.getElementById('fileInput');
const fileNameEl = document.getElementById('fileName');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

let currentUser = null;
let filesMetadata = {}; // Armazena os metadados dos arquivos
let fileToDeleteId = null;

// =======================================================================
// 3. FUNÇÕES DE DADOS (Modificadas para usar Firebase Storage e Realtime DB)
// =======================================================================

async function loadFilesMetadata() {
    if (!currentUser) return;
    const filesRef = dbRef(db, `users/${currentUser.uid}/files`);
    try {
        const snapshot = await get(filesRef);
        filesMetadata = snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.error("Erro ao carregar metadados dos arquivos:", error);
        filesMetadata = {};
    }
    renderFiles();
}

// =======================================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO E UI (Sua lógica original, com pequenas adaptações)
// =======================================================================

const showModal = (modal) => modal.style.display = 'flex';
const hideModal = (modal) => modal.style.display = 'none';

function renderFiles() {
    filesContainer.innerHTML = '';
    const filesArray = Object.values(filesMetadata);

    if (filesArray.length === 0) {
        filesContainer.innerHTML = '<p class="empty-message">Nenhum arquivo salvo. Clique em "Adicionar Arquivo" para começar.</p>';
        return;
    }

    filesArray.sort((a, b) => b.id - a.id).forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.dataset.id = file.id;
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
        
        fileCard.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-btn')) {
                window.open(file.downloadURL, '_blank');
            }
        });
        filesContainer.appendChild(fileCard);
    });
    lucide.createIcons();
}

// =======================================================================
// 5. EVENT LISTENERS (Modificados para usar Firebase)
// =======================================================================

addFileBtn.addEventListener('click', () => {
    fileForm.reset();
    fileNameEl.textContent = 'Clique para selecionar um arquivo PDF';
    document.getElementById('modalTitle').textContent = 'Adicionar Novo Arquivo';
    showModal(fileModal);
});

closeModal.addEventListener('click', () => hideModal(fileModal));
cancelBtn.addEventListener('click', () => hideModal(fileModal));
fileModal.addEventListener('click', (e) => { if (e.target === fileModal) hideModal(fileModal); });

fileInput.addEventListener('change', () => {
    fileNameEl.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'Clique para selecionar um arquivo PDF';
});

fileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const file = fileInput.files[0];
    const title = document.getElementById('fileTitleInput').value;
    if (!file || !title) {
        alert('Por favor, selecione um arquivo e forneça um título.');
        return;
    }

    const saveButton = document.getElementById('saveFileBtn');
    saveButton.disabled = true;
    saveButton.textContent = 'Enviando...';

    try {
        const fileId = Date.now();
        const filePath = `userFiles/${currentUser.uid}/${fileId}_${file.name}`;
        const fileStorageRef = storageRef(storage, filePath);

        // 1. Faz o upload do arquivo para o Cloud Storage
        const uploadResult = await uploadBytes(fileStorageRef, file);
        
        // 2. Pega a URL de download do arquivo
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // 3. Cria os metadados para salvar no Realtime Database
        const fileMetadata = {
            id: fileId,
            title: title,
            description: document.getElementById('fileDescriptionInput').value,
            fileName: file.name,
            filePath: filePath, // Caminho no Storage para futura exclusão
            downloadURL: downloadURL,
            createdAt: new Date().toISOString()
        };

        // 4. Salva os metadados no Realtime Database
        const fileDbRef = dbRef(db, `users/${currentUser.uid}/files/${fileId}`);
        await set(fileDbRef, fileMetadata);

        // 5. Atualiza a UI
        filesMetadata[fileId] = fileMetadata;
        renderFiles();
        hideModal(fileModal);

    } catch (error) {
        console.error("Erro ao salvar arquivo:", error);
        alert("Ocorreu um erro ao salvar o arquivo. Tente novamente.");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar';
    }
});

filesContainer.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        e.stopPropagation();
        fileToDeleteId = deleteButton.dataset.id;
        showModal(deleteModal);
    }
});

confirmDeleteBtn.addEventListener('click', async () => {
    if (!fileToDeleteId || !currentUser) return;

    try {
        const fileMeta = filesMetadata[fileToDeleteId];
        if (!fileMeta) throw new Error("Metadados do arquivo não encontrados.");

        // 1. Deleta o arquivo do Cloud Storage
        const fileStorageRef = storageRef(storage, fileMeta.filePath);
        await deleteObject(fileStorageRef);

        // 2. Deleta os metadados do Realtime Database
        const fileDbRef = dbRef(db, `users/${currentUser.uid}/files/${fileToDeleteId}`);
        await remove(fileDbRef);

        // 3. Atualiza a UI
        delete filesMetadata[fileToDeleteId];
        renderFiles();
        hideModal(deleteModal);

    } catch (error) {
        console.error("Erro ao excluir arquivo:", error);
        // Mesmo se falhar em deletar do storage, remove da lista para o usuário
        delete filesMetadata[fileToDeleteId];
        renderFiles();
        hideModal(deleteModal);
        alert("Não foi possível excluir o arquivo do armazenamento, mas ele foi removido da sua lista.");
    } finally {
        fileToDeleteId = null;
    }
});

closeDeleteModal.addEventListener('click', () => hideModal(deleteModal));
cancelDeleteBtn.addEventListener('click', () => hideModal(deleteModal));
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) hideModal(deleteModal); });

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
        loadFilesMetadata();
    } else {
        window.location.href = 'Login.html';
    }
});

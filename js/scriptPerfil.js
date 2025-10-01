// =======================================================================
// 1. SETUP DO FIREBASE (Adicionado)
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
// 2. ELEMENTOS DO DOM E ESTADO (Sua lógica original, adaptada)
// =======================================================================
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const profilePasswordInput = document.getElementById('profile-password');
const saveButton = document.querySelector('.btn-save');

const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

let currentUser = null;
let userData = {};

// =======================================================================
// 3. FUNÇÕES DE DADOS (Adicionadas para usar Firebase)
// =======================================================================

/**
 * Carrega os dados do perfil do usuário e preenche o formulário.
 */
async function loadProfileData() {
    if (!currentUser) return;

    // Preenche o e-mail (que não muda)
    profileEmailInput.value = currentUser.email;

    // Busca os dados do Realtime Database (como o nome)
    const userRef = ref(db, `users/${currentUser.uid}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            userData = snapshot.val();
            profileNameInput.value = userData.username || '';
            
            // Atualiza o menu de perfil também
            profileDropdown.querySelector('.username').textContent = userData.username || 'Usuário';
            profileDropdown.querySelector('.email').textContent = currentUser.email;
            profileMenuButton.querySelector('.profile-avatar').textContent = (userData.username || 'U').substring(0, 2).toUpperCase();
        }
    } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
    }
}

// =======================================================================
// 4. EVENT LISTENERS (Modificados para usar Firebase)
// =======================================================================

profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';

    const newName = profileNameInput.value.trim();
    const newPassword = profilePasswordInput.value.trim();
    
    try {
        // 1. Atualiza o nome de usuário no Realtime Database
        if (newName && newName !== userData.username) {
            const userDbRef = ref(db, `users/${currentUser.uid}`);
            await update(userDbRef, { username: newName });
        }

        // 2. Atualiza a senha no Firebase Auth (se uma nova foi digitada)
        if (newPassword) {
            if (newPassword.length < 6) {
                alert("A nova senha deve ter no mínimo 6 caracteres.");
                throw new Error("Senha muito curta.");
            }
            await updatePassword(currentUser, newPassword);
            profilePasswordInput.value = ''; // Limpa o campo após o sucesso
        }

        alert("Perfil atualizado com sucesso!");
        await loadProfileData(); // Recarrega os dados para garantir que a UI esteja atualizada

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("Esta é uma operação sensível. Por favor, faça login novamente antes de alterar sua senha.");
            window.location.href = 'Login.html';
        } else {
            alert("Ocorreu um erro ao salvar as alterações.");
        }
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar Alterações';
    }
});

// Sua lógica de menu de perfil, mantida intacta
if (profileMenuContainer) {
    profileMenuButton.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('show'); });
    window.addEventListener('click', (e) => { if (!profileMenuContainer.contains(e.target)) profileDropdown.classList.remove('show'); });
}

// =======================================================================
// 5. INICIALIZAÇÃO (Modificada para usar Firebase)
// =======================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        lucide.createIcons();
        loadProfileData(); // Carrega os dados do usuário ao entrar na página
    } else {
        window.location.href = 'Login.html';
    }
});

// =======================================================================
// 1. SETUP DO FIREBASE (Adicionado)
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
// 2. ELEMENTOS DO DOM E ESTADO (Sua lógica original, mantida)
// =======================================================================
const darkModeToggle = document.getElementById('dark-mode-toggle');
const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
const deleteAccountBtn = document.querySelector('.btn-danger');

const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

let currentUser = null;

// =======================================================================
// 3. FUNÇÕES DE DADOS (Adicionadas para usar Firebase)
// =======================================================================

/**
 * Carrega todas as configurações do usuário do Firebase e atualiza a UI.
 */
async function loadUserSettings() {
    if (!currentUser) return;
    const settingsRef = ref(db, `users/${currentUser.uid}/settings`);
    try {
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
            const settings = snapshot.val();
            
            // Atualiza o toggle de Modo Escuro
            darkModeToggle.checked = settings.theme === 'dark';
            applyTheme(settings.theme);

            // Atualiza o toggle de Notificações
            // Se a configuração não existir, o padrão é 'true' (marcado)
            emailNotificationsToggle.checked = settings.notifications?.email !== false;

        } else {
            // Valores padrão se não houver configurações salvas
            darkModeToggle.checked = false;
            applyTheme('light');
            emailNotificationsToggle.checked = true;
        }
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
    }
}

/**
 * Salva uma configuração específica no Firebase.
 * Ex: saveUserSetting('theme', 'dark');
 * Ex: saveUserSetting('notifications/email', false);
 */
async function saveUserSetting(path, value) {
    if (!currentUser) return;
    const settingRef = ref(db, `users/${currentUser.uid}/settings/${path}`);
    try {
        await set(settingRef, value);
    } catch (error) {
        console.error(`Erro ao salvar configuração '${path}':`, error);
    }
}

/**
 * Aplica o tema (dark/light) ao corpo do documento.
 */
function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
}

// =======================================================================
// 4. EVENT LISTENERS (Modificados para usar Firebase)
// =======================================================================

// Listener para o toggle de Modo Escuro
darkModeToggle?.addEventListener('change', () => {
    const theme = darkModeToggle.checked ? 'dark' : 'light';
    applyTheme(theme);
    saveUserSetting('theme', theme);
});

// Listener para o toggle de Notificações por E-mail
emailNotificationsToggle?.addEventListener('change', () => {
    const wantsNotifications = emailNotificationsToggle.checked;
    saveUserSetting('notifications/email', wantsNotifications);
});

// Listener para o botão de Excluir Conta
deleteAccountBtn?.addEventListener('click', async () => {
    const confirmation = prompt("Esta ação é IRREVERSÍVEL. Você perderá todos os seus dados (notas, arquivos, etc).\n\nPara confirmar, digite 'EXCLUIR' na caixa abaixo.");
    
    if (confirmation === 'EXCLUIR') {
        if (!currentUser) {
            alert("Erro: Usuário não encontrado. Faça login novamente.");
            return;
        }
        
        try {
            // 1. Exclui todos os dados do usuário do Realtime Database
            const userDbRef = ref(db, `users/${currentUser.uid}`);
            await remove(userDbRef);
            
            // 2. Exclui o usuário do sistema de autenticação do Firebase
            // Esta é a parte mais crítica.
            await deleteUser(currentUser);
            
            alert("Sua conta foi excluída com sucesso. Você será redirecionado.");
            window.location.href = 'inicial.html';

        } catch (error) {
            console.error("Erro ao excluir conta:", error);
            alert("Ocorreu um erro ao excluir sua conta. Pode ser necessário fazer login novamente para completar esta ação. Se o erro persistir, contate o suporte.");
            // Erros comuns aqui incluem 'auth/requires-recent-login'
        }
    } else {
        alert("Ação cancelada. Sua conta não foi excluída.");
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
        loadUserSettings(); // Carrega as configurações do usuário ao entrar na página
    } else {
        window.location.href = 'Login.html';
    }
});

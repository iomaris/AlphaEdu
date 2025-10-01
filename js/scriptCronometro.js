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
// 2. ELEMENTOS DO DOM E ESTADO (Sua lógica original, mantida)
// =======================================================================
lucide.createIcons();

const pomodoroMinutesEl = document.getElementById("pomodoro-minutes");
const pomodoroSecondsEl = document.getElementById("pomodoro-seconds");
const customMinutesEl = document.getElementById("custom-minutes");
const customSecondsEl = document.getElementById("custom-seconds");
const customMinutesInput = document.getElementById("custom-minutes-input");
const customSecondsInput = document.getElementById("custom-seconds-input");
const pomodoroLengthInput = document.getElementById("pomodoro-length");

let currentUser = null; // (Adicionado)

// --- LÓGICA DO POMODORO (Sua lógica original, com pequenas adaptações) ---
let pomodoroInterval;
let pomodoroTime = 25 * 60; // Valor padrão
let pomodoroRemaining = pomodoroTime;

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroRemaining / 60).toString().padStart(2, '0');
    const seconds = (pomodoroRemaining % 60).toString().padStart(2, '0');
    pomodoroMinutesEl.textContent = minutes;
    pomodoroSecondsEl.textContent = seconds;
}

window.startPomodoro = function() {
    if (pomodoroInterval) return;
    pomodoroInterval = setInterval(() => {
        if (pomodoroRemaining > 0) {
            pomodoroRemaining--;
            updatePomodoroDisplay();
        } else {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            alert("Pomodoro finalizado! Hora de uma pausa.");
        }
    }, 1000);
}

window.pausePomodoro = function() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
}

window.resetPomodoro = function() {
    pausePomodoro();
    pomodoroRemaining = pomodoroTime;
    updatePomodoroDisplay();
}

// --- LÓGICA DO TEMPORIZADOR (Sua lógica original, mantida intacta) ---
let customInterval;
let customRemaining = 0;

function updateCustomDisplay() {
    const minutes = Math.floor(customRemaining / 60).toString().padStart(2, '0');
    const seconds = (customRemaining % 60).toString().padStart(2, '0');
    customMinutesEl.textContent = minutes;
    customSecondsEl.textContent = seconds;
}

window.startCustomTimer = function() {
    if (customInterval) return;
    if (customRemaining === 0) {
        const min = parseInt(customMinutesInput.value) || 0;
        const sec = parseInt(customSecondsInput.value) || 0;
        customRemaining = min * 60 + sec;
    }
    if (!customRemaining) return;
    customInterval = setInterval(() => {
        if (customRemaining > 0) {
            customRemaining--;
            updateCustomDisplay();
        } else {
            clearInterval(customInterval);
            customInterval = null;
            alert("Tempo finalizado!");
        }
    }, 1000);
}

window.pauseCustomTimer = function() {
    clearInterval(customInterval);
    customInterval = null;
}

window.resetCustomTimer = function() {
    pauseCustomTimer();
    customRemaining = 0;
    customMinutesInput.value = '';
    customSecondsInput.value = '';
    updateCustomDisplay();
}

// =======================================================================
// 3. FUNÇÕES DE DADOS (Adicionadas para usar Firebase)
// =======================================================================

/**
 * Carrega as configurações do cronômetro do usuário a partir do Firebase.
 */
async function loadUserSettings() {
    if (!currentUser) return;
    const settingsRef = ref(db, `users/${currentUser.uid}/settings/pomodoro`);
    try {
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
            const settings = snapshot.val();
            pomodoroTime = (settings.duration || 25) * 60;
            pomodoroLengthInput.value = settings.duration || 25;
        } else {
            // Se não houver configurações salvas, usa o padrão
            pomodoroLengthInput.value = 25;
            pomodoroTime = 25 * 60;
        }
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        pomodoroLengthInput.value = 25; // Usa o padrão em caso de erro
        pomodoroTime = 25 * 60;
    }
    // Inicializa o display com o tempo correto
    resetPomodoro();
}

/**
 * Salva a duração do Pomodoro no Firebase.
 */
async function savePomodoroDuration(duration) {
    if (!currentUser) return;
    const settingsRef = ref(db, `users/${currentUser.uid}/settings/pomodoro`);
    try {
        await set(settingsRef, { duration: duration });
        alert("Configurações salvas com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        alert("Não foi possível salvar as configurações.");
    }
}

// =======================================================================
// 4. EVENT LISTENERS (Sua lógica original, com uma adaptação)
// =======================================================================

// Função de aplicar configurações adaptada para usar Firebase
window.applySettings = function() {
    const length = parseInt(pomodoroLengthInput.value) || 25;
    pomodoroTime = length * 60;
    resetPomodoro();
    savePomodoroDuration(length); // Salva a configuração no Firebase
}

// Sua lógica de controle de abas, mantida intacta
const tabPomodoro = document.getElementById("tab-pomodoro");
const tabTimer = document.getElementById("tab-timer");
const pomodoroTab = document.getElementById("pomodoro-tab");
const timerTab = document.getElementById("timer-tab");
const settings = document.getElementById("pomodoro-settings");

tabPomodoro.addEventListener("click", () => {
    pomodoroTab.classList.add("active");
    timerTab.classList.remove("active");
    tabPomodoro.classList.add("active");
    tabTimer.classList.remove("active");
    settings.classList.remove("hidden");
});

tabTimer.addEventListener("click", () => {
    pomodoroTab.classList.remove("active");
    timerTab.classList.add("active");
    tabPomodoro.classList.remove("active");
    tabTimer.classList.add("active");
    settings.classList.add("hidden");
});

// Sua lógica de menu de perfil, mantida intacta
const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

if (profileMenuContainer && profileMenuButton && profileDropdown) {
    profileMenuButton.addEventListener('click', function(event) {
        event.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
    window.addEventListener('click', function(event) {
        if (!profileMenuContainer.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
}

// =======================================================================
// 5. INICIALIZAÇÃO (Modificada para usar Firebase)
// =======================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadUserSettings(); // Carrega as configurações do usuário
        updateCustomDisplay(); // Inicializa o temporizador customizado
    } else {
        window.location.href = 'Login.html';
    }
});

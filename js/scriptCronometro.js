
lucide.createIcons();

// --- LÓGICA DO POMODORO ---
let pomodoroInterval;
let pomodoroTime = 25 * 60;
let pomodoroRemaining = pomodoroTime;

function updatePomodoroDisplay() {
  const minutes = Math.floor(pomodoroRemaining / 60).toString().padStart(2, '0');
  const seconds = (pomodoroRemaining % 60).toString().padStart(2, '0');
  document.getElementById("pomodoro-minutes").textContent = minutes;
  document.getElementById("pomodoro-seconds").textContent = seconds;
}

function startPomodoro() {
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

function pausePomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
}

function resetPomodoro() {
  pausePomodoro();
  pomodoroRemaining = pomodoroTime;
  updatePomodoroDisplay();
}

function applySettings() {
  const length = parseInt(document.getElementById("pomodoro-length").value) || 25;
  pomodoroTime = length * 60;
  resetPomodoro(); // Reseta para aplicar a nova duração
  alert("Configurações aplicadas!");
}

// --- LÓGICA DO TEMPORIZADOR ---
let customInterval;
let customRemaining = 0;

function updateCustomDisplay() {
  const minutes = Math.floor(customRemaining / 60).toString().padStart(2, '0');
  const seconds = (customRemaining % 60).toString().padStart(2, '0');
  document.getElementById("custom-minutes").textContent = minutes;
  document.getElementById("custom-seconds").textContent = seconds;
}

function startCustomTimer() {
  if (customInterval) return;

  // Pega o valor dos inputs apenas se o timer estiver zerado
  if (customRemaining === 0) {
    const min = parseInt(document.getElementById("custom-minutes-input").value) || 0;
    const sec = parseInt(document.getElementById("custom-seconds-input").value) || 0;
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

function pauseCustomTimer() {
  clearInterval(customInterval);
  customInterval = null;
}

function resetCustomTimer() {
  pauseCustomTimer();
  customRemaining = 0;
  document.getElementById("custom-minutes-input").value = '';
  document.getElementById("custom-seconds-input").value = '';
  updateCustomDisplay();
}

// --- CONTROLE DAS ABAS ---
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

// Inicializar
updatePomodoroDisplay();
updateCustomDisplay();
/* ======================================================= */
/* ===== CÓDIGO PARA ADICIONAR EM TODOS OS ARQUIVOS JS ===== */
/* ======================================================= */

// --- LÓGICA DO MENU DE PERFIL NA SIDEBAR ---
const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

// Verifica se os elementos existem na página antes de adicionar os eventos
if (profileMenuContainer && profileMenuButton && profileDropdown) {
    
    profileMenuButton.addEventListener('click', function(event) {
        // Impede que o clique no botão feche o menu imediatamente
        event.stopPropagation(); 
        profileDropdown.classList.toggle('show');
    });

    // Fecha o dropdown se o usuário clicar em qualquer outro lugar da tela
    window.addEventListener('click', function(event) {
        // Verifica se o clique não foi dentro do menu
        if (!profileMenuContainer.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
}

// Não se esqueça de chamar lucide.createIcons() para que os ícones funcionem
lucide.createIcons();

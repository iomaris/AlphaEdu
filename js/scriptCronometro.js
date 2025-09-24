document.addEventListener('DOMContentLoaded', function() {
  // Inicializa os ícones assim que a página carrega
  lucide.createIcons();

  // --- SELETORES GLOBAIS ---
  const pomodoroMinutesEl = document.getElementById("pomodoro-minutes");
  const pomodoroSecondsEl = document.getElementById("pomodoro-seconds");
  const customMinutesEl = document.getElementById("custom-minutes");
  const customSecondsEl = document.getElementById("custom-seconds");
  const customMinutesInput = document.getElementById("custom-minutes-input");
  const customSecondsInput = document.getElementById("custom-seconds-input");
  const pomodoroLengthInput = document.getElementById("pomodoro-length");

  // --- LÓGICA DO POMODORO ---
  let pomodoroInterval;
  let pomodoroTime = 25 * 60;
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

  window.applySettings = function() {
    const length = parseInt(pomodoroLengthInput.value) || 25;
    pomodoroTime = length * 60;
    resetPomodoro();
    alert("Configurações aplicadas!");
  }

  // --- LÓGICA DO TEMPORIZADOR ---
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

  // --- LÓGICA DO MENU DE PERFIL NA SIDEBAR ---
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

  // --- INICIALIZAÇÃO ---
  updatePomodoroDisplay();
  updateCustomDisplay();
});

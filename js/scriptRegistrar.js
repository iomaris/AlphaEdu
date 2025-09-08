
const tabs = document.querySelectorAll('.tab');
const underline = document.querySelector('.underline');

function moveUnderline(element) {
  underline.style.width = element.offsetWidth + "px";
  underline.style.left = element.offsetLeft + "px";
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    moveUnderline(tab);
  });
});

// posição inicial
window.addEventListener('load', () => {
  const activeTab = document.querySelector('.tab.active');
  moveUnderline(activeTab);
});

(function () {
  // evita executar o mesmo bloco duas vezes (se por acaso foi inserido duplicado)
  if (window.__alphaTabsInitialized) return;
  window.__alphaTabsInitialized = true;

  document.addEventListener('DOMContentLoaded', () => {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const underline = document.querySelector('.underline');
    if (!underline || tabs.length === 0) return;

    function moveUnderline(element) {
      underline.style.width = element.offsetWidth + 'px';
      underline.style.left = element.offsetLeft + 'px';
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        moveUnderline(tab);

        // redirecionamento suave (opcional)
        const target = tab.dataset.target; // "entrar" ou "inscrever"
        if (target === 'entrar' || target === 'inscrever') {
          // aguarda a animação terminar antes de mudar de página
          setTimeout(() => {
            if (target === 'entrar') window.location.href = 'Login.html';
            else if (target === 'inscrever') window.location.href = 'Registrar.html';
          }, 300);
        }
      });
    });

    // posiciona underline inicialmente (usa tab .active ou a primeira)
    const initial = document.querySelector('.tab.active') || tabs[0];
    moveUnderline(initial);

    // ajusta underline quando a janela é redimensionada
    window.addEventListener('resize', () => {
      const activeTab = document.querySelector('.tab.active') || tabs[0];
      if (activeTab) moveUnderline(activeTab);
    });
  });
})();
document.addEventListener('DOMContentLoaded', function () {

  // --- 1. LÓGICA PARA PREENCHER DATA DE NASCIMENTO ---
  const diaSelect = document.getElementById('dia');
  const mesSelect = document.getElementById('mes');
  const anoSelect = document.getElementById('ano');

  // Preencher dias (1 a 31)
  for (let i = 1; i <= 31; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    diaSelect.appendChild(option);
  }

  // Preencher meses
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  meses.forEach((mes, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = mes;
    mesSelect.appendChild(option);
  });

  // Preencher anos (do ano atual até 1900)
  const anoAtual = new Date().getFullYear();
  for (let i = anoAtual; i >= 1900; i--) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    anoSelect.appendChild(option);
  }

  // --- 2. LÓGICA DE VALIDAÇÃO DO FORMULÁRIO ---
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    // Validação de senha forte (exemplo: mínimo 8 caracteres)
    if (senha.length < 8) {
      alert('A senha deve ter no mínimo 8 caracteres.');
      return; // Interrompe a execução
    }

    // Validação de confirmação de senha
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem. Por favor, verifique.');
      return; // Interrompe a execução
    }

    // Se tudo estiver correto, pode prosseguir com o envio
    alert('Cadastro realizado com sucesso!');
    // registerForm.submit(); // Descomente esta linha para enviar o formulário de verdade
  });

  // --- 3. LÓGICA DAS ABAS (TABS) ---
  const tabs = document.querySelectorAll('.tab');
  const underline = document.querySelector('.underline');

  function updateUnderline(activeTab) {
    if (activeTab) {
      underline.style.width = `${activeTab.offsetWidth}px`;
      underline.style.left = `${activeTab.offsetLeft}px`;
    }
  }

  const initialActiveTab = document.querySelector('.tab.active');
  updateUnderline(initialActiveTab);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      if (target === 'entrar') {
        window.location.href = 'Login.html';
      }
    });
  });
});



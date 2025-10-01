// Pega os elementos da página uma única vez
const tabs = document.querySelectorAll('.tab');
const underline = document.querySelector('.underline');

/**
 * Função para mover a linha de sublinhado para baixo da aba ativa.
 * @param {HTMLElement} element - A aba que deve ser sublinhada.
 */
function moveUnderline(element) {
  // Garante que os elementos existem antes de tentar manipulá-los
  if (underline && element) {
    underline.style.width = element.offsetWidth + "px";
    underline.style.left = element.offsetLeft + "px";
  }
}

// Adiciona o evento de clique para cada aba
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Pega o destino a partir do atributo data-target
    const destino = tab.getAttribute("data-target");

    // Redireciona para a página correta com o nome de arquivo CORRETO
    if (destino === "entrar") {
      // Se já estiver na página de login, não faz nada.
      // Se precisar, pode redirecionar para 'login.html' para garantir.
      window.location.href = "login.html";
    } else if (destino === "inscrever") {
      // CORREÇÃO: Usar "Registrar.html" com 'R' maiúsculo
      window.location.href = "Registrar.html";
    }
  });
});

// Define a posição inicial da "underline" assim que a página carrega
window.addEventListener('load', () => {
  const activeTab = document.querySelector('.tab.active');
  moveUnderline(activeTab);
});

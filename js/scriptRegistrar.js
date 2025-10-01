
document.addEventListener("DOMContentLoaded", function () {
  
  const tabs = document.querySelectorAll(".tab");
  const underline = document.querySelector(".underline");

  // Apenas continua se os elementos das abas existirem
  if (!underline || tabs.length === 0) {
    return;
  }

  // Função para mover a linha sublinhada para a aba ativa
  function moveUnderline(activeTab) {
    if (activeTab) {
      underline.style.width = `${activeTab.offsetWidth}px`;
      underline.style.left = `${activeTab.offsetLeft}px`;
    }
  }

  // Adiciona o evento de clique para cada aba
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");
      
      // Se clicar na aba "Entrar", redireciona para a página de login
      if (target === "entrar") {
        window.location.href = "Login.html";
      }
    });
  });

  // Posiciona a linha sublinhada na aba ativa inicial
  const initialActiveTab = document.querySelector(".tab.active");
  moveUnderline(initialActiveTab);

  // Reposiciona a linha caso a janela seja redimensionada
  window.addEventListener("resize", () => {
    const activeTab = document.querySelector(".tab.active");
    moveUnderline(activeTab);
  });
});



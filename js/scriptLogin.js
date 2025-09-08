
const tabs = document.querySelectorAll('.tab');
const underline = document.querySelector('.underline');

function moveUnderline(element) {
  underline.style.width = element.offsetWidth + "px";
  underline.style.left = element.offsetLeft + "px";
}

// adiciona evento de clique
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    moveUnderline(tab);

    // redirecionamento conforme o data-target
    // redirecionamento conforme o data-target
    const destino = tab.getAttribute("data-target");
    if (destino === "entrar") {
      window.location.href = "login.html";
    } else if (destino === "inscrever") {
      window.location.href = "registrar.html";
    }

  });
});

// posição inicial da underline
window.addEventListener('load', () => {
  const activeTab = document.querySelector('.tab.active');
  moveUnderline(activeTab);
});

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

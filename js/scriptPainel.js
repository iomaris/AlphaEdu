
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os \u00edcones
    lucide.createIcons();

    // --- L\u00d3GICA DO MODAL PARA PARTICIPAR DA TURMA ---

    // Seleciona os elementos do DOM
    const openModalBtn = document.getElementById('openJoinModalBtn');
    const closeModalBtn = document.getElementById('closeJoinModalBtn');
    const modal = document.getElementById('joinClassModal');
    const joinForm = document.getElementById('joinClassForm');
    const codeInput = document.getElementById('class-code-input');

    // Fun\u00e7\u00e3o para abrir o modal
    function openModal() {
        modal.classList.add('show');
    }

    // Fun\u00e7\u00e3o para fechar o modal
    function closeModal() {
        modal.classList.remove('show');
    }
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os ícones
    lucide.createIcons();

    // --- LÓGICA DO MODAL PARA PARTICIPAR DA TURMA ---

    // Seleciona os elementos do DOM
    const openModalBtn = document.getElementById('openJoinModalBtn');
    const closeModalBtn = document.getElementById('closeJoinModalBtn');
    const modal = document.getElementById('joinClassModal');
    const joinForm = document.getElementById('joinClassForm');
    const codeInput = document.getElementById('class-code-input');

    // Função para abrir o modal
    function openModal() {
        modal.classList.add('show');
    }

    // Função para fechar o modal
    function closeModal() {
        modal.classList.remove('show');
    }

    // Adiciona os eventos de clique
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Fecha o modal se o usuário clicar fora do conteúdo
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Lógica para quando o formulário do modal for enviado
    joinForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio da página
        const classCode = codeInput.value.trim();

        if (classCode) {
            alert(`Tentando participar da turma com o código: ${classCode}`);
            // Aqui você adicionaria a lógica para enviar o código ao servidor
            closeModal(); // Fecha o modal após a tentativa
        } else {
            alert('Por favor, insira um código de turma.');
        }
    });
});

    // Adiciona os eventos de clique
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Fecha o modal se o usu\u00e1rio clicar fora do conte\u00fado
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // L\u00f3gica para quando o formul\u00e1rio do modal for enviado
    joinForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio da p\u00e1gina
        const classCode = codeInput.value.trim();

        if (classCode) {
            alert(`Tentando participar da turma com o c\u00f3digo: ${classCode}`);
            // Aqui voc\u00ea adicionaria a l\u00f3gica para enviar o c\u00f3digo ao servidor
            closeModal(); // Fecha o modal ap\u00f3s a tentativa
        } else {
            alert('Por favor, insira um c\u00f3digo de turma.');
        }
    });
});

// --- LÓGICA DO MENU DE PERFIL ---
const profileMenuContainer = document.getElementById('profile-menu-container');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileDropdown = document.getElementById('profile-dropdown');

if (profileMenuContainer && profileMenuButton && profileDropdown) {
    profileMenuButton.addEventListener('click', function(event) {
        event.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Fecha o dropdown se o usuário clicar fora dele
    window.addEventListener('click', function(event) {
        if (!profileMenuContainer.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
}


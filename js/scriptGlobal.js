// =======================================================
// ===== ARQUIVO JAVASCRIPT GLOBAL: scriptGlobal.js =====
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
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

    // Inicializa os ícones em todas as páginas
    // Se você já chama isso em outro script, pode remover esta linha
    // para evitar chamadas duplicadas, mas mantê-la aqui garante que funcione.
    try {
        lucide.createIcons();
    } catch (e) {
        console.error("Lucide icons não pôde ser inicializado:", e);
    }
});

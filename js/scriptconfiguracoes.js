
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

  lucide.createIcons( );



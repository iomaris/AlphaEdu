
lucide.createIcons();
let flashcards = [{ pergunta: "O que é HTML?", resposta: "Linguagem de marcação para estruturar páginas web.", tags: ["Web", "HTML"] }, { pergunta: "O que é CSS?", resposta: "Linguagem de estilo usada para definir a aparência da página.", tags: ["Web", "CSS"] }, { pergunta: "O que é JavaScript?", resposta: "Linguagem de programação usada para interatividade.", tags: ["Web", "JS"] }];
let currentIndex = 0; let isEditMode = false;
const flashcard = document.getElementById("flashcard"); const front = document.getElementById("card-front"); const back = document.getElementById("card-back"); const tagsContainer = document.getElementById("tags"); const counter = document.getElementById("counter"); const modal = document.getElementById("modal"); const modalTitle = document.getElementById("modal-title"); const modalPergunta = document.getElementById("modal-pergunta"); const modalResposta = document.getElementById("modal-resposta"); const modalTags = document.getElementById("modal-tags"); const saveBtn = document.getElementById("save");
function renderCard() { if (flashcards.length === 0) { front.textContent = "Nenhum flashcard"; back.textContent = ""; tagsContainer.innerHTML = ""; counter.textContent = ""; return; } let card = flashcards[currentIndex]; front.textContent = card.pergunta; back.textContent = card.resposta; tagsContainer.innerHTML = ""; card.tags.forEach(tag => { let span = document.createElement("span"); span.className = "tag"; span.textContent = tag; tagsContainer.appendChild(span); }); counter.textContent = `Flashcard ${currentIndex + 1} / ${flashcards.length}`; }
flashcard.addEventListener("click", () => { flashcard.classList.toggle("is-flipped"); });
document.getElementById("prev").addEventListener("click", () => { if (flashcards.length > 0) { currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length; flashcard.classList.remove("is-flipped"); renderCard(); } });
document.getElementById("next").addEventListener("click", () => { if (flashcards.length > 0) { currentIndex = (currentIndex + 1) % flashcards.length; flashcard.classList.remove("is-flipped"); renderCard(); } });
document.getElementById("shuffle").addEventListener("click", () => { if (flashcards.length > 1) { let oldIndex = currentIndex; while (currentIndex === oldIndex) { currentIndex = Math.floor(Math.random() * flashcards.length); } flashcard.classList.remove("is-flipped"); renderCard(); } });
document.getElementById("delete").addEventListener("click", () => { if (flashcards.length > 0) { if (confirm("Tem certeza que deseja excluir este card?")) { flashcards.splice(currentIndex, 1); if (currentIndex >= flashcards.length) { currentIndex = Math.max(0, flashcards.length - 1); } flashcard.classList.remove("is-flipped"); renderCard(); } } });
document.getElementById("edit").addEventListener("click", () => { if (flashcards.length > 0) { isEditMode = true; modalTitle.textContent = "Editar Flashcard"; modalPergunta.value = flashcards[currentIndex].pergunta; modalResposta.value = flashcards[currentIndex].resposta; modalTags.value = flashcards[currentIndex].tags.join(", "); saveBtn.textContent = "Salvar Alterações"; modal.classList.add("show"); } });
document.getElementById("add").addEventListener("click", () => { isEditMode = false; modalTitle.textContent = "Novo Flashcard"; modalPergunta.value = ""; modalResposta.value = ""; modalTags.value = ""; saveBtn.textContent = "Criar Flashcard"; modal.classList.add("show"); });
saveBtn.addEventListener("click", () => { const pergunta = modalPergunta.value.trim(); const resposta = modalResposta.value.trim(); const tags = modalTags.value.split(",").map(t => t.trim()).filter(t => t !== ""); if (!pergunta || !resposta) { alert("Por favor, preencha a pergunta e a resposta."); return; } if (isEditMode) { flashcards[currentIndex].pergunta = pergunta; flashcards[currentIndex].resposta = resposta; flashcards[currentIndex].tags = tags; } else { flashcards.push({ pergunta, resposta, tags }); currentIndex = flashcards.length - 1; } modal.classList.remove("show"); flashcard.classList.remove("is-flipped"); renderCard(); });
document.getElementById("cancel").addEventListener("click", () => { modal.classList.remove("show"); });
modal.addEventListener("click", (e) => { if (e.target === modal) { modal.classList.remove("show"); } });
renderCard();
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

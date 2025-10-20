// =======================================================================
// 1. SETUP DO FIREBASE (Adicionado para verificar o login)
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBdXV5FGtIgGulzCoOGO7humceFOmA5KVU",
    authDomain: "alphaedu-1a738.firebaseapp.com",
    databaseURL: "https://alphaedu-1a738-default-rtdb.firebaseio.com/",
    projectId: "alphaedu-1a738",
    storageBucket: "alphaedu-1a738.firebasestorage.app",
    messagingSenderId: "570881564591",
    appId: "1:570881564591:web:60c1ed6f8aaa414b27995a",
    measurementId: "G-M36B97ZQVY"
  };

const app = initializeApp(firebaseConfig );
const auth = getAuth(app);

// =======================================================================
// 2. LÓGICA ORIGINAL (Mantida e sem alterações)
// =======================================================================
lucide.createIcons();

// Efeito de scroll na navbar
const navbar = document.getElementById('navbar');
window.onscroll = () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
};

// =======================================================================
// 3. MELHORIA OPCIONAL (Adicionada)
// =======================================================================
const navButtonsContainer = document.querySelector('.nav-buttons');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado
        // Remove os botões de Login/Cadastro e adiciona o de Acessar Painel
        navButtonsContainer.innerHTML = `
            <a href="PainelAluno.html" class="login-btn">Acessar Painel</a>
        `;
    } else {
        // Usuário NÃO está logado
        // Garante que os botões de Login/Cadastro estejam visíveis
        navButtonsContainer.innerHTML = `
            <a href="Registrar.html" class="register-btn">Cadastrar</a>
            <a href="Login.html" class="login-btn">Login</a>
        `;
    }
});

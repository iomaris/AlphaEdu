// =======================================================================
// 1. SETUP DO FIREBASE (Adicionado para verificar o login)
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC02F-Ka3ftBr4k-uNzUU3d7znjMgQ-zdk",
    authDomain: "alphaedu-60ef2.firebaseapp.com",
    databaseURL: "https://alphaedu-60ef2-default-rtdb.firebaseio.com",
    projectId: "alphaedu-60ef2",
    storageBucket: "alphaedu-60ef2.appspot.com",
    messagingSenderId: "850593200345",
    appId: "1:850593200345:web:abf53a5b5cd6c255f4e6c8"
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
            <a href="painel.html" class="login-btn">Acessar Painel</a>
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

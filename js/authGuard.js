// js/authGuard.js

// Importe as funções que você precisa
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Sua configuração do Firebase (deve ser a mesma em todos os lugares )
const firebaseConfig = {
  apiKey: "AIzaSyC02F-Ka3ftBr4k-uNzUU3d7znjMgQ-zdk",
  authDomain: "alphaedu-60ef2.firebaseapp.com",
  projectId: "alphaedu-60ef2",
  storageBucket: "alphaedu-60ef2.appspot.com",
  messagingSenderId: "850593200345",
  appId: "1:850593200345:web:abf53a5b5cd6c255f4e6c8",
  measurementId: "G-Q961GG2JFN"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===================================================================
// O VIGIA DE AUTENTICAÇÃO (A PARTE MAIS IMPORTANTE)
// ===================================================================
onAuthStateChanged(auth, (user) => {
  // Pega o nome da página atual (ex: "Login.html", "painel.html")
  const currentPage = window.location.pathname.split('/').pop();
  const isAuthPage = currentPage === 'Login.html' || currentPage === 'Registrar.html' || currentPage === 'index.html' || currentPage === '';

  if (user) {
    // USUÁRIO ESTÁ LOGADO
    console.log("AuthGuard: Usuário está logado.", user.email);
    
    // Se ele estiver em uma página de autenticação (Login/Registro), redirecione para o painel.
    if (isAuthPage) {
      console.log("AuthGuard: Redirecionando para o painel...");
      window.location.href = 'painel.html';
    }
    
  } else {
    // USUÁRIO NÃO ESTÁ LOGADO
    console.log("AuthGuard: Nenhum usuário logado.");

    // Se ele tentar acessar qualquer página que não seja de autenticação, redirecione para o login.
    if (!isAuthPage) {
      console.log("AuthGuard: Acesso não autorizado, redirecionando para o login...");
      window.location.href = 'Login.html';
    }
  }
});

// ===================================================================
// FUNÇÃO DE LOGOUT (BÔNUS)
// ===================================================================
// Vamos adicionar a função de logout aqui para que ela esteja disponível em todas as páginas.
// Procuramos por um botão com o id 'logout-btn'
const logoutButton = document.querySelector('.logout'); // Usando a classe do seu menu
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      // O onAuthStateChanged vai detectar o logout e redirecionar para o login automaticamente.
      console.log("Logout realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  });
}

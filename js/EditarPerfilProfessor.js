import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, onAuthStateChanged, updateProfile, updatePassword, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Configuração do Firebase (mesma do seu projeto)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Referências de elementos
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const form = document.getElementById("perfil-form");
const mensagem = document.getElementById("mensagem");
const logoutBtn = document.getElementById("logout-btn");

// 🔹 Verifica usuário logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    nomeInput.value = user.displayName || "";
    emailInput.value = user.email;
    document.getElementById("profile-username").textContent = user.displayName || "Professor";
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-avatar").textContent = (user.displayName?.[0] || "P").toUpperCase();
  } else {
    window.location.href = "login.html";
  }
});

// 🔹 Atualizar dados
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const novoNome = nomeInput.value.trim();
  const novaSenha = senhaInput.value.trim();

  try {
    // Atualiza nome no perfil e Firestore
    await updateProfile(user, { displayName: novoNome });
    const ref = doc(db, "usuarios", user.uid);
    await updateDoc(ref, { nome: novoNome });

    // Atualiza senha, se informada
    if (novaSenha) await updatePassword(user, novaSenha);

    mensagem.style.display = "block";
    mensagem.style.color = "var(--accent)";
    mensagem.textContent = "✅ Dados atualizados com sucesso!";
    senhaInput.value = "";
  } catch (erro) {
    console.error(erro);
    mensagem.style.display = "block";
    mensagem.style.color = "var(--danger)";
    mensagem.textContent = "❌ Erro ao atualizar: " + erro.message;
  }
});

// 🔹 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

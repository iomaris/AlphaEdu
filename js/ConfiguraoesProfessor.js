import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, deleteUser, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Configuração Firebase
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos
const darkToggle = document.getElementById("dark-mode-toggle");
const emailToggle = document.getElementById("email-notifications-toggle");
const deleteBtn = document.getElementById("delete-account-btn");

// Carregar preferências e dados
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const ref = doc(db, "professores", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const prefs = snap.data().configuracoes || {};
      darkToggle.checked = prefs.modoEscuro || false;
      emailToggle.checked = prefs.notificacoesEmail || true;
    }

    document.querySelector(".username").textContent = user.displayName || "Professor";
    document.querySelector(".email").textContent = user.email;
    document.querySelector(".profile-avatar").textContent = (user.displayName?.[0] || "P").toUpperCase();
  } else {
    window.location.href = "Login.html";
  }
});

// Salvar preferências
async function salvarPreferencias() {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "professores", user.uid);
  await setDoc(ref, {
    configuracoes: {
      modoEscuro: darkToggle.checked,
      notificacoesEmail: emailToggle.checked
    }
  }, { merge: true });
}
darkToggle.addEventListener("change", salvarPreferencias);
emailToggle.addEventListener("change", salvarPreferencias);

// Excluir conta
deleteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) return;

  await deleteDoc(doc(db, "professores", user.uid));
  await deleteUser(user);
  alert("Conta excluída com sucesso!");
  window.location.href = "Login.html";
});

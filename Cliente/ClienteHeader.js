import { api } from "../API/apiService.js";
import { auth } from "../API/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const avatar = document.querySelector("#clientHeaderAvatar");
const name = document.querySelector("#clientHeaderName");
const fallbackAvatar = "../Icones/bico_icone.png";

function findClientProfile(response, email) {
  const profiles = Array.isArray(response) ? response : [response];
  const normalizedEmail = email.trim().toLowerCase();

  return profiles.find((profile) => {
    const profileEmail = profile?.email || profile?.Email;
    return typeof profileEmail === "string"
      && profileEmail.trim().toLowerCase() === normalizedEmail;
  }) || profiles[0];
}

avatar.addEventListener("error", () => {
  if (!avatar.dataset.fallbackApplied) {
    avatar.dataset.fallbackApplied = "true";
    avatar.src = fallbackAvatar;
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    name.textContent = "Cliente";
    avatar.src = fallbackAvatar;
    return;
  }

  try {
    const token = await user.getIdToken();
    const response = await api.buscarCliente(token);
    const profile = findClientProfile(response, user.email || "");
    const clientName = profile?.nome || profile?.Nome || user.displayName || user.email || "Cliente";
    const profilePhoto = profile?.fotoPerfil
      || profile?.FotoPerfil
      || profile?.foto
      || profile?.Foto
      || profile?.imagemPerfil
      || profile?.ImagemPerfil;

    name.textContent = clientName;
    avatar.alt = `Foto de ${clientName}`;
    avatar.src = profilePhoto || fallbackAvatar;
  } catch (error) {
    console.error("Não foi possível carregar o perfil do cliente:", error);
    name.textContent = user.displayName || user.email || "Cliente";
    avatar.src = fallbackAvatar;
  }
});

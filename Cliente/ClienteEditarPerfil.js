import { api } from "../API/apiService.js";
import { auth } from "../API/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const form = document.querySelector(".edit-form");
const saveButton = form.querySelector(".btn-salvar");
const logoutButton = document.querySelector("#logoutButton");
const message = document.querySelector("#profileMessage");
const fields = {
  nome: document.querySelector("#nome"),
  email: document.querySelector("#email"),
  cep: document.querySelector("#cep"),
  numero: document.querySelector("#numero"),
  complemento: document.querySelector("#complemento"),
};
const nameDisplay = document.querySelector("#clientProfileName");
const profileAvatar = document.querySelector("#clientProfileAvatar");
const photoInput = document.querySelector("#clientPhotoInput");
const photoButton = document.querySelector("#changePhotoButton");
const fallbackAvatar = "../Icones/bico_icone.png";

let profile = null;
let currentUser = null;
let saving = false;

function getProfileValue(data, ...keys) {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) {
      return String(data[key]);
    }
  }
  return "";
}

function profileFieldKey(data, pascalKey, camelKey) {
  if (Object.prototype.hasOwnProperty.call(data, pascalKey)) {
    return pascalKey;
  }
  if (Object.prototype.hasOwnProperty.call(data, camelKey)) {
    return camelKey;
  }
  return pascalKey;
}

function findClientProfile(response, email) {
  const profiles = Array.isArray(response) ? response : [response];
  const normalizedEmail = email.trim().toLowerCase();
  const matchingProfile = profiles.find((item) => {
    const profileEmail = getProfileValue(item, "Email", "email");
    return profileEmail.trim().toLowerCase() === normalizedEmail;
  });
  return matchingProfile || (profiles.length === 1 ? profiles[0] : null);
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.hidden = !text;
  message.classList.toggle("text-danger", isError);
  message.classList.toggle("text-success", !isError);
}

function setFormEnabled(enabled) {
  Object.values(fields).forEach((field) => {
    field.disabled = !enabled || field === fields.email;
  });
  photoButton.disabled = !enabled;
  saveButton.disabled = !enabled || saving;
}

function renderProfile() {
  fields.nome.value = getProfileValue(profile, "Nome", "nome");
  fields.email.value = currentUser.email || getProfileValue(profile, "Email", "email");
  fields.cep.value = getProfileValue(profile, "Cep", "cep", "CEP");
  fields.numero.value = getProfileValue(profile, "Numero", "numero", "Número");
  fields.complemento.value = getProfileValue(profile, "Complemento", "complemento");

  const clientName = fields.nome.value || currentUser.displayName || currentUser.email || "Cliente";
  nameDisplay.textContent = clientName;
  profileAvatar.alt = `Foto de ${clientName}`;
  profileAvatar.src = getProfileValue(profile, "FotoPerfil", "fotoPerfil", "Foto", "foto") || fallbackAvatar;
}

function buildUpdatedProfile() {
  const updated = { ...profile };
  for (const key of Object.keys(updated)) {
    if (["senha", "password", "telefone", "rua", "logradouro"].includes(key.toLowerCase())) {
      delete updated[key];
    }
  }

  const values = {
    Nome: fields.nome.value.trim(),
    Cep: fields.cep.value.trim(),
    Numero: fields.numero.value.trim(),
    Complemento: fields.complemento.value.trim(),
  };
  Object.entries(values).forEach(([pascalKey, value]) => {
    const camelKey = pascalKey[0].toLowerCase() + pascalKey.slice(1);
    updated[profileFieldKey(profile, pascalKey, camelKey)] = value;
  });
  return updated;
}

async function saveProfile(updatedProfile, successMessage = "Dados atualizados com sucesso.") {
  if (saving) {
    return;
  }
  saving = true;
  setFormEnabled(false);
  showMessage("Salvando alterações...");

  try {
    const token = await currentUser.getIdToken();
    await api.atualizarCliente(token, updatedProfile);
    profile = updatedProfile;
    renderProfile();
    showMessage(successMessage);
  } catch (error) {
    showMessage(error.message || "Não foi possível salvar as alterações.", true);
  } finally {
    saving = false;
    setFormEnabled(Boolean(profile && currentUser));
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!fields.nome.value.trim()) {
    showMessage("Informe seu nome.", true);
    fields.nome.focus();
    return;
  }
  await saveProfile(buildUpdatedProfile());
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  showMessage("Saindo da conta...");
  try {
    await signOut(auth);
    window.location.href = "../Login/Login.html";
  } catch (error) {
    showMessage(error.message || "Não foi possível sair da conta.", true);
    logoutButton.disabled = false;
  }
});

photoButton.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", async () => {
  const file = photoInput.files?.[0];
  if (!file) {
    return;
  }
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
    showMessage("Selecione uma imagem válida de até 8 MB.", true);
    photoInput.value = "";
    return;
  }

  saving = true;
  setFormEnabled(false);
  showMessage("Enviando foto...");
  try {
    const token = await currentUser.getIdToken();
    const uploadedImage = await api.enviarImagem(token, file);
    if (!uploadedImage?.url) {
      throw new Error("O servidor não retornou o endereço da imagem.");
    }
    const updatedProfile = { ...buildUpdatedProfile() };
    updatedProfile[profileFieldKey(profile, "FotoPerfil", "fotoPerfil")] = uploadedImage.url;
    saving = false;
    await saveProfile(updatedProfile, "Foto atualizada com sucesso.");
  } catch (error) {
    showMessage(error.message || "Não foi possível atualizar a foto.", true);
  } finally {
    saving = false;
    setFormEnabled(Boolean(profile && currentUser));
    photoInput.value = "";
  }
});

profileAvatar.addEventListener("error", () => {
  if (!profileAvatar.dataset.fallbackApplied) {
    profileAvatar.dataset.fallbackApplied = "true";
    profileAvatar.src = fallbackAvatar;
  }
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  setFormEnabled(false);
  if (!user) {
    showMessage("Entre na sua conta para editar o perfil.", true);
    return;
  }

  try {
    const token = await user.getIdToken();
    const response = await api.buscarCliente(token);
    profile = findClientProfile(response, user.email || "");
    if (!profile || typeof profile !== "object") {
      throw new Error("A API não retornou o perfil do cliente.");
    }
    renderProfile();
    setFormEnabled(true);
    showMessage("");
  } catch (error) {
    showMessage(error.message || "Não foi possível carregar o perfil do cliente.", true);
  }
});

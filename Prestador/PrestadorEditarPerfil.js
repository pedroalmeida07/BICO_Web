import { api } from "../API/apiService.js";
import { auth } from "../API/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const profileTitle = document.querySelector("#profileTitle");
const profileAbout = document.querySelector("#profileAbout");
const serviceList = document.querySelector("#serviceList");
const servicePlaceholder = document.querySelector("#servicePlaceholder");
const profileLocation = document.querySelector("#profileLocation");
const profilePhoto = document.querySelector("#profilePhoto");
const profilePhotoPlaceholder = document.querySelector("#profilePhotoPlaceholder");
const photoGallery = document.querySelector("#photoGallery");
const galleryPlaceholder = document.querySelector("#galleryPlaceholder");
const editDialog = document.querySelector("#profileEditDialog");
const editForm = document.querySelector("#profileEditForm");
const editTitle = document.querySelector("#profileEditTitle");
const editLabel = document.querySelector("#profileEditLabel");
const editInput = document.querySelector("#profileEditInput");
const editHint = document.querySelector("#profileEditHint");
const profilePhotoInput = document.querySelector("#profilePhotoInput");
const galleryPhotoInput = document.querySelector("#galleryPhotoInput");
const headerAvatar = document.querySelector("#providerHeaderAvatar");
const headerName = document.querySelector("#providerHeaderName");
const editButtons = document.querySelectorAll("[data-edit-field], [data-edit-photo]");
const saveButton = editForm.querySelector("button[type='submit']");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("#toast-message");

let profile = null;
let currentUser = null;
let editingField = "";
let toastTimeout;
let saving = false;
const fallbackAvatar = "../Icones/bico_icone.png";

headerAvatar.addEventListener("error", () => {
  if (!headerAvatar.dataset.fallbackApplied) {
    headerAvatar.dataset.fallbackApplied = "true";
    headerAvatar.src = fallbackAvatar;
  }
});

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 4000);
}

function setEditorEnabled(enabled) {
  editButtons.forEach((button) => {
    button.disabled = !enabled;
  });
}

setEditorEnabled(false);

function renderProfile() {
  const services = Array.isArray(profile.tiposServico) ? profile.tiposServico : [];
  const galleryPhotos = Array.isArray(profile.fotosServicos) ? profile.fotosServicos : [];
  const profileName = profile.nome || "";
  const profileTitleText = [profileName, services[0]].filter(Boolean).join(" - ");
  const headerProfileName = profileName || profile.username || "Prestador";

  profileTitle.textContent = profileTitleText || "Perfil do prestador";
  headerName.textContent = headerProfileName;
  headerAvatar.alt = `Foto de ${headerProfileName}`;
  headerAvatar.src = profile.fotoPerfil || profile.fotoPaginaPerfil || fallbackAvatar;
  profileAbout.textContent = profile.sobre || "";
  profileAbout.dataset.empty = String(!profile.sobre);
  profileLocation.textContent = profile.localAtuacao || "Local de atuação não informado.";
  serviceList.replaceChildren(...services.map((service) => {
    const item = document.createElement("div");
    item.className = "bg-[#e07a38] text-white px-4 py-2 rounded-xl text-xs font-medium text-center shrink-0 w-28 leading-tight";
    item.textContent = service;
    return item;
  }));
  servicePlaceholder.hidden = services.length > 0;

  const profilePhotoUrl = profile.fotoPaginaPerfil || profile.fotoPerfil || fallbackAvatar;
  profilePhoto.src = profilePhotoUrl;
  profilePhoto.alt = profileName ? `Foto de ${profileName}` : "Foto do prestador";
  profilePhoto.classList.remove("hidden");
  profilePhotoPlaceholder.classList.add("hidden");
  profilePhoto.addEventListener("error", () => {
    if (profilePhoto.dataset.fallbackApplied) {
      return;
    }
    profilePhoto.dataset.fallbackApplied = "true";
    profilePhoto.src = fallbackAvatar;
  });

  photoGallery.replaceChildren(...galleryPhotos.map((url, index) => {
    const container = document.createElement("div");
    container.className = "rounded-xl overflow-hidden h-24 bg-slate-100";
    const image = document.createElement("img");
    image.src = url;
    image.alt = `Foto de serviço ${index + 1}`;
    image.className = "w-full h-full object-cover";
    container.append(image);
    return container;
  }));
  galleryPlaceholder.hidden = galleryPhotos.length > 0;
}

function payloadPrestadorCompleto(dados) {
  return {
    nome: dados.nome || "",
    telefone: dados.telefone || "",
    cpf: dados.cpf || "",
    tiposServico: Array.isArray(dados.tiposServico) ? dados.tiposServico : [],
    localAtuacao: dados.localAtuacao || "",
    username: dados.username || "",
    cep: dados.cep || "",
    fotoPerfil: dados.fotoPerfil || "",
    fotoPaginaPerfil: dados.fotoPaginaPerfil || "",
    fotosServicos: Array.isArray(dados.fotosServicos) ? dados.fotosServicos : [],
    sobre: dados.sobre || "",
  };
}

async function saveProfile(updatedProfile) {
  if (saving) {
    return false;
  }

  saving = true;
  saveButton.disabled = true;
  setEditorEnabled(false);
  showToast("Salvando alterações...");

  try {
    const token = await currentUser.getIdToken();
    await api.atualizarPrestador(token, payloadPrestadorCompleto(updatedProfile));
    profile = updatedProfile;
    renderProfile();
    showToast("Perfil atualizado com sucesso.");
    return true;
  } catch (error) {
    showToast(error.message || "Não foi possível salvar as alterações.");
    return false;
  } finally {
    saving = false;
    saveButton.disabled = false;
    setEditorEnabled(Boolean(profile && currentUser));
  }
}

const editorFields = {
  name: {
    title: "Editar nome",
    label: "Nome do prestador",
    hint: "",
    value: () => profile.nome || "",
    multiline: false,
  },
  about: {
    title: "Editar descrição",
    label: "Sobre o profissional",
    hint: "Escreva um breve resumo sobre o seu trabalho.",
    value: () => profile.sobre || "",
    multiline: true,
  },
  services: {
    title: "Editar serviços",
    label: "Informe um serviço por linha",
    hint: "Cada linha será exibida como um serviço.",
    value: () => (Array.isArray(profile.tiposServico) ? profile.tiposServico : []).join("\n"),
    multiline: true,
  },
  location: {
    title: "Editar local de atuação",
    label: "Local de atuação",
    hint: "",
    value: () => profile.localAtuacao || "",
    multiline: false,
  },
};

document.querySelectorAll("[data-edit-field]").forEach((button) => {
  button.addEventListener("click", () => {
    editingField = button.dataset.editField;
    const field = editorFields[editingField];
    editTitle.textContent = field.title;
    editLabel.textContent = field.label;
    editHint.textContent = field.hint;
    editInput.value = field.value();
    editInput.rows = field.multiline ? 5 : 2;
    editDialog.showModal();
    editInput.focus();
  });
});

document.querySelector("#cancelProfileEdit").addEventListener("click", () => {
  editDialog.close();
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = editInput.value.trim();
  if (!value && editingField !== "about") {
    showToast("Preencha a informação antes de salvar.");
    return;
  }

  const updatedProfile = { ...profile };
  if (editingField === "name") {
    updatedProfile.nome = value;
  } else if (editingField === "about") {
    updatedProfile.sobre = value;
  } else if (editingField === "services") {
    updatedProfile.tiposServico = value.split("\n").map((service) => service.trim()).filter(Boolean);
    if (updatedProfile.tiposServico.length === 0) {
      showToast("Informe pelo menos um serviço.");
      return;
    }
  } else if (editingField === "location") {
    updatedProfile.localAtuacao = value;
  }

  if (await saveProfile(updatedProfile)) {
    editDialog.close();
  }
});

document.querySelectorAll("[data-edit-photo]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.dataset.editPhoto === "gallery" ? galleryPhotoInput : profilePhotoInput;
    input.click();
  });
});

async function updatePhotos(input, gallery) {
  const files = Array.from(input.files || []);
  if (files.length === 0) {
    return;
  }
  if (files.some((file) => !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)) {
    showToast("Selecione imagens válidas de até 8 MB cada.");
    input.value = "";
    return;
  }

  saving = true;
  setEditorEnabled(false);
  showToast("Enviando imagens...");
  try {
    const token = await currentUser.getIdToken();
    const uploadedImages = await Promise.all(files.map((file) => api.enviarImagem(token, file)));
    if (uploadedImages.some((image) => !image.url)) {
      throw new Error("O servidor não retornou o endereço de uma das imagens.");
    }

    const updatedProfile = { ...profile };
    if (gallery) {
      updatedProfile.fotosServicos = uploadedImages.map((image) => image.url);
    } else {
      updatedProfile.fotoPaginaPerfil = uploadedImages[0].url;
      updatedProfile.fotoPerfil = uploadedImages[0].url;
    }

    saving = false;
    const updated = await saveProfile(updatedProfile);
    if (updated) {
      showToast("Fotos atualizadas com sucesso.");
    }
  } catch (error) {
    showToast(error.message || "Não foi possível atualizar as imagens.");
  } finally {
    saving = false;
    setEditorEnabled(Boolean(profile && currentUser));
    input.value = "";
  }
}

profilePhotoInput.addEventListener("change", () => updatePhotos(profilePhotoInput, false));
galleryPhotoInput.addEventListener("change", () => updatePhotos(galleryPhotoInput, true));

onAuthStateChanged(auth, async (usuario) => {
  currentUser = usuario;
  setEditorEnabled(false);
  if (!usuario) {
    showToast("Entre na sua conta para editar o perfil.");
    return;
  }

  try {
    const token = await usuario.getIdToken();
    profile = await api.buscarPrestador(token);
    renderProfile();
    setEditorEnabled(true);
  } catch (error) {
    showToast(error.message || "Não foi possível carregar o perfil do prestador.");
  }
});

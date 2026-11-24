import { api } from "../API/apiService.js";
import { auth } from "../API/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const profileTitle = document.querySelector("#profileTitle");
const profilePhoto = document.querySelector("#profilePhoto");
const profilePhotoPlaceholder = document.querySelector("#profilePhotoPlaceholder");
const profileAbout = document.querySelector("#profileAbout");
const serviceList = document.querySelector("#serviceList");
const servicePlaceholder = document.querySelector("#servicePlaceholder");
const profileLocation = document.querySelector("#profileLocation");
const photoGallery = document.querySelector("#photoGallery");
const galleryPlaceholder = document.querySelector("#galleryPlaceholder");
const profileReviews = document.querySelector("#profileReviews");
const profileParams = new URLSearchParams(window.location.search);
const providerId = profileParams.get("id");
const providerSearchTerm = profileParams.get("termo") || "";

function renderProfile(prestador) {
  const services = Array.isArray(prestador.tiposServico) ? prestador.tiposServico : [];
  const photos = Array.isArray(prestador.fotosServicos) ? prestador.fotosServicos : [];
  const reviews = Array.isArray(prestador.avaliacoes) ? prestador.avaliacoes : [];
  const name = prestador.nome || prestador.username || "Prestador";

  profileTitle.textContent = [name, services[0]].filter(Boolean).join(" - ");
  document.title = `BICO - ${name}`;
  profileAbout.textContent = prestador.sobre || "Este profissional ainda não adicionou uma descrição.";
  profileLocation.textContent = prestador.localAtuacao || "Local de atuação não informado.";

  const fallbackPhoto = "../Icones/bico_icone.png";
  const photoUrl = prestador.fotoPaginaPerfil || prestador.fotoPerfil || fallbackPhoto;
  profilePhoto.src = photoUrl;
  profilePhoto.alt = `Foto de ${name}`;
  profilePhoto.classList.remove("hidden");
  profilePhotoPlaceholder.classList.add("hidden");
  profilePhoto.addEventListener("error", () => {
    if (profilePhoto.dataset.fallbackApplied) {
      return;
    }
    profilePhoto.dataset.fallbackApplied = "true";
    profilePhoto.src = fallbackPhoto;
  });

  serviceList.replaceChildren(...services.map((service) => {
    const item = document.createElement("div");
    item.className = "bg-[#e07a38] text-white px-4 py-2 rounded-xl text-xs font-medium text-center shrink-0 w-28 leading-tight";
    item.textContent = service;
    return item;
  }));
  servicePlaceholder.hidden = services.length > 0;

  photoGallery.replaceChildren(...photos.map((url, index) => {
    const container = document.createElement("div");
    container.className = "rounded-xl overflow-hidden h-24 bg-slate-100";
    const image = document.createElement("img");
    image.src = url;
    image.alt = `Foto de serviço ${index + 1} de ${name}`;
    image.className = "w-full h-full object-cover";
    container.append(image);
    return container;
  }));
  galleryPlaceholder.hidden = photos.length > 0;

  profileReviews.replaceChildren(...reviews.map((review) => {
    const card = document.createElement("article");
    card.className = "bg-slate-100/70 p-3 rounded-lg flex items-start justify-between gap-4";
    const content = document.createElement("div");
    const reviewer = document.createElement("p");
    reviewer.className = "font-bold text-slate-700 text-xs mb-0.5";
    reviewer.textContent = review.nome || "Cliente";
    const comment = document.createElement("p");
    comment.className = "text-slate-500 text-[11px]";
    comment.textContent = review.comentario || "";
    content.append(reviewer, comment);

    const rating = Number(review.nota) || 0;
    const stars = document.createElement("span");
    stars.className = "text-slate-800 text-[10px] whitespace-nowrap";
    stars.setAttribute("aria-label", `${rating} de 5 estrelas`);
    stars.textContent = `${"★".repeat(Math.max(0, Math.min(5, rating)))}${"☆".repeat(5 - Math.max(0, Math.min(5, rating)))}`;
    card.append(content, stars);
    return card;
  }));
  if (reviews.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "text-slate-500 text-xs";
    emptyState.textContent = "Este profissional ainda não recebeu avaliações.";
    profileReviews.append(emptyState);
  }
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    showToast("Entre na sua conta para visualizar este perfil.");
    return;
  }
  if (!providerId) {
    showToast("Abra o perfil pela lista de prestadores para carregar as informações.");
    return;
  }

  try {
    const token = await usuario.getIdToken();
    const prestadores = await api.buscarPrestadores(token, { termo: providerSearchTerm, limite: 100 });
    const prestador = prestadores.find((item) => String(item.id) === providerId);
    if (!prestador) {
      showToast("Não foi possível localizar este perfil.");
      return;
    }

    renderProfile(prestador);
  } catch (error) {
    showToast(error.message || "Não foi possível carregar o perfil do prestador.");
  }
});

import { api } from "../API/apiService.js";
import { auth } from "../API/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const searchForm = document.querySelector("#providerSearchForm");
const searchInput = document.querySelector("#service-search");
const providerResults = document.querySelector("#providerResults");
const favoriteResults = document.querySelector("#favoriteResults");
const resultsTitle = document.querySelector("#provider-results-title");
const favoriteActionMessage = document.querySelector("#favoriteActionMessage");
const favoriteIds = new Set();
let currentToken = null;
let favoriteMutationInProgress = false;
let favoriteMessageTimeout;

function showMessage(container, message) {
  const paragraph = document.createElement("p");
  paragraph.className = "provider-description";
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}

function announceFavoriteAction(message) {
  favoriteActionMessage.textContent = message;
  favoriteActionMessage.hidden = false;
  clearTimeout(favoriteMessageTimeout);
  favoriteMessageTimeout = setTimeout(() => {
    favoriteActionMessage.hidden = true;
  }, 4000);
}

function syncFavoriteButtons() {
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    const isFavorite = favoriteIds.has(button.dataset.favoriteId);
    const providerName = button.dataset.providerName;
    button.setAttribute("aria-pressed", String(isFavorite));
    button.setAttribute("aria-label", isFavorite
      ? `Remover ${providerName} dos favoritos`
      : `Adicionar ${providerName} aos favoritos`);
    button.title = isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
    button.textContent = isFavorite ? "★" : "☆";
    button.disabled = favoriteMutationInProgress;
  });
}

async function toggleFavorite(button) {
  if (!currentToken || favoriteMutationInProgress) {
    return;
  }

  const prestadorId = button.dataset.favoriteId;
  const shouldRemove = favoriteIds.has(prestadorId);
  favoriteMutationInProgress = true;
  syncFavoriteButtons();

  try {
    if (shouldRemove) {
      await api.removerFavorito(currentToken, prestadorId);
      favoriteIds.delete(prestadorId);
    } else {
      await api.adicionarFavorito(currentToken, prestadorId);
      favoriteIds.add(prestadorId);
    }

    syncFavoriteButtons();
    await loadFavorites();
    announceFavoriteAction(shouldRemove
      ? "Prestador removido dos favoritos."
      : "Prestador adicionado aos favoritos.");
  } catch (error) {
    announceFavoriteAction(error.message || "Não foi possível atualizar os favoritos.");
  } finally {
    favoriteMutationInProgress = false;
    syncFavoriteButtons();
  }
}

function createProviderCard(provider, isFavorite = false) {
  const services = Array.isArray(provider.tiposServico) ? provider.tiposServico : [];
  const name = provider.nome || provider.username || "Prestador";
  const title = [name, services[0]].filter(Boolean).join(" - ");
  const rating = Math.max(0, Math.min(5, Math.round(Number(provider.notaMedia) || 0)));
  const totalReviews = Number(provider.totalAvaliacoes) || 0;
  if (!provider.id) {
    throw new Error("A API retornou um prestador sem identificador.");
  }
  const searchTerm = provider.username || provider.nome || "";
  const profileUrl = `ClienteVisaoPerfilPrestador.html?id=${encodeURIComponent(provider.id)}&termo=${encodeURIComponent(searchTerm)}`;

  const card = document.createElement("article");
  card.className = `provider-card${isFavorite ? " favorite-card" : ""}`;

  const avatar = document.createElement("img");
  const fallbackAvatar = "../Icones/bico_icone.png";
  avatar.src = provider.fotoPerfil || fallbackAvatar;
  avatar.alt = `Foto de ${name}`;
  avatar.className = "provider-avatar";
  avatar.addEventListener("error", () => {
    if (avatar.dataset.fallbackApplied) {
      return;
    }
    avatar.dataset.fallbackApplied = "true";
    avatar.src = fallbackAvatar;
  });

  const info = document.createElement("div");
  info.className = "provider-info has-favorite-toggle";

  const heading = document.createElement("h2");
  heading.className = "provider-name";
  const profileLink = document.createElement("a");
  profileLink.className = "text-inherit no-underline hover:underline";
  profileLink.href = profileUrl;
  profileLink.textContent = title;
  heading.append(profileLink);

  const ratingLine = document.createElement("p");
  ratingLine.className = "rating";
  const stars = document.createElement("span");
  stars.setAttribute("aria-label", `${rating} de 5 estrelas`);
  stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
  ratingLine.append(stars, document.createTextNode(` (${totalReviews})`));

  const description = document.createElement("p");
  description.className = "provider-description";
  description.textContent = provider.sobre || "Este profissional ainda não adicionou uma descrição.";

  const location = document.createElement("p");
  location.className = "provider-location";
  const locationIcon = document.createElement("img");
  locationIcon.src = "../Icones/PinLaranja.png";
  locationIcon.alt = "";
  location.append(locationIcon, document.createTextNode(provider.localAtuacao || "Local de atuação não informado."));

  info.append(heading, ratingLine, description);
  if (provider.telefone) {
    const phone = document.createElement("a");
    phone.className = "provider-phone";
    phone.href = `tel:${provider.telefone.replace(/[^\d+]/g, "")}`;
    phone.textContent = provider.telefone;
    info.append(phone);
  }
  info.append(location);

  const viewProfile = document.createElement("a");
  viewProfile.className = "message-button";
  viewProfile.href = profileUrl;
  viewProfile.textContent = "Ver perfil";

  const favoriteToggle = document.createElement("button");
  favoriteToggle.type = "button";
  favoriteToggle.className = "favorite-toggle";
  favoriteToggle.dataset.favoriteId = String(provider.id);
  favoriteToggle.dataset.providerName = name;
  favoriteToggle.addEventListener("click", () => toggleFavorite(favoriteToggle));

  card.append(avatar, info, favoriteToggle, viewProfile);
  favoriteToggle.setAttribute("aria-pressed", String(isFavorite || favoriteIds.has(String(provider.id))));
  syncFavoriteButtons();
  return card;
}

async function loadProviders(term = "") {
  showMessage(providerResults, "Carregando prestadores...");
  resultsTitle.textContent = term ? "Resultados da busca" : "Melhor Avaliados";

  try {
    const prestadores = await api.buscarPrestadores(currentToken, { termo: term, limite: 20 });
    if (!Array.isArray(prestadores)) {
      throw new Error("A API retornou uma lista de prestadores inválida.");
    }

    if (prestadores.length === 0) {
      showMessage(providerResults, "Nenhum prestador encontrado.");
      return;
    }
    providerResults.replaceChildren(...prestadores.map((provider) => createProviderCard(provider)));
    syncFavoriteButtons();
  } catch (error) {
    showMessage(providerResults, error.message || "Não foi possível carregar os prestadores.");
  }
}

async function loadFavorites() {
  showMessage(favoriteResults, "Carregando favoritos...");

  try {
    const resposta = await api.buscarFavoritos(currentToken);
    if (!resposta || !Array.isArray(resposta.favoritos)) {
      throw new Error("A API retornou uma lista de favoritos inválida.");
    }

    favoriteIds.clear();
    resposta.favoritos.forEach((provider) => {
      if (!provider.id) {
        throw new Error("A API retornou um favorito sem identificador.");
      }
      favoriteIds.add(String(provider.id));
    });

    if (resposta.favoritos.length === 0) {
      showMessage(favoriteResults, "Você ainda não adicionou prestadores aos favoritos.");
      syncFavoriteButtons();
      return;
    }
    favoriteResults.replaceChildren(...resposta.favoritos.map((provider) => createProviderCard(provider, true)));
    syncFavoriteButtons();
  } catch (error) {
    showMessage(favoriteResults, error.message || "Não foi possível carregar os favoritos.");
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentToken) {
    showMessage(providerResults, "Entre na sua conta para pesquisar prestadores.");
    return;
  }
  await loadProviders(searchInput.value.trim());
});

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    showMessage(providerResults, "Entre na sua conta para ver os prestadores.");
    showMessage(favoriteResults, "Entre na sua conta para ver os favoritos.");
    return;
  }

  try {
    currentToken = await usuario.getIdToken();
    await Promise.all([loadProviders(), loadFavorites()]);
  } catch (error) {
    showMessage(providerResults, error.message || "Não foi possível carregar os dados da conta.");
    showMessage(favoriteResults, "Não foi possível carregar os favoritos.");
  }
});

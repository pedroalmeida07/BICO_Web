import { api } from '../API/apiService.js';

// Elementos da tela
const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confSenha = document.getElementById("confSenha");
const mensagemErro = document.getElementById("mensagemErro");

function mostrarErro(texto) {
  mensagemErro.textContent = texto;
  mensagemErro.style.display = "block";
}

function limparErro() {
  mensagemErro.textContent = "";
  mensagemErro.style.display = "none";
}

btnAvancar.addEventListener("click", async function () {
  limparErro();

  // 1. Validações locais
  if (!email.value.trim()) {
    mostrarErro("Insira um e-mail válido!");
    return;
  }
  if (!senha.value) {
    mostrarErro("Insira uma senha!");
    return;
  }
  if (senha.value.length < 6) {
    mostrarErro("A senha deve ter pelo menos 6 caracteres.");
    return;
  }
  if (confSenha.value !== senha.value) {
    mostrarErro("As senhas não coincidem!");
    return;
  }

  // 2. Recupera os dados coletados nas telas anteriores (salvos no sessionStorage)
  const dadosAnteriores = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");

  // 3. Monta o objeto completo exigido pelo modelo do seu amigo
  const payloadPrestador = {
    ...dadosAnteriores,
    Email: email.value.trim(),
    Senha: senha.value,
    // Valores padrão ou vazios inicializados conforme regra da API
    FotosServicos: dadosAnteriores.FotosServicos || []
  };

  try {
    btnAvancar.disabled = true;
    btnAvancar.textContent = "Cadastrando...";

    // 4. Envia para o banco de dados via API
    const resultado = await api.criarPrestador(payloadPrestador);
    console.log("Prestador cadastrado com sucesso:", resultado);

    // 5. Limpa os dados temporários e redireciona para o login
    sessionStorage.removeItem("dadosCadastroPrestador");
    window.location.href = "../Login/Login.html";

  } catch (erro) {
    mostrarErro(erro.message);
    btnAvancar.disabled = false;
    btnAvancar.textContent = "Avançar";
  }
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "CadastroPrestadorLocal.html";
});
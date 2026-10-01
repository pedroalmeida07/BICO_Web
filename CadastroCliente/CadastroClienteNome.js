// Elementos da tela
const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const nomeCompleto = document.getElementById("nomeCompleto");
const cpf = document.getElementById("cpf");
const mensagemErro = document.getElementById("mensagemErro");

function mostrarErro(texto) {
  if (mensagemErro) {
    mensagemErro.textContent = texto;
    mensagemErro.style.display = "block";
  }
}

function limparErro() {
  if (mensagemErro) {
    mensagemErro.textContent = "";
    mensagemErro.style.display = "none";
  }
}

// Restaura os dados caso o usuário tenha preenchido e voltado a esta tela
document.addEventListener("DOMContentLoaded", function () {
  const dadosSalvos = JSON.parse(sessionStorage.getItem("dadosCadastroCliente") || "{}");
  
  if (dadosSalvos.Nome) nomeCompleto.value = dadosSalvos.Nome;
  if (dadosSalvos.Cpf) cpf.value = dadosSalvos.Cpf;
});

btnAvancar.addEventListener("click", function () {
  limparErro();

  // 1. Validações locais
  if (!nomeCompleto.value.trim()) {
    mostrarErro("Insira seu nome completo!");
    return;
  }
  if (!cpf.value.trim()) {
    mostrarErro("Insira seu CPF!");
    return;
  }

  // 2. Recupera o objeto existente ou inicia um novo
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroCliente") || "{}");

  // 3. Atualiza os campos mantendo o padrão esperado pela API
  const novosDados = {
    ...dadosAtuais,
    Nome: nomeCompleto.value.trim(),
    Cpf: cpf.value.trim()
  };

  // 4. Salva no sessionStorage
  sessionStorage.setItem("dadosCadastroCliente", JSON.stringify(novosDados));

  // 5. Redireciona para a próxima etapa (Endereço/Local)
  window.location.href = "CadastroClienteLocal.html";
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "../Login/Login.html";
});
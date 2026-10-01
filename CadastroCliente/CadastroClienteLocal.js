const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");

const cep = document.getElementById("cep");
const telefone = document.getElementById("telefone");
const numero = document.getElementById("numero");
const complemento = document.getElementById("complemento");
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

// Restaura os campos caso o usuário já tenha preenchido esta tela e voltado
document.addEventListener("DOMContentLoaded", function () {
  const dadosSalvos = JSON.parse(sessionStorage.getItem("dadosCadastroCliente") || "{}");
  
  if (dadosSalvos.Cep) cep.value = dadosSalvos.Cep;
  if (dadosSalvos.Telefone) telefone.value = dadosSalvos.Telefone;
  if (dadosSalvos.Numero) numero.value = dadosSalvos.Numero;
  if (dadosSalvos.Complemento) complemento.value = dadosSalvos.Complemento;
});

btnAvancar.addEventListener("click", function () {
  limparErro();

  // 1. Validações
  if (!cep.value.trim()) {
    mostrarErro("Insira um CEP válido!");
    return;
  }
  if (!telefone.value.trim()) {
    mostrarErro("Insira um telefone!");
    return;
  }
  if (!numero.value.trim()) {
    mostrarErro("Insira o número da residência!");
    return;
  }

  // 2. Recupera o que foi salvo nas telas anteriores (ex: Nome/CPF)
  const dadosAnteriores = JSON.parse(sessionStorage.getItem("dadosCadastroCliente") || "{}");

  // 3. Junta os dados desta tela aos anteriores
  const dadosAtualizados = {
    ...dadosAnteriores,
    Cep: cep.value.trim(),
    Telefone: telefone.value.trim(),
    Numero: numero.value.trim(),
    Complemento: complemento.value.trim()
  };

  // 4. Salva no sessionStorage para usar no envio final
  sessionStorage.setItem("dadosCadastroCliente", JSON.stringify(dadosAtualizados));

  // 5. Avança para a tela de Email/Senha
  window.location.href = "CadastroClienteEmail.html";
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "CadastroClienteNome.html";
});
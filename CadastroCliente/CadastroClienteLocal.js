const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");

const cep = document.getElementById("cep");
const numero = document.getElementById("numero");
const complemento = document.getElementById("complemento");
const mensagemErro = document.getElementById("mensagemErro");

function formatarCep(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

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
  
  if (dadosSalvos.Cep) cep.value = formatarCep(dadosSalvos.Cep);
  if (dadosSalvos.Numero) numero.value = dadosSalvos.Numero;
  if (dadosSalvos.Complemento) complemento.value = dadosSalvos.Complemento;
  if (Object.prototype.hasOwnProperty.call(dadosSalvos, "Telefone")) {
    delete dadosSalvos.Telefone;
    sessionStorage.setItem("dadosCadastroCliente", JSON.stringify(dadosSalvos));
  }
});

function salvarRascunho() {
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroCliente") || "{}");
  delete dadosAtuais.Telefone;
  sessionStorage.setItem("dadosCadastroCliente", JSON.stringify({
    ...dadosAtuais,
    Cep: cep.value,
    Numero: numero.value,
    Complemento: complemento.value
  }));
}

[cep, numero, complemento].forEach((campo) => {
  campo.addEventListener("input", salvarRascunho);
});

cep.addEventListener("input", () => {
  cep.value = formatarCep(cep.value);
  salvarRascunho();
});

btnAvancar.addEventListener("click", function () {
  limparErro();

  // 1. Validações
  if (cep.value.replace(/\D/g, "").length !== 8) {
    mostrarErro("Insira um CEP válido com 8 números!");
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
    Cep: formatarCep(cep.value),
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
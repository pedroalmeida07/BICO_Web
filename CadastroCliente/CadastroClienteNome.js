import { cpfValido } from "../Utils/cpf.js";

// Elementos da tela
const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const nomeCompleto = document.getElementById("nomeCompleto");
const cpf = document.getElementById("cpf");
const mensagemErro = document.getElementById("mensagemErro");

function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length > 9) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }
  if (digitos.length > 6) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  }
  if (digitos.length > 3) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  }
  return digitos;
}

cpf.addEventListener("input", function () {
  const cursor = cpf.selectionStart === null ? cpf.value.length : cpf.selectionStart;
  const digitosAntesCursor = cpf.value.slice(0, cursor).replace(/\D/g, "").length;
  const valorFormatado = formatarCpf(cpf.value);
  cpf.value = valorFormatado;

  let novaPosicao = 0;
  let digitosContados = 0;
  while (novaPosicao < valorFormatado.length && digitosContados < digitosAntesCursor) {
    if (/\d/.test(valorFormatado[novaPosicao])) {
      digitosContados++;
    }
    novaPosicao++;
  }
  while (novaPosicao < valorFormatado.length && !/\d/.test(valorFormatado[novaPosicao])) {
    novaPosicao++;
  }
  cpf.setSelectionRange(novaPosicao, novaPosicao);
});

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
  if (dadosSalvos.Cpf) cpf.value = formatarCpf(dadosSalvos.Cpf);
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
  if (!cpfValido(cpf.value)) {
    mostrarErro("CPF inválido. Verifique os números digitados.");
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
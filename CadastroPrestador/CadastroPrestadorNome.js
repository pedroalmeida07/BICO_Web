import { cpfValido } from "../Utils/cpf.js";

const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const nomeCompleto = document.getElementById("nomeCompleto");
const cpf = document.getElementById("cpf");

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

btnAvancar.addEventListener("click", function () {
  if (!nomeCompleto.value.trim()) {
    alert("Insira seu nome completo!");
    return;
  }
  if (!cpf.value.trim()) {
    alert("Insira seu CPF!");
    return;
  }
  if (!cpfValido(cpf.value)) {
    alert("CPF inválido. Verifique os números digitados.");
    return;
  }

  // Recupera o objeto existente ou inicia um novo
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");

  // Adiciona Nome e CPF com os nomes de chaves exatos esperados pelo modelo
  const novosDados = {
    ...dadosAtuais,
    Nome: nomeCompleto.value.trim(),
    Cpf: cpf.value.trim()
  };

  // Salva no sessionStorage
  sessionStorage.setItem("dadosCadastroPrestador", JSON.stringify(novosDados));

  // Redireciona para a próxima etapa
  window.location.href = "CadastroPrestadorUsuario.html";
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "../Login/Login.html";
});
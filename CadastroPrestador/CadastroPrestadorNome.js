const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const nomeCompleto = document.getElementById("nomeCompleto");
const cpf = document.getElementById("cpf");

btnAvancar.addEventListener("click", function () {
  if (!nomeCompleto.value.trim()) {
    alert("Insira seu nome completo!");
    return;
  }
  if (!cpf.value.trim()) {
    alert("Insira seu CPF!");
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
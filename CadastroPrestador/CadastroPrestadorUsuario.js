const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const usuario = document.getElementById("usuario");

btnAvancar.addEventListener("click", function () {
  if (!usuario.value.trim()) {
    alert("Insira um nome de usuário!");
    return;
  }

  // Recupera os dados das etapas anteriores
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");

  // Adiciona o Username ao objeto
  const novosDados = {
    ...dadosAtuais,
    Username: usuario.value.trim()
  };

  // Atualiza no sessionStorage
  sessionStorage.setItem("dadosCadastroPrestador", JSON.stringify(novosDados));

  // Redireciona para a próxima etapa
  window.location.href = "CadastroPrestadorLocal.html";
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "CadastroPrestadorNome.html";
});
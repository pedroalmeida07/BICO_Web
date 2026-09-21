const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const servico = document.getElementById("servico");
const local = document.getElementById("local");

btnAvancar.addEventListener("click", function () {
  if (!servico.value.trim()) {
    alert("Insira o tipo de serviço!");
    return;
  }
  if (!local.value.trim()) {
    alert("Insira o local de atuação!");
    return;
  }

  // Converte a string de serviços em uma lista/Array (ex: "Eletricista, Encanador" -> ["Eletricista", "Encanador"])
  const listaServicos = servico.value
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0);

  // Recupera os dados acumulados
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");

  // Adiciona TiposServico e LocalAtuacao
  const novosDados = {
    ...dadosAtuais,
    TiposServico: listaServicos,
    LocalAtuacao: local.value.trim()
  };

  // Atualiza no sessionStorage
  sessionStorage.setItem("dadosCadastroPrestador", JSON.stringify(novosDados));

  // Redireciona para a última etapa (onde o e-mail e a senha serão solicitados e a API será chamada)
  window.location.href = "CadastroPrestadorEmail.html";
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "CadastroPrestadorUsuario.html";
});
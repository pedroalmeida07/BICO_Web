const btnAvancar = document.getElementById("btnAvancar");
const btnVoltar = document.getElementById("btnVoltar");
const servico = document.getElementById("servico");
const servicoOptions = document.getElementById("servicoOptions");
const servicoStatus = document.getElementById("servicoStatus");
const cep = document.getElementById("cep");
const local = document.getElementById("local");
const cepStatus = document.getElementById("cepStatus");
let cepRequest = 0;

const servicosDisponiveis = [
  "Advogado",
  "Agente de viagens",
  "Animador de eventos",
  "Arquiteto",
  "Assistente administrativo",
  "Assistência técnica",
  "Babá",
  "Barbeiro",
  "Barista",
  "Beleza e estética",
  "Bombeiro hidráulico",
  "Chaveiro",
  "Chef de cozinha",
  "Coaching e mentoria",
  "Confeiteiro",
  "Consultor",
  "Consultor financeiro",
  "Consultor de imagem",
  "Contador",
  "Costureiro",
  "Cuidado de idosos",
  "Cuidado de crianças",
  "Cuidado de pets",
  "Cuidador",
  "Decoração",
  "Dedetização",
  "Design gráfico",
  "Design de interiores",
  "Desenvolvedor de software",
  "Eletricista",
  "Eletricista automotivo",
  "Eletrônica",
  "Encanador",
  "Engenheiro",
  "Entregador",
  "Eventos",
  "Faxineiro",
  "Fotógrafo",
  "Funileiro",
  "Garçom",
  "Garçom para eventos",
  "Gesseiro",
  "Guincho e reboque",
  "Instalação de ar-condicionado",
  "Instalação de câmeras",
  "Instalação de internet",
  "Instalação de móveis",
  "Instalação elétrica",
  "Instalação hidráulica",
  "Instalação de equipamentos",
  "Instalação de antenas",
  "Jardinagem",
  "Manutenção de computadores",
  "Manutenção de eletrodomésticos",
  "Manutenção de ar-condicionado",
  "Manutenção predial",
  "Manutenção residencial",
  "Manutenção industrial",
  "Manutenção automotiva",
  "Manutenção de piscinas",
  "Manutenção de máquinas",
  "Manutenção de equipamentos",
  "Manicure",
  "Marceneiro",
  "Massagista",
  "Mecânico",
  "Mecânico de motos",
  "Mecânico de máquinas",
  "Montador de móveis",
  "Motoboy",
  "Motorista",
  "Motorista particular",
  "Mudanças",
  "Organização residencial",
  "Organizador de eventos",
  "Outros Serviços",
  "Paisagismo",
  "Pedreiro",
  "Personal trainer",
  "Pet sitter",
  "Pintor",
  "Pintor automotivo",
  "Piscineiro",
  "Podador de árvores",
  "Podólogo",
  "Professor particular",
  "Professor de idiomas",
  "Professor de música",
  "Programador",
  "Redator",
  "Reformas",
  "Refrigeração",
  "Reparos residenciais",
  "Reparos de eletrônicos",
  "Reparos automotivos",
  "Salão de beleza",
  "Segurança",
  "Segurança eletrônica",
  "Serralheiro",
  "Serviços de limpeza",
  "Serviços de transporte",
  "Soldador",
  "Técnico de informática",
  "Técnico de celulares",
  "Técnico de eletrônicos",
  "Técnico de eletrodomésticos",
  "Tradutor",
  "Veterinário",
  "Vidraceiro",
  "Web designer",
];

servicoOptions.replaceChildren(...servicosDisponiveis.map((nome) => {
  const option = document.createElement("option");
  option.value = nome;
  return option;
}));

function getServicoSelecionado() {
  const valor = servico.value.trim().toLocaleLowerCase("pt-BR");
  return servicosDisponiveis.find((nome) => nome.toLocaleLowerCase("pt-BR") === valor) || "";
}

function salvarRascunhoServico() {
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");
  sessionStorage.setItem("dadosCadastroPrestador", JSON.stringify({
    ...dadosAtuais,
    ServicoRascunho: servico.value,
  }));
}

servico.addEventListener("input", () => {
  salvarRascunhoServico();
  const selecionado = getServicoSelecionado();
  servicoStatus.textContent = selecionado
    ? `Serviço selecionado: ${selecionado}.`
    : "Selecione um serviço disponível na lista.";
  servicoStatus.classList.toggle("text-danger", Boolean(servico.value.trim() && !selecionado));
  servicoStatus.classList.toggle("text-muted", !servico.value.trim() || Boolean(selecionado));
});

function mostrarStatusCep(mensagem, erro = false) {
  cepStatus.textContent = mensagem;
  cepStatus.classList.toggle("text-danger", erro);
  cepStatus.classList.toggle("text-muted", !erro);
}

async function buscarLocalPorCep() {
  const numeroCep = cep.value.replace(/\D/g, "");
  const requestId = ++cepRequest;
  local.value = "";

  if (numeroCep.length !== 8) {
    mostrarStatusCep("Informe um CEP válido com 8 números.", true);
    return false;
  }

  mostrarStatusCep("Consultando CEP...");
  try {
    const response = await fetch(`https://viacep.com.br/ws/${numeroCep}/json/`);
    if (!response.ok) {
      throw new Error("Não foi possível consultar o CEP. Tente novamente.");
    }

    const endereco = await response.json();
    if (requestId !== cepRequest) {
      return false;
    }
    if (endereco.erro) {
      mostrarStatusCep("CEP não encontrado. Confira o número e tente novamente.", true);
      return false;
    }

    const localidade = [endereco.localidade, endereco.uf].filter(Boolean).join(" - ");
    if (!localidade) {
      throw new Error("A consulta não retornou uma cidade para este CEP.");
    }
    local.value = localidade;
    mostrarStatusCep("Local de atuação preenchido pelo CEP.");
    return true;
  } catch (error) {
    if (requestId === cepRequest) {
      mostrarStatusCep(error.message || "Não foi possível consultar o CEP.", true);
    }
    return false;
  }
}

cep.addEventListener("input", () => {
  const digits = cep.value.replace(/\D/g, "").slice(0, 8);
  cep.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");
  sessionStorage.setItem("dadosCadastroPrestador", JSON.stringify({
    ...dadosAtuais,
    Cep: cep.value,
  }));
  cepRequest++;
  local.value = "";

  if (digits.length === 8) {
    buscarLocalPorCep();
  } else {
    mostrarStatusCep("");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const dadosSalvos = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");
  servico.value = dadosSalvos.ServicoRascunho
    || (Array.isArray(dadosSalvos.TiposServico) ? dadosSalvos.TiposServico[0] || "" : "");
  const cepSalvo = dadosSalvos.Cep || dadosSalvos.cep || "";
  if (cepSalvo) {
    cep.value = cepSalvo;
    cep.dispatchEvent(new Event("input"));
  }
});

btnAvancar.addEventListener("click", function () {
  const servicoSelecionado = getServicoSelecionado();
  if (!servicoSelecionado) {
    servicoStatus.textContent = "Selecione um serviço disponível na lista.";
    servicoStatus.classList.add("text-danger");
    servico.focus();
    return;
  }
  if (cep.value.replace(/\D/g, "").length !== 8 || !local.value.trim()) {
    mostrarStatusCep("Informe um CEP válido e aguarde o preenchimento do local de atuação.", true);
    return;
  }

  // Recupera os dados acumulados
  const dadosAtuais = JSON.parse(sessionStorage.getItem("dadosCadastroPrestador") || "{}");

  // Adiciona TiposServico e LocalAtuacao
  const novosDados = {
    ...dadosAtuais,
    TiposServico: [servicoSelecionado],
    Cep: cep.value.replace(/\D/g, ""),
    LocalAtuacao: local.value.trim()
  };
  delete novosDados.ServicoRascunho;

  // Atualiza no sessionStorage
  sessionStorage.setItem("dadosCadastroPrestador", JSON.stringify(novosDados));

  // Redireciona para a última etapa (onde o e-mail e a senha serão solicitados e a API será chamada)
  window.location.href = "CadastroPrestadorEmail.html";
});

btnVoltar.addEventListener("click", function () {
  window.location.href = "CadastroPrestadorUsuario.html";
});
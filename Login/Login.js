
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { api } from "../API/apiService.js";
import { auth } from "../API/firebase.js";

const mostrarMensagem = (mensagem, tipo = "erro") => {
    const mensagemElement = document.querySelector("#loginMensagem");
    mensagemElement.textContent = mensagem;
    mensagemElement.classList.toggle("text-danger", tipo === "erro");
    mensagemElement.classList.toggle("text-success", tipo === "sucesso");
    mensagemElement.hidden = false;
};

const perfilContemEmail = (dados, email) => {
    if (Array.isArray(dados)) {
        return dados.some((item) => perfilContemEmail(item, email));
    }

    if (!dados || typeof dados !== "object") {
        return false;
    }

    return Object.entries(dados).some(([chave, valor]) => {
        if (chave.toLowerCase() === "email" && typeof valor === "string") {
            return valor.trim().toLowerCase() === email.trim().toLowerCase();
        }

        return perfilContemEmail(valor, email);
    });
};

const buscarTipoConta = async (token, email) => {
    const resultados = await Promise.allSettled([
        api.buscarCliente(token),
        api.buscarPrestador(token),
    ]);
    const perfis = resultados.flatMap((resultado, indice) => {
        if (resultado.status !== "fulfilled") {
            return [];
        }

        return [{
            tipo: indice === 0 ? "cliente" : "prestador",
            dados: resultado.value,
        }];
    });

    if (perfis.length === 0) {
        const erros = resultados
            .filter((resultado) => resultado.status === "rejected")
            .map((resultado) => resultado.reason);

        if (erros.some((erro) => erro.status === 401)) {
            throw new Error("O Firebase autenticou, mas a API recusou o token. Verifique se o servidor valida tokens do mesmo projeto Firebase.");
        }

        if (erros.some((erro) => erro.status === 403)) {
            throw new Error("O Firebase autenticou, mas a API não permitiu consultar o perfil desta conta.");
        }

        throw new Error("O Firebase autenticou, mas não foi possível consultar o perfil na API.");
    }

    if (perfis.length === 1) {
        return perfis[0].tipo;
    }

    const perfisCorrespondentes = perfis.filter((perfil) => perfilContemEmail(perfil.dados, email));
    if (perfisCorrespondentes.length === 1) {
        return perfisCorrespondentes[0].tipo;
    }

    throw new Error("A API retornou mais de um perfil e não foi possível identificar o tipo desta conta pelo e-mail.");
};

const autenticarUsuario = async (email, senha) => {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const usuario = credencial.user;
    const token = await usuario.getIdToken();
    const tipoConta = await buscarTipoConta(token, usuario.email || email);

    sessionStorage.setItem("tipoConta", tipoConta);
    sessionStorage.setItem("usuario", JSON.stringify({ uid: usuario.uid, email: usuario.email }));

    window.location.href = tipoConta === "prestador"
        ? "../Prestador/PrestadorHome.html"
        : "../Cliente/ClienteHome.html";
};

const formLogin = document.querySelector("#formLogin");
const btnCadCliente = document.querySelector("#btnCadCliente");
const btnCadPrestador = document.querySelector("#btnCadPrestador");

btnCadCliente.addEventListener("click", function () {
    window.location.href = "../CadastroCliente/CadastroClienteNome.html";
});

btnCadPrestador.addEventListener("click", function () {
    window.location.href = "../CadastroPrestador/CadastroPrestadorNome.html";
});

formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#senha").value;

    if (!email || !senha) {
        mostrarMensagem("Informe o e-mail e a senha.");
        return;
    }

    const botaoEntrar = formLogin.querySelector("button[type='submit']");
    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando...";
    mostrarMensagem("", "sucesso");

    try {
        await autenticarUsuario(email, senha);
    } catch (erro) {
        const mensagensFirebase = {
            "auth/invalid-credential": "E-mail ou senha inválidos.",
            "auth/invalid-email": "O formato do e-mail é inválido.",
            "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.",
            "auth/network-request-failed": "Não foi possível conectar ao Firebase. Verifique sua conexão.",
        };
        mostrarMensagem(mensagensFirebase[erro.code] || erro.message || "Não foi possível realizar o login.");
        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const togglePassword = document.querySelector("#togglePassword");
    const passwordInput = document.querySelector("#senha");
    const eyeIcon = document.querySelector("#eyeIcon");

    togglePassword.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        if (type === "password") {
            eyeIcon.innerHTML = `
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            `;
        }
    });
});
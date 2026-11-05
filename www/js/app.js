

const CHAVE_USUARIOS = "usuarios";
const CHAVE_SESSAO = "sessao";

function lerJSON(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao;
  } catch {
    return padrao;
  }
}

const usuarios = () => lerJSON(CHAVE_USUARIOS, []);
const sessao = () => lerJSON(CHAVE_SESSAO, null);

function salvarUsuarios(lista) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
}

function iniciarSessao(usuario) {
  localStorage.setItem(
    CHAVE_SESSAO,
    JSON.stringify({ nome: usuario.nome, email: usuario.email })
  );
}

/* ---------- Validação ---------- */
const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function mostrarErro(input, mensagem) {
  const campo = input.closest(".campo");
  campo.classList.add("invalido");
  input.setAttribute("aria-invalid", "true");
  campo.querySelector(".erro").textContent = mensagem;
}

function limparErro(input) {
  const campo = input.closest(".campo");
  campo.classList.remove("invalido");
  input.removeAttribute("aria-invalid");
  campo.querySelector(".erro").textContent = "";
}

function mostrarAlerta(form, mensagem) {
  const alerta = form.querySelector(".alerta");
  alerta.textContent = mensagem;
  alerta.classList.remove("visivel");
  void alerta.offsetWidth; 
  alerta.classList.add("visivel");
}

function esconderAlerta(form) {
  form.querySelector(".alerta").classList.remove("visivel");
}

function validar(input) {
  const valor = input.value.trim();
  const tipo = input.name;

  if (tipo === "nome" && valor.length < 2) {
    mostrarErro(input, "Digite seu nome (mínimo 2 letras).");
    return false;
  }
  if (tipo === "email" && !emailValido(valor)) {
    mostrarErro(input, "Digite um e-mail válido, como nome@email.com.");
    return false;
  }
  if (tipo === "senha" && input.value.length < 6) {
    mostrarErro(input, "A senha precisa ter pelo menos 6 caracteres.");
    return false;
  }
  limparErro(input);
  return true;
}

function validarFormulario(form) {
  const campos = [...form.querySelectorAll("input")];
  const resultados = campos.map(validar); // valida todos para mostrar todos os erros
  const primeiroInvalido = campos[resultados.indexOf(false)];
  if (primeiroInvalido) primeiroInvalido.focus();
  return !primeiroInvalido;
}

function configurarVerSenha() {
  document.querySelectorAll(".ver-senha").forEach((botao) => {
    botao.addEventListener("click", () => {
      const input = botao.parentElement.querySelector("input");
      const mostrando = input.type === "text";
      input.type = mostrando ? "password" : "text";
      botao.textContent = mostrando ? "Mostrar" : "Ocultar";
      botao.setAttribute("aria-pressed", String(!mostrando));
    });
  });
}


function configurarForcaSenha() {
  const input = document.querySelector("#senha");
  const barra = document.querySelector(".forca span");
  const texto = document.querySelector(".forca-texto");
  if (!input || !barra) return;

  const niveis = [
    { rotulo: "", cor: "transparent", largura: "0%" },
    { rotulo: "Fraca", cor: "#c62828", largura: "25%" },
    { rotulo: "Razoável", cor: "#ef6c00", largura: "50%" },
    { rotulo: "Boa", cor: "#9e9d24", largura: "75%" },
    { rotulo: "Forte", cor: "#2e7d32", largura: "100%" },
  ];

  input.addEventListener("input", () => {
    const s = input.value;
    let pontos = 0;
    if (s.length >= 6) pontos++;
    if (s.length >= 10) pontos++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
    if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) pontos++;
    if (!s) pontos = 0;
    else pontos = Math.max(pontos, 1);

    const n = niveis[pontos];
    barra.style.width = n.largura;
    barra.style.background = n.cor;
    texto.textContent = n.rotulo ? `Senha: ${n.rotulo}` : "";
  });
}


function paginaLogin() {
  const form = document.querySelector("#form-login");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    esconderAlerta(form);
    if (!validarFormulario(form)) return;

    const email = form.email.value.trim().toLowerCase();
    const usuario = usuarios().find(
      (u) => u.email === email && u.senha === form.senha.value
    );

    if (!usuario) {
      mostrarAlerta(form, "E-mail ou senha incorretos.");
      return;
    }
    iniciarSessao(usuario);
    window.location.replace("home.html");
  });
}

function paginaCadastro() {
  const form = document.querySelector("#form-cadastro");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    esconderAlerta(form);
    if (!validarFormulario(form)) return;

    const lista = usuarios();
    const email = form.email.value.trim().toLowerCase();

    if (lista.some((u) => u.email === email)) {
      mostrarAlerta(form, "Este e-mail já está cadastrado. Tente entrar.");
      return;
    }

    const novo = { nome: form.nome.value.trim(), email, senha: form.senha.value };
    lista.push(novo);
    salvarUsuarios(lista);
    iniciarSessao(novo);
    window.location.replace("home.html");
  });
}

function paginaHome() {
  const atual = sessao();
  if (!atual) {
    window.location.replace("index.html"); 
    return;
  }

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  document.querySelector("#saudacao").textContent = `${saudacao}, ${atual.nome.split(" ")[0]}!`;
  document.querySelector("#email").textContent = atual.email;
  document.querySelector("#avatar").textContent = atual.nome.charAt(0).toUpperCase();

  document.querySelector("#sair").addEventListener("click", () => {
    localStorage.removeItem(CHAVE_SESSAO);
    window.location.replace("index.html");
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.body.dataset.pagina;

  
  if ((pagina === "login" || pagina === "cadastro") && sessao()) {
    window.location.replace("home.html");
    return;
  }


  document.querySelectorAll("form input").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.closest(".campo").classList.contains("invalido")) validar(input);
    });
    input.addEventListener("blur", () => {
      if (input.value) validar(input);
    });
  });

  configurarVerSenha();
  configurarForcaSenha();

  if (pagina === "login") paginaLogin();
  if (pagina === "cadastro") paginaCadastro();
  if (pagina === "home") paginaHome();
});


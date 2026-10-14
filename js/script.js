/* =====================================================
   PORTFOLIO DE PAOLO LANDÓ - JAVASCRIPT
   Qué hace este archivo:
   1. Cambia entre modo oscuro y claro
   2. Abre y cierra el menú en celulares
   3. Crea las tarjetas de proyectos desde un arreglo
   4. Filtra los proyectos mientras se escribe
   5. Valida el formulario de contacto
   ===================================================== */


/* -----------------------------------------------------
   VARIABLES Y CONSTANTES
   const = valor que no se reasigna | let = valor que puede cambiar
   ----------------------------------------------------- */

// Elementos del HTML que vamos a usar (selección del DOM)
const botonTema = document.getElementById("boton-tema");
const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu");
const listaProyectos = document.getElementById("lista-proyectos");
const buscador = document.getElementById("buscador-proyectos");
const sinResultados = document.getElementById("sin-resultados");
const formulario = document.getElementById("formulario");
const campoNombre = document.getElementById("nombre");
const campoEmail = document.getElementById("email");
const campoMensaje = document.getElementById("mensaje");
const contadorMensaje = document.getElementById("contador-mensaje");
const respuestaFormulario = document.getElementById("respuesta-formulario");

// Constante numérica: máximo de caracteres del mensaje
const MAX_MENSAJE = 500;

// Variable que guarda el tema actual (string)
let temaActual = "oscuro";

// Arreglo de objetos: cada objeto es un proyecto.
// Si querés agregar o cambiar un proyecto, se hace acá y la página se actualiza sola.
const proyectos = [
  {
    nombre: "Currency Converter Microservice",
    descripcion:
      "Refactoricé una aplicación de escritorio hecha en Java Swing y la convertí en un microservicio REST desacoplado. " +
      "Guarda los datos con Spring Data JPA y H2, actualiza las cotizaciones en segundo plano con @Scheduled, " +
      "maneja excepciones de forma global y tiene pruebas unitarias con JUnit 5 y Mockito. Está empaquetado en un contenedor Docker.",
    tecnologias: ["Java 17", "Spring Boot 3.2", "Spring Data JPA", "H2", "JUnit 5", "Mockito", "Docker"],
    imagen: "img/proyecto-currency.svg",
    textoImagen: "Ilustración de una respuesta de la API de conversión de monedas",
    enlace: "https://github.com/PaoloLando/currency-converter-service",
    textoEnlace: "Ver en GitHub",
    estado: "Terminado"
  },
  {
    nombre: "Aprendo Fácil Web",
    descripcion:
      "Proyecto en equipo (4 personas), todavía en desarrollo. Mi parte es el frontend. " +
      "En la rama feat/login-form-integration integré el formulario de login (LoginForm) con el endpoint /api/auth/login, " +
      "configuré TypeScript y Vite, y resolví los conflictos de integración con develop. " +
      "En la rama feat/category-manager empecé el componente CategoryManager para administrar categorías. " +
      "El backend lo desarrollan mis compañeros.",
    tecnologias: ["React", "TypeScript", "Vite", "Git", "GitHub"],
    imagen: "img/proyecto-aprendofacil.svg",
    textoImagen: "Ilustración del formulario de login y del gestor de categorías",
    enlace: "https://github.com/Michibikii/aprendofacil-web",
    textoEnlace: "Ver repositorio del equipo",
    estado: "En desarrollo"
  },
  {
    nombre: "Este portfolio",
    descripcion:
      "Mi portfolio personal, hecho desde cero. Tiene diseño responsive con Flexbox y Grid, " +
      "modo oscuro y claro, un buscador de proyectos y un formulario de contacto validado con JavaScript.",
    tecnologias: ["HTML", "CSS", "JavaScript", "Git", "GitHub"],
    imagen: "img/proyecto-portfolio.svg",
    textoImagen: "Ilustración de un sitio web con barra de navegación",
    enlace: "https://github.com/PaoloLando/portfolio-paolo-lando",
    textoEnlace: "Ver en GitHub",
    estado: "Terminado"
  }
];


/* -----------------------------------------------------
   1. MODO OSCURO / CLARO
   ----------------------------------------------------- */

// Función que aplica un tema: cambia el atributo data-theme del <html> y el ícono del botón
function aplicarTema(tema) {
  temaActual = tema;

  // Estructura de control: if / else
  if (tema === "claro") {
    document.documentElement.setAttribute("data-theme", "claro");
    botonTema.textContent = "🌙";
  } else {
    document.documentElement.removeAttribute("data-theme");
    botonTema.textContent = "☀️";
  }

  // Guardo la elección para que se recuerde la próxima vez (try/catch por si el navegador lo bloquea)
  try {
    localStorage.setItem("tema", tema);
  } catch (error) {
    console.log("No se pudo guardar el tema:", error);
  }
}

// EVENTO CLICK: al tocar el botón se cambia de tema
botonTema.addEventListener("click", function () {
  const nuevoTema = temaActual === "oscuro" ? "claro" : "oscuro";
  aplicarTema(nuevoTema);
});

// Al cargar la página, recupero el tema guardado (si existe)
try {
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "claro") {
    aplicarTema("claro");
  }
} catch (error) {
  console.log("No se pudo leer el tema guardado:", error);
}


/* -----------------------------------------------------
   2. MENÚ PARA CELULARES
   ----------------------------------------------------- */

// EVENTO CLICK: abre o cierra el menú agregando/quitando una clase CSS
botonMenu.addEventListener("click", function () {
  // classList.toggle agrega la clase si no está y la quita si está
  const abierto = menu.classList.toggle("menu--abierto");
  botonMenu.setAttribute("aria-expanded", abierto);
});

// Al tocar un enlace del menú, se cierra (útil en celulares)
const enlacesMenu = document.querySelectorAll(".menu__lista a");
enlacesMenu.forEach(function (enlace) {
  enlace.addEventListener("click", function () {
    menu.classList.remove("menu--abierto");
    botonMenu.setAttribute("aria-expanded", false);
  });
});


/* -----------------------------------------------------
   3. CREAR LAS TARJETAS DE PROYECTOS
   ----------------------------------------------------- */

// Función que recibe un proyecto (objeto) y devuelve la tarjeta HTML ya armada
function crearTarjeta(proyecto) {
  // createElement crea un elemento nuevo
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("proyecto");

  const imagen = document.createElement("img");
  imagen.classList.add("proyecto__imagen");
  imagen.src = proyecto.imagen;
  imagen.alt = proyecto.textoImagen;

  const cuerpo = document.createElement("div");
  cuerpo.classList.add("proyecto__cuerpo");

  const estado = document.createElement("span");
  estado.classList.add("proyecto__estado");
  estado.textContent = proyecto.estado;

  const titulo = document.createElement("h3");
  titulo.textContent = proyecto.nombre;

  const descripcion = document.createElement("p");
  descripcion.classList.add("proyecto__descripcion");
  descripcion.textContent = proyecto.descripcion;

  // Lista de tecnologías: recorro el arreglo con un bucle for...of
  const tecnologias = document.createElement("ul");
  tecnologias.classList.add("etiquetas", "proyecto__tecnologias");
  for (const tecnologia of proyecto.tecnologias) {
    const item = document.createElement("li");
    item.textContent = tecnologia;
    tecnologias.appendChild(item);
  }

  const enlace = document.createElement("a");
  enlace.classList.add("boton", "boton--principal", "proyecto__enlace");
  enlace.href = proyecto.enlace;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.textContent = proyecto.textoEnlace;

  // appendChild mete un elemento dentro de otro
  cuerpo.appendChild(estado);
  cuerpo.appendChild(titulo);
  cuerpo.appendChild(descripcion);
  cuerpo.appendChild(tecnologias);
  cuerpo.appendChild(enlace);

  tarjeta.appendChild(imagen);
  tarjeta.appendChild(cuerpo);

  return tarjeta;
}

// Función que dibuja en pantalla la lista de proyectos que recibe
function mostrarProyectos(lista) {
  listaProyectos.innerHTML = ""; // vacío el contenedor antes de volver a dibujar

  lista.forEach(function (proyecto) {
    listaProyectos.appendChild(crearTarjeta(proyecto));
  });

  // Si no hay proyectos para mostrar, aparece el mensaje; si hay, se oculta
  sinResultados.hidden = lista.length > 0;
}

// Al abrir la página muestro todos los proyectos
mostrarProyectos(proyectos);


/* -----------------------------------------------------
   4. BUSCADOR DE PROYECTOS
   ----------------------------------------------------- */

// EVENTO INPUT: se ejecuta cada vez que el usuario escribe o borra una letra
buscador.addEventListener("input", function () {
  // trim() saca espacios de los costados; toLowerCase() pasa todo a minúscula
  const texto = buscador.value.trim().toLowerCase();

  // filter se queda solo con los proyectos que cumplen la condición
  const filtrados = proyectos.filter(function (proyecto) {
    const nombre = proyecto.nombre.toLowerCase();
    const tecnologias = proyecto.tecnologias.join(" ").toLowerCase();
    return nombre.includes(texto) || tecnologias.includes(texto);
  });

  mostrarProyectos(filtrados);
});


/* -----------------------------------------------------
   5. FORMULARIO DE CONTACTO
   ----------------------------------------------------- */

// Función que muestra (o borra) el error de un campo.
// "campo" es el input, "mensajeError" es el texto a mostrar ("" = sin error)
function mostrarError(campo, mensajeError) {
  const contenedor = campo.parentElement;                            // el <div class="campo">
  const textoError = document.getElementById("error-" + campo.id);   // el <span> del error

  textoError.textContent = mensajeError;

  // Cambio las clases para pintar el borde de rojo o de verde
  if (mensajeError === "") {
    contenedor.classList.remove("campo--error");
    contenedor.classList.add("campo--ok");
  } else {
    contenedor.classList.remove("campo--ok");
    contenedor.classList.add("campo--error");
  }
}

// Función de validación del nombre: devuelve true si está bien y false si está mal
function validarNombre() {
  const nombre = campoNombre.value.trim();

  if (nombre === "") {
    mostrarError(campoNombre, "Escribí tu nombre.");
    return false;
  }
  if (nombre.length < 2) {
    mostrarError(campoNombre, "El nombre debe tener al menos 2 letras.");
    return false;
  }

  mostrarError(campoNombre, "");
  return true;
}

// Función de validación del email, usando una expresión regular simple
function validarEmail() {
  const email = campoEmail.value.trim();
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    mostrarError(campoEmail, "Escribí tu email.");
    return false;
  }
  if (!formatoEmail.test(email)) {
    mostrarError(campoEmail, "El email no tiene un formato válido (ej: nombre@correo.com).");
    return false;
  }

  mostrarError(campoEmail, "");
  return true;
}

// Función de validación del mensaje
function validarMensaje() {
  const mensaje = campoMensaje.value.trim();

  if (mensaje === "") {
    mostrarError(campoMensaje, "Escribí un mensaje.");
    return false;
  }
  if (mensaje.length < 10) {
    mostrarError(campoMensaje, "El mensaje debe tener al menos 10 caracteres.");
    return false;
  }

  mostrarError(campoMensaje, "");
  return true;
}

// EVENTO INPUT en el mensaje: actualiza el contador de caracteres mientras se escribe
campoMensaje.addEventListener("input", function () {
  const cantidad = campoMensaje.value.length;
  contadorMensaje.textContent = cantidad + " / " + MAX_MENSAJE;

  // Si se pasa del máximo, el contador se pone rojo
  if (cantidad > MAX_MENSAJE) {
    contadorMensaje.style.color = "#ff6b6b";
  } else {
    contadorMensaje.style.color = "";
  }
});

// Valido cada campo cuando el usuario sale de él (evento blur)
campoNombre.addEventListener("blur", validarNombre);
campoEmail.addEventListener("blur", validarEmail);
campoMensaje.addEventListener("blur", validarMensaje);

// EVENTO SUBMIT: se ejecuta al apretar "Enviar mensaje"
formulario.addEventListener("submit", function (evento) {
  // preventDefault evita que el navegador recargue la página
  evento.preventDefault();

  // Ejecuto las tres validaciones (las guardo en variables para que se muestren todos los errores a la vez)
  const nombreOk = validarNombre();
  const emailOk = validarEmail();
  const mensajeOk = validarMensaje();

  // Si todo está bien, muestro la confirmación y limpio el formulario
  if (nombreOk && emailOk && mensajeOk) {
    const nombre = campoNombre.value.trim();

    respuestaFormulario.textContent = "¡Gracias, " + nombre + "! Tu mensaje fue validado correctamente.";
    respuestaFormulario.classList.add("respuesta--ok");
    respuestaFormulario.hidden = false;

    formulario.reset();
    contadorMensaje.textContent = "0 / " + MAX_MENSAJE;

    // Saco los bordes verdes de los campos
    document.querySelectorAll(".campo").forEach(function (campo) {
      campo.classList.remove("campo--ok", "campo--error");
    });
  } else {
    respuestaFormulario.hidden = true;
  }
});


/* -----------------------------------------------------
   6. AÑO ACTUAL EN EL PIE DE PÁGINA
   ----------------------------------------------------- */

// Date es un objeto que representa la fecha actual
document.getElementById("anio").textContent = new Date().getFullYear();

/* =====================================================
  PORTFOLIO DE PAOLO LANDÓ - JAVASCRIPT (página principal)
   ===================================================== */


/* -----------------------------------------------------
  VARIABLES Y CONSTANTES
   ----------------------------------------------------- */

const botonTema = document.getElementById("boton-tema");
const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu");
const listaProyectos = document.getElementById("lista-proyectos");
const mensajeCarga = document.getElementById("mensaje-carga");
const buscador = document.getElementById("buscador-proyectos");
const sinResultados = document.getElementById("sin-resultados");
const formulario = document.getElementById("formulario");
const campoNombre = document.getElementById("nombre");
const campoEmail = document.getElementById("email");
const campoMensaje = document.getElementById("mensaje");
const contadorMensaje = document.getElementById("contador-mensaje");
const respuestaFormulario = document.getElementById("respuesta-formulario");

const MAX_MENSAJE = 500;

const API_PROYECTOS = "/api/proyectos";
const API_HABILIDADES = "/api/habilidades";
const API_FORMACIONES = "/api/formaciones";

const contenedorHabilidades = document.getElementById("habilidades-dinamicas");
const contenedorFormacion = document.getElementById("formacion-dinamica");

let temaActual = "oscuro";
let proyectos = [];


/* -----------------------------------------------------
  1. MODO OSCURO / CLARO
   ----------------------------------------------------- */

function aplicarTema(tema) {
  temaActual = tema;

  if (tema === "claro") {
    document.documentElement.setAttribute("data-theme", "claro");
    botonTema.textContent = "🌙";
  } else {
    document.documentElement.removeAttribute("data-theme");
    botonTema.textContent = "☀️";
  }

  try {
    localStorage.setItem("tema", tema);
  } catch (error) {
    console.log("No se pudo guardar el tema:", error);
  }
}

botonTema.addEventListener("click", function () {
  const nuevoTema = temaActual === "oscuro" ? "claro" : "oscuro";
  aplicarTema(nuevoTema);
});

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

botonMenu.addEventListener("click", function () {
  const abierto = menu.classList.toggle("menu--abierto");
  botonMenu.setAttribute("aria-expanded", abierto);
});

const enlacesMenu = document.querySelectorAll(".menu__lista a");

enlacesMenu.forEach(function (enlace) {
  enlace.addEventListener("click", function () {
    menu.classList.remove("menu--abierto");
    botonMenu.setAttribute("aria-expanded", false);
  });
});


/* -----------------------------------------------------
  3. PROYECTOS: PEDIRLOS AL BACKEND Y CREAR LAS TARJETAS
   ----------------------------------------------------- */

function crearTarjeta(proyecto) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("proyecto");

  if (proyecto.imagen) {
    const imagen = document.createElement("img");
    imagen.classList.add("proyecto__imagen");
    imagen.src = proyecto.imagen;
    imagen.alt = "Captura del proyecto " + proyecto.nombre;
    tarjeta.appendChild(imagen);
  }

  const cuerpo = document.createElement("div");
  cuerpo.classList.add("proyecto__cuerpo");

  const avance = document.createElement("span");
  avance.classList.add("proyecto__estado");
  avance.textContent = proyecto.avance;

  const titulo = document.createElement("h3");
  titulo.textContent = proyecto.nombre;

  const descripcion = document.createElement("p");
  descripcion.classList.add("proyecto__descripcion");
  descripcion.textContent = proyecto.descripcion;

  const tecnologias = document.createElement("ul");
  tecnologias.classList.add("etiquetas", "proyecto__tecnologias");

  for (const tecnologia of proyecto.tecnologias) {
    const item = document.createElement("li");
    item.textContent = tecnologia;
    tecnologias.appendChild(item);
  }

  cuerpo.appendChild(avance);
  cuerpo.appendChild(titulo);
  cuerpo.appendChild(descripcion);
  cuerpo.appendChild(tecnologias);

  if (proyecto.enlace) {
    const enlace = document.createElement("a");
    enlace.classList.add("boton", "boton--principal", "proyecto__enlace");
    enlace.href = proyecto.enlace;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = "Ver proyecto";
    cuerpo.appendChild(enlace);
  }

  tarjeta.appendChild(cuerpo);

  return tarjeta;
}


function mostrarProyectos(lista) {
  listaProyectos.innerHTML = "";

  lista.forEach(function (proyecto) {
    listaProyectos.appendChild(crearTarjeta(proyecto));
  });

  if (lista.length === 0) {
    sinResultados.textContent =
      proyectos.length === 0
        ? "Todavía no hay proyectos publicados."
        : "No encontré ningún proyecto con esa búsqueda.";
  }

  sinResultados.hidden = lista.length > 0;
}


async function cargarProyectos() {
  try {
    const respuesta = await fetch(API_PROYECTOS);

    if (!respuesta.ok) {
      throw new Error("El servidor respondió con el código " + respuesta.status);
    }

    proyectos = await respuesta.json();

    mensajeCarga.hidden = true;
    mostrarProyectos(proyectos);

  } catch (error) {
    console.error("No se pudieron cargar los proyectos:", error);

    mensajeCarga.textContent =
      "No se pudieron cargar los proyectos. Verificá que el servidor esté encendido.";

    mensajeCarga.hidden = false;
  }
}

cargarProyectos();


/* -----------------------------------------------------
   3 BIS. HABILIDADES Y FORMACIÓN ACADÉMICA DINÁMICAS
   ----------------------------------------------------- */

// Muestra un mensaje dentro de un contenedor dinámico.
function mostrarEstadoDinamico(contenedor, texto) {
  if (!contenedor) return;

  contenedor.replaceChildren();

  const mensaje = document.createElement("p");
  mensaje.className = "mensaje-vacio";
  mensaje.textContent = texto;

  contenedor.appendChild(mensaje);
}


// Convierte una fecha YYYY-MM en MM/YYYY.
function formatearFecha(fecha) {
  if (!fecha) return "";

  const partes = String(fecha).split("-");

  return partes.length >= 2
    ? `${partes[1]}/${partes[0]}`
    : String(fecha);
}


// Pide las habilidades al backend y las muestra agrupadas por categoría.
async function cargarHabilidadesPublicas() {
  if (!contenedorHabilidades) return;

  try {
    const respuesta = await fetch(API_HABILIDADES);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const habilidades = await respuesta.json();

    contenedorHabilidades.replaceChildren();

    if (!Array.isArray(habilidades) || habilidades.length === 0) {
      mostrarEstadoDinamico(
        contenedorHabilidades,
        "Todavía no hay habilidades registradas."
      );

      return;
    }

    // Agrupo las habilidades según su categoría.
    const grupos = new Map();

    habilidades.forEach((habilidad) => {
      const categoria = habilidad.categoria || "Otras habilidades";

      if (!grupos.has(categoria)) {
        grupos.set(categoria, []);
      }

      grupos.get(categoria).push(habilidad);
    });

    // Creo un bloque visual por cada categoría.
    grupos.forEach((elementos, categoria) => {
      const grupo = document.createElement("div");
      grupo.className = "habilidades__grupo";

      const titulo = document.createElement("h4");
      titulo.textContent = categoria;

      const lista = document.createElement("ul");
      lista.className = "etiquetas";

      elementos.forEach((habilidad) => {
        const item = document.createElement("li");

        item.textContent =
          `${habilidad.nombre}${habilidad.nivel ? ` · ${habilidad.nivel}` : ""}`;

        lista.appendChild(item);
      });

      grupo.append(titulo, lista);
      contenedorHabilidades.appendChild(grupo);
    });

  } catch (error) {
    console.error("No se pudieron cargar las habilidades:", error);

    mostrarEstadoDinamico(
      contenedorHabilidades,
      "No se pudieron cargar las habilidades. Verificá que el servidor esté encendido."
    );
  }
}


// Pide las formaciones académicas al backend y las muestra en pantalla.
async function cargarFormacionPublica() {
  if (!contenedorFormacion) return;

  try {
    const respuesta = await fetch(API_FORMACIONES);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const formaciones = await respuesta.json();

    contenedorFormacion.replaceChildren();

    if (!Array.isArray(formaciones) || formaciones.length === 0) {
      mostrarEstadoDinamico(
        contenedorFormacion,
        "Todavía no hay formación académica registrada."
      );

      return;
    }

    formaciones.forEach((formacion) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta";

      const titulo = document.createElement("h3");
      titulo.textContent = formacion.titulo || "Formación académica";

      const institucion = document.createElement("h4");
      institucion.textContent = formacion.institucion || "";

      const fechas = document.createElement("p");

      const inicio = formatearFecha(formacion.fecha_inicio);

      const fin = formacion.en_curso
        ? "En curso"
        : formatearFecha(formacion.fecha_fin);

      fechas.textContent = [inicio, fin].filter(Boolean).join(" – ");

      tarjeta.append(titulo, institucion, fechas);

      if (formacion.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.textContent = formacion.descripcion;

        tarjeta.appendChild(descripcion);
      }

      contenedorFormacion.appendChild(tarjeta);
    });

  } catch (error) {
    console.error("No se pudo cargar la formación académica:", error);

    mostrarEstadoDinamico(
      contenedorFormacion,
      "No se pudo cargar la formación académica. Verificá que el servidor esté encendido."
    );
  }
}


// Ejecuto las dos funciones cuando se carga el archivo.
cargarHabilidadesPublicas();
cargarFormacionPublica();


/* -----------------------------------------------------
  4. BUSCADOR DE PROYECTOS
   ----------------------------------------------------- */

buscador.addEventListener("input", function () {
  const texto = buscador.value.trim().toLowerCase();

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

function mostrarError(campo, mensajeError) {
  const contenedor = campo.parentElement;
  const textoError = document.getElementById("error-" + campo.id);

  textoError.textContent = mensajeError;

  if (mensajeError === "") {
    contenedor.classList.remove("campo--error");
    contenedor.classList.add("campo--ok");
  } else {
    contenedor.classList.remove("campo--ok");
    contenedor.classList.add("campo--error");
  }
}


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


function validarEmail() {
  const email = campoEmail.value.trim();
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    mostrarError(campoEmail, "Escribí tu email.");
    return false;
  }

  if (!formatoEmail.test(email)) {
    mostrarError(
      campoEmail,
      "El email no tiene un formato válido (ej: nombre@correo.com)."
    );

    return false;
  }

  mostrarError(campoEmail, "");
  return true;
}


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


// Actualizo el contador de caracteres mientras se escribe.
campoMensaje.addEventListener("input", function () {
  const cantidad = campoMensaje.value.length;

  contadorMensaje.textContent = cantidad + " / " + MAX_MENSAJE;

  if (cantidad > MAX_MENSAJE) {
    contadorMensaje.style.color = "#ff6b6b";
  } else {
    contadorMensaje.style.color = "";
  }
});


campoNombre.addEventListener("blur", validarNombre);
campoEmail.addEventListener("blur", validarEmail);
campoMensaje.addEventListener("blur", validarMensaje);


// Valido el formulario al enviarlo.
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nombreOk = validarNombre();
  const emailOk = validarEmail();
  const mensajeOk = validarMensaje();

  if (nombreOk && emailOk && mensajeOk) {
    const nombre = campoNombre.value.trim();

    respuestaFormulario.textContent =
      "¡Gracias, " + nombre + "! Tu mensaje fue validado correctamente.";

    respuestaFormulario.classList.add("respuesta--ok");
    respuestaFormulario.hidden = false;

    formulario.reset();

    contadorMensaje.textContent = "0 / " + MAX_MENSAJE;

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

document.getElementById("anio").textContent = new Date().getFullYear();
/* =====================================================
   ADMINISTRACIÓN DE PROYECTOS (CRUD)
   Esta página se comunica con la API del backend con fetch:

     Consultar -> GET    /api/proyectos?todos=1
     Crear     -> POST   /api/proyectos
     Modificar -> PUT    /api/proyectos/:id
     Eliminar  -> DELETE /api/proyectos/:id
   ===================================================== */

// Dirección de la API (ruta relativa: el mismo servidor entrega esta página y la API)
const API = "/api/proyectos";

// Elementos del HTML
const formulario = document.getElementById("formulario-proyecto");
const tituloFormulario = document.getElementById("titulo-formulario");
const campoId = document.getElementById("proyecto-id");
const campoNombre = document.getElementById("proyecto-nombre");
const campoDescripcion = document.getElementById("proyecto-descripcion");
const campoTecnologias = document.getElementById("proyecto-tecnologias");
const campoImagen = document.getElementById("proyecto-imagen");
const campoEnlace = document.getElementById("proyecto-enlace");
const campoAvance = document.getElementById("proyecto-avance");
const campoEstado = document.getElementById("proyecto-estado");
const botonGuardar = document.getElementById("boton-guardar");
const botonCancelar = document.getElementById("boton-cancelar");
const mensajeAdmin = document.getElementById("mensaje-admin");
const mensajeTabla = document.getElementById("mensaje-tabla");
const tabla = document.getElementById("tabla-proyectos");
const cuerpoTabla = document.getElementById("cuerpo-tabla");

// Arreglo con los proyectos que hay en la base (se actualiza cada vez que se carga la tabla)
let proyectos = [];

// Aplico el tema (oscuro/claro) que se eligió en la página principal
try {
  if (localStorage.getItem("tema") === "claro") {
    document.documentElement.setAttribute("data-theme", "claro");
  }
} catch (error) {
  console.log("No se pudo leer el tema guardado:", error);
}


/* -----------------------------------------------------
   MENSAJES PARA EL USUARIO
   ----------------------------------------------------- */

// Muestra un mensaje de éxito
function mostrarOk(texto) {
  mensajeAdmin.className = "respuesta respuesta--ok";
  mensajeAdmin.textContent = texto;
  mensajeAdmin.hidden = false;
}

// Muestra un mensaje de error. "detalles" es la lista de errores de validación (opcional)
function mostrarError(texto, detalles) {
  mensajeAdmin.className = "respuesta respuesta--error";
  mensajeAdmin.textContent = texto;

  if (detalles && detalles.length > 0) {
    const lista = document.createElement("ul");
    lista.classList.add("respuesta__lista");
    detalles.forEach(function (detalle) {
      const item = document.createElement("li");
      item.textContent = detalle;
      lista.appendChild(item);
    });
    mensajeAdmin.appendChild(lista);
  }
  mensajeAdmin.hidden = false;
}


/* -----------------------------------------------------
   CONSULTAR (READ): cargar la tabla
   ----------------------------------------------------- */

// Función ASÍNCRONA: pide todos los proyectos (incluidos los borradores) y dibuja la tabla
async function cargarTabla() {
  try {
    const respuesta = await fetch(API + "?todos=1");
    if (!respuesta.ok) {
      throw new Error("Código " + respuesta.status);
    }
    proyectos = await respuesta.json();
    dibujarTabla();
  } catch (error) {
    console.error("Error al cargar los proyectos:", error);
    mensajeTabla.textContent = "No se pudieron cargar los proyectos. Verificá que el servidor esté encendido.";
    mensajeTabla.hidden = false;
    tabla.hidden = true;
  }
}

// Crea una celda <td> con un texto
function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

// Dibuja una fila por cada proyecto
function dibujarTabla() {
  cuerpoTabla.innerHTML = "";

  if (proyectos.length === 0) {
    mensajeTabla.textContent = "Todavía no hay proyectos guardados.";
    mensajeTabla.hidden = false;
    tabla.hidden = true;
    return;
  }

  mensajeTabla.hidden = true;
  tabla.hidden = false;

  proyectos.forEach(function (proyecto) {
    const fila = document.createElement("tr");

    fila.appendChild(crearCelda(proyecto.nombre));
    fila.appendChild(crearCelda(proyecto.avance));

    // Celda del estado con una "etiqueta" de color
    const celdaEstado = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.classList.add("insignia", "insignia--" + proyecto.estado);
    etiqueta.textContent = proyecto.estado;
    celdaEstado.appendChild(etiqueta);
    fila.appendChild(celdaEstado);

    // Celda con los botones Editar y Eliminar
    const celdaAcciones = document.createElement("td");
    const botones = document.createElement("div");
    botones.classList.add("botones-fila");

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.classList.add("boton", "boton--secundario", "boton--chico");
    botonEditar.textContent = "Editar";
    // EVENTO CLICK: cargo los datos de este proyecto en el formulario
    botonEditar.addEventListener("click", function () {
      prepararEdicion(proyecto);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.classList.add("boton", "boton--peligro", "boton--chico");
    botonEliminar.textContent = "Eliminar";
    // EVENTO CLICK: elimino este proyecto
    botonEliminar.addEventListener("click", function () {
      eliminarProyecto(proyecto);
    });

    botones.appendChild(botonEditar);
    botones.appendChild(botonEliminar);
    celdaAcciones.appendChild(botones);
    fila.appendChild(celdaAcciones);

    cuerpoTabla.appendChild(fila);
  });
}


/* -----------------------------------------------------
   CREAR (CREATE) Y MODIFICAR (UPDATE): el formulario
   ----------------------------------------------------- */

// Vuelve el formulario al modo "crear proyecto"
function reiniciarFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Nuevo proyecto";
  botonGuardar.textContent = "Crear proyecto";
  botonCancelar.hidden = true;
}

// Carga un proyecto en el formulario para poder modificarlo
function prepararEdicion(proyecto) {
  campoId.value = proyecto.id;
  campoNombre.value = proyecto.nombre;
  campoDescripcion.value = proyecto.descripcion;
  campoTecnologias.value = proyecto.tecnologias.join(", "); // el arreglo pasa a texto separado por comas
  campoImagen.value = proyecto.imagen;
  campoEnlace.value = proyecto.enlace;
  campoAvance.value = proyecto.avance;
  campoEstado.value = proyecto.estado;

  tituloFormulario.textContent = "Editar proyecto #" + proyecto.id;
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  mensajeAdmin.hidden = true;

  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

// EVENTO CLICK: cancelar la edición
botonCancelar.addEventListener("click", function () {
  reiniciarFormulario();
  mensajeAdmin.hidden = true;
});

// EVENTO SUBMIT: al enviar el formulario se crea o se modifica, según haya o no un id
formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault(); // evita que el navegador recargue la página

  // Armo el objeto con los datos del formulario.
  // Las tecnologías se escriben separadas por coma: las convierto en un arreglo.
  const datos = {
    nombre: campoNombre.value,
    descripcion: campoDescripcion.value,
    tecnologias: campoTecnologias.value.split(",").map(function (t) {
      return t.trim();
    }),
    imagen: campoImagen.value,
    enlace: campoEnlace.value,
    avance: campoAvance.value,
    estado: campoEstado.value,
  };

  // Si el campo oculto tiene id, es una modificación (PUT); si no, una creación (POST)
  const editando = campoId.value !== "";
  const url = editando ? API + "/" + campoId.value : API;
  const metodo = editando ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" }, // le aviso al servidor que le mando JSON
      body: JSON.stringify(datos),                      // convierte el objeto en texto JSON
    });

    const resultado = await respuesta.json(); // lo que contestó el servidor

    if (respuesta.ok) {
      mostrarOk(editando ? "Proyecto modificado correctamente." : "Proyecto creado correctamente.");
      reiniciarFormulario();
      await cargarTabla();
    } else {
      // El servidor rechazó los datos (400) o no encontró el proyecto (404)
      mostrarError(resultado.error || "No se pudo guardar el proyecto.", resultado.errores);
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    mostrarError("No se pudo conectar con el servidor. Verificá que esté encendido.");
  }
});


/* -----------------------------------------------------
   ELIMINAR (DELETE)
   ----------------------------------------------------- */

async function eliminarProyecto(proyecto) {
  // confirm muestra un cuadro de Aceptar / Cancelar
  const confirmado = confirm('¿Seguro que querés eliminar "' + proyecto.nombre + '"? Esta acción no se puede deshacer.');
  if (!confirmado) {
    return;
  }

  try {
    const respuesta = await fetch(API + "/" + proyecto.id, { method: "DELETE" });

    if (respuesta.ok) {
      mostrarOk('Proyecto "' + proyecto.nombre + '" eliminado.');
      // Si justo estaba editando ese proyecto, limpio el formulario
      if (campoId.value === String(proyecto.id)) {
        reiniciarFormulario();
      }
      await cargarTabla();
    } else {
      const resultado = await respuesta.json();
      mostrarError(resultado.error || "No se pudo eliminar el proyecto.");
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
    mostrarError("No se pudo conectar con el servidor. Verificá que esté encendido.");
  }
}


// Al abrir la página cargo la tabla
cargarTabla();

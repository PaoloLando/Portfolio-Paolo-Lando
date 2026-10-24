/* =====================================================
   VALIDACIÓN DE LOS DATOS QUE LLEGAN DEL FRONTEND
   Nunca hay que confiar en lo que manda el cliente: acá se controla
   que el proyecto tenga los campos y valores correctos antes de guardarlo.
   ===================================================== */

import { AVANCES, ESTADOS } from "./types";
import type { Avance, EstadoPublicacion, ProyectoNuevo } from "./types";

// El resultado es uno de dos casos (tipo unión):
//  - { ok: true, datos }     -> todo bien, con los datos ya limpios
//  - { ok: false, errores }  -> algo está mal, con la lista de mensajes
export type ResultadoValidacion =
  | { ok: true; datos: ProyectoNuevo }
  | { ok: false; errores: string[] };

// Devuelve el valor como texto sin espacios en los costados ("" si no era un texto).
function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

// Comprueba que sea una URL http o https válida.
function esUrlHttp(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validarProyecto(cuerpo: unknown): ResultadoValidacion {
  // El cuerpo tiene que ser un objeto JSON
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return { ok: false, errores: ["El cuerpo de la petición debe ser un objeto JSON."] };
  }

  const c = cuerpo as Record<string, unknown>;
  const errores: string[] = [];

  // --- nombre ---
  const nombre = texto(c.nombre);
  if (nombre.length < 3 || nombre.length > 100) {
    errores.push("El nombre es obligatorio y debe tener entre 3 y 100 caracteres.");
  }

  // --- descripción ---
  const descripcion = texto(c.descripcion);
  if (descripcion.length < 10 || descripcion.length > 1000) {
    errores.push("La descripción es obligatoria y debe tener entre 10 y 1000 caracteres.");
  }

  // --- tecnologías: arreglo de textos, al menos una ---
  let tecnologias: string[] = [];
  if (Array.isArray(c.tecnologias)) {
    tecnologias = c.tecnologias.map(texto).filter((t) => t !== ""); // saco las vacías
  }
  if (tecnologias.length === 0) {
    errores.push("Indicá al menos una tecnología.");
  } else if (tecnologias.length > 15 || tecnologias.some((t) => t.length > 40)) {
    errores.push("Máximo 15 tecnologías, de hasta 40 caracteres cada una.");
  }

  // --- imagen: opcional. Si viene, tiene que ser una ruta "img/..." o una URL ---
  const imagen = texto(c.imagen);
  if (imagen !== "" && !esUrlHttp(imagen) && !/^img\/[\w./-]+$/.test(imagen)) {
    errores.push('La imagen debe ser una ruta que empiece con "img/" o una URL http(s).');
  }

  // --- enlace: opcional. Si viene, tiene que ser una URL http(s) ---
  const enlace = texto(c.enlace);
  if (enlace !== "" && !esUrlHttp(enlace)) {
    errores.push("El enlace debe ser una URL válida que empiece con http:// o https://.");
  }

  // --- avance y estado: solo pueden valer los valores permitidos ---
  if (!AVANCES.includes(c.avance as Avance)) {
    errores.push('El avance debe ser "En desarrollo" o "Terminado".');
  }
  if (!ESTADOS.includes(c.estado as EstadoPublicacion)) {
    errores.push('El estado debe ser "publicado" o "borrador".');
  }

  // Si hubo algún error, lo devuelvo
  if (errores.length > 0) {
    return { ok: false, errores };
  }

  // Todo bien: devuelvo los datos limpios
  return {
    ok: true,
    datos: {
      nombre,
      descripcion,
      tecnologias,
      imagen,
      enlace,
      avance: c.avance as Avance,
      estado: c.estado as EstadoPublicacion,
    },
  };
}

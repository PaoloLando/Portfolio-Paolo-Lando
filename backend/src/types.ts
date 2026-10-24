/* =====================================================
   TIPOS DE TYPESCRIPT DEL PROYECTO
   Acá se define "cómo es" un proyecto. Todo el backend usa estos tipos,
   así si me equivoco con un campo, TypeScript me avisa antes de ejecutar.
   ===================================================== */

// Tipo unión: el estado de publicación SOLO puede valer una de estas dos opciones.
export type EstadoPublicacion = "publicado" | "borrador";

// Otro tipo unión: en qué punto está el proyecto.
export type Avance = "En desarrollo" | "Terminado";

// Interfaz: describe las propiedades de un proyecto y el tipo de cada una.
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  tecnologias: string[];      // arreglo de textos
  imagen: string;             // ruta (img/...) o URL
  enlace: string;             // URL del repositorio o sitio
  avance: Avance;
  estado: EstadoPublicacion;
}

// Un proyecto nuevo es igual a Proyecto pero SIN id (el id lo asigna la base de datos).
// Omit<...> crea ese tipo a partir del anterior, sin repetir las propiedades.
export type ProyectoNuevo = Omit<Proyecto, "id">;

// Listas con los valores permitidos (las usa la validación).
export const ESTADOS: EstadoPublicacion[] = ["publicado", "borrador"];
export const AVANCES: Avance[] = ["En desarrollo", "Terminado"];

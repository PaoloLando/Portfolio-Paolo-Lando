/* =====================================================
   REPOSITORIO: ÚNICO LUGAR QUE HABLA CON LA BASE DE DATOS
   Acá están las consultas SQL del CRUD. Las rutas no escriben SQL:
   le piden estas funciones lo que necesitan.
   Los signos "?" son parámetros: SQLite reemplaza cada uno por el valor
   correspondiente de forma segura (evita la inyección SQL).
   ===================================================== */

import { db } from "./db";
import type { Avance, EstadoPublicacion, Proyecto, ProyectoNuevo } from "./types";

// La base devuelve filas "crudas" (la lista de tecnologías es un texto JSON).
// Esta función las convierte a un objeto Proyecto con los tipos correctos.
function filaAProyecto(fila: Record<string, unknown>): Proyecto {
  return {
    id: Number(fila.id),
    nombre: String(fila.nombre),
    descripcion: String(fila.descripcion),
    tecnologias: JSON.parse(String(fila.tecnologias)) as string[],
    imagen: String(fila.imagen),
    enlace: String(fila.enlace),
    avance: fila.avance as Avance,
    estado: fila.estado as EstadoPublicacion,
  };
}

// READ (todos): si soloPublicados es true, devuelve solo los de estado "publicado".
export function listar(soloPublicados: boolean): Proyecto[] {
  const sql = soloPublicados
    ? "SELECT * FROM proyectos WHERE estado = 'publicado' ORDER BY id"
    : "SELECT * FROM proyectos ORDER BY id";
  return db.prepare(sql).all().map(filaAProyecto);
}

// READ (uno): devuelve el proyecto con ese id, o undefined si no existe.
export function obtener(id: number): Proyecto | undefined {
  const fila = db.prepare("SELECT * FROM proyectos WHERE id = ?").get(id);
  return fila ? filaAProyecto(fila) : undefined;
}

// CREATE: inserta un proyecto nuevo y lo devuelve ya con su id.
export function crear(datos: ProyectoNuevo): Proyecto {
  const resultado = db
    .prepare(
      `INSERT INTO proyectos (nombre, descripcion, tecnologias, imagen, enlace, avance, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      datos.nombre,
      datos.descripcion,
      JSON.stringify(datos.tecnologias), // el arreglo se guarda como texto JSON
      datos.imagen,
      datos.enlace,
      datos.avance,
      datos.estado
    );
  // lastInsertRowid es el id que la base le asignó al nuevo registro
  return obtener(Number(resultado.lastInsertRowid)) as Proyecto;
}

// UPDATE: reemplaza los datos del proyecto. Devuelve el proyecto actualizado,
// o undefined si no existía ningún proyecto con ese id.
export function actualizar(id: number, datos: ProyectoNuevo): Proyecto | undefined {
  const resultado = db
    .prepare(
      `UPDATE proyectos
       SET nombre = ?, descripcion = ?, tecnologias = ?, imagen = ?, enlace = ?, avance = ?, estado = ?
       WHERE id = ?`
    )
    .run(
      datos.nombre,
      datos.descripcion,
      JSON.stringify(datos.tecnologias),
      datos.imagen,
      datos.enlace,
      datos.avance,
      datos.estado,
      id
    );
  // "changes" es la cantidad de filas modificadas: si es 0, no existía ese id
  return resultado.changes > 0 ? obtener(id) : undefined;
}

// DELETE: borra el proyecto. Devuelve true si se borró, false si no existía.
export function eliminar(id: number): boolean {
  const resultado = db.prepare("DELETE FROM proyectos WHERE id = ?").run(id);
  return resultado.changes > 0;
}

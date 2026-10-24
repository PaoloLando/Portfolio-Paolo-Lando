/* =====================================================
   RUTAS (ENDPOINTS) DE LA API DE PROYECTOS
   Cada ruta combina un método HTTP con una dirección:

     GET    /api/proyectos        -> lista los proyectos publicados
     GET    /api/proyectos?todos=1-> lista todos (la usa la página de administración)
     GET    /api/proyectos/:id    -> devuelve uno
     POST   /api/proyectos        -> crea uno nuevo
     PUT    /api/proyectos/:id    -> modifica uno existente
     DELETE /api/proyectos/:id    -> elimina uno

   Códigos de respuesta: 200 OK, 201 Creado, 204 Sin contenido,
   400 Datos inválidos, 404 No encontrado.
   ===================================================== */

import { Router } from "express";
import { actualizar, crear, eliminar, listar, obtener } from "./repositorio";
import { validarProyecto } from "./validacion";

const rutas = Router();

// El id viene en la URL como texto. Lo convierto a número y compruebo que sea válido.
function leerId(valor: string): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// CONSULTAR todos
rutas.get("/", (req, res) => {
  const todos = req.query.todos === "1"; // ?todos=1 incluye los borradores
  res.json(listar(!todos));
});

// CONSULTAR uno
rutas.get("/:id", (req, res) => {
  const id = leerId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "El id debe ser un número entero positivo." });
    return;
  }

  const proyecto = obtener(id);
  if (!proyecto) {
    res.status(404).json({ error: "Proyecto no encontrado." });
    return;
  }
  res.json(proyecto);
});

// CREAR
rutas.post("/", (req, res) => {
  const validacion = validarProyecto(req.body); // req.body es el JSON que mandó el frontend
  if (!validacion.ok) {
    res.status(400).json({ error: "Datos inválidos.", errores: validacion.errores });
    return;
  }

  const nuevo = crear(validacion.datos);
  res.status(201).json(nuevo); // 201 = creado
});

// MODIFICAR
rutas.put("/:id", (req, res) => {
  const id = leerId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "El id debe ser un número entero positivo." });
    return;
  }

  const validacion = validarProyecto(req.body);
  if (!validacion.ok) {
    res.status(400).json({ error: "Datos inválidos.", errores: validacion.errores });
    return;
  }

  const actualizado = actualizar(id, validacion.datos);
  if (!actualizado) {
    res.status(404).json({ error: "Proyecto no encontrado." });
    return;
  }
  res.json(actualizado);
});

// ELIMINAR
rutas.delete("/:id", (req, res) => {
  const id = leerId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "El id debe ser un número entero positivo." });
    return;
  }

  if (!eliminar(id)) {
    res.status(404).json({ error: "Proyecto no encontrado." });
    return;
  }
  res.status(204).end(); // 204 = se borró, no hay nada más para devolver
});

export default rutas;

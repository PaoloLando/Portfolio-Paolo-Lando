/* =====================================================
   SERVIDOR EXPRESS
   Arranca el servidor, conecta las rutas de la API y también entrega
   los archivos del frontend (HTML, CSS, JS e imágenes).
   Así se usa un solo comando y no hace falta configurar CORS.
   ===================================================== */

import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import { rutaBD } from "./db"; // al importar db.ts se abre la base y se crea la tabla
import rutasProyectos from "./rutas";

const app = express();
const PUERTO = Number(process.env.PORT ?? 3000);

// Middleware: convierte el JSON que llega en el cuerpo de la petición en un objeto (req.body)
app.use(express.json());

// Todas las rutas de proyectos cuelgan de /api/proyectos
app.use("/api/proyectos", rutasProyectos);

// Si piden una ruta de la API que no existe, respondo 404 en JSON
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

// Entrego los archivos del frontend (la carpeta ../../frontend respecto de este archivo)
const carpetaFrontend = path.resolve(import.meta.dirname, "../../frontend");
app.use(express.static(carpetaFrontend));

// Manejo de errores: si algo falla (por ejemplo, un JSON mal escrito), respondo con un mensaje claro
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: "El JSON enviado no es válido." });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PUERTO, () => {
  console.log(`Servidor listo en http://localhost:${PUERTO}`);
  console.log(`Base de datos: ${rutaBD}`);
});

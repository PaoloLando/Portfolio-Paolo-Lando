import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import { rutaBD } from "./db";
import rutasProyectos, { rutasFormacion, rutasHabilidades } from "./rutas";
import rutasUsuarios from "./usuarios";

const app = express();
const PUERTO = Number(process.env.PORT ?? 3000);
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rutasUsuarios);
app.use("/api/proyectos", rutasProyectos);
app.use("/api/habilidades", rutasHabilidades);
app.use("/api/formaciones", rutasFormacion);
app.use("/api", (_req, res) => res.status(404).json({ error: "Ruta no encontrada." }));
const carpetaFrontend = path.resolve(import.meta.dirname, "../../frontend");
app.use(express.static(carpetaFrontend));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError) { res.status(400).json({ error: "El JSON enviado no es válido." }); return; }
  console.error(error); res.status(500).json({ error: "Error interno del servidor." });
});
app.listen(PUERTO, () => {
  console.log(`Portfolio disponible en http://localhost:${PUERTO}`);
  console.log(`Base de datos: ${rutaBD}`);
});

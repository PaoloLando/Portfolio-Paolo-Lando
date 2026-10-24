/* =====================================================
   CONEXIÓN A LA BASE DE DATOS (SQLite)
   Abre (o crea) el archivo de la base y se asegura de que exista la tabla.
   ===================================================== */

import "dotenv/config"; // lee el archivo .env y carga sus valores en process.env
import { DatabaseSync } from "node:sqlite"; // SQLite viene incluida en Node
import fs from "node:fs";
import path from "node:path";

// Ruta del archivo de la base: sale del .env, y si no está definida usa un valor por defecto.
const rutaBD = path.resolve(process.env.DB_PATH ?? "./data/portfolio.db");

// Si la carpeta donde va el archivo no existe, la creo.
fs.mkdirSync(path.dirname(rutaBD), { recursive: true });

// Abro la conexión. Si el archivo no existe, SQLite lo crea vacío.
export const db = new DatabaseSync(rutaBD);

// Leo el esquema (db/schema.sql) y lo ejecuto para crear la tabla si todavía no existe.
const rutaEsquema = path.resolve(import.meta.dirname, "../db/schema.sql");
db.exec(fs.readFileSync(rutaEsquema, "utf-8"));

export { rutaBD };

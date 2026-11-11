import {
  createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response, NextFunction } from "express";
import type { Rol } from "./types";

const scrypt = promisify(scryptCallback);
const secret = process.env.JWT_SECRET ?? "";
if (secret.length < 32) {
  throw new Error("Configurá JWT_SECRET en backend/.env (mínimo 32 caracteres).");
}
export interface TokenUsuario { id: number; username: string; rol: Rol; }
export interface RequestAutenticado extends Request { usuario?: TokenUsuario; }

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}
export async function compararPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, originalHex] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !originalHex) return false;
  const original = Buffer.from(originalHex, "hex");
  const derived = await scrypt(password, salt, original.length) as Buffer;
  return original.length === derived.length && timingSafeEqual(original, derived);
}
function firma(data: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}
export function crearToken(usuario: TokenUsuario): string {
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ ...usuario, iat: ahora, exp: ahora + 4 * 60 * 60 })).toString("base64url");
  const contenido = `${cabecera}.${payload}`;
  return `${contenido}.${firma(contenido)}`;
}
export function verificarToken(token: string): TokenUsuario {
  const partes = token.split(".");
  if (partes.length !== 3) throw new Error("Token inválido");
  const contenido = `${partes[0]}.${partes[1]}`;
  const esperado = Buffer.from(firma(contenido));
  const recibido = Buffer.from(partes[2]);
  if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) throw new Error("Firma inválida");
  const payload = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8"));
  if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000 ||
      !Number.isInteger(payload.id) || typeof payload.username !== "string" ||
      !["admin", "visitante"].includes(payload.rol)) throw new Error("Token vencido o inválido");
  return { id: payload.id, username: payload.username, rol: payload.rol };
}
export function requiereLogin(req: RequestAutenticado, res: Response, next: NextFunction) {
  const cabecera = req.headers.authorization;
  const token = cabecera?.startsWith("Bearer ") ? cabecera.slice(7) : "";
  if (!token) { res.status(401).json({ error: "Tenés que iniciar sesión." }); return; }
  try { req.usuario = verificarToken(token); next(); }
  catch { res.status(401).json({ error: "La sesión venció o el token no es válido." }); }
}
export function requiereAdmin(req: RequestAutenticado, res: Response, next: NextFunction) {
  if (req.usuario?.rol !== "admin") { res.status(403).json({ error: "Acceso restringido al administrador." }); return; }
  next();
}

import { Router } from "express";
import { db } from "./db";
import { compararPassword, crearToken, requiereLogin } from "./auth";
import type { RequestAutenticado } from "./auth";

const router = Router();
router.post("/login", async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!username || !password) { res.status(400).json({ error: "Ingresá usuario y contraseña." }); return; }
  const usuario = db.prepare("SELECT id, username, password_hash, rol FROM usuarios WHERE username = ?").get(username) as
    { id: number; username: string; password_hash: string; rol: "admin" | "visitante" } | undefined;
  if (!usuario || !(await compararPassword(password, usuario.password_hash))) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos." }); return;
  }
  const token = crearToken({ id: usuario.id, username: usuario.username, rol: usuario.rol });
  res.json({ token, username: usuario.username, rol: usuario.rol });
});
router.get("/me", requiereLogin, (req: RequestAutenticado, res) => res.json({ usuario: req.usuario }));
export default router;

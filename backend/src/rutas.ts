import { Router } from "express";
import { verificarToken } from "./auth";
import { db } from "./db";
import { actualizar, crear, eliminar, listar, obtener } from "./repositorio";
import { validarProyecto } from "./validacion";
import { requiereAdmin, requiereLogin } from "./auth";
import type { HabilidadNueva, FormacionNueva, Nivel } from "./types";
import { NIVELES } from "./types";

const rutas = Router();
function leerId(valor: string): number | null {
  const id = Number(valor); return Number.isInteger(id) && id > 0 ? id : null;
}
function texto(v: unknown): string { return typeof v === "string" ? v.trim() : ""; }
function validarId(idTexto: string, res: import("express").Response): number | null {
  const id = leerId(idTexto);
  if (id === null) res.status(400).json({ error: "El id debe ser un entero positivo." });
  return id;
}

// PROYECTOS: lectura pública; todas las escrituras y la lectura de borradores requieren admin.
rutas.get("/", (req, res) => {
  if (req.query.todos === "1") {
    const cabecera = req.headers.authorization;
    const token = cabecera?.startsWith("Bearer ") ? cabecera.slice(7) : "";
    try {
      const usuario = verificarToken(token);
      if (usuario.rol !== "admin") { res.status(403).json({ error: "Acceso restringido." }); return; }
    } catch { res.status(401).json({ error: "Iniciá sesión como administrador." }); return; }
    res.json(listar(false)); return;
  }
  res.json(listar(true));
});
rutas.get("/:id", (req, res) => {
  const id = validarId(req.params.id, res); if (id === null) return;
  const proyecto = obtener(id);
  if (!proyecto || proyecto.estado !== "publicado") { res.status(404).json({ error: "Proyecto no encontrado." }); return; }
  res.json(proyecto);
});
rutas.post("/", requiereLogin, requiereAdmin, (req, res) => {
  const v = validarProyecto(req.body);
  if (!v.ok) { res.status(400).json({ error: "Datos inválidos.", errores: v.errores }); return; }
  res.status(201).json(crear(v.datos));
});
rutas.put("/:id", requiereLogin, requiereAdmin, (req, res) => {
  const id = validarId(req.params.id, res); if (id === null) return;
  const v = validarProyecto(req.body);
  if (!v.ok) { res.status(400).json({ error: "Datos inválidos.", errores: v.errores }); return; }
  const actualizado = actualizar(id, v.datos);
  if (!actualizado) { res.status(404).json({ error: "Proyecto no encontrado." }); return; }
  res.json(actualizado);
});
rutas.delete("/:id", requiereLogin, requiereAdmin, (req, res) => {
  const id = validarId(req.params.id, res); if (id === null) return;
  if (!eliminar(id)) { res.status(404).json({ error: "Proyecto no encontrado." }); return; }
  res.status(204).end();
});

// HABILIDADES: visitantes consultan; solo admin modifica.
export const rutasHabilidades = Router();
rutasHabilidades.get("/", (_req, res) => {
  res.json(db.prepare("SELECT * FROM habilidades ORDER BY id").all());
});
rutasHabilidades.post("/", requiereLogin, requiereAdmin, (req, res) => {
  const nombre = texto(req.body?.nombre), categoria = texto(req.body?.categoria), nivel = req.body?.nivel as Nivel;
  if (nombre.length < 2 || nombre.length > 80 || !categoria || categoria.length > 60 || !NIVELES.includes(nivel)) {
    res.status(400).json({ error: "Completá nombre, categoría y un nivel válido (Básico, Intermedio o Avanzado)." }); return;
  }
  const result = db.prepare("INSERT INTO habilidades (nombre,categoria,nivel) VALUES (?,?,?)").run(nombre,categoria,nivel);
  res.status(201).json(db.prepare("SELECT * FROM habilidades WHERE id=?").get(Number(result.lastInsertRowid)));
});
rutasHabilidades.put("/:id", requiereLogin, requiereAdmin, (req, res) => {
  const id = validarId(req.params.id,res); if(id===null)return;
  const nombre=texto(req.body?.nombre), categoria=texto(req.body?.categoria), nivel=req.body?.nivel as Nivel;
  if(nombre.length<2 || nombre.length>80 || !categoria || categoria.length>60 || !NIVELES.includes(nivel)){res.status(400).json({error:"Datos de habilidad inválidos."});return;}
  const r=db.prepare("UPDATE habilidades SET nombre=?,categoria=?,nivel=? WHERE id=?").run(nombre,categoria,nivel,id);
  if(!r.changes){res.status(404).json({error:"Habilidad no encontrada."});return;}
  res.json(db.prepare("SELECT * FROM habilidades WHERE id=?").get(id));
});
rutasHabilidades.delete("/:id", requiereLogin, requiereAdmin, (req,res)=>{
  const id=validarId(req.params.id,res);if(id===null)return;
  const r=db.prepare("DELETE FROM habilidades WHERE id=?").run(id);
  if(!r.changes){res.status(404).json({error:"Habilidad no encontrada."});return;} res.status(204).end();
});

// FORMACIÓN ACADÉMICA.
export const rutasFormacion = Router();
rutasFormacion.get("/", (_req,res)=>res.json(db.prepare("SELECT * FROM formaciones ORDER BY fecha_inicio DESC,id DESC").all().map((f:any)=>({...f,en_curso:Boolean(f.en_curso)}))));
function validarFormacion(body: any): FormacionNueva | null {
  const institucion=texto(body?.institucion), titulo=texto(body?.titulo), descripcion=texto(body?.descripcion);
  const fecha_inicio=texto(body?.fecha_inicio), fecha_fin=texto(body?.fecha_fin), en_curso=Boolean(body?.en_curso);
  if(institucion.length<2 || titulo.length<2 || !/^\d{4}-\d{2}(-\d{2})?$/.test(fecha_inicio) ||
    (!en_curso && !/^\d{4}-\d{2}(-\d{2})?$/.test(fecha_fin))) return null;
  return {institucion,titulo,descripcion,fecha_inicio,fecha_fin:en_curso?"":fecha_fin,en_curso};
}
rutasFormacion.post("/", requiereLogin, requiereAdmin,(req,res)=>{
  const d=validarFormacion(req.body);if(!d){res.status(400).json({error:"Completá institución, título y fechas válidas."});return;}
  const r=db.prepare("INSERT INTO formaciones(institucion,titulo,descripcion,fecha_inicio,fecha_fin,en_curso) VALUES(?,?,?,?,?,?)")
    .run(d.institucion,d.titulo,d.descripcion,d.fecha_inicio,d.fecha_fin,d.en_curso?1:0);
  res.status(201).json({...db.prepare("SELECT * FROM formaciones WHERE id=?").get(Number(r.lastInsertRowid)) as object,en_curso:d.en_curso});
});
rutasFormacion.put("/:id", requiereLogin, requiereAdmin,(req,res)=>{
  const id=validarId(req.params.id,res);if(id===null)return;const d=validarFormacion(req.body);
  if(!d){res.status(400).json({error:"Datos de formación inválidos."});return;}
  const r=db.prepare("UPDATE formaciones SET institucion=?,titulo=?,descripcion=?,fecha_inicio=?,fecha_fin=?,en_curso=? WHERE id=?")
    .run(d.institucion,d.titulo,d.descripcion,d.fecha_inicio,d.fecha_fin,d.en_curso?1:0,id);
  if(!r.changes){res.status(404).json({error:"Formación no encontrada."});return;}
  res.json({...db.prepare("SELECT * FROM formaciones WHERE id=?").get(id) as object,en_curso:d.en_curso});
});
rutasFormacion.delete("/:id", requiereLogin, requiereAdmin,(req,res)=>{
  const id=validarId(req.params.id,res);if(id===null)return;const r=db.prepare("DELETE FROM formaciones WHERE id=?").run(id);
  if(!r.changes){res.status(404).json({error:"Formación no encontrada."});return;}res.status(204).end();
});
export default rutas;

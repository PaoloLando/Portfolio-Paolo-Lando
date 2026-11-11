/* Tipos e interfaces compartidos del backend. */
export type EstadoPublicacion = "publicado" | "borrador";
export type Avance = "En desarrollo" | "Terminado";
export type Rol = "admin" | "visitante";
export type Nivel = "Básico" | "Intermedio" | "Avanzado";

export interface Proyecto {
  id: number; nombre: string; descripcion: string; tecnologias: string[];
  imagen: string; enlace: string; avance: Avance; estado: EstadoPublicacion;
}
export type ProyectoNuevo = Omit<Proyecto, "id">;

export interface Usuario {
  id: number; username: string; password_hash: string; rol: Rol;
}
export interface Habilidad {
  id: number; nombre: string; categoria: string; nivel: Nivel;
}
export type HabilidadNueva = Omit<Habilidad, "id">;
export interface Formacion {
  id: number; institucion: string; titulo: string; descripcion: string;
  fecha_inicio: string; fecha_fin: string; en_curso: boolean;
}
export type FormacionNueva = Omit<Formacion, "id">;

export const ESTADOS: EstadoPublicacion[] = ["publicado", "borrador"];
export const AVANCES: Avance[] = ["En desarrollo", "Terminado"];
export const NIVELES: Nivel[] = ["Básico", "Intermedio", "Avanzado"];

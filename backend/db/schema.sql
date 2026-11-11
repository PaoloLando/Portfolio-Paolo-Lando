-- Esquema SQLite del portfolio. Las tablas existentes se conservan.
CREATE TABLE IF NOT EXISTS proyectos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tecnologias TEXT NOT NULL DEFAULT '[]',
  imagen TEXT NOT NULL DEFAULT '',
  enlace TEXT NOT NULL DEFAULT '',
  avance TEXT NOT NULL DEFAULT 'En desarrollo' CHECK (avance IN ('En desarrollo', 'Terminado')),
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('publicado', 'borrador'))
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'visitante')) DEFAULT 'visitante',
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habilidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  nivel TEXT NOT NULL CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado'))
);

CREATE TABLE IF NOT EXISTS formaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  institucion TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL DEFAULT '',
  en_curso INTEGER NOT NULL DEFAULT 0 CHECK (en_curso IN (0, 1))
);

-- =====================================================
-- ESQUEMA DE LA BASE DE DATOS DEL PORTFOLIO (SQLite)
-- Se ejecuta automáticamente al iniciar el servidor.
-- "IF NOT EXISTS" evita errores si la tabla ya fue creada.
-- =====================================================

CREATE TABLE IF NOT EXISTS proyectos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,   -- identificador único, lo asigna la base
  nombre       TEXT NOT NULL,                       -- obligatorio
  descripcion  TEXT NOT NULL,                       -- obligatorio
  tecnologias  TEXT NOT NULL DEFAULT '[]',          -- lista guardada como texto JSON, ej: ["Java","Docker"]
  imagen       TEXT NOT NULL DEFAULT '',            -- ruta o URL de la imagen (puede estar vacía)
  enlace       TEXT NOT NULL DEFAULT '',            -- URL del repositorio o sitio (puede estar vacía)
  avance       TEXT NOT NULL DEFAULT 'En desarrollo'
               CHECK (avance IN ('En desarrollo', 'Terminado')),
  estado       TEXT NOT NULL DEFAULT 'borrador'     -- estado de publicación
               CHECK (estado IN ('publicado', 'borrador'))
);

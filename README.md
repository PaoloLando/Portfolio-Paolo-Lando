# Portfolio Web — Paolo Landó

Portfolio personal desarrollado con HTML, CSS, JavaScript, Node.js, Express, TypeScript y SQLite. Conserva la interfaz original e incorpora un módulo administrativo con autenticación y control de permisos.

## Funcionalidades

- Portfolio responsive con HTML semántico, CSS Grid/Flexbox, menú móvil, modo claro/oscuro y buscador.
- Proyectos, habilidades y formación académica consultados desde SQLite mediante la API.
- Panel de administración protegido por usuario y contraseña.
- Contraseñas almacenadas con hash `scrypt` (nunca texto plano).
- Token de sesión firmado con HMAC-SHA256 y vencimiento de cuatro horas.
- Rol `admin`: puede consultar, crear, modificar y eliminar los tres tipos de contenido.
- Rol `visitante`: puede consultar el contenido público; no puede escribir ni acceder a datos administrativos.
- Validaciones del lado del servidor y persistencia en SQLite.
- TypeScript para modelos, autenticación, rutas y acceso a datos.

## Requisitos

- Node.js 22.5 o superior (se utiliza el módulo integrado `node:sqlite`).
- npm.

## Instalación

1. Cloná el repositorio y entrá a la carpeta del backend:

   ```bash
   git clone https://github.com/PaoloLando/portfolio-paolo-lando.git
   cd portfolio-paolo-lando/backend
   ```

2. Instalá las dependencias:

   ```bash
   npm install
   ```

3. Creá tu archivo privado `.env` copiando la plantilla:

   **Windows PowerShell:**
   ```powershell
   Copy-Item .env.example .env
   ```

   **CMD:**
   ```cmd
   copy .env.example .env
   ```

4. Editá `backend/.env` y configurá estos valores. `JWT_SECRET` debe tener al menos 32 caracteres aleatorios y la contraseña del administrador debe tener 12 caracteres o más:

   ```env
   PORT=3000
   DB_PATH=./data/portfolio.db
   JWT_SECRET=una_clave_aleatoria_larga_y_privada_de_32_caracteres_o_mas
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=una_contrasena_segura_de_12_caracteres_o_mas
   ```

   No compartas el `.env` ni lo subas a GitHub. Está excluido mediante `.gitignore`.

5. Inicializá la base y cargá los datos iniciales (incluye el usuario administrador):

   ```bash
   npm run seed
   ```

   El comando no duplica los registros iniciales ni reemplaza la contraseña si el usuario ya existe. Carga proyectos y una lista orientativa de habilidades; la formación se completa desde el panel para no inventar fechas académicas que no figuran en el portfolio original.

6. Iniciá el servidor:

   ```bash
   npm run dev
   ```

7. Abrí:
   - Portfolio público: http://localhost:3000
   - Panel de administración: http://localhost:3000/admin.html

   Iniciá sesión con `ADMIN_USERNAME` y `ADMIN_PASSWORD` definidos en tu `.env`.

## Base de datos

SQLite guarda los datos en `backend/data/portfolio.db`. Las tablas son:

- `proyectos`: nombre, descripción, tecnologías, imagen, enlace, avance y estado de publicación.
- `usuarios`: nombre de usuario, hash de contraseña y rol.
- `habilidades`: nombre, categoría y nivel.
- `formaciones`: institución, título, descripción, fechas y condición de cursada.

La base es relacional: organiza registros en tablas con columnas y restricciones. SQLite resulta adecuada para este portfolio por su bajo volumen, persistencia en un archivo y ausencia de un servicio de base de datos separado.

## API REST

| Método | Endpoint | Acceso | Acción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Iniciar sesión |
| GET | `/api/auth/me` | Autenticado | Consultar sesión |
| GET | `/api/proyectos` | Público | Listar proyectos publicados |
| GET | `/api/proyectos?todos=1` | Admin | Listar también borradores |
| POST | `/api/proyectos` | Admin | Crear proyecto |
| PUT | `/api/proyectos/:id` | Admin | Modificar proyecto |
| DELETE | `/api/proyectos/:id` | Admin | Eliminar proyecto |
| GET | `/api/habilidades` | Público | Listar habilidades |
| POST / PUT / DELETE | `/api/habilidades` y `/:id` | Admin | CRUD de habilidades |
| GET | `/api/formaciones` | Público | Listar formación |
| POST / PUT / DELETE | `/api/formaciones` y `/:id` | Admin | CRUD de formación |

Para las rutas protegidas se envía el encabezado `Authorization: Bearer <token>`. La autorización se verifica en el backend; ocultar botones en el frontend no reemplaza esta protección.

## Cómo probar el recuperatorio

1. Ejecutá el servidor y abrí `/admin.html`.
2. Probá iniciar sesión con credenciales incorrectas: debe aparecer un mensaje de error.
3. Iniciá sesión con el administrador configurado en `.env`.
4. En cada módulo, creá un registro, modificálo y eliminálo.
5. Abrí el portfolio público en otra pestaña y comprobá que se reflejen proyectos publicados, habilidades y formación.
6. Creá un proyecto como borrador y verificá que no aparezca en la página pública.
7. Cerrá sesión. Las operaciones de escritura deben responder `401` sin token.
8. Para comprobar persistencia, apagá y volvé a iniciar el servidor: los datos deben seguir en SQLite.

También podés probar la protección directamente con una petición HTTP sin encabezado `Authorization`: por ejemplo, `POST /api/habilidades` debe ser rechazado con `401`.

## TypeScript

TypeScript agrega tipado estático a JavaScript. Las interfaces y tipos de `backend/src/types.ts` describen los datos de proyectos, habilidades, formación y roles. El tipado ayuda al editor y al compilador a detectar inconsistencias antes de ejecutar. Las validaciones de las rutas siguen siendo necesarias porque los tipos no verifican automáticamente los datos que llegan por HTTP.

Verificación:

```bash
npm run typecheck
```

## Git y GitHub

Desde la carpeta raíz del proyecto:

```bash
git status
git add .
git commit -m "Implementar autenticación y CRUD de contenido del portfolio"
git push origin main
```

Antes de subir, verificá que `backend/.env` y `backend/data/` no estén incluidos en el commit.

## Estructura

```text
portfolio-paolo-lando/
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── js/admin.js
│   └── img/
├── backend/
│   ├── db/schema.sql
│   ├── src/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── repositorio.ts
│   │   ├── rutas.ts
│   │   ├── seed.ts
│   │   ├── server.ts
│   │   ├── types.ts
│   │   ├── usuarios.ts
│   │   └── validacion.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

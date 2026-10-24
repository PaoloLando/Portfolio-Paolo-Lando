# Portfolio Web de Paolo Landó

**Autor:** Paolo Landó
**Actividad:** Actividad integradora Unidades 3, 4, 5 y 6 - Backend y persistencia de datos en el Portfolio Web

## Descripción

Portfolio web personal donde presento quién soy, mi formación, las tecnologías que conozco y mis proyectos. Soy estudiante de programación y mi área de interés es el desarrollo backend.

En esta segunda etapa el portfolio dejó de ser un sitio estático: la sección de **Proyectos** ahora obtiene sus datos de una **base de datos** a través de una **API REST** hecha con Node.js y Express, y los proyectos se pueden **crear, modificar y eliminar** desde una página de administración.

## Tecnologías utilizadas

| Parte | Tecnologías |
|---|---|
| Frontend | HTML5, CSS3 (Flexbox, Grid, media queries) y JavaScript (DOM, eventos, `fetch`) |
| Backend | Node.js y Express |
| Base de datos | SQLite (relacional) |
| Tipado | TypeScript en el backend |
| Control de versiones | Git y GitHub |

## Funcionalidades

- **Portfolio responsive** con modo oscuro y claro, menú desplegable en celulares y buscador de proyectos.
- **Proyectos desde la base de datos:** la página principal pide a la API los proyectos con estado "publicado" y arma las tarjetas.
- **CRUD completo** en la página `admin.html`: consultar, crear, modificar y eliminar proyectos.
- **Estado de publicación:** un proyecto en "borrador" se guarda pero no se muestra en el portfolio.
- **Validación en el servidor:** el backend controla los datos y responde con errores claros (código 400) si son inválidos.
- **Persistencia:** los datos se guardan en un archivo SQLite, así que siguen ahí aunque se apague el servidor.
- **Formulario de contacto** validado con JavaScript (no envía datos a ningún servidor).

## Estructura del proyecto

```
portfolio-paolo-lando/
│
├── frontend/
│   ├── index.html            Página principal del portfolio
│   ├── admin.html            Página de administración (CRUD)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── script.js         Lógica de la página principal
│   │   └── admin.js          Lógica del CRUD
│   └── img/
│
├── backend/
│   ├── src/
│   │   ├── server.ts         Servidor Express
│   │   ├── rutas.ts          Endpoints de la API
│   │   ├── repositorio.ts    Consultas SQL (acceso a la base de datos)
│   │   ├── validacion.ts     Validación de los datos recibidos
│   │   ├── db.ts             Conexión a SQLite
│   │   ├── types.ts          Tipos e interfaces de TypeScript
│   │   └── seed.ts           Carga de los proyectos iniciales
│   ├── db/
│   │   └── schema.sql        Estructura de la base de datos
│   ├── .env.example          Plantilla de configuración
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

## Requisitos

- [Node.js](https://nodejs.org) versión 22.5 o superior (probado con Node 24).
- [Git](https://git-scm.com).

No hace falta instalar ningún programa de base de datos: SQLite viene incluida en Node.

## Instalación y ejecución

1. **Clonar el repositorio** y entrar a la carpeta del backend:

   ```bash
   git clone https://github.com/PaoloLando/portfolio-paolo-lando.git
   cd portfolio-paolo-lando/backend
   ```

2. **Instalar las dependencias:**

   ```bash
   npm install
   ```

3. **Configurar la conexión a la base de datos.** Copiar la plantilla `.env.example` con el nombre `.env`:

   ```bash
   # Git Bash, Linux o macOS
   cp .env.example .env

   # Windows (CMD o PowerShell)
   copy .env.example .env
   ```

4. **Crear la base de datos y cargar los proyectos iniciales:**

   ```bash
   npm run seed
   ```

5. **Iniciar el servidor:**

   ```bash
   npm run dev
   ```

6. **Abrir el portfolio en el navegador:**

   - Portfolio: http://localhost:3000
   - Administración de proyectos: http://localhost:3000/admin.html

> **Importante:** el frontend lo entrega el mismo servidor Express, así que hay que abrirlo desde `http://localhost:3000` y no haciendo doble clic en `index.html` (de esa forma el navegador no puede comunicarse con la API).
>
> Al iniciar, Node muestra un aviso `ExperimentalWarning: SQLite is an experimental feature`. Es normal y no afecta el funcionamiento.

### Scripts disponibles (dentro de `backend/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor y lo reinicia solo cuando cambia el código |
| `npm start` | Inicia el servidor |
| `npm run seed` | Carga los proyectos iniciales si la tabla está vacía |
| `npm run seed -- --reset` | Borra todos los proyectos y vuelve a cargar los iniciales |
| `npm run typecheck` | Verifica los tipos de TypeScript sin ejecutar nada |

## Configuración de la base de datos

La conexión se configura en el archivo `backend/.env` (que **no se sube al repositorio**):

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DB_PATH` | Ruta del archivo de la base de datos SQLite | `./data/portfolio.db` |

SQLite no usa usuario ni contraseña: la "conexión" consiste en abrir un archivo. Ese archivo se crea solo la primera vez que se inicia el servidor, y la tabla se crea a partir de `backend/db/schema.sql`.

**Tabla `proyectos`:**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER, clave primaria | Se asigna automáticamente |
| `nombre` | TEXT, obligatorio | Nombre del proyecto |
| `descripcion` | TEXT, obligatorio | Descripción |
| `tecnologias` | TEXT | Lista de tecnologías guardada como JSON |
| `imagen` | TEXT | Ruta o URL de la imagen |
| `enlace` | TEXT | URL del repositorio o sitio |
| `avance` | TEXT | `En desarrollo` o `Terminado` |
| `estado` | TEXT | Estado de publicación: `publicado` o `borrador` |

Las columnas `avance` y `estado` tienen una restricción `CHECK`, así que la propia base rechaza cualquier otro valor.

## API REST

Todas las rutas cuelgan de `/api/proyectos`.

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/proyectos` | Lista los proyectos publicados | `200` |
| `GET` | `/api/proyectos?todos=1` | Lista todos, incluidos los borradores | `200` |
| `GET` | `/api/proyectos/:id` | Devuelve un proyecto | `200` / `404` |
| `POST` | `/api/proyectos` | Crea un proyecto | `201` / `400` |
| `PUT` | `/api/proyectos/:id` | Modifica un proyecto | `200` / `400` / `404` |
| `DELETE` | `/api/proyectos/:id` | Elimina un proyecto | `204` / `404` |

Ejemplo de cuerpo JSON para `POST` y `PUT`:

```json
{
  "nombre": "Mi proyecto",
  "descripcion": "Descripción de al menos 10 caracteres.",
  "tecnologias": ["Node.js", "SQLite"],
  "imagen": "img/mi-proyecto.png",
  "enlace": "https://github.com/usuario/repositorio",
  "avance": "En desarrollo",
  "estado": "borrador"
}
```

Si los datos no son válidos, el servidor responde `400` con la lista de errores:

```json
{ "error": "Datos inválidos.", "errores": ["El nombre es obligatorio y debe tener entre 3 y 100 caracteres."] }
```

## Cómo circula la información

**Al abrir el portfolio (consultar):**

1. El navegador pide la página al servidor Express, que entrega `index.html`, el CSS y el JavaScript.
2. `script.js` ejecuta `fetch("/api/proyectos")`, una petición `GET` a la API.
3. Express recibe la petición y la deriva a la ruta correspondiente en `rutas.ts`.
4. La ruta llama al repositorio, que ejecuta la consulta SQL `SELECT` sobre SQLite.
5. SQLite devuelve las filas y el repositorio las convierte en objetos `Proyecto` (la lista de tecnologías pasa de texto JSON a arreglo).
6. Express responde con ese arreglo en formato JSON y el código `200`.
7. El navegador recibe el JSON, lo convierte en un arreglo de objetos y `script.js` crea las tarjetas en el DOM.

**Al crear o modificar un proyecto:** el formulario de `admin.html` arma un objeto, lo envía como JSON en el cuerpo de un `POST` o un `PUT`, `validacion.ts` controla los datos, el repositorio ejecuta el `INSERT` o el `UPDATE`, y el servidor responde con el proyecto guardado (`201` o `200`) o con los errores (`400`). Después la tabla se vuelve a cargar con una nueva consulta.

## Elección de la base de datos: SQLite

**Relacional vs no relacional.** Las bases relacionales (SQLite, MySQL, PostgreSQL) guardan los datos en tablas con columnas de tipo fijo, permiten relacionar tablas entre sí y se consultan con SQL. Las no relacionales (por ejemplo MongoDB) guardan documentos tipo JSON con una estructura flexible, y resultan útiles cuando los datos cambian de forma entre registros o cuando hay que escalar a un volumen muy grande.

**Por qué elegí SQLite:**

- Todos los proyectos tienen los mismos campos, así que una tabla con columnas de tipo fijo encaja bien, y la base puede hacer cumplir reglas (campos obligatorios, estado limitado a dos valores).
- El volumen es chico (pocos registros y un solo usuario), por lo que no hace falta un servidor de base de datos aparte.
- Guarda todo en un único archivo, sin instalación ni configuración, y los datos persisten aunque se apague el servidor. Cualquiera puede clonar el repositorio y ejecutarlo enseguida.
- Ya trabajé con SQL en otros proyectos, así que puedo explicar cada consulta.

**Limitaciones:** SQLite no está pensada para muchos usuarios escribiendo a la vez ni para un tráfico alto. Si el portfolio creciera, migraría a PostgreSQL o MySQL; como las consultas son SQL estándar, el cambio se concentraría en `db.ts` y `repositorio.ts`.

## TypeScript

El backend está escrito en TypeScript. En `backend/src/types.ts` se define la interfaz `Proyecto` con el tipo de cada propiedad, y tipos unión para los valores permitidos:

```ts
export type EstadoPublicacion = "publicado" | "borrador";

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  tecnologias: string[];
  imagen: string;
  enlace: string;
  avance: Avance;
  estado: EstadoPublicacion;
}
```

El resto del backend (validación, repositorio y rutas) usa esos tipos. El frontend se mantiene en JavaScript. Para verificar los tipos se ejecuta `npm run typecheck`.

**Ventajas del tipado estático:**

- Los errores de tipo se detectan antes de ejecutar el programa. Por ejemplo, escribir `"publicdo"` como estado es un error de compilación.
- El editor autocompleta las propiedades y avisa si falta alguna.
- Los tipos sirven como documentación: se ve qué datos recibe y devuelve cada función.
- Hace más seguro modificar el código: si cambio un campo, TypeScript marca todos los lugares que hay que actualizar.

**Diferencias entre TypeScript y JavaScript:**

- TypeScript es un superconjunto de JavaScript que agrega tipos estáticos; todo código JavaScript válido también es TypeScript válido.
- JavaScript tiene tipado dinámico: los tipos se comprueban recién al ejecutar. TypeScript los comprueba antes, al analizar el código.
- El navegador y Node no ejecutan TypeScript directamente: hay que transformarlo a JavaScript (en este proyecto lo hace la herramienta `tsx`), y los tipos desaparecen en ese paso.
- Como los tipos no existen en tiempo de ejecución, no alcanzan para controlar los datos que llegan de afuera. Por eso `validacion.ts` sigue verificando el contenido de cada petición.

## Contacto

- Email: landopaolo035@gmail.com
- GitHub: [github.com/PaoloLando](https://github.com/PaoloLando)
- LinkedIn: [linkedin.com/in/paolo-landó](https://www.linkedin.com/in/paolo-land%C3%B3)

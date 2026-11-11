# Guía breve para explicar y defender el recuperatorio

Esta guía resume cómo explicar el proyecto con los términos de las consignas.

## 1. ¿Qué se amplió respecto del portfolio original?

Se conservó el portfolio público y su identidad visual. Se mantuvieron HTML, CSS y JavaScript en el frontend, y se amplió el backend con autenticación, roles y dos módulos nuevos de gestión: habilidades/tecnologías y formación académica. El CRUD de proyectos que ya existía ahora queda protegido por autenticación y autorización.

## 2. ¿Cómo circula la información?

1. El navegador muestra `frontend/index.html` o `frontend/admin.html`.
2. JavaScript realiza solicitudes HTTP con `fetch()` a los endpoints `/api/...`.
3. Express recibe la solicitud y la deriva al router correspondiente.
4. En las operaciones protegidas, los middlewares verifican el token y el rol del usuario.
5. Las rutas validan los datos recibidos y ejecutan consultas parametrizadas sobre SQLite.
6. El servidor devuelve una respuesta HTTP y datos JSON.
7. JavaScript recibe el JSON y actualiza la interfaz mediante el DOM.

## 3. ¿Cómo funciona el login y la seguridad?

El usuario envía su nombre de usuario y contraseña a `POST /api/auth/login`. El servidor busca al usuario en SQLite y compara la contraseña ingresada con el hash almacenado. No guarda ni compara contraseñas en texto plano.

Para crear el hash se utiliza `scrypt`, una función de derivación de claves disponible en Node.js, con una sal aleatoria por contraseña. Si las credenciales son correctas, el servidor entrega un token firmado con HMAC-SHA256 que vence a las cuatro horas.

El frontend envía el token en `Authorization: Bearer ...`. El middleware `requiereLogin` verifica su firma y vencimiento. Luego `requiereAdmin` comprueba que el rol sea `admin`. Por eso, aunque alguien intente llamar directamente a un endpoint de escritura, el servidor rechaza la operación si no tiene permisos.

## 4. ¿Qué puede hacer cada rol?

- **Administrador (`admin`):** inicia sesión, accede al panel y puede consultar, crear, modificar y eliminar proyectos, habilidades y formación.
- **Visitante (`visitante`):** puede consultar el portfolio público y los datos publicados. No puede realizar operaciones de escritura ni consultar borradores.

El registro público no está habilitado. El administrador inicial se crea mediante el script `npm run seed` y las credenciales configuradas en el archivo privado `.env`.

## 5. ¿Qué es CRUD?

CRUD representa las cuatro operaciones básicas sobre los datos:

- **Create:** crear un registro mediante `POST`.
- **Read:** consultar registros mediante `GET`.
- **Update:** modificar un registro mediante `PUT`.
- **Delete:** eliminar un registro mediante `DELETE`.

Los tres módulos cuentan con estas operaciones y los cambios quedan guardados en SQLite.

## 6. ¿Por qué SQLite?

SQLite es una base de datos relacional que almacena los registros en tablas y permite consultarlos mediante SQL. Se eligió porque el portfolio maneja un volumen reducido de datos, no necesita un servidor de base de datos separado y puede persistir la información en un archivo local. Una base no relacional almacena información con un modelo más flexible, por ejemplo documentos. Para este caso, las tablas y campos definidos encajan con el modelo relacional.

## 7. ¿Qué aporta TypeScript y en qué se diferencia de JavaScript?

JavaScript es un lenguaje de tipado dinámico: los tipos se determinan durante la ejecución. TypeScript agrega un sistema de tipos estáticos que permite describir estructuras con interfaces y tipos unión, y detectar inconsistencias durante el análisis o la compilación.

En este proyecto, `types.ts` describe los modelos de proyectos, habilidades, formación y roles. Esto mejora el autocompletado, la documentación del código y la detección temprana de errores. Los tipos no sustituyen la validación de los datos que llegan por HTTP, por eso las rutas también validan cada solicitud.

## 8. Demostración recomendada en clase

1. Mostrar el portfolio público y sus secciones originales.
2. Abrir `/admin.html` e intentar iniciar sesión con una contraseña incorrecta.
3. Iniciar sesión con el administrador.
4. Crear un proyecto y mostrarlo en la lista.
5. Modificarlo y luego eliminarlo.
6. Repetir las operaciones CRUD con una habilidad.
7. Repetir las operaciones CRUD con una formación académica.
8. Crear un proyecto como borrador y comprobar que no se muestra al visitante.
9. Cerrar sesión e intentar enviar una operación de escritura sin token: el servidor debe responder `401`.
10. Reiniciar el servidor y comprobar que los datos siguen almacenados.

## 9. Archivos principales

- `backend/src/auth.ts`: hash de contraseñas, firma y verificación del token, middlewares.
- `backend/src/usuarios.ts`: login y consulta de la sesión.
- `backend/src/rutas.ts`: endpoints y CRUD de proyectos, habilidades y formación.
- `backend/src/repositorio.ts`: consultas SQL de proyectos.
- `backend/src/validacion.ts`: validación de proyectos.
- `backend/db/schema.sql`: estructura de las tablas.
- `backend/src/seed.ts`: creación inicial del administrador y datos iniciales.
- `frontend/admin.html`: interfaz del panel.
- `frontend/js/admin.js`: interacción con el panel y solicitudes a la API.
- `frontend/js/script.js`: contenido público, proyectos, habilidades y formación.

## 10. Antes de la entrega

- Configurar un `JWT_SECRET` privado de al menos 32 caracteres.
- Cambiar la contraseña de ejemplo por una contraseña propia segura.
- Completar desde el panel las fechas exactas de la formación académica.
- Revisar los niveles de las habilidades iniciales y ajustarlos si hace falta.
- Ejecutar `npm run typecheck`.
- Probar los tres CRUD y la protección de endpoints.
- Verificar que `.env` y `backend/data/` no se suban a GitHub.

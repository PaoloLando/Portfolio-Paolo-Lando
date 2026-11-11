import "dotenv/config";
import { db, rutaBD } from "./db";
import { hashPassword } from "./auth";
import { crear } from "./repositorio";
import type { ProyectoNuevo } from "./types";

const proyectosIniciales: ProyectoNuevo[] = [
  { nombre:"Currency Converter Microservice", descripcion:"Refactoricé una aplicación de escritorio hecha en Java Swing y la convertí en un microservicio REST desacoplado. Guarda los datos con Spring Data JPA y H2, actualiza cotizaciones en segundo plano con @Scheduled, maneja excepciones de forma global y tiene pruebas unitarias con JUnit 5 y Mockito. Está empaquetado en Docker.", tecnologias:["Java 17","Spring Boot 3.2","Spring Data JPA","H2","JUnit 5","Mockito","Docker"], imagen:"img/proyecto-currency.png", enlace:"https://github.com/PaoloLando/currency-converter-service", avance:"Terminado", estado:"publicado" },
  { nombre:"Aprendo Fácil Web", descripcion:"Proyecto en equipo (4 personas), todavía en desarrollo. Mi parte es el frontend. Integré el formulario de login con TypeScript y Vite; el backend lo desarrollan mis compañeros.", tecnologias:["React","TypeScript","Vite","Git","GitHub"], imagen:"img/proyecto-aprendofacil.png", enlace:"https://github.com/Michibikii/aprendofacil-web", avance:"En desarrollo", estado:"publicado" },
  { nombre:"Este portfolio", descripcion:"Portfolio personal con HTML, CSS y JavaScript, diseño responsive, backend Node.js y Express, autenticación y base de datos SQLite.", tecnologias:["HTML","CSS","JavaScript","Node.js","Express","TypeScript","SQLite","Git","GitHub"], imagen:"img/proyecto-portfolio.png", enlace:"https://github.com/PaoloLando/portfolio-paolo-lando", avance:"Terminado", estado:"publicado" }
];
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
if (!username || !password || password.length < 12) {
  throw new Error("Definí ADMIN_USERNAME y ADMIN_PASSWORD (mínimo 12 caracteres) en backend/.env antes de ejecutar npm run seed.");
}
const existe = db.prepare("SELECT id FROM usuarios WHERE username=?").get(username);
if (!existe) {
  const password_hash = await hashPassword(password);
  db.prepare("INSERT INTO usuarios(username,password_hash,rol) VALUES(?,?,'admin')").run(username,password_hash);
  console.log(`Administrador '${username}' creado.`);
} else console.log("El administrador ya existe; no se modificó su contraseña.");

if (Number((db.prepare("SELECT COUNT(*) total FROM proyectos").get() as {total:number}).total) === 0) {
  for (const p of proyectosIniciales) crear(p);
  console.log("Proyectos iniciales cargados.");
}
if (Number((db.prepare("SELECT COUNT(*) total FROM habilidades").get() as {total:number}).total) === 0) {
  const insert=db.prepare("INSERT INTO habilidades(nombre,categoria,nivel) VALUES(?,?,?)");
  const iniciales=[["Java 17","Lenguaje de programación","Intermedio"],["Spring Boot","Framework","Intermedio"],["SQL / SQLite","Base de datos","Intermedio"],["HTML y CSS","Desarrollo web","Intermedio"],["JavaScript","Lenguaje de programación","Básico"],["TypeScript","Lenguaje de programación","Básico"],["Git y GitHub","Herramienta","Intermedio"],["Docker","Herramienta","Básico"]];
  for(const h of iniciales) insert.run(...h);
  console.log("Habilidades iniciales cargadas.");
}
console.log(`Base de datos preparada: ${rutaBD}`);

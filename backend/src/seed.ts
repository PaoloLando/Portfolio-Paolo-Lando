/* =====================================================
   DATOS INICIALES (SEED)
   Carga en la base los proyectos del portfolio.

     npm run seed             -> carga los proyectos solo si la tabla está vacía
     npm run seed -- --reset  -> borra todo y vuelve a cargar los proyectos iniciales
   ===================================================== */

import { db, rutaBD } from "./db";
import { crear } from "./repositorio";
import type { ProyectoNuevo } from "./types";

// Arreglo tipado: TypeScript comprueba que cada objeto tenga todos los campos de ProyectoNuevo
const proyectosIniciales: ProyectoNuevo[] = [
  {
    nombre: "Currency Converter Microservice",
    descripcion:
      "Refactoricé una aplicación de escritorio hecha en Java Swing y la convertí en un microservicio REST desacoplado. " +
      "Guarda los datos con Spring Data JPA y H2, actualiza las cotizaciones en segundo plano con @Scheduled, " +
      "maneja excepciones de forma global y tiene pruebas unitarias con JUnit 5 y Mockito. Está empaquetado en un contenedor Docker.",
    tecnologias: ["Java 17", "Spring Boot 3.2", "Spring Data JPA", "H2", "JUnit 5", "Mockito", "Docker"],
    imagen: "img/proyecto-currency.png",
    enlace: "https://github.com/PaoloLando/currency-converter-service",
    avance: "Terminado",
    estado: "publicado",
  },
  {
    nombre: "Aprendo Fácil Web",
    descripcion:
      "Proyecto en equipo (4 personas), todavía en desarrollo. Mi parte es el frontend. " +
      "En la rama feat/login-form-integration integré el formulario de login (LoginForm) con el endpoint /api/auth/login, " +
      "configuré TypeScript y Vite, y resolví los conflictos de integración con develop. " +
      "En la rama feat/category-manager empecé el componente CategoryManager para administrar categorías. " +
      "El backend lo desarrollan mis compañeros.",
    tecnologias: ["React", "TypeScript", "Vite", "Git", "GitHub"],
    imagen: "img/proyecto-aprendofacil.png",
    enlace: "https://github.com/Michibikii/aprendofacil-web",
    avance: "En desarrollo",
    estado: "publicado",
  },
  {
    nombre: "Este portfolio",
    descripcion:
      "Mi portfolio personal. El frontend está hecho con HTML, CSS y JavaScript, con diseño responsive y modo oscuro y claro. " +
      "Los proyectos se guardan en una base de datos SQLite y se gestionan (crear, modificar y eliminar) a través de " +
      "una API REST hecha con Node.js, Express y TypeScript.",
    tecnologias: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "TypeScript", "SQLite", "Git", "GitHub"],
    imagen: "img/proyecto-portfolio.png",
    enlace: "https://github.com/PaoloLando/portfolio-paolo-lando",
    avance: "Terminado",
    estado: "publicado",
  },
];

// ¿Se pidió --reset? (se lee de los argumentos del comando)
const reiniciar = process.argv.includes("--reset");

if (reiniciar) {
  db.exec("DELETE FROM proyectos");
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'proyectos'"); // reinicia los ids desde 1
  console.log("Tabla vaciada.");
}

// Cuento cuántos proyectos hay para no duplicar datos
const fila = db.prepare("SELECT COUNT(*) AS total FROM proyectos").get();
const total = Number(fila?.total ?? 0);

if (total > 0) {
  console.log(`La tabla ya tiene ${total} proyectos. No se cargó nada (usá --reset para volver a empezar).`);
} else {
  for (const proyecto of proyectosIniciales) {
    crear(proyecto);
  }
  console.log(`Se cargaron ${proyectosIniciales.length} proyectos en ${rutaBD}`);
}

/* Panel administrativo: la API valida los permisos en el servidor. */
const $ = (id) => document.getElementById(id);
const API = "/api";
let token = localStorage.getItem("portfolio_token") || "";
let proyectos = [], habilidades = [], formaciones = [];

function headers(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
async function request(url, options = {}) {
  const response = await fetch(API + url, { ...options, headers: { ...headers(options.body !== undefined), ...(options.headers || {}) } });
  if (response.status === 401) {
    cerrarSesion(false);
    throw new Error("Tu sesión venció. Iniciá sesión nuevamente.");
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}
function mensaje(id, texto, error = false) {
  const el = $(id); el.textContent = texto; el.className = "respuesta " + (error ? "respuesta--error" : "respuesta--ok"); el.hidden = false;
}
function celda(fila, texto) { const td = document.createElement("td"); td.textContent = texto ?? ""; fila.appendChild(td); }
function botonAccion(texto, clase, callback) {
  const b = document.createElement("button"); b.type = "button"; b.className = `boton ${clase} boton--chico`; b.textContent = texto; b.addEventListener("click", callback); return b;
}
function acciones(fila, editar, eliminar) {
  const td = document.createElement("td"), wrap = document.createElement("div"); wrap.className = "botones-fila";
  wrap.append(botonAccion("Editar","boton--secundario",editar),botonAccion("Eliminar","boton--peligro",eliminar)); td.appendChild(wrap); fila.appendChild(td);
}
function llenarTabla(idTabla, idEstado, datos, dibujar) {
  const tabla = $(idTabla), estado = $(idEstado), cuerpo = tabla.querySelector("tbody"); cuerpo.innerHTML = "";
  if (!datos.length) { tabla.hidden = true; estado.textContent = "Todavía no hay registros."; estado.hidden = false; return; }
  datos.forEach(d => dibujar(cuerpo,d)); estado.hidden = true; tabla.hidden = false;
}
async function iniciarSesion(evento) {
  evento.preventDefault();
  try {
    const data = await request("/auth/login", { method:"POST", body:JSON.stringify({ username:$("login-username").value.trim(), password:$("login-password").value }) });
    token = data.token; localStorage.setItem("portfolio_token",token);
    mostrarPanel(data.username); $("form-login").reset(); await cargarTodo();
  } catch (e) { mensaje("mensaje-login",e.message,true); }
}
function mostrarPanel(username) {
  $("vista-login").hidden = true; $("vista-panel").hidden = false; $("boton-logout").hidden = false;
  $("bienvenida-admin").textContent = `Sesión iniciada como ${username}.`;
}
function cerrarSesion(mostrar = true) {
  token = ""; localStorage.removeItem("portfolio_token");
  $("vista-login").hidden = false; $("vista-panel").hidden = true; $("boton-logout").hidden = true;
  if (mostrar) mensaje("mensaje-login","Sesión cerrada correctamente.");
}
async function verificarSesion() {
  if (!token) return;
  try { const data = await request("/auth/me"); mostrarPanel(data.usuario.username); await cargarTodo(); }
  catch { cerrarSesion(false); }
}
$("form-login").addEventListener("submit", iniciarSesion);
$("boton-logout").addEventListener("click", () => cerrarSesion());
document.querySelectorAll(".admin-tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("activo"));
  btn.classList.add("activo");
  document.querySelectorAll(".admin-modulo").forEach(m => m.hidden = true);
  $("modulo-" + btn.dataset.modulo).hidden = false;
}));

async function cargarTodo() { await Promise.all([cargarProyectos(),cargarHabilidades(),cargarFormaciones()]); }

// CRUD PROYECTOS
async function cargarProyectos() {
  try {
    proyectos = await request("/proyectos?todos=1");
    llenarTabla("tabla-proyectos","estado-proyectos",proyectos,(tbody,p)=>{
      const tr=document.createElement("tr"); celda(tr,p.nombre); celda(tr,p.estado);
      acciones(tr,()=>editarProyecto(p),()=>eliminarRegistro("proyectos",p.id,p.nombre,cargarProyectos)); tbody.appendChild(tr);
    });
  } catch(e) { $("estado-proyectos").textContent=e.message; }
}
function editarProyecto(p) {
  $("proyecto-id").value=p.id; $("proyecto-nombre").value=p.nombre; $("proyecto-descripcion").value=p.descripcion;
  $("proyecto-tecnologias").value=p.tecnologias.join(", "); $("proyecto-imagen").value=p.imagen; $("proyecto-enlace").value=p.enlace;
  $("proyecto-avance").value=p.avance; $("proyecto-estado").value=p.estado; $("titulo-proyecto-form").textContent="Editar proyecto";
  $("cancelar-proyecto").hidden=false; $("form-proyecto").scrollIntoView({behavior:"smooth"});
}
function resetProyecto() { $("form-proyecto").reset(); $("proyecto-id").value=""; $("titulo-proyecto-form").textContent="Nuevo proyecto"; $("cancelar-proyecto").hidden=true; }
$("cancelar-proyecto").addEventListener("click",resetProyecto);
$("form-proyecto").addEventListener("submit",async e=>{
  e.preventDefault(); const id=$("proyecto-id").value;
  const data={nombre:$("proyecto-nombre").value,descripcion:$("proyecto-descripcion").value,tecnologias:$("proyecto-tecnologias").value.split(",").map(x=>x.trim()).filter(Boolean),imagen:$("proyecto-imagen").value,enlace:$("proyecto-enlace").value,avance:$("proyecto-avance").value,estado:$("proyecto-estado").value};
  try { await request("/proyectos"+(id?"/"+id:""),{method:id?"PUT":"POST",body:JSON.stringify(data)}); resetProyecto(); mensaje("mensaje-proyecto",id?"Proyecto actualizado.":"Proyecto creado."); await cargarProyectos(); }
  catch(err){mensaje("mensaje-proyecto",err.message,true);}
});

// CRUD HABILIDADES
async function cargarHabilidades() {
  try {
    habilidades=await request("/habilidades");
    llenarTabla("tabla-habilidades","estado-habilidades",habilidades,(tbody,h)=>{
      const tr=document.createElement("tr"); celda(tr,h.nombre);celda(tr,h.categoria);celda(tr,h.nivel);
      acciones(tr,()=>editarHabilidad(h),()=>eliminarRegistro("habilidades",h.id,h.nombre,cargarHabilidades));tbody.appendChild(tr);
    });
  } catch(e){$("estado-habilidades").textContent=e.message;}
}
function editarHabilidad(h){$("habilidad-id").value=h.id;$("habilidad-nombre").value=h.nombre;$("habilidad-categoria").value=h.categoria;$("habilidad-nivel").value=h.nivel;$("titulo-habilidad-form").textContent="Editar habilidad";$("cancelar-habilidad").hidden=false;}
function resetHabilidad(){$("form-habilidad").reset();$("habilidad-id").value="";$("titulo-habilidad-form").textContent="Nueva habilidad";$("cancelar-habilidad").hidden=true;}
$("cancelar-habilidad").addEventListener("click",resetHabilidad);
$("form-habilidad").addEventListener("submit",async e=>{
  e.preventDefault();const id=$("habilidad-id").value;const data={nombre:$("habilidad-nombre").value,categoria:$("habilidad-categoria").value,nivel:$("habilidad-nivel").value};
  try{await request("/habilidades"+(id?"/"+id:""),{method:id?"PUT":"POST",body:JSON.stringify(data)});resetHabilidad();mensaje("mensaje-habilidad",id?"Habilidad actualizada.":"Habilidad creada.");await cargarHabilidades();}
  catch(err){mensaje("mensaje-habilidad",err.message,true);}
});

// CRUD FORMACIÓN
async function cargarFormaciones(){
  try{formaciones=await request("/formaciones");llenarTabla("tabla-formaciones","estado-formaciones",formaciones,(tbody,f)=>{
    const tr=document.createElement("tr");celda(tr,`${f.institucion} · ${f.titulo}`);celda(tr,`${f.fecha_inicio} – ${f.en_curso?"En curso":f.fecha_fin}`);
    acciones(tr,()=>editarFormacion(f),()=>eliminarRegistro("formaciones",f.id,f.titulo,cargarFormaciones));tbody.appendChild(tr);
  });}catch(e){$("estado-formaciones").textContent=e.message;}
}
function editarFormacion(f){$("formacion-id").value=f.id;$("formacion-institucion").value=f.institucion;$("formacion-titulo").value=f.titulo;$("formacion-descripcion").value=f.descripcion;$("formacion-inicio").value=f.fecha_inicio;$("formacion-fin").value=f.fecha_fin;$("formacion-curso").checked=f.en_curso;$("formacion-fin").disabled=f.en_curso;$("titulo-formacion-form").textContent="Editar formación";$("cancelar-formacion").hidden=false;}
function resetFormacion(){$("form-formacion").reset();$("formacion-id").value="";$("formacion-fin").disabled=false;$("titulo-formacion-form").textContent="Nueva formación";$("cancelar-formacion").hidden=true;}
$("formacion-curso").addEventListener("change",()=>{$("formacion-fin").disabled=$("formacion-curso").checked;if($("formacion-curso").checked)$("formacion-fin").value="";});
$("cancelar-formacion").addEventListener("click",resetFormacion);
$("form-formacion").addEventListener("submit",async e=>{
  e.preventDefault();const id=$("formacion-id").value;const data={institucion:$("formacion-institucion").value,titulo:$("formacion-titulo").value,descripcion:$("formacion-descripcion").value,fecha_inicio:$("formacion-inicio").value,fecha_fin:$("formacion-fin").value,en_curso:$("formacion-curso").checked};
  try{await request("/formaciones"+(id?"/"+id:""),{method:id?"PUT":"POST",body:JSON.stringify(data)});resetFormacion();mensaje("mensaje-formacion",id?"Formación actualizada.":"Formación creada.");await cargarFormaciones();}
  catch(err){mensaje("mensaje-formacion",err.message,true);}
});

async function eliminarRegistro(modulo,id,nombre,recargar){
  if(!confirm(`¿Seguro que querés eliminar "${nombre}"? Esta acción no se puede deshacer.`))return;
  try{await request(`/${modulo}/${id}`,{method:"DELETE"});await recargar();}
  catch(e){alert(e.message);}
}
verificarSesion();

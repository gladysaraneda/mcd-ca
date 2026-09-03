import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ============================================================
// SISTEMA COLECTIVO (Bio-reactivo / Salmón LaksData)
// ============================================================
const ETAPA = 4;

const BROKER = "wss://s0565630.ala.us-east-1.emqxsl.com:8084/mqtt";
const USUARIO = "mcd-prueba";
const TOPIC_BASE = "uai/mcd/2026/sistema-colectivo";
const TOPIC_SUSCRIPCION = `${TOPIC_BASE}/+/estado`;

document.querySelector("#etapa-actual").textContent = ETAPA;
document.querySelectorAll("[data-etapa]").forEach(s => s.hidden = Number(s.dataset.etapa) > ETAPA);

const nombreInput = document.querySelector("#nombre");
const contrasenaInput = document.querySelector("#contrasena");
const botonConectar = document.querySelector("#boton-conectar");
const clienteIdTexto = document.querySelector("#cliente-id");
document.querySelector("#topic-suscripcion").textContent = TOPIC_SUSCRIPCION;

let cliente, clientId, nombre, topicPublicacion;
const miEstado = { u: 0.5, v: 0.5, intensidad: 50, actividad: 50, variacion: 50 };

// ACUMULADOR COLECTIVO: Almacena los puntos defectuosos de todas las máquinas conectadas
const historialNodos = []; 

botonConectar.addEventListener("click", conectar);

function conectar() {
  nombre = nombreInput.value.trim();
  const contrasena = contrasenaInput.value;
  if (!nombre || !contrasena) return cambiarEstadoConexion("error", "Falta nombre o contraseña");

  const slug = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24) || "usuario";
  const idCorto = Math.random().toString(16).slice(2,6).toUpperCase();
  clientId = `navegador-${slug}-${idCorto}`;
  topicPublicacion = `${TOPIC_BASE}/${clientId}/estado`;
  clienteIdTexto.textContent = clientId;

  nombreInput.disabled = contrasenaInput.disabled = botonConectar.disabled = true;
  cambiarEstadoConexion("conectando","Conectando…");

  cliente = window.mqtt.connect(BROKER,{clientId,username:USUARIO,password:contrasena,reconnectPeriod:2000,connectTimeout:10000,clean:true});

  cliente.on("connect",()=>{
    cambiarEstadoConexion("conectado","Conectado a EMQX");
    botonConectar.textContent = "CONECTADO ✓";
    botonConectar.classList.add("conectado");
    
    cliente.subscribe(TOPIC_SUSCRIPCION, error => {
      if (error) return console.error("Error al suscribirse:", error);
    });
  });

  cliente.on("message",(topic,payload)=>procesarMensaje(payload));
  cliente.on("reconnect",()=>cambiarEstadoConexion("conectando","Reconectando…"));
  cliente.on("offline",()=>cambiarEstadoConexion("error","Sin conexión"));
  cliente.on("error",error=>{console.error(error);cambiarEstadoConexion("error","Error de conexión");});
}

// ============================================================
// ESCÁNER AUTOMÁTICO DE DEFECTOS (SANGRE Y MELANINA)
// ============================================================
const uploadFoto = document.querySelector("#upload-foto");
const canvasFrutilla = document.querySelector("#canvas-frutilla");
const botonEscanear = document.querySelector("#boton-escanear");
const ctx = canvasFrutilla ? canvasFrutilla.getContext("2d", { willReadFrequently: true }) : null;

if (uploadFoto && canvasFrutilla) {
  uploadFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      canvasFrutilla.width = canvasFrutilla.clientWidth;
      canvasFrutilla.height = (img.height / img.width) * canvasFrutilla.width;
      ctx.drawImage(img, 0, 0, canvasFrutilla.width, canvasFrutilla.height);
    };
    img.src = URL.createObjectURL(file);
  });
}

if (botonEscanear && canvasFrutilla) {
  botonEscanear.addEventListener("click", () => {
    if (!cliente?.connected) return cambiarEstadoConexion("error", "Conéctate primero a la red");
    if (!ctx) return;

    const ancho = canvasFrutilla.width;
    const alto = canvasFrutilla.height;
    
    // Resolución del escáner (analiza 1 de cada 15 píxeles)
    const resolucion = 15; 
    const defectosDetectados = []; // Array temporal para evitar saturar MQTT

    for (let y = 0; y < alto; y += resolucion) {
      for (let x = 0; x < ancho; x += resolucion) {
        const px = ctx.getImageData(x, y, 1, 1).data;
        const r = px[0], g = px[1], b = px[2];
        const brillo = (r + g + b) / 3;

        let tipoDefecto = null;
        let pIntensidad = 50, pActividad = 50, pVariacion = 50;

        // REGLA 1: Manchas de Melanina (Oscuras/Negras)
        if (brillo < 40 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15) {
          tipoDefecto = "Melanina";
          pIntensidad = 90; 
          pActividad = 100; 
          pVariacion = 10; 
        } 
        // REGLA 2: Manchas de Sangre (Rojas y oscuras)
        else if (r > g * 2.0 && r > b * 2.0 && r < 150) {
          tipoDefecto = "Sangre";
          pIntensidad = 80; 
          pActividad = 80; 
          pVariacion = 90; 
        }

        // Si detecta un defecto, guarda los datos para enviarlos y marca la foto
        if (tipoDefecto) {
          defectosDetectados.push({
            u: x / ancho,
            v: y / alto,
            intensidad: pIntensidad,
            actividad: pActividad,
            variacion: pVariacion
          });
          
          ctx.fillStyle = tipoDefecto === "Sangre" ? "#ff0000" : "#000000";
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // Publicación secuencial para no colapsar el Broker MQTT
    defectosDetectados.forEach((defecto, index) => {
      setTimeout(() => {
        miEstado.u = defecto.u;
        miEstado.v = defecto.v;
        miEstado.intensidad = defecto.intensidad;
        miEstado.actividad = defecto.actividad;
        miEstado.variacion = defecto.variacion;
        publicarEstado();
      }, index * 25); // 25ms de separación entre cada punto enviado
    });

    const estadoFrutoEl = document.querySelector("#estado-fruto");
    if(estadoFrutoEl) estadoFrutoEl.textContent = `Escaneo finalizado: ${defectosDetectados.length} anomalías`;
  });
}

function publicarEstado(){
  if(!cliente?.connected)return;
  const mensaje = {
    nombre, 
    clientId, 
    u: miEstado.u, 
    v: miEstado.v, 
    intensidad: miEstado.intensidad,
    actividad: miEstado.actividad,
    variacion: miEstado.variacion,
    timestamp: Date.now()
  };
  cliente.publish(topicPublicacion,JSON.stringify(mensaje),{qos:0,retain:false});
}

function procesarMensaje(payload){
  try{
    const m=JSON.parse(payload.toString());
    const hora=new Date(m.timestamp||Date.now()).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    
    const ultimoInt = document.querySelector("#ultimo-intensidad");
    const ultimoNom = document.querySelector("#ultimo-nombre");
    const ultimoHor = document.querySelector("#ultimo-hora");
    const ultimoJsn = document.querySelector("#ultimo-json");
    
    if(ultimoInt) ultimoInt.textContent=m.intensidad;
    if(ultimoNom) ultimoNom.textContent=m.nombre||"Sin nombre";
    if(ultimoHor) ultimoHor.textContent=hora;
    if(ultimoJsn) ultimoJsn.textContent=JSON.stringify(m,null,2);
    
    // ACUMULAR HISTORIAL EN LUGAR DE SOBREESCRIBIR
    historialNodos.push(m);
    if(historialNodos.length > 800) historialNodos.shift(); // Límite de memoria ampliado para el escáner
    
    actualizarColectivo();
  }catch(e){console.error("Mensaje inválido:",e);}
}

// ============================================================
// OUTPUT GEOMÉTRICO: MAPA DE CALOR 3D (SALMÓN)
// ============================================================
let escenaColectiva, rendererColectivo, camaraColectiva, controlesColectivo, grupoNodos;
if(ETAPA>=4) iniciarColectivo();

function iniciarColectivo(){
  const c=document.querySelector("#escena-colectiva");
  if(!c) return;
  escenaColectiva=new THREE.Scene(); escenaColectiva.background=new THREE.Color(0x0a121a);
  camaraColectiva=new THREE.PerspectiveCamera(42,c.clientWidth/c.clientHeight,.1,200); 
  camaraColectiva.position.set(0, 0, 14); 
  
  rendererColectivo=new THREE.WebGLRenderer({antialias:true}); 
  rendererColectivo.setPixelRatio(Math.min(devicePixelRatio,2)); 
  rendererColectivo.setSize(c.clientWidth,c.clientHeight); 
  c.appendChild(rendererColectivo.domElement);
  
  controlesColectivo=new OrbitControls(camaraColectiva,rendererColectivo.domElement); 
  controlesColectivo.enableDamping=true; 
  controlesColectivo.target.set(0,0,0);
  
  escenaColectiva.add(new THREE.HemisphereLight(0xffffff,0x22252b,2));
  const luz=new THREE.DirectionalLight(0x90e2ed, 1.5); 
  luz.position.set(5, 5, 10); 
  escenaColectiva.add(luz);
  
  grupoNodos=new THREE.Group(); 
  escenaColectiva.add(grupoNodos);
  
  // Grilla de laboratorio
  const grid = new THREE.GridHelper(14, 14, 0x369cbb, 0x162638);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -1;
  escenaColectiva.add(grid);
  
  animarColectivo();
}

function actualizarColectivo(){
  if(!grupoNodos)return;
  
  while(grupoNodos.children.length){
    const o=grupoNodos.children[0];
    o.geometry?.dispose(); o.material?.dispose();
    grupoNodos.remove(o);
  }
  
  if(!historialNodos.length) return;
  
  let totalVoxelsGenerados = 0;

  historialNodos.forEach((n) => {
    const a = (n.actividad ?? 50) / 100; 
    const v = (n.variacion ?? 50) / 100;
    
    const uCoord = n.u ?? 0.5;
    const vCoord = n.v ?? 0.5;

    const centroX = (uCoord - 0.5) * 12; 
    const centroY = -(vCoord - 0.5) * 12; 
    const baseZ = a * 2.5; 

    // Regla de color para defectos del salmón
    const colorNodo = new THREE.Color();
    if (v < 0.2) {
      colorNodo.setHSL(0.0, 0.0, 0.1); // Melanina: Tonos casi negros
    } else {
      colorNodo.setHSL(0.0, 0.9, 0.3); // Sangre: Tonos rojos profundos
    }

    // Cluster de voxels por cada anomalía detectada
    const cantidadVoxels = Math.floor(THREE.MathUtils.lerp(1, 5, a)); 
    totalVoxelsGenerados += cantidadVoxels;

    for(let k = 0; k < cantidadVoxels; k++) {
      const radioDispersion = THREE.MathUtils.lerp(0.1, 1.2, a); 
      const ox = (Math.random() - 0.5) * radioDispersion;
      const oy = (Math.random() - 0.5) * radioDispersion;
      const oz = (Math.random() - 0.5) * radioDispersion;

      const geometria = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshStandardMaterial({
        color: colorNodo,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
        wireframe: (a > 0.9) 
      });

      const voxel = new THREE.Mesh(geometria, material);
      voxel.position.set(centroX + ox, centroY + oy, baseZ + oz);
      grupoNodos.add(voxel);
    }
  });

  const valsActividad = historialNodos.map(n => n.actividad || 50);
  const promedioCaos = valsActividad.reduce((acc, val) => acc + val, 0) / valsActividad.length;
  const valsInt = historialNodos.map(n => n.intensidad || 50);
  
  const mNodos = document.querySelector("#m-nodos");
  const mPromedio = document.querySelector("#m-promedio");
  const mMin = document.querySelector("#m-minimo");
  const mMax = document.querySelector("#m-maximo");
  
  if(mNodos) mNodos.textContent = totalVoxelsGenerados; 
  if(mPromedio) mPromedio.textContent = promedioCaos.toFixed(1);
  if(mMin) mMin.textContent = Math.min(...valsInt);
  if(mMax) mMax.textContent = Math.max(...valsInt);
}

function animarColectivo(){
  requestAnimationFrame(animarColectivo);
  controlesColectivo.update();
  
  if(grupoNodos) {
      grupoNodos.position.z = Math.sin(Date.now() * 0.001) * 0.15;
  }
  
  rendererColectivo.render(escenaColectiva,camaraColectiva);
}

window.addEventListener("resize",()=>{
  for(const [sel,cam,ren] of [["#escena-colectiva",camaraColectiva,rendererColectivo]]){
    const c=document.querySelector(sel); if(!c||!cam||!ren)continue;
    cam.aspect=c.clientWidth/c.clientHeight; cam.updateProjectionMatrix(); ren.setSize(c.clientWidth,c.clientHeight);
  }
});

function cambiarEstadoConexion(tipo,texto){
  const estadoPunto = document.querySelector("#estado-punto");
  const estadoTexto = document.querySelector("#estado-texto");
  if(estadoPunto) {
      estadoPunto.className="estado-punto";
      if(tipo)estadoPunto.classList.add(tipo);
  }
  if(estadoTexto) estadoTexto.textContent=texto;
}
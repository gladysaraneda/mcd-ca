import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======================================================
// 01 — CONFIGURACIÓN Y DATOS DE CENTROS DE ESQUÍ
// ======================================================

const URL_RESPALDO = "./assets/data/ski-respaldo.json";

const parametros = {
  modo: "geografico",
  escalaAltura: 0.1,
  escalaAncho: 0.8,
};

let centrosEsqui = [];
let objetosCentros = [];
let centroSeleccionado = null;

// ======================================================
// 02 — ESCENA Y CÁMARA
// ======================================================

const viewport = document.querySelector("#viewport");
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0b0b0c);

const camara = new THREE.PerspectiveCamera(
  42,
  viewport.clientWidth / viewport.clientHeight,
  0.1,
  300
);
camara.position.set(0, 35, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

const controlesOrbita = new OrbitControls(camara, renderer.domElement);
controlesOrbita.enableDamping = true;
controlesOrbita.target.set(0, 0, 0);

escena.add(new THREE.HemisphereLight(0xffffff, 0x1f2228, 1.8));

const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.7);
luzPrincipal.position.set(18, 28, 14);
luzPrincipal.castShadow = true;
escena.add(luzPrincipal);

const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({ color: 0x101114, roughness: 1 })
);
suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.05;
suelo.receiveShadow = true;
escena.add(suelo);

const grupoCentros = new THREE.Group();
escena.add(grupoCentros);

// ======================================================
// 03 — CARGA DE DATOS LOCALES
// ======================================================

async function cargarDatosNieve() {
  try {
    const respuesta = await fetch(URL_RESPALDO, { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo cargar el archivo de respaldo.");
    
    const datos = await respuesta.json();
    centrosEsqui = datos.centros;
    
    document.querySelector("#fuente-label").textContent = "Dataset local · Esquí Chile";
    document.querySelector("#actualizacion-label").textContent = "activo";

    generarRepresentacion();
  } catch (error) {
    console.error("Error al cargar los datos de nieve:", error);
  }
}

// ======================================================
// 04 — REGLAS DE REPRESENTACIÓN (MAPPINGS)
// ======================================================

function proyectarGeograficamente(centros) {
  // Mapping 1: Posición espacial basada en latitud y longitud simulando el territorio chileno
  const latitudes = centros.map((c) => c.lat);
  const longitudes = centros.map((c) => c.lon);

  const latCentro = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const lonCentro = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

  return centros.map((centro) => ({
    ...centro,
    x: (centro.lon - lonCentro) * 120, // Eje X territorial
    z: -(centro.lat - latCentro) * 40,  // Eje Z longitudinal (norte-sur)
  }));
}

function ordenarPorNieve(centros) {
  const ordenados = [...centros].sort((a, b) => b.cm_nieve - a.cm_nieve);
  const columnas = 3;
  const separacion = 4.0;

  return ordenados.map((centro, indice) => {
    const columna = indice % columnas;
    const fila = Math.floor(indice / columnas);
    return {
      ...centro,
      x: (columna - columnas / 2 + 0.5) * separacion,
      z: (fila - 1) * separacion,
    };
  });
}

function generarRepresentacion() {
  limpiarRepresentacion();

  const distribuidos =
    parametros.modo === "geografico"
      ? proyectarGeograficamente(centrosEsqui)
      : ordenarPorNieve(centrosEsqui);

  distribuidos.forEach(crearModuloCopo);
}

// ======================================================
// 05 — GEOMETRÍA DEL COPO DE NIEVE (OUTPUT VISUAL)
// ======================================================

function crearModuloCopo(centro) {
  const grupo = new THREE.Group();
  grupo.position.set(centro.x, 0, centro.z);
  grupo.userData.centro = centro;

  // Mapping 2: El color cambia según el estado de la nieve (Celeste si es óptimo, Rojo si está cerrado)
  const esOptimo = centro.estado === "optimo";
  const colorCopo = esOptimo ? 0x61afef : 0xe06c75; // Celeste brillante / Rojo alerta

  // Base o soporte del punto en el mapa (color rojo base como pediste)
  const geoBase = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
  const matBase = new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness: 0.4 });
  const base = new THREE.Mesh(geoBase, matBase);
  base.position.y = 0.1;
  base.userData.centro = centro;
  grupo.add(base);

  // Geometría del Copo de Nieve (agrupando pequeñas barras que simulan los cristales de nieve)
  const grupoCopo = new THREE.Group();
  grupoCopo.position.y = 1.2;

  const matCopo = new THREE.MeshStandardMaterial({
    color: colorCopo,
    roughness: 0.3,
    emissive: colorCopo,
    emissiveIntensity: 0.3,
  });

  // Centro hexagonal del copo
  const geoHex = new THREE.BoxGeometry(0.6, 0.2, 0.6);
  const hex = new THREE.Mesh(geoHex, matCopo);
  grupoCopo.add(hex);

  // Brazos del copo de nieve
  for (let i = 0; i < 3; i++) {
    const brazoGeo = new THREE.BoxGeometry(2.2, 0.15, 0.3);
    const brazo = new THREE.Mesh(brazoGeo, matCopo);
    brazo.rotation.y = (i * Math.PI) / 3;
    grupoCopo.add(brazo);
  }

  // Escalar el copo según la cantidad de centímetros de nieve acumulada
  const escalaNieve = Math.max(0.6, centro.cm_nieve / 40);
  grupoCopo.scale.set(escalaNieve, escalaNieve, escalaNieve);
  
  grupoCopo.userData.centro = centro;
  grupo.add(grupoCopo);

  grupoCentros.add(grupo);
  objetosCentros.push(base, grupoCopo);
}

function limpiarRepresentacion() {
  objetosCentros = [];
  while (grupoCentros.children.length > 0) {
    const obj = grupoCentros.children[0];
    obj.traverse((hijo) => {
      if (hijo.geometry) hijo.geometry.dispose();
      if (hijo.material) hijo.material.dispose();
    });
    grupoCentros.remove(obj);
  }
}

// ======================================================
// 06 — INTERACCIÓN Y ZOOM FOCALIZADO (MAPPING 3)
// ======================================================

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();

renderer.domElement.addEventListener("pointerdown", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  puntero.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  puntero.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(puntero, camara);
  const intersecciones = raycaster.intersectObjects(objetosCentros, true);

  if (intersecciones.length > 0) {
    let objetoEncontrado = intersecciones[0].object;
    while (objetoEncontrado.parent && !objetoEncontrado.userData.centro) {
      objetoEncontrado = objetoEncontrado.parent;
    }

    if (objetoEncontrado.userData.centro) {
      seleccionarCentroEsqui(objetoEncontrado.userData.centro);
    }
  }
});

function seleccionarCentroEsqui(centro) {
  centroSeleccionado = centro;

  // Actualizar panel lateral de lectura de datos
  document.querySelector("#estacion-nombre").textContent = centro.nombre;
  document.querySelector("#m-estado").textContent = centro.estado.toUpperCase();
  document.querySelector("#m-temp").textContent = centro.temperatura;
  document.querySelector("#m-nieve").textContent = centro.cm_nieve;

  // Mapping 3: Acercar la cámara de forma suave hacia el centro seleccionado
  const targetX = centro.x;
  const targetZ = centro.z;

  animarCamaraA({ x: targetX, y: 6, z: targetZ + 5 }, { x: targetX, y: 1, z: targetZ });
}

function animarCamaraA(nuevaPosicion, nuevoTarget) {
  const posInicial = camara.position.clone();
  const targetInicial = controlesOrbita.target.clone();
  let progreso = 0;

  function pasoAnimacion() {
    progreso += 0.05;
    if (progreso > 1) progreso = 1;

    camara.position.lerpVectors(posInicial, new THREE.Vector3(nuevaPosicion.x, nuevaPosicion.y, nuevaPosicion.z), progreso);
    controlesOrbita.target.lerpVectors(targetInicial, new THREE.Vector3(nuevoTarget.x, nuevoTarget.y, nuevoTarget.z), progreso);
    controlesOrbita.update();

    if (progreso < 1) {
      requestAnimationFrame(pasoAnimacion);
    }
  }
  pasoAnimacion();
}

// Controles de interfaz
document.querySelector("#modo-distribucion").addEventListener("change", (event) => {
  parametros.modo = event.target.value;
  generarRepresentacion();
});

document.querySelector("#actualizar").addEventListener("click", () => {
  cargarDatosNieve();
});

document.querySelector("#restablecer-vista").addEventListener("click", () => {
  animarCamaraA({ x: 0, y: 35, z: 30 }, { x: 0, y: 0, z: 0 });
  document.querySelector("#estacion-nombre").textContent = "Selecciona un centro";
  document.querySelector("#m-estado").textContent = "--";
  document.querySelector("#m-temp").textContent = "--";
  document.querySelector("#m-nieve").textContent = "--";
});

// ======================================================
// 07 — LOOP DE ANIMACIÓN
// ======================================================

function animar() {
  requestAnimationFrame(animar);
  controlesOrbita.update();
  renderer.render(escena, camara);
}

window.addEventListener("resize", () => {
  const ancho = viewport.clientWidth;
  const altura = viewport.clientHeight;
  camara.aspect = ancho / altura;
  camara.updateProjectionMatrix();
  renderer.setSize(ancho, altura);
});

cargarDatosNieve();
animar();
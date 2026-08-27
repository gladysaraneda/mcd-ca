import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const datosNieve = {
  "actualizado": "2026-08-27T16:00:00-04:00",
  "centros": [
    { "id": "valle-nevado", "nombre": "Valle Nevado", "lat": -33.3567, "lon": -70.2528, "estado": "optimo", "temperatura": -2, "cm_nieve": 45 },
    { "id": "el-colorado", "nombre": "El Colorado", "lat": -33.3444, "lon": -70.2889, "estado": "optimo", "temperatura": -3, "cm_nieve": 40 },
    { "id": "la-parva", "nombre": "La Parva", "lat": -33.3333, "lon": -70.2833, "estado": "cerrado", "temperatura": 1, "cm_nieve": 10 },
    { "id": "portillo", "nombre": "Portillo", "lat": -32.8361, "lon": -70.1389, "estado": "optimo", "temperatura": -4, "cm_nieve": 60 },
    { "id": "nevados-chillan", "nombre": "Nevados de Chillán", "lat": -36.9083, "lon": -71.4083, "estado": "optimo", "temperatura": -1, "cm_nieve": 80 },
    { "id": "pucon", "nombre": "Pucón (Villarrica)", "lat": -39.4200, "lon": -71.9300, "estado": "optimo", "temperatura": -2, "cm_nieve": 70 },
    { "id": "antillanca", "nombre": "Antillanca", "lat": -40.7667, "lon": -72.1833, "estado": "optimo", "temperatura": -2, "cm_nieve": 50 },
    { "id": "volcan-osorno", "nombre": "Volcán Osorno", "lat": -41.1000, "lon": -72.5000, "estado": "optimo", "temperatura": -3, "cm_nieve": 65 },
    { "id": "corralco", "nombre": "Corralco", "lat": -38.4236, "lon": -71.5644, "estado": "cerrado", "temperatura": 2, "cm_nieve": 15 }
  ]
};

const parametros = { modo: "geografico" };
let centrosEsqui = datosNieve.centros;
let objetosCentros = [];
let centroSeleccionado = null;
let sistemasNieveLocal = [];

const viewport = document.querySelector("#viewport");
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0b0b0c);

const camara = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 300);
camara.position.set(0, 35, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

const controlesOrbita = new OrbitControls(camara, renderer.domElement);
controlesOrbita.enableDamping = true;
controlesOrbita.target.set(0, 0, 0);

escena.add(new THREE.HemisphereLight(0xffffff, 0x1f2228, 1.8));
const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.7);
luzPrincipal.position.set(18, 28, 14);
escena.add(luzPrincipal);

// Tooltip flotante para mostrar el nombre al pasar el cursor
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.background = "rgba(0, 0, 0, 0.85)";
tooltip.style.color = "#fff";
tooltip.style.padding = "6px 10px";
tooltip.style.borderRadius = "4px";
tooltip.style.fontSize = "12px";
tooltip.style.pointerEvents = "none";
tooltip.style.display = "none";
tooltip.style.border = "1px solid #61afef";
document.body.appendChild(tooltip);

const grupoCentros = new THREE.Group();
escena.add(grupoCentros);
const grupoMapaChile = new THREE.Group();
escena.add(grupoMapaChile);

function calcularPosiciones(centros) {
  if (parametros.modo === "geografico") {
    const latitudes = centros.map((c) => c.lat);
    const longitudes = centros.map((c) => c.lon);
    const latCentro = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
    const lonCentro = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

    return centros.map((centro) => ({
      ...centro,
      x: (centro.lon - lonCentro) * 35,
      z: -(centro.lat - latCentro) * 22,
    }));
  } else {
    const ordenados = [...centros].sort((a, b) => b.cm_nieve - a.cm_nieve);
    const columnas = 3;
    const separacion = 5.0;
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
}

function generarRepresentacion() {
  limpiarRepresentacion();
  const distribuidos = calcularPosiciones(centrosEsqui);
  // Actualizamos el array global con las coordenadas calculadas para que los botones las reconozcan
  centrosEsqui = distribuidos;

  centrosEsqui.forEach(crearModuloCopo);

  if (parametros.modo === "geografico") {
    crearSiluetaChileContinua();
  }
}

// Franja territorial orientada de norte a sur de manera recta y vertical
function crearSiluetaChileContinua() {
  const geometriaMapa = new THREE.BoxGeometry(0.8, 0.3, 38);
  const materialMapa = new THREE.MeshStandardMaterial({
    color: 0x1e222b,
    roughness: 0.8,
    metalness: 0.2
  });

  const meshChile = new THREE.Mesh(geometriaMapa, materialMapa);
  meshChile.rotation.y = 0;
  meshChile.position.set(0, -0.2, 0);
  grupoMapaChile.add(meshChile);
}

function crearModuloCopo(centro) {
  const grupo = new THREE.Group();
  grupo.position.set(centro.x, 0, centro.z);
  grupo.userData.centro = centro;

  const esOptimo = centro.estado === "optimo";
  const colorCopo = esOptimo ? 0x61afef : 0xe06c75;

  const geoBase = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16);
  const matBase = new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness: 0.4 });
  const base = new THREE.Mesh(geoBase, matBase);
  base.position.y = 0.1;
  base.userData.centro = centro;
  grupo.add(base);

  const grupoCopo = new THREE.Group();
  grupoCopo.position.y = 1.2;

  const matCopo = new THREE.MeshStandardMaterial({
    color: colorCopo,
    roughness: 0.3,
    emissive: colorCopo,
    emissiveIntensity: 0.4,
  });

  const geoHex = new THREE.BoxGeometry(0.6, 0.2, 0.6);
  const hex = new THREE.Mesh(geoHex, matCopo);
  grupoCopo.add(hex);

  for (let i = 0; i < 3; i++) {
    const brazoGeo = new THREE.BoxGeometry(2.4, 0.15, 0.3);
    const brazo = new THREE.Mesh(brazoGeo, matCopo);
    brazo.rotation.y = (i * Math.PI) / 3;
    grupoCopo.add(brazo);
  }

  const escalaNieve = Math.max(0.6, centro.cm_nieve / 35);
  grupoCopo.scale.set(escalaNieve, escalaNieve, escalaNieve);
  grupoCopo.userData.centro = centro;
  grupo.add(grupoCopo);

  // Nieve animada localizada solo sobre los centros óptimos
  if (esOptimo) {
    const particulas = crearNieveLocal(centro.x, centro.z);
    sistemasNieveLocal.push(particulas);
    escena.add(particulas);
  }

  grupoCentros.add(grupo);
  objetosCentros.push(base, grupoCopo);
}

function crearNieveLocal(posX, posZ) {
  const cantidad = 35;
  const geom = new THREE.BufferGeometry();
  const posiciones = new Float32Array(cantidad * 3);

  for (let i = 0; i < cantidad * 3; i += 3) {
    posiciones[i] = posX + (Math.random() - 0.5) * 2.5;
    posiciones[i + 1] = Math.random() * 6 + 1;
    posiciones[i + 2] = posZ + (Math.random() - 0.5) * 2.5;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.75 });
  return new THREE.Points(geom, mat);
}

function actualizarNieveLocal() {
  sistemasNieveLocal.forEach(sistema => {
    const pos = sistema.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= 0.08;
      if (pos[i] < 0) pos[i] = 7;
    }
    sistema.geometry.attributes.position.needsUpdate = true;
  });
}

function limpiarRepresentacion() {
  objetosCentros = [];
  sistemasNieveLocal.forEach(s => escena.remove(s));
  sistemasNieveLocal = [];

  while (grupoCentros.children.length > 0) {
    const obj = grupoCentros.children[0];
    obj.traverse((hijo) => {
      if (hijo.geometry) hijo.geometry.dispose();
      if (hijo.material) hijo.material.dispose();
    });
    grupoCentros.remove(obj);
  }
  while (grupoMapaChile.children.length > 0) {
    const obj = grupoMapaChile.children[0];
    obj.traverse((hijo) => {
      if (hijo.geometry) hijo.geometry.dispose();
      if (hijo.material) hijo.material.dispose();
    });
    grupoMapaChile.remove(obj);
  }
}

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();

renderer.domElement.addEventListener("mousemove", (event) => {
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
      tooltip.style.display = "block";
      tooltip.style.left = `${event.clientX + 12}px`;
      tooltip.style.top = `${event.clientY + 12}px`;
      tooltip.textContent = objetoEncontrado.userData.centro.nombre;
      renderer.domElement.style.cursor = "pointer";
      return;
    }
  }
  tooltip.style.display = "none";
  renderer.domElement.style.cursor = "default";
});

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
  document.querySelector("#estacion-nombre").textContent = centro.nombre;
  document.querySelector("#m-estado").textContent = centro.estado.toUpperCase();
  document.querySelector("#m-temp").textContent = centro.temperatura;
  document.querySelector("#m-nieve").textContent = centro.cm_nieve;

  animarCamaraA({ x: centro.x, y: 6, z: centro.z + 5 }, { x: centro.x, y: 1, z: centro.z });
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
    if (progreso < 1) requestAnimationFrame(pasoAnimacion);
  }
  pasoAnimacion();
}

function buscarYSeleccionar(id) {
  const encontrado = centrosEsqui.find(c => c.id === id);
  if (encontrado) {
    seleccionarCentroEsqui(encontrado);
  }
}

document.querySelector("#btn-valle").addEventListener("click", () => buscarYSeleccionar("valle-nevado"));
document.querySelector("#btn-portillo").addEventListener("click", () => buscarYSeleccionar("portillo"));
document.querySelector("#btn-chillan").addEventListener("click", () => buscarYSeleccionar("nevados-chillan"));
document.querySelector("#btn-pucon").addEventListener("click", () => buscarYSeleccionar("pucon"));
document.querySelector("#btn-antillanca").addEventListener("click", () => buscarYSeleccionar("antillanca"));
document.querySelector("#btn-osorno").addEventListener("click", () => buscarYSeleccionar("volcan-osorno"));

document.querySelector("#modo-distribucion").addEventListener("change", (event) => {
  parametros.modo = event.target.value;
  generarRepresentacion();
});

document.querySelector("#actualizar").addEventListener("click", () => generarRepresentacion());

document.querySelector("#restablecer-vista").addEventListener("click", () => {
  animarCamaraA({ x: 0, y: 35, z: 25 }, { x: 0, y: 0, z: 0 });
  document.querySelector("#estacion-nombre").textContent = "Selecciona un centro";
  document.querySelector("#m-estado").textContent = "--";
  document.querySelector("#m-temp").textContent = "--";
  document.querySelector("#m-nieve").textContent = "--";
});

function animar() {
  requestAnimationFrame(animar);
  actualizarNieveLocal();
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

generarRepresentacion();
animar();
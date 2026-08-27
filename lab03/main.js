import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const datosNieve = {
  "actualizado": "2026-08-27T16:00:00-04:00",
  "centros": [
    { 
      "id": "valle-nevado", "nombre": "Valle Nevado", "lat": -33.3567, "lon": -70.2528, 
      "estado": "optimo", "temperatura": -2, "cm_nieve": 45, "precipitacion": "Nieve ligera", 
      "camino": "Obligatorio uso de cadenas", 
      "imagen": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "el-colorado", "nombre": "El Colorado", "lat": -33.3444, "lon": -70.2889, 
      "estado": "optimo", "temperatura": -3, "cm_nieve": 40, "precipitacion": "Nevando", 
      "camino": "Cadenas obligatorias", 
      "imagen": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "la-parva", "nombre": "La Parva", "lat": -33.3333, "lon": -70.2833, 
      "estado": "cerrado", "temperatura": 1, "cm_nieve": 10, "precipitacion": "Lluvia débil", 
      "camino": "Camino con precaución", 
      "imagen": "https://images.unsplash.com/photo-1482867665717-f371a3372991?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "portillo", "nombre": "Portillo", "lat": -32.8361, "lon": -70.1389, 
      "estado": "optimo", "temperatura": -4, "cm_nieve": 60, "precipitacion": "Nieve intensa", 
      "camino": "Cadenas obligatorias (Ruta 60)", 
      "imagen": "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "nevados-chillan", "nombre": "Nevados de Chillán", "lat": -36.9083, "lon": -71.4083, 
      "estado": "optimo", "temperatura": -1, "cm_nieve": 80, "precipitacion": "Nieve moderada", 
      "camino": "Transitable con cadenas", 
      "imagen": "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "pucon", "nombre": "Pucón (Villarrica)", "lat": -39.4200, "lon": -71.9300, 
      "estado": "optimo", "temperatura": -2, "cm_nieve": 70, "precipitacion": "Lluvia y Nieve", 
      "camino": "Transitable con precaución", 
      "imagen": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "antillanca", "nombre": "Antillanca", "lat": -40.7667, "lon": -72.1833, 
      "estado": "optimo", "temperatura": -2, "cm_nieve": 50, "precipitacion": "Nieve", 
      "camino": "Uso de cadenas requerido", 
      "imagen": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "volcan-osorno", "nombre": "Volcán Osorno", "lat": -41.1000, "lon": -72.5000, 
      "estado": "optimo", "temperatura": -3, "cm_nieve": 65, "precipitacion": "Nieve ligera", 
      "camino": "Cadenas recomendadas", 
      "imagen": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      "id": "corralco", "nombre": "Corralco", "lat": -38.4236, "lon": -71.5644, 
      "estado": "cerrado", "temperatura": 2, "cm_nieve": 15, "precipitacion": "Lluvia", 
      "camino": "Transitable", 
      "imagen": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80" 
    }
  ]
};

const parametros = { modo: "geografico", mostrarNieve: true, mostrarLluvia: true };
let centrosEsqui = datosNieve.centros;
let objetosCentros = [];
let centroSeleccionado = null;
let sistemasNieveLocal = [];
let sistemasLluviaLocal = [];

const viewport = document.querySelector("#viewport");
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0b0b0c);

const camara = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 300);
camara.position.set(0, 22, 18);

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

// Tooltip flotante
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
    return centros.map((centro) => {
      let x = 0, z = 0;
      switch(centro.id) {
        case "portillo": x = -0.15; z = -2.0; break;
        case "valle-nevado": x = 0.15; z = -1.1; break;
        case "el-colorado": x = 0.3; z = -0.9; break;
        case "la-parva": x = 0.45; z = -0.7; break;
        case "nevados-chillan": x = -0.25; z = 1.0; break;
        case "corralco": x = -0.4; z = 1.9; break;
        case "pucon": x = -0.65; z = 2.8; break;
        case "antillanca": x = -0.9; z = 3.6; break;
        case "volcan-osorno": x = -1.1; z = 4.2; break;
      }
      return { ...centro, x, z };
    });
  } else {
    const ordenados = [...centros].sort((a, b) => b.cm_nieve - a.cm_nieve);
    const columnas = 3;
    const separacion = 2.0;
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
  centrosEsqui = distribuidos;

  centrosEsqui.forEach(crearModuloCopo);

  if (parametros.modo === "geografico") {
    crearMapaChileCubosPixelados();
  }
}

// Mapa pixelado con altura reducida (y = -0.35) para que los centros queden siempre libres arriba
function crearMapaChileCubosPixelados() {
  const geomCubo = new THREE.BoxGeometry(0.18, 0.08, 0.18);
  const matCubo = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.5,
    metalness: 0.1
  });

  const offsetsChile = [];
  for (let z = -5.0; z <= 5.5; z += 0.22) {
    let centroX = Math.sin(z * 0.4) * 0.4 - 0.1;
    if (z > 2.5) centroX -= (z - 2.5) * 0.2;
    
    let ancho = 0.35;
    if (z > 3.0) ancho = 0.55;

    for (let x = centroX - ancho; x <= centroX + ancho; x += 0.2) {
      offsetsChile.push({ x: x, z: z });
    }
  }

  offsetsChile.forEach(pos => {
    const cubo = new THREE.Mesh(geomCubo, matCubo);
    cubo.position.set(pos.x, -0.35, pos.z); // Bajado para evitar intersecciones con las bases
    grupoMapaChile.add(cubo);
  });
}

function crearModuloCopo(centro) {
  const grupo = new THREE.Group();
  grupo.position.set(centro.x, 0, centro.z);
  grupo.userData.centro = centro;

  const esOptimo = centro.estado === "optimo";
  const colorCopo = esOptimo ? 0x61afef : 0xe06c75;

  const geoBase = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16);
  const matBase = new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness: 0.4 });
  const base = new THREE.Mesh(geoBase, matBase);
  base.position.y = 0.02;
  base.userData.centro = centro;
  grupo.add(base);

  const grupoCopo = new THREE.Group();
  grupoCopo.position.y = 0.2;

  const matCopo = new THREE.MeshStandardMaterial({
    color: colorCopo,
    roughness: 0.3,
    emissive: colorCopo,
    emissiveIntensity: 0.4,
  });

  const geoHex = new THREE.BoxGeometry(0.1, 0.03, 0.1);
  const hex = new THREE.Mesh(geoHex, matCopo);
  grupoCopo.add(hex);

  for (let i = 0; i < 3; i++) {
    const brazoGeo = new THREE.BoxGeometry(0.35, 0.025, 0.05);
    const brazo = new THREE.Mesh(brazoGeo, matCopo);
    brazo.rotation.y = (i * Math.PI) / 3;
    grupoCopo.add(brazo);
  }

  const factorEscala = Math.max(0.6, centro.cm_nieve / 100);
  grupoCopo.scale.set(factorEscala, factorEscala, factorEscala);
  grupoCopo.userData.centro = centro;
  grupo.add(grupoCopo);

  // Generar partículas de nieve si está activado
  if (esOptimo && parametros.mostrarNieve) {
    const particulasNieve = crearParticulas(centro.x, centro.z, 0xffffff, 0.06);
    sistemasNieveLocal.push(particulasNieve);
    escena.add(particulasNieve);
  }

  // Generar partículas de lluvia si está activado y el centro tiene reporte de lluvia
  if (centro.precipitacion.toLowerCase().includes("lluvia") && parametros.mostrarLluvia) {
    const particulasLluvia = crearParticulas(centro.x, centro.z, 0x61afef, 0.05, true);
    sistemasLluviaLocal.push(particulasLluvia);
    escena.add(particulasLluvia);
  }

  grupoCentros.add(grupo);
  objetosCentros.push(base, grupoCopo);
}

function crearParticulas(posX, posZ, colorHex, tamano, esLluvia = false) {
  const cantidad = 12;
  const geom = new THREE.BufferGeometry();
  const posiciones = new Float32Array(cantidad * 3);

  for (let i = 0; i < cantidad * 3; i += 3) {
    posiciones[i] = posX + (Math.random() - 0.5) * 0.25;
    posiciones[i + 1] = Math.random() * 0.9 + 0.2;
    posiciones[i + 2] = posZ + (Math.random() - 0.5) * 0.25;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  const mat = new THREE.PointsMaterial({ color: colorHex, size: tamano, transparent: true, opacity: 0.85 });
  const puntos = new THREE.Points(geom, mat);
  puntos.userData.esLluvia = esLluvia;
  return puntos;
}

function actualizarParticulasClima() {
  [...sistemasNieveLocal, ...sistemasLluviaLocal].forEach(sistema => {
    const pos = sistema.geometry.attributes.position.array;
    const velocidad = sistema.userData.esLluvia ? 0.07 : 0.03;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= velocidad;
      if (pos[i] < 0) pos[i] = 1.1;
    }
    sistema.geometry.attributes.position.needsUpdate = true;
  });
}

function limpiarRepresentacion() {
  objetosCentros = [];
  sistemasNieveLocal.forEach(s => escena.remove(s));
  sistemasNieveLocal = [];
  sistemasLluviaLocal.forEach(s => escena.remove(s));
  sistemasLluviaLocal = [];

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
  document.querySelector("#m-precip").textContent = centro.precipitacion;
  document.querySelector("#m-camino").textContent = centro.camino;

  // Mostrar imagen de la estación en el panel lateral
  const imgContainer = document.querySelector("#estacion-imagen-container");
  const imgElement = document.querySelector("#estacion-foto");
  if (centro.imagen) {
    imgElement.src = centro.imagen;
    imgContainer.style.display = "block";
  } else {
    imgContainer.style.display = "none";
  }

  animarCamaraA({ x: centro.x, y: 1.2, z: centro.z + 1.2 }, { x: centro.x, y: 0, z: centro.z });
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

// Botones de Encendido/Apagado (Toggle) para Nieve y Lluvia
const btnNieve = document.querySelector("#toggle-nieve");
btnNieve.addEventListener("click", () => {
  parametros.mostrarNieve = !parametros.mostrarNieve;
  btnNieve.textContent = `❄️ Nieve: ${parametros.mostrarNieve ? "ON" : "OFF"}`;
  btnNieve.style.background = parametros.mostrarNieve ? "#61afef" : "#3b4048";
  generarRepresentacion();
});

const btnLluvia = document.querySelector("#toggle-lluvia");
btnLluvia.addEventListener("click", () => {
  parametros.mostrarLluvia = !parametros.mostrarLluvia;
  btnLluvia.textContent = `🌧️ Lluvia: ${parametros.mostrarLluvia ? "ON" : "OFF"}`;
  btnLluvia.style.background = parametros.mostrarLluvia ? "#e06c75" : "#3b4048";
  generarRepresentacion();
});

document.querySelector("#modo-distribucion").addEventListener("change", (event) => {
  parametros.modo = event.target.value;
  generarRepresentacion();
});

document.querySelector("#actualizar").addEventListener("click", () => generarRepresentacion());

document.querySelector("#restablecer-vista").addEventListener("click", () => {
  animarCamaraA({ x: 0, y: 22, z: 18 }, { x: 0, y: 0, z: 0 });
  document.querySelector("#estacion-nombre").textContent = "Selecciona un centro";
  document.querySelector("#m-estado").textContent = "--";
  document.querySelector("#m-temp").textContent = "--";
  document.querySelector("#m-nieve").textContent = "--";
  document.querySelector("#m-precip").textContent = "--";
  document.querySelector("#m-camino").textContent = "--";
  document.querySelector("#estacion-imagen-container").style.display = "none";
});

function animar() {
  requestAnimationFrame(animar);
  actualizarParticulasClima();
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
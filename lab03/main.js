import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const datosNieve = {
  "actualizado": "2026-08-27T16:00:00-04:00",
  "centros": [
    { 
      "id": "valle-nevado", "nombre": "Valle Nevado", "lat": -33.3567, "lon": -70.2528, 
      "estado": "optimo", "temperatura": -2, "cm_nieve": 45, "precipitacion": "Nieve ligera", 
      "camino": "Obligatorio uso de cadenas", "imagen": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80",
      "mensual": [20, 55, 90, 45, 30, 15]
    },
    { 
      "id": "el-colorado", "nombre": "El Colorado", "lat": -33.3444, "lon": -70.2889, 
      "estado": "optimo", "temperatura": -3, "cm_nieve": 40, "precipitacion": "Nevando", 
      "camino": "Cadenas obligatorias", "imagen": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
      "mensual": [15, 50, 85, 40, 25, 10]
    },
    { 
      "id": "la-parva", "nombre": "La Parva", "lat": -33.3333, "lon": -70.2833, 
      "estado": "cerrado", "temperatura": 1, "cm_nieve": 10, "precipitacion": "Lluvia débil", 
      "camino": "Camino con precaución", "imagen": "https://images.unsplash.com/photo-1482867665717-f371a3372991?auto=format&fit=crop&w=600&q=80",
      "mensual": [5, 20, 40, 10, 10, 5]
    },
    { 
      "id": "portillo", "nombre": "Portillo", "lat": -32.8361, "lon": -70.1389, 
      "estado": "optimo", "temperatura": -4, "cm_nieve": 60, "precipitacion": "Nieve intensa", 
      "camino": "Cadenas obligatorias (Ruta 60)", "imagen": "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=600&q=80",
      "mensual": [30, 70, 110, 60, 40, 20]
    },
    { 
      "id": "nevados-chillan", "nombre": "Nevados de Chillán", "lat": -36.9083, "lon": -71.4083, 
      "estado": "optimo", "temperatura": -1, "cm_nieve": 80, "precipitacion": "Nieve moderada", 
      "camino": "Transitable con cadenas", "imagen": "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=600&q=80",
      "mensual": [40, 90, 140, 80, 55, 30]
    },
    { 
      "id": "pucon", "nombre": "Pucón (Villarrica)", "lat": -39.4200, "lon": -71.9300, 
      "estado": "optimo", "temperatura": -2, "cm_nieve": 70, "precipitacion": "Lluvia y Nieve", 
      "camino": "Transitable con precaución", "imagen": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
      "mensual": [35, 80, 120, 70, 45, 25]
    },
    { 
      "id": "antillanca", "nombre": "Antillanca", "lat": -40.7667, "lon": -72.1833, 
      "estado": "optimo", "temperatura": -2, "cm_nieve": 50, "precipitacion": "Nieve", 
      "camino": "Uso de cadenas requerido", "imagen": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=600&q=80",
      "mensual": [25, 60, 95, 50, 35, 15]
    },
    { 
      "id": "volcan-osorno", "nombre": "Volcán Osorno", "lat": -41.1000, "lon": -72.5000, 
      "estado": "optimo", "temperatura": -3, "cm_nieve": 65, "precipitacion": "Nieve ligera", 
      "camino": "Cadenas recomendadas", "imagen": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      "mensual": [30, 75, 115, 65, 40, 20]
    },
    { 
      "id": "corralco", "nombre": "Corralco", "lat": -38.4236, "lon": -71.5644, 
      "estado": "cerrado", "temperatura": 2, "cm_nieve": 15, "precipitacion": "Lluvia", 
      "camino": "Transitable", "imagen": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80",
      "mensual": [10, 30, 55, 15, 15, 5]
    }
  ]
};

const parametros = { modo: "geografico", mesSeleccionado: "actual", soloAbiertos: false, mostrarNieve: true, mostrarLluvia: true };
let centrosEsqui = datosNieve.centros;
let objetosCentros = [];
let centroSeleccionado = null;
let gruposCoposAnimados = [];
let sistemasNieveLocal = [];
let sistemasLluviaLocal = [];
let tarjetaFlotanteUnica = null;
let centroActivoPopup = null;

const viewport = document.querySelector("#viewport");
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0b0b0c);

const camara = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 300);
camara.position.set(0, 24, 20);

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
const grupoTopografia = new THREE.Group();
escena.add(grupoTopografia);

tarjetaFlotanteUnica = document.createElement("div");
tarjetaFlotanteUnica.className = "centro-card-flotante";
tarjetaFlotanteUnica.style.display = "none";
document.body.appendChild(tarjetaFlotanteUnica);

function calcularPosiciones(centros) {
  let lista = centros;
  if (parametros.soloAbiertos) {
    lista = centros.filter(c => c.estado === "optimo");
  }

  if (parametros.modo === "geografico") {
    return lista.map((centro) => {
      let x = 0, z = 0;
      switch(centro.id) {
        case "portillo": x = -0.2; z = -2.2; break;
        case "valle-nevado": x = 0.2; z = -1.2; break;
        case "el-colorado": x = 0.4; z = -1.0; break;
        case "la-parva": x = 0.5; z = -0.8; break;
        case "nevados-chillan": x = -0.3; z = 1.2; break;
        case "corralco": x = -0.5; z = 2.2; break;
        case "pucon": x = -0.8; z = 3.2; break;
        case "antillanca": x = -1.1; z = 4.2; break;
        case "volcan-osorno": x = -1.3; z = 4.8; break;
      }
      return { ...centro, x, z };
    });
  } else {
    const ordenados = [...lista].sort((a, b) => b.cm_nieve - a.cm_nieve);
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

  centrosEsqui.forEach(crearModuloLinea);

  if (parametros.modo === "geografico") {
    crearCordilleraCapasDeLineas();
  }
}

// Cordillera construida con múltiples capas de líneas azuladas en cascada (Estilo arte generativo)
function crearCordilleraCapasDeLineas() {
  const numCapas = 22; // Cantidad de líneas paralelas en profundidad (Eje Z)
  
  for (let i = 0; i < numCapas; i++) {
    const zOffset = -5.5 + (i * (11.0 / numCapas));
    const puntosLinea = [];
    
    // Generar puntos fluidos a lo largo del eje longitudinal (X)
    for (let x = -2.5; x <= 2.5; x += 0.1) {
      // Perfil de altimetría combinando funciones senoidales y armónicos para simular los Andes
      let altimetria = Math.abs(Math.sin(x * 1.2 + i * 0.15) * Math.cos(x * 0.5 - zOffset * 0.2)) * 1.8;
      altimetria += Math.sin(x * 3.0 + i * 0.1) * 0.3;
      
      // Atenuar los bordes para que parezca una cordillera central acotada
      let factorAtenuacion = Math.max(0, 1 - Math.abs(x) / 2.5);
      let y = Math.max(0.1, altimetria * factorAtenuacion + (i * 0.04));
      
      puntosLinea.push(new THREE.Vector3(x, y, zOffset + (Math.sin(x * 2) * 0.1)));
    }

    const geometriaLinea = new THREE.BufferGeometry().setFromPoints(puntosLinea);
    
    // Gradiente de color y opacidad: las líneas superiores más blancas y brillantes, las inferiores más azuladas
    const opacidadCapa = 0.3 + (i / numCapas) * 0.5;
    const colorCapa = new THREE.Color().lerpColors(
      new THREE.Color(0x2152ff), // Azul profundo abajo
      new THREE.Color(0x61afef), // Azul claro / blanco arriba
      i / numCapas
    );

    const materialLinea = new THREE.LineBasicMaterial({
      color: colorCapa,
      transparent: true,
      opacity: opacidadCapa,
      linewidth: 1.5
    });

    const lineaCordillera = new THREE.Line(geometriaLinea, materialLinea);
    grupoTopografia.add(lineaCordillera);
  }
}

function crearModuloLinea(centro) {
  const grupo = new THREE.Group();
  grupo.position.set(centro.x, 0, centro.z);
  grupo.userData.centro = centro;

  let nieveActual = centro.cm_nieve;
  if (parametros.mesSeleccionado !== "actual" && centro.mensual) {
    const idxMes = ["mayo", "junio", "julio", "agosto", "septiembre", "octubre"].indexOf(parametros.mesSeleccionado);
    if (idxMes !== -1) nieveActual = centro.mensual[idxMes];
  }

  const alturaCentro = Math.max(0.6, nieveActual / 25);
  const esOptimo = centro.estado === "optimo";
  const colorCopo = esOptimo ? 0x61afef : 0xe06c75;

  // Esfera principal del centro (Celeste si óptimo, Roja si cerrado)
  const geomEsferaCentro = new THREE.SphereGeometry(0.25, 16, 16);
  const matEsferaCentro = new THREE.MeshStandardMaterial({
    color: esOptimo ? 0xffffff : 0xff4d4d,
    roughness: 0.3,
    transparent: true,
    opacity: 0.8,
    emissive: colorCopo,
    emissiveIntensity: 0.6
  });
  const mallaCentro = new THREE.Mesh(geomEsferaCentro, matEsferaCentro);
  mallaCentro.position.y = alturaCentro;
  mallaCentro.userData.centro = centro;
  grupo.add(mallaCentro);

  // Copo geométrico flotando y animado encima
  const grupoCopo = new THREE.Group();
  grupoCopo.position.y = alturaCentro + 0.45;

  const matCopo = new THREE.MeshStandardMaterial({
    color: colorCopo,
    roughness: 0.3,
    emissive: colorCopo,
    emissiveIntensity: 0.7,
  });

  const geoHex = new THREE.BoxGeometry(0.12, 0.04, 0.12);
  const hex = new THREE.Mesh(geoHex, matCopo);
  grupoCopo.add(hex);

  for (let i = 0; i < 3; i++) {
    const brazoGeo = new THREE.BoxGeometry(0.4, 0.03, 0.06);
    const brazo = new THREE.Mesh(brazoGeo, matCopo);
    brazo.rotation.y = (i * Math.PI) / 3;
    grupoCopo.add(brazo);
  }

  grupoCopo.userData.centro = centro;
  grupo.add(grupoCopo);
  gruposCoposAnimados.push(grupoCopo);

  if (esOptimo && parametros.mostrarNieve) {
    const particulasNieve = crearParticulasClima(centro.x, centro.z, alturaCentro + 0.3, 0xffffff, 0.08);
    sistemasNieveLocal.push(particulasNieve);
    escena.add(particulasNieve);
  }

  if (centro.precipitacion.toLowerCase().includes("lluvia") && parametros.mostrarLluvia) {
    const particulasLluvia = crearParticulasClima(centro.x, centro.z, alturaCentro + 0.3, 0x61afef, 0.07, true);
    sistemasLluviaLocal.push(particulasLluvia);
    escena.add(particulasLluvia);
  }

  grupoCentros.add(grupo);
  objetosCentros.push(mallaCentro, grupoCopo);
}

function crearParticulasClima(posX, posZ, alturaTecho, colorHex, tamano, esLluvia = false) {
  const cantidad = 10;
  const geom = new THREE.BufferGeometry();
  const posiciones = new Float32Array(cantidad * 3);

  for (let i = 0; i < cantidad * 3; i += 3) {
    posiciones[i] = posX + (Math.random() - 0.5) * 0.3;
    posiciones[i + 1] = alturaTecho + Math.random() * 0.8;
    posiciones[i + 2] = posZ + (Math.random() - 0.5) * 0.3;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  const mat = new THREE.PointsMaterial({ color: colorHex, size: tamano, transparent: true, opacity: 0.85 });
  const puntos = new THREE.Points(geom, mat);
  puntos.userData.esLluvia = esLluvia;
  puntos.userData.alturaBase = 0.2;
  puntos.userData.alturaTecho = alturaTecho + 0.8;
  return puntos;
}

function actualizarAnimaciones() {
  const tiempo = Date.now() * 0.003;
  
  gruposCoposAnimados.forEach((copo, idx) => {
    copo.position.y += Math.sin(tiempo * 2 + idx) * 0.002;
    copo.rotation.y += 0.01;
  });

  if (centroActivoPopup && tarjetaFlotanteUnica) {
    let nieveActual = centroActivoPopup.cm_nieve;
    if (parametros.mesSeleccionado !== "actual" && centroActivoPopup.mensual) {
      const idxMes = ["mayo", "junio", "julio", "agosto", "septiembre", "octubre"].indexOf(parametros.mesSeleccionado);
      if (idxMes !== -1) nieveActual = centroActivoPopup.mensual[idxMes];
    }
    const alturaCentro = Math.max(0.6, nieveActual / 25);
    const pos3D = new THREE.Vector3(centroActivoPopup.x, alturaCentro + 0.9, centroActivoPopup.z);
    
    pos3D.project(camara);
    const x = (pos3D.x * .5 + .5) * viewport.clientWidth;
    const y = (-(pos3D.y * .5 + .5) * viewport.clientHeight) + viewport.offsetTop;
    
    if (pos3D.z < 1) {
      tarjetaFlotanteUnica.style.display = "block";
      tarjetaFlotanteUnica.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    } else {
      tarjetaFlotanteUnica.style.display = "none";
    }
  }

  [...sistemasNieveLocal, ...sistemasLluviaLocal].forEach(sistema => {
    const pos = sistema.geometry.attributes.position.array;
    const velocidad = sistema.userData.esLluvia ? 0.05 : 0.025;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= velocidad;
      if (pos[i] < sistema.userData.alturaBase) {
        pos[i] = sistema.userData.alturaTecho;
      }
    }
    sistema.geometry.attributes.position.needsUpdate = true;
  });
}

function limpiarRepresentacion() {
  objetosCentros = [];
  gruposCoposAnimados = [];
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
  while (grupoTopografia.children.length > 0) {
    const obj = grupoTopografia.children[0];
    obj.traverse((hijo) => {
      if (hijo.geometry) hijo.geometry.dispose();
      if (hijo.material) hijo.material.dispose();
    });
    grupoTopografia.remove(obj);
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
  centroActivoPopup = centro;
  document.querySelector("#estacion-nombre").textContent = centro.nombre;
  document.querySelector("#m-estado").textContent = centro.estado.toUpperCase();
  document.querySelector("#m-temp").textContent = centro.temperatura;
  
  let nieveMostrada = centro.cm_nieve;
  if (parametros.mesSeleccionado !== "actual" && centro.mensual) {
    const idxMes = ["mayo", "junio", "julio", "agosto", "septiembre", "octubre"].indexOf(parametros.mesSeleccionado);
    if (idxMes !== -1) nieveMostrada = centro.mensual[idxMes];
  }

  document.querySelector("#m-nieve").textContent = nieveMostrada;
  document.querySelector("#m-precip").textContent = centro.precipitacion;
  document.querySelector("#m-camino").textContent = centro.camino;

  const imgContainer = document.querySelector("#estacion-imagen-container");
  const imgElement = document.querySelector("#estacion-foto");
  if (centro.imagen) {
    imgElement.src = centro.imagen;
    imgContainer.style.display = "block";
  } else {
    imgContainer.style.display = "none";
  }

  actualizarPopupGrafico(centro);

  animarCamaraA({ x: centro.x, y: 3.5, z: centro.z + 3.0 }, { x: centro.x, y: 1.0, z: centro.z });
}

function actualizarPopupGrafico(centro) {
  const meses = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
  const valores = centro.mensual || [0,0,0,0,0,0];
  const maxVal = Math.max(...valores, 140);

  const points = valores.map((v, i) => {
    const px = i * 30 + 15;
    const py = 65 - (v / maxVal) * 50;
    return `${px},${py}`;
  });

  tarjetaFlotanteUnica.innerHTML = `
    <div class="card-title">${centro.nombre}</div>
    <div class="chart-container-grid">
      <svg class="line-chart-svg" viewBox="0 0 180 75">
        <line x1="10" y1="15" x2="170" y2="15" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="10" y1="30" x2="170" y2="30" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="10" y1="45" x2="170" y2="45" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="10" y1="60" x2="170" y2="60" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

        <polyline fill="none" stroke="#61afef" stroke-width="2.5" points="${points.join(' ')}" />

        ${valores.map((v, i) => {
          const px = i * 30 + 15;
          const py = 65 - (v / maxVal) * 50;
          return `<circle cx="${px}" cy="${py}" r="3.5" fill="#61afef" />`;
        }).join('')}
      </svg>
      <div class="chart-labels">
        ${meses.map(m => `<span>${m}</span>`).join('')}
      </div>
    </div>
  `;
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

const btnEstado = document.querySelector("#toggle-estado");
if (btnEstado) {
  btnEstado.addEventListener("click", () => {
    parametros.soloAbiertos = !parametros.soloAbiertos;
    btnEstado.textContent = parametros.soloAbiertos ? "🟢 Todos los Centros" : "🟢 Solo Abiertos";
    btnEstado.style.background = parametros.soloAbiertos ? "#e06c75" : "#98c379";
    centroActivoPopup = null;
    tarjetaFlotanteUnica.style.display = "none";
    generarRepresentacion();
  });
}

document.querySelector("#selector-mes").addEventListener("change", (event) => {
  parametros.mesSeleccionado = event.target.value;
  document.querySelector("#mes-label").textContent = event.target.options[event.target.selectedIndex].text;
  generarRepresentacion();
  if (centroSeleccionado) {
    seleccionarCentroEsqui(centroSeleccionado);
  }
});

const btnNieve = document.querySelector("#toggle-nieve");
if (btnNieve) {
  btnNieve.addEventListener("click", () => {
    parametros.mostrarNieve = !parametros.mostrarNieve;
    btnNieve.textContent = `❄️ Nieve: ${parametros.mostrarNieve ? "ON" : "OFF"}`;
    btnNieve.style.background = parametros.mostrarNieve ? "#61afef" : "#3b4048";
    generarRepresentacion();
  });
}

const btnLluvia = document.querySelector("#toggle-lluvia");
if (btnLluvia) {
  btnLluvia.addEventListener("click", () => {
    parametros.mostrarLluvia = !parametros.mostrarLluvia;
    btnLluvia.textContent = `🌧️ Lluvia: ${parametros.mostrarLluvia ? "ON" : "OFF"}`;
    btnLluvia.style.background = parametros.mostrarLluvia ? "#e06c75" : "#3b4048";
    generarRepresentacion();
  });
}

document.querySelector("#modo-distribucion").addEventListener("change", (event) => {
  parametros.modo = event.target.value;
  centroActivoPopup = null;
  tarjetaFlotanteUnica.style.display = "none";
  generarRepresentacion();
});

document.querySelector("#actualizar").addEventListener("click", () => generarRepresentacion());

document.querySelector("#restablecer-vista").addEventListener("click", () => {
  animarCamaraA({ x: 0, y: 24, z: 20 }, { x: 0, y: 0, z: 0 });
  centroActivoPopup = null;
  tarjetaFlotanteUnica.style.display = "none";
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
  actualizarAnimaciones();
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
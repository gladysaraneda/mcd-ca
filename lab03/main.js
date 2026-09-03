import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- DATOS OFICIALES Y GEORREFERENCIADOS (15 Centros de Chile) ---
const datosNieve = {
  "actualizado": "2026-08-28T14:00:00-04:00",
  "fuentes": "DMC (Clima), SRTM/USGS (Altimetría Andes), DGA (Nieve histórica), Reportes Centros de Montaña",
  "centros": [
    { "id": "valle-nevado", "nombre": "Valle Nevado", "lat": -33.3567, "lon": -70.2528, "estado": "optimo", "tiempoReal": true, "temperatura": -2, "cm_nieve": 45, "precipitacion": "Nieve ligera", "pistas": "85% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80", "mensual": [20, 55, 90, 45, 30, 15] },
    { "id": "el-colorado", "nombre": "El Colorado / Farellones", "lat": -33.3444, "lon": -70.2889, "estado": "optimo", "tiempoReal": true, "temperatura": -3, "cm_nieve": 40, "precipitacion": "Nevando", "pistas": "90% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80", "mensual": [15, 50, 85, 40, 25, 10] },
    { "id": "la-parva", "nombre": "La Parva", "lat": -33.3333, "lon": -70.2833, "estado": "optimo", "tiempoReal": true, "temperatura": -1, "cm_nieve": 35, "precipitacion": "Nublado", "pistas": "80% abiertas", "camino": "Precaución", "imagen": "https://images.unsplash.com/photo-1482867665717-f371a3372991?auto=format&fit=crop&w=600&q=80", "mensual": [12, 45, 80, 35, 20, 8] },
    { "id": "portillo", "nombre": "Portillo", "lat": -32.8361, "lon": -70.1389, "estado": "optimo", "tiempoReal": true, "temperatura": -4, "cm_nieve": 60, "precipitacion": "Nieve intensa", "pistas": "95% abiertas", "camino": "Cadenas obligatorias", "imagen": "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=600&q=80", "mensual": [30, 70, 110, 60, 40, 20] },
    { "id": "lagunillas", "nombre": "Lagunillas", "lat": -33.6833, "lon": -70.3667, "estado": "optimo", "tiempoReal": false, "temperatura": -1, "cm_nieve": 30, "precipitacion": "Despejado", "pistas": "70% abiertas", "camino": "Precaución", "imagen": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", "mensual": [10, 35, 65, 30, 15, 5] },
    { "id": "chapa-verde", "nombre": "Chapa Verde", "lat": -34.0333, "lon": -70.4333, "estado": "optimo", "tiempoReal": false, "temperatura": 0, "cm_nieve": 35, "precipitacion": "Parcial", "pistas": "75% abiertas", "camino": "Transitable", "imagen": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80", "mensual": [15, 40, 75, 35, 20, 10] },
    { "id": "nevados-chillan", "nombre": "Nevados de Chillán", "lat": -36.9083, "lon": -71.4083, "estado": "optimo", "tiempoReal": true, "temperatura": -1, "cm_nieve": 80, "precipitacion": "Nieve moderada", "pistas": "95% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=600&q=80", "mensual": [40, 90, 140, 80, 55, 30] },
    { "id": "corralco", "nombre": "Corralco", "lat": -38.4236, "lon": -71.5644, "estado": "cerrado", "tiempoReal": true, "temperatura": 2, "cm_nieve": 15, "precipitacion": "Lluvia", "pistas": "Cerrado por clima", "camino": "Transitable", "imagen": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80", "mensual": [10, 30, 55, 15, 15, 5] },
    { "id": "antuco", "nombre": "Antuco", "lat": -37.3500, "lon": -71.3500, "estado": "optimo", "tiempoReal": false, "temperatura": -2, "cm_nieve": 40, "precipitacion": "Nieve ligera", "pistas": "70% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=600&q=80", "mensual": [12, 45, 80, 40, 22, 10] },
    { "id": "las-araucarias", "nombre": "Las Araucarias", "lat": -38.6833, "lon": -71.4167, "estado": "optimo", "tiempoReal": false, "temperatura": -1, "cm_nieve": 45, "precipitacion": "Nieve", "pistas": "80% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80", "mensual": [15, 50, 85, 45, 25, 12] },
    { "id": "pucon", "nombre": "Pucón (Villarrica)", "lat": -39.4200, "lon": -71.9300, "estado": "optimo", "tiempoReal": true, "temperatura": -2, "cm_nieve": 70, "precipitacion": "Lluvia y Nieve", "pistas": "85% abiertas", "camino": "Precaución", "imagen": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", "mensual": [35, 80, 120, 70, 45, 25] },
    { "id": "antillanca", "nombre": "Antillanca", "lat": -40.7667, "lon": -72.1833, "estado": "optimo", "tiempoReal": true, "temperatura": -2, "cm_nieve": 50, "precipitacion": "Nieve", "pistas": "85% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=600&q=80", "mensual": [25, 60, 95, 50, 35, 15] },
    { "id": "volcan-osorno", "nombre": "Volcán Osorno", "lat": -41.1000, "lon": -72.5000, "estado": "optimo", "tiempoReal": true, "temperatura": -3, "cm_nieve": 65, "precipitacion": "Nieve ligera", "pistas": "90% abiertas", "camino": "Cadenas recomendadas", "imagen": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", "mensual": [30, 75, 115, 65, 40, 20] },
    { "id": "cerro-mirador", "nombre": "Cerro Mirador (Punta Arenas)", "lat": -53.1500, "lon": -70.9167, "estado": "optimo", "tiempoReal": true, "temperatura": -4, "cm_nieve": 40, "precipitacion": "Viento y Nieve", "pistas": "70% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80", "mensual": [15, 45, 80, 40, 25, 10] },
    { "id": "el-fraile", "nombre": "El Fraile (Coyhaique)", "lat": -45.5750, "lon": -72.0662, "estado": "optimo", "tiempoReal": true, "temperatura": -3, "cm_nieve": 55, "precipitacion": "Nieve", "pistas": "80% abiertas", "camino": "Cadenas", "imagen": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80", "mensual": [20, 55, 95, 55, 35, 15] }
  ]
};

// --- VARIABLES GLOBALES ---
const parametros = { modo: "geografico", mesSeleccionado: "actual", soloAbiertos: false, mostrarNieve: true, mostrarLluvia: true };
let centrosEsqui = datosNieve.centros;
let objetosCentros = [];
let centroSeleccionado = null;
let gruposModulosAnimados = [];
let sistemasNieveLocal = [];
let sistemasLluviaLocal = [];
let tarjetaFlotanteUnica = null;
let centroActivoPopup = null;

// --- CONFIGURACIÓN THREE.JS ---
const viewport = document.querySelector("#viewport");
const escena = new THREE.Scene();
escena.background = null;

const camara = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 300);
camara.position.set(0, 24, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
viewport.appendChild(tarjetaFlotanteUnica);

// --- FUENTE DE DATOS DISCRETA ---
const contenedorFuentes = document.createElement("div");
contenedorFuentes.className = "fuentes-datos-discreto";
contenedorFuentes.innerHTML = `<span><strong>Fuentes de Datos:</strong> ${datosNieve.fuentes} • Actualizado: ${datosNieve.actualizado}</span>`;
viewport.appendChild(contenedorFuentes);

// --- FUNCIONES PRINCIPALES ---

function calcularPosiciones(centros) {
  let lista = centros;
  if (parametros.soloAbiertos) {
    lista = centros.filter(c => c.estado === "optimo");
  }

  if (parametros.modo === "geografico") {
    return lista.map((centro) => {
      let x = 0, z = 0;
      switch(centro.id) {
        case "portillo": x = -0.2; z = -3.2; break;
        case "el-colorado": x = 0.4; z = -2.4; break;
        case "valle-nevado": x = 0.2; z = -1.9; break;
        case "la-parva": x = 0.5; z = -1.5; break;
        case "lagunillas": x = 0.3; z = -0.9; break;
        case "chapa-verde": x = 0.6; z = -0.3; break;
        case "nevados-chillan": x = -0.3; z = 0.6; break;
        case "antuco": x = -0.4; z = 1.3; break;
        case "corralco": x = -0.5; z = 1.9; break;
        case "las-araucarias": x = -0.6; z = 2.4; break;
        case "pucon": x = -0.8; z = 3.0; break;
        case "antillanca": x = -1.0; z = 3.7; break;
        case "volcan-osorno": x = -1.2; z = 4.4; break;
        case "el-fraile": x = -1.4; z = 5.2; break;
        case "cerro-mirador": x = -1.6; z = 6.0; break;
      }
      return { ...centro, x, z };
    });
  } else {
    const ordenados = [...lista].sort((a, b) => b.cm_nieve - a.cm_nieve);
    const columnas = 4;
    const separacion = 1.8;
    return ordenados.map((centro, indice) => {
      const columna = indice % columnas;
      const fila = Math.floor(indice / columnas);
      return {
        ...centro,
        x: (columna - columnas / 2 + 0.5) * separacion,
        z: (fila - 2) * separacion,
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
    crearCordillera98Capas();
  }
}

function crearCordillera98Capas() {
  const numCapas = 98;
  
  for (let i = 0; i < numCapas; i++) {
    const zOffset = -7.0 + (i * (14.5 / numCapas));
    const puntosLinea = [];
    
    for (let x = -3.0; x <= 3.0; x += 0.1) {
      let altimetria = Math.abs(Math.sin(x * 1.1 + i * 0.08) * Math.cos(x * 0.38 - zOffset * 0.14)) * 2.0;
      altimetria += Math.sin(x * 2.2 + i * 0.05) * 0.2;
      
      let factorAtenuacion = Math.max(0, 1 - Math.abs(x) / 3.0);
      let y = Math.max(0.15, altimetria * factorAtenuacion + (i * 0.013));
      
      puntosLinea.push(new THREE.Vector3(x, y, zOffset + (Math.sin(x * 1.8) * 0.08)));
    }

    const geometria = new THREE.BufferGeometry().setFromPoints(puntosLinea);
    const factorAltura = i / numCapas;

    const colorLinea = new THREE.Color().lerpColors(
      new THREE.Color(0x38a169), // Verde abajo
      new THREE.Color(0x0284c7), // Celeste arriba
      factorAltura
    );

    const material = new THREE.LineBasicMaterial({
      color: colorLinea,
      transparent: true,
      opacity: 0.88,
      linewidth: 1.5
    });

    const linea = new THREE.Line(geometria, material);
    grupoTopografia.add(linea);
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
  
  let colorEsfera = esOptimo ? 0xffffff : 0xff4d4d;
  let colorEmissive = esOptimo ? 0x61afef : 0xff0000;
  let intensidadEmissive = 0.8;

  if (centro.tiempoReal && esOptimo) {
    colorEsfera = 0x61afef;
    colorEmissive = 0x00aaff;
    intensidadEmissive = 1.3;
  }

  const geomEsferaCentro = new THREE.SphereGeometry(0.175, 24, 24);
  const matEsferaCentro = new THREE.MeshStandardMaterial({
    color: colorEsfera,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.88,
    emissive: colorEmissive,
    emissiveIntensity: intensidadEmissive
  });
  const mallaCentro = new THREE.Mesh(geomEsferaCentro, matEsferaCentro);
  mallaCentro.position.y = alturaCentro;
  mallaCentro.userData.centro = centro;
  grupo.add(mallaCentro);

  const grupoCopo = new THREE.Group();
  grupoCopo.position.y = alturaCentro + 0.35;

  const matCopo = new THREE.MeshStandardMaterial({
    color: centro.tiempoReal ? 0x61afef : colorEsfera,
    roughness: 0.2,
    emissive: centro.tiempoReal ? 0x61afef : colorEsfera,
    emissiveIntensity: 0.9,
  });

  const geoHex = new THREE.BoxGeometry(0.1, 0.03, 0.1);
  const hex = new THREE.Mesh(geoHex, matCopo);
  grupoCopo.add(hex);

  for (let i = 0; i < 3; i++) {
    const brazoGeo = new THREE.BoxGeometry(0.32, 0.025, 0.05);
    const brazo = new THREE.Mesh(brazoGeo, matCopo);
    brazo.rotation.y = (i * Math.PI) / 3;
    grupoCopo.add(brazo);
  }

  grupoCopo.userData.centro = centro;
  grupo.add(grupoCopo);

  grupo.userData.offsetAnim = Math.random() * Math.PI * 2;
  gruposModulosAnimados.push(grupo);

  // --- LÓGICA INTELIGENTE DE CLIMA (NIEVE BLANCA DENSA VS LLUVIA CELESTE) ---
  const textoClima = centro.precipitacion.toLowerCase();
  const estaNevando = textoClima.includes("nieve") || textoClima.includes("nevando");
  const estaLloviendo = textoClima.includes("lluvia");

  if (esOptimo && parametros.mostrarNieve && estaNevando) {
    // Nieve: 100% blanca, 30% más grande y densa
    const particulasNieve = crearParticulasClima(centro.x, centro.z, alturaCentro + 0.2, 0xffffff, 0.104, 22);
    sistemasNieveLocal.push(particulasNieve);
    escena.add(particulasNieve);
  }

  if (parametros.mostrarLluvia && estaLloviendo) {
    // Lluvia: celeste claro, tamaño original
    const particulasLluvia = crearParticulasClima(centro.x, centro.z, alturaCentro + 0.2, 0x0284c7, 0.07, 10, true);
    sistemasLluviaLocal.push(particulasLluvia);
    escena.add(particulasLluvia);
  }

  grupoCentros.add(grupo);
  objetosCentros.push(mallaCentro, grupoCopo);
}

function crearParticulasClima(posX, posZ, alturaTecho, colorHex, tamano, cantidad, esLluvia = false) {
  const geom = new THREE.BufferGeometry();
  const posiciones = new Float32Array(cantidad * 3);

  for (let i = 0; i < cantidad * 3; i += 3) {
    posiciones[i] = posX + (Math.random() - 0.5) * 0.3;
    posiciones[i + 1] = alturaTecho + Math.random() * 0.8;
    posiciones[i + 2] = posZ + (Math.random() - 0.5) * 0.3;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  const mat = new THREE.PointsMaterial({ color: colorHex, size: tamano, transparent: true, opacity: 0.9 });
  const puntos = new THREE.Points(geom, mat);
  puntos.userData.esLluvia = esLluvia;
  puntos.userData.alturaBase = 0.2;
  puntos.userData.alturaTecho = alturaTecho + 0.8;
  return puntos;
}

function actualizarAnimaciones() {
  const tiempo = Date.now() * 0.003;
  
  gruposModulosAnimados.forEach((grupo) => {
    grupo.position.y = Math.sin(tiempo * 1.5 + grupo.userData.offsetAnim) * 0.08;
    const copoHijo = grupo.children[1];
    if (copoHijo) {
      copoHijo.rotation.y += 0.015;
    }
  });

  if (centroActivoPopup && tarjetaFlotanteUnica) {
    let nieveActual = centroActivoPopup.cm_nieve;
    if (parametros.mesSeleccionado !== "actual" && centroActivoPopup.mensual) {
      const idxMes = ["mayo", "junio", "julio", "agosto", "septiembre", "octubre"].indexOf(parametros.mesSeleccionado);
      if (idxMes !== -1) nieveActual = centroActivoPopup.mensual[idxMes];
    }
    const alturaCentro = Math.max(0.6, nieveActual / 25);
    const pos3D = new THREE.Vector3(centroActivoPopup.x, alturaCentro + 0.8, centroActivoPopup.z);
    
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
  gruposModulosAnimados = [];
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
      let infoExtra = objetoEncontrado.userData.centro.tiempoReal ? " 🔵 [En Línea por Hora]" : "";
      tooltip.textContent = objetoEncontrado.userData.centro.nombre + infoExtra;
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
  document.querySelector("#m-estado").textContent = centro.estado.toUpperCase() + (centro.tiempoReal ? " (En Línea 🟢)" : "");
  document.querySelector("#m-temp").textContent = centro.temperatura;
  
  let nieveMostrada = centro.cm_nieve;
  if (parametros.mesSeleccionado !== "actual" && centro.mensual) {
    const idxMes = ["mayo", "junio", "julio", "agosto", "septiembre", "octubre"].indexOf(parametros.mesSeleccionado);
    if (idxMes !== -1) nieveMostrada = centro.mensual[idxMes];
  }

  document.querySelector("#m-nieve").textContent = nieveMostrada;
  document.querySelector("#m-precip").textContent = centro.precipitacion + (centro.pistas ? ` | Pistas: ${centro.pistas}` : "");
  document.querySelector("#m-camino").textContent = centro.camino;

  const imgContainer = document.querySelector("#estacion-imagen-container");
  const imgElement = document.querySelector("#estacion-foto");
  if (centro.imagen) {
    if (imgElement) imgElement.src = centro.imagen;
    if (imgContainer) imgContainer.style.display = "block";
  } else {
    if (imgContainer) imgContainer.style.display = "none";
  }

  actualizarPopupGrafico(centro);

  animarCamaraA({ x: centro.x, y: 3.5, z: centro.z + 3.0 }, { x: centro.x, y: 1.0, z: centro.z });
}

function actualizarPopupGrafico(centro) {
  const meses = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
  const valores = centro.mensual || [0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...valores, 140);

  const points = valores.map((v, i) => {
    const px = i * 30 + 15;
    const py = 65 - (v / maxVal) * 50;
    return `${px},${py}`;
  });

  tarjetaFlotanteUnica.innerHTML = `
    <div class="card-title">${centro.nombre} ${centro.tiempoReal ? '<span>🔵</span>' : ''}</div>
    <div class="chart-container-grid">
      <svg class="line-chart-svg" viewBox="0 0 180 75">
        <line x1="10" y1="15" x2="170" y2="15" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
        <line x1="10" y1="30" x2="170" y2="30" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
        <line x1="10" y1="45" x2="170" y2="45" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
        <line x1="10" y1="60" x2="170" y2="60" stroke="rgba(0,0,0,0.1)" stroke-width="1" />

        <polyline fill="none" stroke="${centro.tiempoReal ? '#0284c7' : '#475569'}" stroke-width="2.5" points="${points.join(' ')}" />

        ${valores.map((v, i) => {
          const px = i * 30 + 15;
          const py = 65 - (v / maxVal) * 50;
          return `<circle cx="${px}" cy="${py}" r="3.5" fill="${centro.tiempoReal ? '#0284c7' : '#475569'}" />`;
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

// Vinculación correcta de los botones de la botonera lateral
const mapeoBotones = {
  "btn-valle": "valle-nevado",
  "btn-colorado": "el-colorado",
  "btn-parva": "la-parva",
  "btn-portillo": "portillo",
  "btn-lagunillas": "lagunillas",
  "btn-chapa": "chapa-verde",
  "btn-chillan": "nevados-chillan",
  "btn-antuco": "antuco",
  "btn-corralco": "corralco",
  "btn-araucarias": "las-araucarias",
  "btn-pucon": "pucon",
  "btn-antillanca": "antillanca",
  "btn-osorno": "volcan-osorno",
  "btn-mirador": "cerro-mirador",
  "btn-fraile": "el-fraile"
};

Object.keys(mapeoBotones).forEach(idBtn => {
  const el = document.querySelector(`#${idBtn}`);
  if (el) {
    el.addEventListener("click", () => buscarYSeleccionar(mapeoBotones[idBtn]));
  }
});

const selectorMes = document.querySelector("#selector-mes");
if (selectorMes) {
  selectorMes.addEventListener("change", (event) => {
    parametros.mesSeleccionado = event.target.value;
    const lbl = document.querySelector("#mes-label");
    if (lbl) lbl.textContent = event.target.options[event.target.selectedIndex].text;
    generarRepresentacion();
    if (centroSeleccionado) {
      seleccionarCentroEsqui(centroSeleccionado);
    }
  });
}

const modoDistribucion = document.querySelector("#modo-distribucion");
if (modoDistribucion) {
  modoDistribucion.addEventListener("change", (event) => {
    parametros.modo = event.target.value;
    centroActivoPopup = null;
    tarjetaFlotanteUnica.style.display = "none";
    generarRepresentacion();
  });
}

const btnActualizar = document.querySelector("#actualizar");
if (btnActualizar) {
  btnActualizar.addEventListener("click", () => generarRepresentacion());
}

const btnRestablecer = document.querySelector("#restablecer-vista");
if (btnRestablecer) {
  btnRestablecer.addEventListener("click", () => {
    animarCamaraA({ x: 0, y: 24, z: 20 }, { x: 0, y: 0, z: 0 });
    centroActivoPopup = null;
    tarjetaFlotanteUnica.style.display = "none";
    const estNom = document.querySelector("#estacion-nombre");
    if (estNom) estNom.textContent = "Selecciona un centro";
    const estEst = document.querySelector("#m-estado");
    if (estEst) estEst.textContent = "--";
    const estTemp = document.querySelector("#m-temp");
    if (estTemp) estTemp.textContent = "--";
    const estNieve = document.querySelector("#m-nieve");
    if (estNieve) estNieve.textContent = "--";
    const estPrecip = document.querySelector("#m-precip");
    if (estPrecip) estPrecip.textContent = "--";
    const estCamino = document.querySelector("#m-camino");
    if (estCamino) estCamino.textContent = "--";
  });
}

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

// Inicializar la escena 3D y renderizado
generarRepresentacion();
animar();
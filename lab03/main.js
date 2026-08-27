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
// 05 — INTERFAZ + INSPECTOR
// ======================================================

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();

renderer.domElement.addEventListener("pointerdown", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  puntero.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  puntero.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(puntero, camara);

  const intersecciones = raycaster.intersectObjects(objetosEstacion, false);

  if (intersecciones.length > 0) {
    mostrarEstacion(intersecciones[0].object.userData.estacion);
  }
});

function mostrarEstacion(estacion) {
  const ocupacion = calcularOcupacion(estacion);

  document.querySelector("#estacion-nombre").textContent = estacion.nombre;
  document.querySelector("#m-bicis").textContent = estacion.bicicletas;
  document.querySelector("#m-libres").textContent = estacion.anclajes_libres;
  document.querySelector("#m-capacidad").textContent = estacion.capacidad;
  document.querySelector("#m-ocupacion").textContent =
    `${Math.round(ocupacion * 100)}%`;
}

document.querySelector("#modo-distribucion").addEventListener("change", (event) => {
  parametros.modo = event.target.value;
  generarRepresentacion();
});

conectarSlider("escala-altura", "escala-altura-valor", "escalaAltura", 2);
conectarSlider("escala-ancho", "escala-ancho-valor", "escalaAncho", 2);
conectarSlider("cantidad", "cantidad-valor", "cantidad", 0);

function conectarSlider(idControl, idValor, parametro, decimales) {
  const control = document.querySelector(`#${idControl}`);
  const valor = document.querySelector(`#${idValor}`);

  control.addEventListener("input", (event) => {
    parametros[parametro] = Number(event.target.value);
    valor.value = parametros[parametro].toFixed(decimales);
    generarRepresentacion();
  });
}

document.querySelector("#actualizar").addEventListener("click", async () => {
  segundosRestantes = INTERVALO_ACTUALIZACION;
  await cargarDatosVivos();
});

document.querySelector("#pausar").addEventListener("click", (event) => {
  actualizacionAutomatica = !actualizacionAutomatica;
  event.target.textContent = actualizacionAutomatica
    ? "Pausar auto"
    : "Reanudar auto";

  document.querySelector("#cuenta-regresiva").textContent =
    actualizacionAutomatica ? `${segundosRestantes} s` : "pausada";
});

function actualizarEstadoConexion(tipo) {
  const estado = document.querySelector("#estado-label");

  if (tipo === "vivo") {
    estado.innerHTML = '<i class="status-dot"></i> conectado';
  } else if (tipo === "respaldo") {
    estado.textContent = "respaldo local";
  } else {
    estado.textContent = "conectando…";
  }
}

function formatearHora(timestamp) {
  if (!timestamp) return new Date().toLocaleTimeString("es-CL");

  // GBFS v2 usa epoch seconds.
  const fecha = new Date(timestamp * 1000);

  return fecha.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ======================================================
// 06 — POLLING RESPONSABLE
// ======================================================
// La app consulta periódicamente el feed para mantener visible la fuente viva.
// El feed puede declarar un TTL mayor, por lo que algunas respuestas pueden repetirse.
// El contador mantiene visible que el sistema está esperando la próxima actualización.

setInterval(async () => {
  if (!actualizacionAutomatica) return;

  segundosRestantes -= 1;
  document.querySelector("#cuenta-regresiva").textContent =
    `${segundosRestantes} s`;

  if (segundosRestantes <= 0) {
    segundosRestantes = INTERVALO_ACTUALIZACION;
    await cargarDatosVivos();
  }
}, 1000);

// ======================================================
// 07 — ANIMACIÓN + RESPONSIVE
// ======================================================

function animar() {
  requestAnimationFrame(animar);
  controlesOrbita.update();
  renderer.render(escena, camara);
}

function ajustarVentana() {
  const ancho = viewport.clientWidth;
  const altura = viewport.clientHeight;

  camara.aspect = ancho / altura;
  camara.updateProjectionMatrix();
  renderer.setSize(ancho, altura);
}

window.addEventListener("resize", ajustarVentana);

cargarDatosVivos();
animar();
//prueba

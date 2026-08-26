import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======================================================
// 01 — PARÁMETROS
// ======================================================

const valoresIniciales = {
  columnas: 15,
  filas: 15,
  separacion: 1.2,
  amplitud: 3.0,
  frecuencia: 0.4,
  rotacion: 0.3,
  aleatoriedad: 0.0,
  semilla: 42,
};

const parametros = { ...valoresIniciales };

// ======================================================
// 02 — ESCENA
// ======================================================

const viewport = document.querySelector("#viewport");
const memoriaColores = new Map();

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0b0b0c);

const camara = new THREE.PerspectiveCamera(
  42,
  viewport.clientWidth / viewport.clientHeight,
  0.1,
  200
);

camara.position.set(18, 16, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

viewport.appendChild(renderer.domElement);

const controlesOrbita = new OrbitControls(camara, renderer.domElement);
controlesOrbita.enableDamping = true;
controlesOrbita.target.set(0, 1.2, 0);

// Iluminación general.
const luzHemisferica = new THREE.HemisphereLight(0xf3efe5, 0x202229, 1.7);
escena.add(luzHemisferica);

// Luz principal.
const luzPrincipal = new THREE.DirectionalLight(0xffffff, 3.1);
luzPrincipal.position.set(8, 14, 9);
luzPrincipal.castShadow = true;
escena.add(luzPrincipal);

// Luz secundaria para suavizar el contraste.
const luzRelleno = new THREE.DirectionalLight(0xc8d8ff, 0.8);
luzRelleno.position.set(-8, 6, -6);
escena.add(luzRelleno);

// Plano base.
const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({
    color: 0x101114,
    roughness: 1,
    metalness: 0,
  })
);

suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.03;
suelo.receiveShadow = true;
escena.add(suelo);

// Grilla de referencia para leer mejor escala y posición.
const grilla = new THREE.GridHelper(50, 50, 0x35383d, 0x202227);
grilla.position.y = 0.001;
escena.add(grilla);

// ======================================================
// 03 — OBJETO GENERATIVO
// ======================================================

const grupoCampo = new THREE.Group();
escena.add(grupoCampo);

// 1. Cambiamos la caja por una esfera
const geometriaModulo = new THREE.SphereGeometry(0.5, 32, 16);

// 2. Quitamos el color fijo para inyectarlo después
const materialModulo = new THREE.MeshStandardMaterial({
  roughness: 0.58,
  metalness: 0.03,
});

// ======================================================
// 04 — REGLAS GENERATIVAS
// ======================================================

function calcularAlturaModulo(x, z) {
  const distancia = Math.sqrt(x * x + z * z);
  const onda = Math.sin(distancia * parametros.frecuencia) * parametros.amplitud;
  const ruido = aleatoriedadConSemilla(x, z, parametros.semilla) * parametros.aleatoriedad;
  return Math.max(0.25, 1.2 + onda + ruido);
}

function calcularRotacionModulo(x, z) {
  const direccion = Math.atan2(z, x);
  return direccion * parametros.rotacion;
}

// 3. Nueva regla de color basada en la posición
function calcularColorModulo(x, z) {
  const rojo = Math.max(0, Math.min(1, (x + 10) / 20));
  const azul = Math.max(0, Math.min(1, (z + 10) / 20));
  const verde = 1.0 - ((rojo + azul) * 0.4); 
  return new THREE.Color(rojo, verde, azul);
}

// ======================================================
// 05 — GENERAR CAMPO
// ======================================================

function generarCampo() {
  limpiarCampo();

  const ancho = (parametros.columnas - 1) * parametros.separacion;
  const profundidad = (parametros.filas - 1) * parametros.separacion;

  for (let columna = 0; columna < parametros.columnas; columna++) {
    for (let fila = 0; fila < parametros.filas; fila++) {
      const x = columna * parametros.separacion - ancho / 2;
      const z = fila * parametros.separacion - profundidad / 2;

      const altura = calcularAlturaModulo(x, z);
      const rotacion = calcularRotacionModulo(x, z);

      // Clonamos el material base
      const materialUnico = materialModulo.clone();
      
      // Creamos una "coordenada celular" única para esta esfera
      const idUnico = `${columna}-${fila}`;

      // Si la esfera ya existe en la memoria, recupera su color. Si no, calcula su color original.
      if (memoriaColores.has(idUnico)) {
        materialUnico.color.copy(memoriaColores.get(idUnico));
      } else {
        materialUnico.color = calcularColorModulo(x, z);
        memoriaColores.set(idUnico, materialUnico.color);
      }

      const modulo = new THREE.Mesh(geometriaModulo, materialUnico);

      // NUEVO: Guardamos el ID dentro del objeto para reconocerlo al tocarlo
      modulo.userData.id = idUnico;

      // Escalamos de forma uniforme (X, Y, Z) para mantener la proporción de la esfera
      modulo.scale.set(altura, altura, altura);
      
      modulo.position.set(x, altura / 2, z);
      
      modulo.rotation.y = rotacion;
      modulo.castShadow = true;
      modulo.receiveShadow = true;

      grupoCampo.add(modulo);
    }
  }
}

function limpiarCampo() {
  while (grupoCampo.children.length > 0) {
    grupoCampo.remove(grupoCampo.children[0]);
  }
}

// ======================================================
// 06 — ALEATORIEDAD CONTROLADA
// ======================================================
function aleatoriedadConSemilla(x, z, semilla) {
  const valor =
    Math.sin(
      x * 12.9898 +
      z * 78.233 +
      semilla * 37.719
    ) * 43758.5453;

  const normalizado = valor - Math.floor(valor);
  return normalizado * 2 - 1;
}

// ======================================================
// 07 — INTERFAZ
// ======================================================

const controles = {
  columnas: document.querySelector("#columnas"),
  filas: document.querySelector("#filas"),
  separacion: document.querySelector("#separacion"),
  amplitud: document.querySelector("#amplitud"),
  frecuencia: document.querySelector("#frecuencia"),
  rotacion: document.querySelector("#rotacion"),
  aleatoriedad: document.querySelector("#aleatoriedad"),
  semilla: document.querySelector("#semilla"),
};

const valoresVisibles = {
  columnas: document.querySelector("#columnas-valor"),
  filas: document.querySelector("#filas-valor"),
  separacion: document.querySelector("#separacion-valor"),
  amplitud: document.querySelector("#amplitud-valor"),
  frecuencia: document.querySelector("#frecuencia-valor"),
  rotacion: document.querySelector("#rotacion-valor"),
  aleatoriedad: document.querySelector("#aleatoriedad-valor"),
  semilla: document.querySelector("#semilla-valor"),
};

function actualizarParametro(nombre, valor) {
  const parametrosEnteros = ["columnas", "filas", "semilla"];
  parametros[nombre] = parametrosEnteros.includes(nombre)
    ? Number.parseInt(valor, 10)
    : Number.parseFloat(valor);

  if (valoresVisibles[nombre]) {
    valoresVisibles[nombre].value = parametrosEnteros.includes(nombre)
      ? parametros[nombre]
      : parametros[nombre].toFixed(2);
  }
  generarCampo();
}

Object.entries(controles).forEach(([nombre, control]) => {
  if (control) { // Solo escucha si el control no fue borrado del HTML
    control.addEventListener("input", (event) => {
      actualizarParametro(nombre, event.target.value);
    });
  }
});

const btnRestablecer = document.querySelector("#restablecer");
if (btnRestablecer) {
  btnRestablecer.addEventListener("click", () => {
    Object.assign(parametros, valoresIniciales);
    const parametrosEnteros = ["columnas", "filas", "semilla"];
    Object.entries(controles).forEach(([nombre, control]) => {
      if (control) {
        control.value = parametros[nombre];
        valoresVisibles[nombre].value = parametrosEnteros.includes(nombre)
          ? parametros[nombre]
          : parametros[nombre].toFixed(2);
      }
    });
    generarCampo();
  });
}

// ======================================================
// 08 — BUCLE DE ANIMACIÓN E INTERACCIÓN
// ======================================================

const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2(-100, -100); 

// Usamos 'let' para que el color pueda ser modificado por los botones
let colorContagio = new THREE.Color(0xff0000); 

// Conectar botones de colores
const btnRojo = document.querySelector("#btn-rojo");
if (btnRojo) btnRojo.addEventListener("click", () => colorContagio.set(0xff0000));

const btnVerde = document.querySelector("#btn-verde");
if (btnVerde) btnVerde.addEventListener("click", () => colorContagio.set(0x00ff00));

const btnNegro = document.querySelector("#btn-negro");
if (btnNegro) btnNegro.addEventListener("click", () => colorContagio.set(0x000000));

// Conectar botón de limpieza
const btnLimpiarColores = document.querySelector("#btn-limpiar-colores");
if (btnLimpiarColores) {
  btnLimpiarColores.addEventListener("click", () => {
    memoriaColores.clear(); // Borramos la memoria de contagio
    generarCampo(); // Regeneramos la grilla limpia
  });
}

window.addEventListener('mousemove', (event) => {
  cursor.x = (event.clientX / viewport.clientWidth) * 2 - 1;
  cursor.y = -(event.clientY / viewport.clientHeight) * 2 + 1;
});

function animar() {
  requestAnimationFrame(animar);

  raycaster.setFromCamera(cursor, camara);
  const intersecciones = raycaster.intersectObjects(grupoCampo.children);

  if (intersecciones.length > 0) {
    const esferaTocada = intersecciones[0].object;
    
    esferaTocada.material.color.lerp(colorContagio, 0.1);
    
    const idCelular = esferaTocada.userData.id;
    memoriaColores.set(idCelular, esferaTocada.material.color.clone());
  }

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

generarCampo();
animar();
//TRATANDO DE PUBLICAR2
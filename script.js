// Variables globales de conversación
let arbolDecision = {};
let estiloElegido = '';

// Referencias del DOM usando las partes indicadas
const zonaMensajes = document.getElementById('zona-de-mensajes');
const ingresoMensajes = document.getElementById('ingreso-de-mensajes');

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    cargarArbolDecision();
});

// Cargar el árbol desde JSON con fetch
function cargarArbolDecision() {
    fetch('arbol_decision.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Respuesta de red no ok');
            }
            return response.json();
        })
        .then(data => {
            arbolDecision = data;
            irANodo('inicio');
        })
        .catch(error => {
            console.error('Error al cargar JSON:', error);
            mostrarMensajeErrorServidor();
        });
}

// Mensaje obligatorio de error si se abre sin servidor local
function mostrarMensajeErrorServidor() {
    zonaMensajes.innerHTML = '';
    ingresoMensajes.innerHTML = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje bot';
    errorDiv.style.backgroundColor = '#ff4757';
    errorDiv.textContent = 'Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json.';

    zonaMensajes.appendChild(errorDiv);
}

// Navegación entre nodos del árbol
function irANodo(idNodo) {
    const nodo = arbolDecision[idNodo];
    if (!nodo) return;

    // Personalizar texto si se recordó una elección previa
    let textoBot = nodo.texto;
    if (estiloElegido && textoBot.includes('{estilo}')) {
        textoBot = textoBot.replace('{estilo}', estiloElegido);
    }

    agregarMensajeBot(textoBot);
    ingresoMensajes.innerHTML = '';

    if (nodo.requiereInput) {
        renderizarInput(nodo);
    } else if (nodo.opciones && nodo.opciones.length > 0) {
        nodo.opciones.forEach(opcion => {
            const boton = document.createElement('button');
            boton.className = 'opcion-btn';

            if (opcion.siguiente === 'fin' || opcion.texto.includes('Terminar')) {
                boton.classList.add('salir');
            }

            boton.textContent = opcion.texto;
            boton.addEventListener('click', () => {
                agregarMensajeUsuario(opcion.texto);

                // Guardar la elección en memoria si la opción lo indica
                if (opcion.guardarEstilo) {
                    estiloElegido = opcion.guardarEstilo;
                }

                irANodo(opcion.siguiente);
            });
            ingresoMensajes.appendChild(boton);
        });
    }
}

function agregarMensajeBot(texto) {
    const msj = document.createElement('div');
    msj.className = 'mensaje bot';
    msj.textContent = texto;
    zonaMensajes.appendChild(msj);
    zonaMensajes.scrollTop = zonaMensajes.scrollHeight;
}

function agregarMensajeUsuario(texto) {
    const msj = document.createElement('div');
    msj.className = 'mensaje usuario';
    msj.textContent = texto;
    zonaMensajes.appendChild(msj);
    zonaMensajes.scrollTop = zonaMensajes.scrollHeight;
}

// Formulario exclusivo cuando sea imperioso solicitar datos
function renderizarInput(nodo) {
    const contenedor = document.createElement('div');
    contenedor.className = 'input-contenedor';

    const fila = document.createElement('div');
    fila.className = 'input-fila';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-datos';
    input.placeholder = nodo.placeholder || 'Escribí tu respuesta...';

    const btnEnviar = document.createElement('button');
    btnEnviar.type = 'button';
    btnEnviar.className = 'opcion-btn';
    btnEnviar.textContent = 'Enviar';

    const msjError = document.createElement('span');
    msjError.className = 'msj-error';

    fila.appendChild(input);
    fila.appendChild(btnEnviar);
    contenedor.appendChild(fila);
    contenedor.appendChild(msjError);

    const enviar = () => {
        const valor = input.value.trim();

        if (nodo.tipoValidacion === 'texto') {
            if (!valor || /\d/.test(valor)) {
                msjError.textContent = '⚠️ Por favor, ingresá un nombre válido (sin números).';
                return;
            }
        } else if (nodo.tipoValidacion === 'numero') {
            if (isNaN(valor) || valor === '') {
                msjError.textContent = '⚠️ Por favor, ingresá un número válido.';
                return;
            }
        }

        if (nodo.guardarEleccion) {
            estiloElegido = valor;
        }

        agregarMensajeUsuario(valor);
        irANodo(nodo.siguiente);
    };

    btnEnviar.addEventListener('click', enviar);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            enviar();
        }
    });

    ingresoMensajes.appendChild(contenedor);
}

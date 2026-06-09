// --- CONFIGURACIÓN CENTRAL ---
// Tu URL específica de ngrok para pruebas
const N8N_WEBHOOK_URL = "https://icon-lingo-essay.ngrok-free.dev/webhook-test/table-inf";

// Coordenadas iniciales por defecto (Floridablanca / Bucaramanga)
const LAT_POR_DEFECTO = 7.0642; 
const LON_POR_DEFECTO = -73.1056;

// Elementos de la interfaz
const form = document.getElementById('reporteForm');
const btnGeo = document.getElementById('btnGeo');
const geoStatus = document.getElementById('geo-status');
const latInput = document.getElementById('latitud');
const lonInput = document.getElementById('longitud');
const btnSubmit = document.getElementById('btnSubmit');
const messageBox = document.getElementById('form-message');

// --- INICIALIZACIÓN DEL MAPA (Leaflet.js) ---
const map = L.map('map').setView([LAT_POR_DEFECTO, LON_POR_DEFECTO], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Crear marcador arrastrable
const marcador = L.marker([LAT_POR_DEFECTO, LON_POR_DEFECTO], {
    draggable: true
}).addTo(map);

// Escuchar movimiento del marcador
marcador.on('dragend', function () {
    const posicion = marcador.getLatLng();
    actualizarCoordenadas(posicion.lat, posicion.lng, "Manual (Marcador arrastrado)");
});

// Escuchar clics en el mapa
map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    marcador.setLatLng([lat, lng]);
    actualizarCoordenadas(lat, lng, "Manual (Clic en mapa)");
});

// --- EVENT LISTENERS ---
btnGeo.addEventListener('click', obtenerUbicacion);
form.addEventListener('submit', enviarFormulario);

// --- FUNCIÓN: CAPTURA DE GPS ---
function obtenerUbicacion() {
    if (!navigator.geolocation) {
        mostrarStatus("La geolocalización no es compatible con tu navegador.", "var(--error-color)");
        return;
    }

    mostrarStatus("Localizando dispositivo vía GPS...", "var(--primary-color)");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            map.setView([lat, lon], 17); // Zoom cerrado en la calle exacta
            marcador.setLatLng([lat, lon]);

            actualizarCoordenadas(lat, lon, "GPS Automático");
        },
        (error) => {
            let mensajeError = "Error de GPS. Puedes marcar el daño haciendo clic directo en el mapa.";
            if (error.code === error.PERMISSION_DENIED) {
                mensajeError = "Permiso de GPS denegado. Marca la ubicación haciendo clic en el mapa.";
            }
            mostrarStatus(mensajeError, "var(--error-color)");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function actualizarCoordenadas(lat, lon, metodo) {
    latInput.value = lat;
    lonInput.value = lon;
    mostrarStatus(`✓ Ubicación establecida vía ${metodo} (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)})`, "var(--success-color)");
}

function mostrarStatus(texto, color) {
    geoStatus.textContent = texto;
    geoStatus.style.color = color;
}

// --- FUNCIÓN: ENVÍO Y RECEPCIÓN DE ID DESDE N8N ---
async function enviarFormulario(event) {
    event.preventDefault();

    // Validación de seguridad: coordenadas capturadas obligatorias
    if (!latInput.value || !lonInput.value) {
        mostrarMensaje("Por favor, selecciona una ubicación en el mapa antes de enviar.", "error");
        return;
    }

    // Bloquear controles y mostrar estado de espera
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Procesando reporte con IA (Espera un momento)...";
    ocultarMensaje();

    const formData = new FormData(form);

    try {
        // Petición HTTP incluyendo la cabecera bypass de ngrok
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true' // Rompe la pantalla de advertencia de ngrok
            },
            body: formData
        });

        if (response.ok) {
            // Esperamos el JSON estructurado de n8n
            const resultado = await response.json();
            
            console.log("Respuesta completa de n8n:", resultado); // Debug
            
            // Separar y validar el ID del JSON
            let ticketId = "ID-No-Generado";
            
            if (resultado) {
                // Intentar obtener el ID de diferentes posibles campos
                if (resultado.id) {
                    ticketId = String(resultado.id);
                } else if (resultado.ticket_id) {
                    ticketId = String(resultado.ticket_id);
                } else if (resultado.ticketId) {
                    ticketId = String(resultado.ticketId);
                } else if (resultado.responseBody && resultado.responseBody.id) {
                    ticketId = String(resultado.responseBody.id);
                }
            }

            console.log("ID extraído:", ticketId); // Debug

            // Mensaje en pantalla con el ID claramente visible
            mostrarMensaje(`✓ Reporte enviado exitosamente\n\nTu ID de ticket: ${ticketId}\n\nUsa este ID para rastrear tu solicitud con el bot @Cami_nandobot`, "success");
            
            // Limpieza y reseteo del mapa
            form.reset();
            map.setView([LAT_POR_DEFECTO, LON_POR_DEFECTO], 13);
            marcador.setLatLng([LAT_POR_DEFECTO, LON_POR_DEFECTO]);
            mostrarStatus("Coordenadas no capturadas aún.", "var(--text-muted)");
        } else {
            throw new Error(`Error en el servidor de n8n: ${response.status}`);
        }
    } catch (error) {
        console.error("Error al conectar con n8n:", error);
        mostrarMensaje("Hubo un problema al procesar tu reporte. Por favor, inténtalo de nuevo.", "error");
    } finally {
        // Restablecer el botón de envío
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Enviar Reporte Ciudadano";
    }
}

// Funciones de UI
function mostrarMensaje(texto, tipo) {
    messageBox.textContent = texto;
    messageBox.className = `message-box ${tipo}`;
}

function ocultarMensaje() {
    messageBox.className = "message-box hidden";
}
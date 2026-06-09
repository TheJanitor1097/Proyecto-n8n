// --- CONFIGURACIÓN CENTRAL ---
const N8N_WEBHOOK_URL = "TU_URL_WEBHOOK_N8N";

// Coordenadas iniciales por defecto (Ejemplo: Centro de Bogotá, Colombia)
// Cambia estos números por el centro geográfico de tu municipio o ciudad
const LAT_POR_DEFECTO = 4.6097; 
const LON_POR_DEFECTO = -74.0817;

// Elementos de la interfaz
const form = document.getElementById('reporteForm');
const btnGeo = document.getElementById('btnGeo');
const geoStatus = document.getElementById('geo-status');
const latInput = document.getElementById('latitud');
const lonInput = document.getElementById('longitud');
const btnSubmit = document.getElementById('btnSubmit');
const messageBox = document.getElementById('form-message');

// --- INICIALIZACIÓN DEL MAPA (Leaflet.js) ---
// Inicializa el visor del mapa centrado en la ubicación por defecto con un zoom de 13
const map = L.map('map').setView([LAT_POR_DEFECTO, LON_POR_DEFECTO], 13);

// Carga las capas visuales de las calles desde OpenStreetMap de forma gratuita
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Crea un marcador (pin) arrastrable en el mapa
const marcador = L.marker([LAT_POR_DEFECTO, LON_POR_DEFECTO], {
    draggable: true
}).addTo(marcadorAlMapa());

function marcadorAlMapa() {
    return map;
}

// Escuchar cuando el usuario termina de arrastrar el marcador manualmente
marcador.on('dragend', function (e) {
    const posicion = marcador.getLatLng();
    actualizarCoordenadas(posicion.lat, posicion.lng, "Manual (Marcador arrastrado)");
});

// Escuchar cuando el usuario hace clic directo en cualquier parte del mapa
map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    marcador.setLatLng([lat, lng]); // Mueve el pin a donde hizo clic
    actualizarCoordenadas(lat, lng, "Manual (Clic en mapa)");
});


// --- EVENT LISTENERS DEL FORMULARIO ---
btnGeo.addEventListener('click', obtenerUbicacion);
form.addEventListener('submit', enviarFormulario);


// --- FUNCIÓN: CAPTURA AUTOMÁTICA DE GPS ---
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

            // Mover el mapa y el marcador a la posición real encontrada por el GPS
            map.setView([lat, lon], 17); // Zoom más cercano (calle exacta)
            marcador.setLatLng([lat, lon]);

            actualizarCoordenadas(lat, lon, "GPS Automático");
        },
        (error) => {
            let mensajeError = "Error al obtener ubicación GPS. Puedes marcarla manualmente haciendo clic en el mapa.";
            if (error.code === error.PERMISSION_DENIED) mensajeError = "Permiso de GPS denegado. Por favor, marca el daño haciendo clic directo en el mapa.";
            
            mostrarStatus(mensajeError, "var(--error-color)");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Función centralizadora para guardar los datos y dar feedback al usuario
function actualizarCoordenadas(lat, lon, metodo) {
    latInput.value = lat;
    lonInput.value = lon;
    mostrarStatus(`✓ Ubicación establecida vía ${metodo} (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)})`, "var(--success-color)");
}

function mostrarStatus(texto, color) {
    geoStatus.textContent = texto;
    geoStatus.style.color = color;
}


// --- FUNCIÓN: ENVÍO ASÍNCRONO A N8N (FETCH ACTUALIZADO) ---
async function enviarFormulario(event) {
    event.preventDefault(); // Evita que la página se recargue automáticamente

    // Validación de seguridad: Verificar si el usuario capturó las coordenadas primero
    if (!latInput.value || !lonInput.value) {
        mostrarMensaje("Por favor, captura tu ubicación antes de enviar el reporte.", "error");
        return;
    }

    // Bloquear controles mientras se procesa el envío
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando reporte de incidente...";
    ocultarMensaje();

    // Empaquetar automáticamente todos los inputs del HTML
    const formData = new FormData(form);

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData // Envía los datos estructurados
        });

        if (response.ok) {
            // ¡AQUÍ ESTÁ EL CAMBIO CRUCIAL! 
            // Leemos la respuesta de n8n esperando un formato JSON como: { "id": "TK-12345" }
            const resultado = await response.json();
            
            // Si n8n nos devuelve un campo id, lo usamos; si no, ponemos uno por defecto
            const ticketId = resultado.id || "Generando...";

            // Mostramos el mensaje exacto que solicitaste
            mostrarMensaje(`Tu pedido fue enviado, esta es tu id: ${ticketId}`, "success");
            
            form.reset(); // Limpia el formulario para un nuevo reporte
            mostrarStatus("Coordenadas no capturadas aún.", "var(--text-muted)");
        } else {
            throw new Error(`Error en el servidor de n8n: ${response.status}`);
        }
    } catch (error) {
        console.error("Error al conectar con n8n:", error);
        mostrarMensaje("Hubo un problema de conexión al enviar el reporte. Inténtalo de nuevo.", "error");
    } finally {
        // Desbloquear el botón de envío
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Enviar Reporte Ciudadano";
    }
}

function mostrarMensaje(texto, tipo) {
    messageBox.textContent = texto;
    messageBox.className = `message-box ${tipo}`;
}

function ocultarMensaje() {
    messageBox.className = "message-box hidden";
}
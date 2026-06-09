# SmartCity-Fix
## Sistema Inteligente de Diagnóstico y Enrutamiento de Reportes de Infraestructura Urbana

---

# 1. Introducción

SmartCity-Fix es una solución orientada a ciudades inteligentes que automatiza la recepción, análisis, clasificación y seguimiento de incidentes de infraestructura urbana.

El sistema permite que los ciudadanos reporten daños como:

- Baches
- Luminarias fundidas
- Semáforos averiados
- Fugas de agua
- Cableado caído

A diferencia de los procesos tradicionales basados en llamadas telefónicas o revisión manual, SmartCity-Fix utiliza automatización e inteligencia artificial para analizar los reportes y asignar prioridades de atención de forma automática.

---

# 2. Objetivo General

Desarrollar un sistema automatizado que permita registrar, clasificar y enrutar reportes de daños en infraestructura urbana, integrando visión artificial, geolocalización, análisis de texto, toma de decisiones basada en criticidad y notificaciones automatizadas.

---

# 3. Objetivos Específicos

- Diseñar un formulario web geolocalizado para la captura de reportes ciudadanos.
- Automatizar la consolidación de reportes en Google Sheets.
- Implementar un módulo de Inteligencia Artificial multimodal.
- Clasificar incidentes según prioridad.
- Integrar un bot de Telegram para consultas y notificaciones.
- Reducir tiempos de respuesta operativa.
- Detectar reportes duplicados geográficamente.
- Generar métricas para seguimiento de incidentes.

---

# 4. Arquitectura General del Sistema

```text
Ciudadano
    │
    ▼
Formulario Web
    │
    ▼
Webhook (n8n)
    │
    ▼
Geocodificación Inversa
    │
    ▼
Detección de Duplicados
    │
    ▼
IA Multimodal
    │
    ▼
Clasificación y Priorización
    │
    ▼
Google Sheets
    │
    ├── Dashboard
    │
    └── Telegram
            │
            ├── Consulta Ticket
            └── Notificaciones
```

---

# 5. Tecnologías Utilizadas

| Tecnología              | Función                 |
| ----------------------- | ----------------------- |
| HTML/CSS/JavaScript     | Formulario web          |
| n8n                     | Automatización          |
| OpenAI/Gemini           | Inteligencia Artificial |
| Google Sheets           | Base de datos           |
| Telegram Bot API        | Notificaciones          |
| OpenStreetMap Nominatim | Geocodificación inversa |
| ngrok                   | Exposición del webhook  |

---

# 6. Componentes del Sistema

---

## 6.1 Formulario Web

El formulario permite registrar:

- Nombre
- Teléfono
- Tipo de incidente
- Dirección
- Descripción
- Fotografía
- Latitud
- Longitud

### Funcionalidades

- Captura de ubicación GPS.
- Carga de imágenes.
- Envío mediante Webhook.

### Captura

![Formulario Web](/assets/1.png)

---

## 6.2 Webhook de Recepción

El formulario envía los datos al Webhook de n8n.

El Webhook recibe:

```json
{
  "nombre": "",
  "telefono": "",
  "tipo_incidente": "",
  "direccion": "",
  "descripcion": "",
  "latitud": "",
  "longitud": ""
}
```

Además recibe la imagen adjunta en formato binario.

### Captura

![Webhook](/assets/2.png)

---

## 6.3 Geocodificación Inversa

Se utiliza la API de OpenStreetMap Nominatim para convertir coordenadas GPS en direcciones legibles.

### Entrada

```text
Latitud
Longitud
```

### Salida

```text
Calle 48 #28-39, Bogotá, Colombia
```

### Beneficios

- Facilita la asignación de cuadrillas.
- Mejora la lectura de reportes.

### Captura

![Geocodificación](/assets/3.png)

---

## 6.4 Detección de Duplicados Geográficos

Antes de registrar un incidente se compara la ubicación con reportes existentes.

### Método utilizado

Fórmula de Haversine.

### Regla aplicada

```text
Distancia <= 20 metros
```

### Resultado

- Duplicado → Se bloquea el registro.
- No duplicado → Continúa el flujo.

### Captura

![Duplicados](/assets/4.png)

---

## 6.5 Módulo de Inteligencia Artificial

La IA analiza simultáneamente:

### Visión Artificial

Analiza la imagen para identificar:

- Baches
- Luminarias fundidas
- Semáforos dañados
- Fugas de agua
- Cableado caído

### NLP (Procesamiento de Texto)

Analiza palabras clave relacionadas con riesgo.

Ejemplos:

```text
gas
alto voltaje
colegio cerca
riesgo
explosión
```

### Salida

```json
{
  "categoria": "Luminaria Fundida",
  "prioridad": "Moderada",
  "confianza": 92
}
```

### Captura

![IA](/assets/5.png)

---

## 6.6 Sistema de Priorización

La IA genera:

### Prioridad Crítica

Ejemplos:

- Fuga de gas
- Cableado energizado
- Riesgo inmediato

### Prioridad Moderada

Ejemplos:

- Semáforos averiados
- Daños parciales

### Prioridad Baja

Ejemplos:

- Luminarias fundidas
- Señalización dañada

### Captura

![Priorización](/assets/6.png)

---

## 6.7 Base de Datos de Incidentes

Todos los registros son almacenados en Google Sheets.

### Campos

| Campo             |
| ----------------- |
| Ticket ID         |
| Nombre            |
| Teléfono          |
| Tipo de Incidente |
| Descripción       |
| Latitud           |
| Longitud          |
| Dirección         |
| Categoría IA      |
| Prioridad         |
| Confianza         |
| Estado            |
| Chat ID           |
| Fecha             |

### Captura

![Google Sheets](/assets/7.png)

---

## 6.8 Bot de Telegram

El sistema dispone de un bot para interacción ciudadana.

### Funciones

#### Consulta de Ticket

Ejemplo:

```text
/consultar TK-001
```

Respuesta:

```text
Estado: En Asignación
Prioridad: Moderada
```

#### Notificaciones Automáticas

Cuando el estado cambia a:

```text
Solucionado
```

el ciudadano recibe una notificación automática.

### Captura

![Telegram](/assets/8.png)

---

## 6.9 Dashboard de Métricas

Se implementó un panel en Google Sheets para monitoreo.

### Métricas

- Total Reportes
- Reportes Críticos
- Reportes Moderados
- Reportes Bajos
- Solucionados
- En Asignación

### Gráficos

- Distribución por prioridad.
- Estado de incidentes.

### Captura

![Dashboard](/assets/9.png)

---

# 7. Flujo Completo de Operación

```text
1. Ciudadano registra incidente
2. Formulario envía datos
3. Webhook recibe información
4. Se obtiene dirección mediante geocodificación
5. Se valida duplicidad geográfica
6. IA analiza imagen y descripción
7. IA clasifica incidente
8. Se asigna prioridad
9. Se genera Ticket ID
10. Se almacena en Google Sheets
11. Telegram registra Chat ID
12. Ciudadano consulta ticket
13. Sistema envía notificaciones automáticas
14. Dashboard actualiza métricas
```

---

# 8. Consideraciones de Seguridad

- Protección de datos personales.
- Acceso restringido mediante credenciales.
- Validación de archivos adjuntos.
- Uso de conexiones HTTPS.
- Control de acceso a Google Sheets.

---

# 9. Resultados Obtenidos

Durante el desarrollo se logró:

✅ Automatizar la recepción de incidentes.

✅ Clasificar reportes mediante IA.

✅ Integrar análisis multimodal.

✅ Implementar geocodificación inversa.

✅ Detectar reportes duplicados.

✅ Almacenar información en tiempo real.

✅ Consultar estados mediante Telegram.

✅ Enviar notificaciones automáticas.

✅ Generar métricas y visualizaciones.

---

# 10. Conclusiones

SmartCity-Fix demuestra cómo la automatización de procesos y la inteligencia artificial pueden optimizar la gestión de infraestructura urbana.

La integración de n8n, Google Sheets, Telegram e IA multimodal permitió construir una solución funcional capaz de recibir, analizar y gestionar incidentes urbanos de forma automática, reduciendo tiempos operativos y mejorando la trazabilidad de la información.

---

# 11. Repositorio

Repositorio del proyecto:

```text
https://github.com/TheJanitor1097/Proyecto-n8n
```

---

# 12. Anexos

## Anexo A - Workflow completo

![Workflow](/assets/10.png)

---

Integrantes: 

Michael santos 

Nikolas tolosa

Miguel hernandez

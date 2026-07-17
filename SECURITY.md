# Política y Arquitectura de Seguridad — Nexo Agencia Creativa

En **Nexo Agencia Creativa**, priorizamos la seguridad, integridad y privacidad de la información tanto en nuestra infraestructura web como en el manejo de los datos de nuestros clientes. Este documento detalla las medidas de seguridad técnicas implementadas en nuestro sitio web estático (`/NEXO-AC/`) alojado en GitHub Pages.

---

## 1. Medidas de Seguridad Web Implementadas

### A. Política de Seguridad de Contenido (CSP) Estricta
Todas las páginas HTML del sitio incluyen directivas de `Content-Security-Policy` diseñadas para prevenir ataques de Cross-Site Scripting (XSS), inyecciones de código de terceros y redirecciones no autorizadas:
- `default-src 'self'`: Restringe la carga por defecto a recursos del propio origen.
- `script-src 'self'`: Bloquea scripts externos no autorizados y garantiza que únicamente los archivos de secuencia de comandos propios (como `assets/main.js`) sean ejecutados por el navegador.
- `style-src 'self' 'unsafe-inline'`: Permite los estilos de nuestra hoja principal `styles.css` e inyecciones de estilo dinámicas controladas para animaciones e interacciones de UI.
- `img-src 'self' data: https:`: Permite imágenes locales, datos en Base64 y recursos gráficos seguros vía HTTPS.
- `connect-src 'self' https://wa.me https://www.instagram.com`: Limita de forma estricta las conexiones externas y redirecciones a canales oficiales autorizados de la agencia (WhatsApp e Instagram).
- `object-src 'none'` y `frame-ancestors 'none'`: Bloquean complementos Flash/plugin y previenen ataques de *Clickjacking* al prohibir que el sitio sea embebido dentro de `iframes` externos.
- `form-action 'self' https://wa.me`: Garantiza que el envío de formularios únicamente pueda dirigirse a nuestras rutas internas o a la API oficial de WhatsApp.

### B. Sanitización y Validación de Entradas en el Cliente
El formulario interactivo de contacto (`iniciar-proyecto.html`) y sus manejadores en `assets/main.js` implementan defensas de validación y limpieza rigurosas:
1. **Sanitización de Cadenas (`sanitizeString`)**: Antes de componer cualquier mensaje o procesar datos, todas las entradas de usuario se limpian eliminando caracteres potencialmente peligrosos y etiquetas HTML (`<`, `>`, `&`, `"`, `'`, `/`, `` ` ``), neutralizando cualquier intento de inyección de código o XSS reflejado.
2. **Validación Estricta de Patrones**:
   - Nombres: Se valida longitud mínima y máxima junto con filtrado de caracteres no alfabéticos.
   - Correo Electrónico (`email`): Verificación por expresión regular estricta de formato estándar de e-mail.
   - Teléfono: Limpieza y validación numérica internacional orientada a WhatsApp (`+58`).
3. **Prevención de Envíos Duplicados / Rate Limiting en Cliente**: Control de estado (`formSubmitted`) que deshabilita el botón de acción una vez disparado el evento, previniendo envíos múltiples involuntarios o automatizados simples.

### C. Protección Anti-Spam invisible (Honeypot)
El formulario de contacto incorpora un campo trampa invisible (`_honey`) fuera de la percepción visual del usuario mediante CSS (`aria-hidden="true"`, `tabindex="-1"`, `display:none`). Si un bot automatizado rellena este campo, el sistema intercepta el envío de forma silenciosa y descarta la solicitud sin generar notificaciones falsas.

### D. Integridad de Rutas y Navegación Segura
- **Enlaces Exclusivos con `rel="noopener noreferrer"`**: Todos los enlaces externos salientes (WhatsApp, Instagram, redes sociales) incluyen los atributos `rel="noopener noreferrer" target="_blank"` para evitar vulnerabilidades de tipo *Reverse Tabnabbing* y proteger la privacidad de referencia.
- **Rutas Absolutas y Relativas Protegidas (`getPrefix()`)**: La arquitectura resuelve dinámicamente el prefijo de GitHub Pages (`/NEXO-AC/`), evitando secuestros de ruta al transicionar entre carpetas raíz y subdirectorios (`proyectos/`).

---

## 2. Reporte de Vulnerabilidades

Si descubres una vulnerabilidad o fallo de seguridad en este sitio web, te agradeceremos que lo notifiques de forma responsable antes de hacerlo público:

1. **Contacto Directo**: Envía un informe detallado con los pasos para reproducir la vulnerabilidad a nuestro canal oficial de atención vía WhatsApp al **+58 414-703-5317** o a nuestro correo corporativo de administración.
2. **Confidencialidad**: Nos comprometemos a evaluar, validar y solucionar cualquier fallo reportado en el menor tiempo posible, manteniendo la confidencialidad de la investigación.

---

*Última actualización: Julio 2026 — Nexo Agencia Creativa.*

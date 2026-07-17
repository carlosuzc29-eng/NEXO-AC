# Nexo Agencia Creativa — Sitio web

Sitio estático responsive de Nexo Agencia Creativa, preparado como portafolio de proyectos y catálogo de servicios. La interfaz integra la dirección visual del prototipo en HTML, CSS y JavaScript reales; no utiliza una captura de pantalla como fondo.

![Vista completa de la página de inicio](previews/home-desktop-full.png)

## Contenido

- Inicio editorial e interactivo.
- Portafolio de Burger House, Moffyns, Milkarf, Impreco, Paolafisiofit y Will Auto Service.
- Casos individuales para las seis marcas.
- Catálogo de estrategia, gestión de redes, producción, diseño, publicidad y análisis.
- Página de estudio.
- Formulario guiado que prepara la solicitud y la abre en WhatsApp.
- Página de privacidad, manifiesto web, SEO social, sitemap y página 404.
- Diseño responsive, navegación por teclado y soporte para `prefers-reduced-motion`.
- Despliegue automático con GitHub Pages.

No se muestran precios, montos ni comparativas económicas.

## Verlo localmente

No requiere compilación ni dependencias de JavaScript.

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000`.

También puedes ejecutar:

```bash
npm run preview
```

## Validar el proyecto

El validador revisa enlaces y recursos internos, IDs duplicados, metadatos esenciales, sintaxis JavaScript y ausencia de precios visibles.

```bash
python3 -m pip install beautifulsoup4
python3 scripts/validate_site.py
```

## Publicarlo en GitHub Pages

1. Crea un repositorio vacío en GitHub.
2. Sube todos los archivos de esta carpeta a la rama `main`, incluyendo `.github` y `.nojekyll`.
3. En GitHub entra en **Settings → Pages**.
4. En **Build and deployment → Source**, selecciona **GitHub Actions**.
5. Abre la pestaña **Actions** y espera a que termine `Deploy Nexo to GitHub Pages`.
6. GitHub mostrará la URL pública al finalizar el despliegue.

El workflow:

- valida el código;
- detecta automáticamente la URL del repositorio o del dominio personalizado;
- genera las URL sociales, `robots.txt` y `sitemap.xml`;
- prepara una carpeta `_site` limpia;
- publica el sitio con GitHub Pages.

## Subirlo desde Terminal

Dentro de esta carpeta:

```bash
git init
git add .
git commit -m "Publicar web de Nexo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## Configuración editable

Los datos generales están en [`site.config.json`](site.config.json):

- nombre y descripción del sitio;
- Instagram;
- WhatsApp;
- ubicación;
- imagen social predeterminada.

Para cambiar textos, proyectos o servicios, edita los archivos HTML correspondientes. Los estilos están centralizados en `assets/styles.css` y las interacciones en `assets/main.js`.

## Seguridad

El sitio implementa directivas estrictas de Content-Security-Policy (CSP), validación en cliente con honeypot anti-spam, protección contra re-envío de formularios (`rate limiting`) y enlaces sanitizados con `rel="noopener noreferrer"`. Para más detalles técnicos y reporte responsable de vulnerabilidades, consulta [`SECURITY.md`](SECURITY.md).

## Estructura

```text
.
├── .github/workflows/deploy-pages.yml
├── assets/
│   ├── img/
│   ├── main.js
│   └── styles.css
├── proyectos/
│   ├── index.html
│   └── [casos de estudio]
├── scripts/
│   ├── prepare_deploy.py
│   └── validate_site.py
├── index.html
├── servicios.html
├── estudio.html
├── iniciar-proyecto.html
├── legal.html
├── 404.html
├── site.config.json
└── site.webmanifest
```

## Material visual

Las composiciones actuales permiten publicar y revisar la experiencia completa. Se pueden sustituir gradualmente por fotografías, reels, campañas y diseños autorizados de cada cliente conservando las mismas rutas de archivo o actualizando los `src` en las páginas.

## Derechos

Consulta [`LICENSE.md`](LICENSE.md). El proyecto y la identidad visual son de Nexo Agencia Creativa.

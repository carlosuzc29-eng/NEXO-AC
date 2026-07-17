# Tokens de diseño — Nexo Web V1

## Colores

| Token | Valor | Uso |
|---|---:|---|
| `--nexo-blue` | `#1F3549` | Fondo institucional, secciones y navegación |
| `--nexo-blue-deep` | `#07131D` | Fondos profundos, contraste y showreel |
| `--nexo-green` | `#5CB83E` | Acción, enlaces, líneas y estados activos |
| `--nexo-white` | `#F5F7F3` | Superficie principal |
| `--nexo-paper` | `#EDF0EB` | Superficie editorial secundaria |
| `--nexo-gray` | `#979797` | Información secundaria |
| `--nexo-orange` | `#E64A00` | Acento complementario contextual |
| `--nexo-yellow` | `#F5C535` | Acento complementario contextual |
| `--nexo-violet` | `#5E35B1` | Acento complementario contextual |

Los complementarios se activan de uno en uno y no sustituyen a los colores institucionales.

## Tipografía

```css
--font-display: Futura, "Futura PT", "Avenir Next", Montserrat, Arial, sans-serif;
--font-body: "Avenir Next", Futura, Montserrat, Arial, sans-serif;
```

No se incluyen ni distribuyen archivos tipográficos.

## Escala espacial

- Contenedor: `min(92vw, 1520px)`.
- Separación de secciones: `clamp(5rem, 10vw, 11rem)`.
- Navegación: 82px en escritorio, 72px en tablet/móvil.
- Sistema modular de 12 columnas para proyectos.

## Movimiento

- Curva principal: `cubic-bezier(.2, .75, .2, 1)`.
- Revelados: 750ms.
- Interacciones breves: 250–450ms.
- Todas las animaciones se desactivan o reducen con `prefers-reduced-motion`.

## Recursos de marca expandidos

- Retícula visible.
- Líneas de conexión.
- Flechas direccionales.
- Cortes de 15°.
- Etiquetas numéricas.
- Marcos editoriales.
- Halos azul-verde.

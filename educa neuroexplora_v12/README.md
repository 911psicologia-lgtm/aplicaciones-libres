# NeuroExplora

**Explorador interactivo del cerebro humano**  
Versión 1.0 — Módulo: Cerebro Interactivo

Desarrollado por **José Alonso Andrade Salazar**

---

## Estructura del proyecto

```
neuroexplora/
├── index.html          → Página principal
├── css/
│   └── styles.css      → Todos los estilos
├── js/
│   ├── data.js         → Datos de las 11 regiones cerebrales
│   ├── brain.js        → Motor SVG interactivo del cerebro
│   └── main.js         → Lógica de la aplicación, eventos, UI
├── assets/
│   └── (imágenes, SVGs adicionales — futuras versiones)
└── README.md
```

---

## Despliegue en Cloudflare Pages

### Opción A — Arrastrando la carpeta (más simple)

1. Ve a [pages.cloudflare.com](https://pages.cloudflare.com)
2. Inicia sesión o crea cuenta gratuita
3. Clic en **"Create a project"** → **"Direct Upload"**
4. Arrastra la carpeta `neuroexplora/` completa
5. Cloudflare asignará un dominio tipo `neuroexplora.pages.dev`

### Opción B — Conectando con GitHub (recomendado para versiones futuras)

1. Sube la carpeta a un repositorio GitHub
2. En Cloudflare Pages → **"Connect to Git"** → selecciona el repo
3. Cloudflare desplegará automáticamente cada vez que hagas cambios
4. Puedes conectar un dominio personalizado desde "Custom domains"

---

## Funcionalidades v1.0

- ✅ 11 regiones cerebrales interactivas (vista lateral izquierda)
- ✅ Panel de información con 3 pestañas: Función / Para niños / Curiosidad
- ✅ Habilidades por región (chips visuales)
- ✅ Regiones conectadas (navegación entre áreas relacionadas)
- ✅ Hover tooltip en escritorio
- ✅ Leyenda interactiva de colores
- ✅ Botón "Sorpresa" — región aleatoria
- ✅ Tour de bienvenida (primer acceso)
- ✅ Modal de créditos
- ✅ Diseño responsive (escritorio + móvil)
- ✅ Fondo animado de estrellas

## Próximos módulos (Fase 2 y 3)

- 🔜 Neurona interactiva con animación del impulso nervioso
- 🔜 Evolución del cerebro (línea de tiempo)
- 🔜 Funciones cerebrales (tarjetas visuales)
- 🔜 Evaluación gamificada con 3 niveles

---

## Agregar imágenes o recursos

Coloca los archivos en la carpeta `assets/` y referencialos desde el HTML o CSS:

```html
<!-- En index.html -->
<img src="assets/nombre-imagen.png" alt="descripción">
```

```css
/* En styles.css */
background-image: url('../assets/textura.png');
```

---

*Información científica adaptada con fines pedagógicos.*

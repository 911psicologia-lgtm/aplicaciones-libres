# MMPI-2 · Aplicación clínica

Aplicación web para aplicación, corrección e interpretación del MMPI-2 con baremos españoles (TEA Ediciones).

## 🚀 Despliegue rápido en Cloudflare Pages via GitHub

### Opción A: Drag-and-drop directo
1. Descomprime `MMPI2_App.zip`
2. Ve a https://dash.cloudflare.com → Pages → Create a project → Upload assets
3. Arrastra la carpeta `app/` completa
4. Click "Deploy site" — listo, sin build step

### Opción B: Vía GitHub
1. Crea un nuevo repositorio en GitHub (público o privado)
2. Sube el contenido de la carpeta `app/` a la raíz del repo
3. Ve a Cloudflare Pages → Create a project → Connect to Git
4. Selecciona el repositorio
5. Build settings:
   - Framework preset: **None**
   - Build command: **(vacío)**
   - Build output directory: **/** (raíz)
6. Click "Save and Deploy"

La app estará disponible en `https://<tu-proyecto>.pages.dev` en ~30 segundos.

## 📁 Estructura de archivos

```
app/
├── index.html                  # Punto de entrada
├── css/
│   └── styles.css               # Estilos (CSS vanilla)
├── js/
│   ├── app.js                   # Router principal + menú hamburguesa
│   ├── lib/
│   │   ├── storage.js           # Persistencia localStorage
│   │   ├── mmpi2.js             # Motor de cálculo MMPI-2
│   │   ├── signature.js         # Firma digital (canvas)
│   │   └── export.js            # Export HTML/Word/Excel/JSON
│   └── screens/
│       ├── splash.js            # Pantalla splash (2s)
│       ├── setup.js             # Config evaluador (primera vez)
│       ├── dashboard.js         # Panel principal + casos
│       ├── case.js              # Datos del evaluado
│       ├── capture.js           # Captura (cargar Excel o aplicar)
│       └── report.js            # Informe con tablas + gráficos
├── data/
│   ├── items.json               # 567 ítems del MMPI-2
│   ├── baremos.json             # Baremos por sexo (78 escalas)
│   ├── criterios.json           # Criterios interpretativos (79 escalas)
│   └── scale_items.json         # Mapeo escala → ítems
├── assets/
│   ├── favicon.svg
│   └── MMPI2_Plantilla_Paciente.xlsx  # Excel para enviar a pacientes
└── vendor/
    ├── chart.umd.min.js         # Chart.js (gráficos)
    ├── xlsx.full.min.js         # SheetJS (Excel import/export)
    └── docx.umd.min.js          # docx.js (Word export)
```

## 🎯 Uso de la aplicación

### Primera vez (setup del evaluador)
1. Splash (2s) → detecta primera vez
2. Formulario evaluador: nombre, correo, registro profesional, dirección, teléfono, firma digital
3. Configuración guardada → panel principal

### Flujo de un caso
1. Click "Nuevo caso"
2. Datos del evaluado (nombre, documento, fecha nacimiento, sexo, contexto, antecedentes, motivo)
3. Captura de respuestas (2 modos):
   - **Cargar Excel**: sube el `MMPI2_Plantilla_Paciente.xlsx` con respuestas del paciente
   - **Aplicar test directo**: 567 ítems uno a uno con botones V/F
4. Procesamiento automático → informe completo
5. Exportar: HTML standalone / Word / Excel / JSON

### Persistencia
- Todos los casos se guardan en `localStorage` del navegador
- Menú hamburguesa (top right) → "Mis casos" → ver/editar cualquier caso guardado
- Export JSON: respaldo completo de la app (evaluador + todos los casos)

## 📋 Plantilla Excel para pacientes

El archivo `assets/MMPI2_Plantilla_Paciente.xlsx` está diseñado para enviarlo a los pacientes:
- 567 ítems con texto completo
- Columna "Respuesta" con validación (solo 1=V o 2=F)
- Columna "Estado" automática (OK / PENDIENTE / INVÁLIDA)
- Hoja "Instrucciones" con guía para el paciente

**Flujo:**
1. Evaluador envía el Excel al paciente (email, descarga, etc.)
2. Paciente abre, completa sus respuestas (1 o 2 en columna C)
3. Paciente devuelve el archivo
4. Evaluador carga el Excel en la app → procesamiento automático → informe

## 🔒 Características

- ✅ **Sin backend**: 100% cliente, ideal para Cloudflare Pages
- ✅ **Sin dependencias build**: HTML+CSS+JS vanilla, sin npm
- ✅ **Offline-ready**: funciona una vez cargados los datos
- ✅ **Selector sexo M/H**: recalcula todos los baremos automáticamente
- ✅ **Datos verificados**: baremos del manual español TEA (N=500 por grupo)
- ✅ **79 escalas interpretadas**: 0 escalas sin texto interpretativo
- ✅ **Export multi-formato**: HTML standalone, Word (.docx), Excel (.xlsx), JSON
- ✅ **Firma digital**: canvas con soporte mouse + táctil

## 📊 Cobertura

| Componente | Cantidad |
|------------|----------|
| Ítems MMPI-2 | 567 |
| Escalas evaluadas | 79 |
| Baremos (H + M) | 3.109 filas |
| Textos interpretativos | 17.380 |
| Configuraciones clínicas | 22 patrones |
| Criterios por banda T | 407 bandas |

## 🛠️ Stack técnico

- **Frontend**: HTML5, CSS3, JavaScript ES6 (vanilla, sin frameworks)
- **Persistencia**: localStorage API
- **Gráficos**: Chart.js 4.4.1
- **Excel**: SheetJS 0.20.3
- **Word**: docx.js 8.5.0
- **Firma**: HTML5 Canvas API

## 📝 Fuentes

- Manual MMPI-2 adaptación española (TEA Ediciones)
- Apunte Universidad de Concepción (apunte_mmpi_2.pdf)
- Butcher, J.N. (2011) — A Beginner's Guide to the MMPI-2
- Graham, J.R. (2006) — MMPI-2: Assessing Personality and Psychopathology
- Harris & Lingoes (1955) — Subescalas Harris-Lingoes
- Informe técnico de baremos (Informe_tecnico_tablas_PD_T_MMPI2_espanol.docx)

## ⚠️ Notas clínicas

- Las escalas **Fp, S, Ho** están marcadas como **ES-ONLINE**: sus baremos completos no están publicados en extracto abierto y requieren TEAcorrige (sistema oficial). La app calcula la PD pero muestra el mensaje "REQUIERE TEAcorrige".
- Las escalas **O-H, MDS, APS, AAS** tienen baremos verificados solo parcialmente para mujeres (tramo T≤62), per el informe técnico.
- Esta aplicación es una herramienta de apoyo. La interpretación clínica final debe realizarla un profesional acreditado.

## 📄 Licencia

Uso clínico y educativo. Los baremos y criterios provienen de fuentes documentadas; verificar licencia de uso del MMPI-2 con TEA Ediciones para uso comercial.

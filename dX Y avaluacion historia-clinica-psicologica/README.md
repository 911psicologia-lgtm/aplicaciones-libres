# Historia Clínica Psicológica Integral

Sistema profesional para la gestión integral de historias clínicas psicológicas, diseñado para profesionales de la salud mental. Aplicación web progresiva (PWA) que funciona completamente offline con almacenamiento local seguro.

## Características Principales

- **Gestión Completa de Pacientes**: Registro detallado con cálculo automático de edad y detección de menores de edad
- **Consentimiento Informado**: Checklist editable con firma digital
- **Notas de Evolución**: Formatos DAP y SOAP
- **Evaluaciones e Instrumentos**: Seguimiento de aplicaciones e interpretaciones
- **Diagnóstico**: Bases de datos integradas de DSM-5-TR y CIE-11 con búsqueda inteligente
- **Formulación Clínica Avanzada**: Hipótesis, dinámicas, factores de riesgo y protectores
- **Remisiones**: Generación automática de cartas de remisión
- **Exportación**: Múltiples formatos (TXT, HTML, DOCX)
- **Funcionamiento Offline**: PWA completa que funciona sin conexión a internet
- **Seguridad**: Login obligatorio, bloqueo por inactividad, autoguardado

## Requisitos Técnicos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Soporte para IndexedDB
- Soporte para Service Workers (para funcionamiento offline)

## Instalación

### Opción 1: Instalación en Hosting Web

1. Descargue todos los archivos del proyecto
2. Suba la carpeta completa a su servidor web
3. Acceda a `index.html` desde su navegador
4. Para instalar como PWA en dispositivos móviles:
   - **Android (Chrome)**: Menú → "Agregar a pantalla de inicio"
   - **iOS (Safari)**: Compartir → "Agregar a Inicio"
   - **Desktop (Chrome)**: Aparecerá automáticamente el ícono de instalación

### Opción 2: Uso Local

1. Descargue y descomprima el proyecto
2. Abra `index.html` en su navegador
3. Nota: Algunos navegadores pueden requerir un servidor local para el funcionamiento completo de IndexedDB

### Crear Servidor Local Simple (opcional)

```bash
# Python 3
python -m http.server 8000

# Node.js (si tiene http-server instalado)
npx http-server

# PHP
php -S localhost:8000
```

Luego acceda a `http://localhost:8000`

## Primer Uso

### Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

> **IMPORTANTE**: Cambie la contraseña por defecto en la sección de Configuración → Seguridad

### Configuración Inicial

1. Inicie sesión con las credenciales por defecto
2. Vaya a **Configuración → Profesional**
3. Complete sus datos personales y profesionales
4. Cargue su firma digital y logo institucional (opcional)
5. Guarde la configuración

## Uso del Sistema

### 1. Crear un Nuevo Paciente

1. Desde el Dashboard, haga clic en "Nuevo Paciente"
2. Complete los datos de identificación:
   - La historia clínica se genera automáticamente (HC-000001, HC-000002, etc.)
   - La edad se calcula automáticamente al ingresar la fecha de nacimiento
   - Si es menor de edad, aparecerá automáticamente el módulo de acudiente
3. Complete el consentimiento informado
4. Registre el motivo de consulta e historia del problema
5. Guarde los cambios

### 2. Registrar una Sesión

1. Desde el Dashboard o la ficha del paciente, haga clic en "+ Sesión"
2. Seleccione el formato (DAP o SOAP)
3. Complete los campos correspondientes:
   - **DAP**: Datos, Análisis, Plan
   - **SOAP**: Subjetivo, Objetivo, Evaluación, Plan
4. Registre la próxima cita si aplica
5. Guarde la sesión

### 3. Agregar Evaluaciones

1. Desde la ficha del paciente, acceda a "Evaluaciones"
2. Haga clic en "Agregar Evaluación"
3. Seleccione o escriba el instrumento
4. Registre puntajes e interpretación
5. Adjunte archivos si es necesario

### 4. Establecer Diagnóstico

1. Desde la ficha del paciente, acceda a "Diagnóstico"
2. Seleccione el sistema de clasificación:
   - **DSM-5-TR**: Búsqueda por código o nombre
   - **CIE-11**: Búsqueda por código o nombre
   - **Manual**: Diagnóstico libre
3. Seleccione el nivel de certeza
4. Agregue diagnósticos diferenciales si aplica
5. Guarde el diagnóstico

### 5. Generar Remisión

1. Desde la ficha del paciente, acceda a "Remisión"
2. Seleccione la especialidad de destino
3. Complete los datos del destinatario
4. Escriba la pregunta clínica
5. Seleccione qué información incluir
6. Genere la vista previa y exporte

### 6. Exportar Historia Clínica

1. Desde la ficha del paciente, acceda a "Exportar"
2. Seleccione el tipo de exportación:
   - Historia completa
   - Informe resumido
   - Solo sesiones
   - Solo evaluaciones
3. Seleccione las secciones a incluir
4. Elija el formato (TXT, HTML, DOCX)
5. Descargue el archivo

## Respaldo y Restauración

### Crear Respaldo

1. Vaya a **Configuración → Base de Datos**
2. En la sección "Respaldo de Datos", haga clic en "Exportar Respaldo"
3. Guarde el archivo JSON en un lugar seguro
4. **Recomendación**: Realice respaldos periódicamente

### Restaurar Respaldo

1. Vaya a **Configuración → Base de Datos**
2. En "Restaurar Respaldo", haga clic en el área de carga
3. Seleccione el archivo JSON de respaldo
4. Confirme la operación
5. **Advertencia**: Esto reemplazará todos los datos actuales

## Seguridad y Privacidad

### Medidas de Seguridad Implementadas

- **Login obligatorio**: Acceso protegido por contraseña
- **Bloqueo por inactividad**: Sesión expira después de 30 minutos sin actividad
- **Autoguardado**: Los datos se guardan automáticamente mientras escribe
- **Almacenamiento local**: Los datos nunca salen de su dispositivo
- **Sin conexión a internet**: La aplicación funciona completamente offline

### Recomendaciones de Seguridad

1. **Cambie la contraseña por defecto** inmediatamente
2. **No comparta sus credenciales** de acceso
3. **Realice respaldos periódicos** y guárdelos en lugar seguro
4. **Bloquee su dispositivo** cuando no lo use
5. **Use contraseñas fuertes** (mínimo 8 caracteres, combinando letras, números y símbolos)

## Consideraciones Éticas y Legales

### Responsabilidad del Profesional

Esta herramienta está diseñada para apoyar la práctica profesional ética y responsable. El profesional es responsable de:

- El uso adecuado y ético de la información
- El cumplimiento de las normas de confidencialidad
- La obtención del consentimiento informado del paciente
- El manejo seguro de la información clínica
- El cumplimiento de la legislación vigente en materia de protección de datos

### Confidencialidad

- Los datos del paciente son confidenciales y deben protegerse
- No comparta información con terceros sin autorización
- Use la función de consentimiento informado adecuadamente
- Respete los límites de la confidencialidad según la normativa aplicable

## Solución de Problemas

### La aplicación no carga

1. Verifique que su navegador esté actualizado
2. Limpie la caché del navegador
3. Verifique que JavaScript esté habilitado
4. Intente en modo incógnito

### Pérdida de datos

1. Verifique si tiene un respaldo reciente
2. Restaure desde el respaldo en Configuración → Base de Datos
3. Si no tiene respaldo, los datos no pueden recuperarse

### Error al guardar

1. Verifique que haya completado los campos obligatorios
2. Verifique que hay espacio disponible en su dispositivo
3. Intente recargar la página

### Problemas con la firma digital

1. Asegúrese de que la imagen sea PNG o JPG
2. El tamaño no debe superar 2MB
3. Use una imagen con fondo blanco para mejor resultado

## Estructura del Proyecto

```
historia-clinica-psicologica/
├── index.html              # Login
├── dashboard.html          # Panel principal
├── patient.html            # Ficha del paciente
├── session.html            # Notas de evolución
├── assessments.html        # Evaluaciones
├── diagnosis.html          # Diagnóstico
├── referral.html           # Remisiones
├── export.html             # Exportación
├── settings.html           # Configuración
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker
├── README.md               # Este archivo
├── assets/
│   ├── css/
│   │   └── main.css        # Estilos principales
│   ├── js/
│   │   ├── db.js           # Base de datos IndexedDB
│   │   └── utils.js        # Utilidades compartidas
│   └── data/
│       ├── dsm5.js         # Base DSM-5-TR
│       └── cie11.js        # Base CIE-11
```

## Soporte y Actualizaciones

Para reportar problemas o sugerir mejoras, contacte al administrador del sistema.

## Licencia

Este software es de uso profesional. El uso indebido de la información es responsabilidad exclusiva del usuario.

## Versión

**Versión actual**: 1.0.0

**Fecha de lanzamiento**: 2024

---

**Nota importante**: Esta aplicación almacena todos los datos localmente en su dispositivo. No se transmite información a servidores externos. El profesional es responsable de realizar respaldos periódicos y mantener la seguridad de la información.

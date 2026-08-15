# v4.4 · Limpieza de navegación superior y centro de apoyo

Cambios aplicados:

- Se retiró la navegación superior en todas las pantallas.
- La navegación principal queda concentrada en el dock inferior.
- El menú hamburguesa inferior quedó sin: timer/iniciar sesión, modo escucha, diccionario, biblioteca, diplomas/certificados y usuario/perfil.
- Usuario/perfil queda dentro de Ajustes.
- Diccionario y Biblioteca se unificaron en una sola pantalla 100% responsive: "Diccionario y biblioteca".
- El botón Aa del dock inferior abre la pantalla unificada.
- Las rutas antiguas `dictionary` y `library` se mantienen como alias internos para no romper botones existentes.

Validación:

- `node --check app.js` aprobado.

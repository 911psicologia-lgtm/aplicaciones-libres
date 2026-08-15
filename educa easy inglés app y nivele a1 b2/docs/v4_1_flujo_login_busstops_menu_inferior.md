# Inglés para Dummies · v4.1 · Flujo login + Bus Stop

Cambios aplicados:

1. Splash inicial con logo completo en fondo blanco durante 3 segundos.
2. Flujo de arranque:
   - Si el usuario no está logueado: splash → pantalla de login/perfil.
   - Si el usuario ya está logueado: splash → pantalla del loro saludando.
3. Pantalla de login:
   - Logo pequeño superior.
   - Loro visible.
   - Campos locales: nombre/usuario, email, celular, interés inicial.
   - Selector de ritmo: Ligero, Constante, Intensivo.
   - Recordatorios integrados con los controles existentes.
   - Carga de backup JSON.
   - Los datos se guardan en localStorage; no se envían a servidores.
4. Pantalla del loro:
   - Fondo blanco.
   - Loro grande y legible.
   - Mensaje animado en burbuja dirigida al pico.
   - Botón activo para continuar a la lección.
   - Botón secundario para ver paradas y mundos.
   - Tap/clic en la pantalla abre las paradas.
5. Ruta tipo Bus Stop:
   - La carretera representa el avance general.
   - Cada parada de bus representa un mundo.
   - Al tocar una parada, se abre su panel de submundos/lecciones.
   - Las lecciones aparecen como tarjetas/nodos secundarios.
6. Menú inferior fijo:
   - Inicio.
   - Mundo en curso.
   - Escuche y repasa.
   - Diccionario/biblioteca.
   - Diplomas/certificados.
   - Menú hamburguesa.
7. Ajustes técnicos:
   - Corrección de SyntaxError por variable duplicada lessonWorld.
   - Se evita CORS local del manifest.json en file://.
   - Splash ajustado a 3 segundos.
   - XP de repaso queda limitado para evitar acumulación por entrar/salir repetidamente.


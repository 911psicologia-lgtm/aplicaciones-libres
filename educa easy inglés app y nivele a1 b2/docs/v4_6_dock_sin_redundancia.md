# v4.6 · Dock inferior sin redundancia

## Ajuste realizado

Se eliminó del dock inferior el botón de carretera `🛣️`, porque repetía la acción de la casita.

## Lógica final

- `🏠 Inicio`: lleva a la carretera principal de mundos.
- `🧠 Mundo en curso`: lleva al ramal interno/misiones del mundo activo.
- `🎧`: escucha y repaso.
- `Aa`: diccionario y biblioteca.
- `🎓`: diplomas/certificados.
- `⏻`: salir al login.
- `☰`: menú complementario.

## Validación

Se ejecutó `node --check app.js` sin errores.

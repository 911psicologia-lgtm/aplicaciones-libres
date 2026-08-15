/**
 * DATETIME CONTEXT — usa la hora real del dispositivo donde corre la app.
 * Rangos: mañana 05:00–11:59 · tarde 12:00–18:59 · noche 19:00–04:59
 */
window.DateTimeContext = (() => {
  function getFranja(date = new Date()) {
    const h = date.getHours();
    if (h >= 5 && h < 12) return "manana";
    if (h >= 12 && h < 19) return "tarde";
    return "noche";
  }

  function getGreeting(franja, name) {
    const suffix = name ? `, ${name}` : "";
    if (franja === "manana") return `Buenos días${suffix}`;
    if (franja === "tarde") return `Buenas tardes${suffix}`;
    return `Buenas noches${suffix}`;
  }

  function formatClock(date = new Date()) {
    return date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  }

  return { getFranja, getGreeting, formatClock };
})();

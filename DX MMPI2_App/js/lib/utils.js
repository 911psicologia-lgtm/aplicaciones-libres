/* ============================================
   Helper utility: safe event binding
   ============================================ */

// Bind an event listener only if the element exists
function bindEvent(elementId, eventName, handler) {
  const el = document.getElementById(elementId);
  if (el) {
    el.addEventListener(eventName, handler);
    return true;
  }
  return false;
}

// Bind multiple events safely
function bindEvents(bindings) {
  bindings.forEach(({ id, event, handler }) => {
    bindEvent(id, event, handler);
  });
}

// Expose globally
window.bindEvent = bindEvent;
window.bindEvents = bindEvents;

(function () {
  'use strict';

  function fnv1a(input) {
    let hash = 0x811c9dc5;
    const text = String(input ?? '');
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function deriveSeed(parts) {
    return fnv1a(parts.filter(Boolean).join('|'));
  }

  function shortSeed(seed) {
    return Number(seed >>> 0).toString(16).padStart(8, '0').toUpperCase();
  }

  window.FQ_RANDOM = { fnv1a, mulberry32, deriveSeed, shortSeed };
})();

# ADAPTIVE HIVE BOSS DIRECTOR — v2.15.20 PREDICTIVE PILOT

## Idea central
La v2.15.20 mejora el Director para diferenciar potencia sostenida de ráfagas temporales y para proteger la identidad del boss sin convertirlo en una esponja. La mayor parte de las contramedidas sigue en Shadow. La única intervención viva nueva es **Signature Priority Pilot**, deliberadamente pequeña, reversible y limitada.

## 1. DPS multiventana
Se mantienen buckets circulares de 1 segundo y sin arrays crecientes por frame. En cada muestra (1 s) se calculan:
- **BURST 3 s**: detecta picos y combos instantáneos.
- **TACTICAL 8 s**: detecta ramp-up y secuencias ofensivas cortas.
- **SUSTAINED 20 s**: representa dominación real y estable.

El DPS efectivo combina las tres ventanas. En los primeros segundos da más peso a burst/tactical porque todavía no existe historial de 20 s; luego el peso principal pasa a sustained. Se registran también spread, burst ratio, trend y ratios frente al DPS esperado.

## 2. Fingerprint de daño
El Director clasifica la forma del daño como STEADY, BURST_SPIKE, SUSTAINED_DOMINATION, RAMP_UP, COOLING o LOW_OUTPUT. Un BURST_SPIKE aislado no puede producir A3 si la ventana sostenida no confirma dominación. Así un combo espectacular sigue sintiéndose poderoso sin provocar una respuesta exagerada.

## 3. Confidence Gate
Cada lectura recibe confidence 0–1 usando edad de la pelea, cobertura real de buckets y concordancia de las tres ventanas. A3 requiere confianza >=0.62; las propuestas agresivas Shadow requieren >=0.82. Con confianza baja el Director observa más antes de reaccionar.

## 4. Memoria local acotada
Para el mismo mundo y dificultad se consultan como máximo las últimas 6 victorias locales. Solo con 3 o más registros válidos puede existir calibración. El DPS histórico entra con peso 20% y jamás puede desplazar el expected DPS base más de ±12%. La memoria no se transmite ni modifica permanentemente estadísticas del jugador o boss.

## 5. Experience Debt
Además de TTK, v2.15.20 mide si la pelea está perdiendo contenido relevante: fases alcanzadas, duración por fase, signatures ejecutadas por fase y oportunidad de signature. En CH2, si una fase madura sin ejecutar su signature, se genera `signatureDebt`. También se calcula cobertura de experiencia y phase debt.

El Director detecta si la phase gate nativa ya está protegiendo la transición. En ese caso marca `phaseProtectionSource: native_phase_gate` y no propone otro gate redundante.

## 6. Planner contrafactual mínimo
En A2/A3 el sistema calcula cuánto habría que amortiguar el daño para evitar únicamente los extremos. Selecciona 1.00 / 0.88 / 0.78 / 0.70, escogiendo el nivel más ligero compatible con el objetivo contrafactual. Estos multiplicadores permanecen **inactivos** en v2.15.20.

La secuencia preferida es identidad primero: signature priority -> defensive mobility -> reactive armor Shadow -> soft gate Shadow -> disruption Shadow. Esto evita que HP/armadura sea la primera respuesta automática.

## 7. Signature Priority Pilot — única intervención activa
Solo puede actuar cuando se cumplen todas estas condiciones:
- world 11–20;
- campaign (no training ni Boss Rush);
- estado estabilizado A3;
- confidence >=0.78;
- fingerprint SUSTAINED_DOMINATION;
- fase 2 o 3;
- existe signature debt;
- no hay entrada, transición, Last Chance ni recovery grace;
- no existe otra signature/telegraph/special/charge activa;
- máximo una activación por fase.

La acción NO dispara la signature directamente. Solo reduce `signatureAttackCd` hasta 1.05 s. El motor normal sigue decidiendo el lanzamiento y conserva warning, animación, audio, wind-up, daño y dodgeability originales.

## 8. Contramedidas que siguen Shadow
No se aplican todavía: reactive armor, Symbiotic Assist, RIFT DISRUPTION, RIFT REBIRTH ni soft gates adicionales. Sus propuestas se registran para análisis, pero no alteran HP, build, ranks, powers ni daño real.

## 9. Telemetría local schema 2
Key: `swarm_rift_hive_telemetry_v21520`. Lee v21519 si aún no existe schema 2. Máximo 40 peleas. Añade al schema previo: dpsProfileFinal, dpsPeak, fingerprintHistory, confidence, target/history calibration, phaseDurations, signatureByPhase, signatureTimeline, experienceFinal, nativeGateDeferrals, fairnessDeferrals y signaturePilotEvents.

## 10. Hooks
- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_HIVE_DIRECTOR_REPORT()`
- `window.__SWARM_HIVE_DIRECTOR_SELFTEST()`
- `window.__SWARM_HIVE_TELEMETRY_SUMMARY()`
- `window.__SWARM_V21520_STATUS()`

## 11. Siguiente paso seguro
Antes de activar armadura, conviene jugar varias builds altas y revisar cuántas veces el Signature Pilot aparece, si A3 sostenido coincide con la sensación humana de dominación y si la memoria ±12% reduce falsos positivos. El siguiente candidato activo debería ser una armadura reactiva A3 breve y con cooldown, nunca supresión/resurrección simultánea.

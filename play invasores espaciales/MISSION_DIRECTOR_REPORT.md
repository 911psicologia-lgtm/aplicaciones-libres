# MISSION DIRECTOR REPORT — v0.5.6

La revisión detectó una inconsistencia estructural: la versión anterior declaraba “3 + boss”, pero la etapa 4 todavía construía una formación completa, una horda final y luego el jefe. También existía un objetivo configurado para una oleada 5 que no forma parte de la campaña.

## Correcciones
- La etapa 4 crea directamente la arena de jefe.
- Se elimina la formación extra del boss wave.
- Se sustituyen objetivos rígidos por pools alcanzables en cada una de las cuatro etapas.
- Se añade objetivo `bosspart`, alimentado al destruir módulos orbitales o sistemas corporales.
- Se añade protección breve de entrada al boss para preservar la presentación visual frente al autofuego.
- El Breeder se mueve a wave 3 para preservar toda la ecología enemiga dentro de las tres oleadas previas.

## QA
Se añadió `tests/mission-director-v056.js` para comprobar que la cuarta etapa contiene exactamente un boss, ninguna formación, objetivo válido y protección de entrada.

# Auditoría verificable de assets — v2.6.1 · Preparación M14

Fecha de auditoría: 2026-08-25  
Base física auditada: `Rizoma_Zombie_Strike_v2.6.0_Banda_Sonora_Guardianes.zip`  
Regla aplicada: no se considera existente ningún recurso que no esté presente en el paquete o haya sido creado y validado en esta iteración.

## Resultado ejecutivo

La base v2.6.0 se conserva para M1–M13. La biblioteca `assets/future/` contiene recursos ambientales recuperables, pero sus Guardianes corresponden a M6–M10 y no son válidos para representar Heliovorax ni Guardianes futuros por recoloración o sustitución directa. M14 se implementó con un paquete dedicado independiente.

| Grupo | Verificación física | Estado | Decisión |
|---|---:|---|---|
| Meteoritos futuros recortados | 10 PNG | LISTO | Reutilizables como biblioteca ambiental secundaria |
| Basura/escombros espaciales futuros | 15 PNG | LISTO | Reutilizables con parallax y escala controlada |
| Planetas errantes futuros | 10 PNG | LISTO | Reutilizables como fondo/ambiente, no como enemigo |
| Guardianes antiguos M6–M10 | 5 PNG + 6 piezas articuladas | RECUPERABLE | Referencia/sistemas existentes; prohibido convertirlos en Heliovorax por recoloración |
| Audio externo | 14 MP3 físicos | LISTO para lo ya asignado | 12 temas principales de jefes M1–M12, 1 respaldo de M6 y 1 ambiente de M1; no existe pista externa dedicada M13/M14 |
| M14 · fondos | 2 | LISTO | Aproximación + arena de Guardián |
| M14 · Guardián | 1 | LISTO | Heliovorax · Némesis Nova |
| M14 · enemigos normales | 6 | LISTO | Dos cuerpos por cada una de las tres familias |
| M14 · subjefes | 3 | LISTO | Uno por familia, con sprite diferenciado |
| M14 · hazards ambientales | 6 | LISTO | Panel quemado, fragmento coronal, mini-cometa, luna calcinada, resto de observatorio y cristal solar |
| M14 · proyectiles | 2 | LISTO | Llamarada + fragmento/corte de corona |
| M14 · reliquia | 1 | LISTO | Reliquia Nova |
| M14 · nave capturable | 1 | LISTO | Trono Nova, sprite independiente |
| M15–M20 · paquetes dedicados | 0 directorios dedicados encontrados | POR GENERAR | No se declara como existente ningún set canónico de estos mundos |

## M14 validado físicamente

Directorio: `assets/world14/`  
Total: 22 archivos. Los PNG de Guardián, nave, enemigos, subjefes, hazards, proyectiles y reliquia contienen transparencia real; las cuatro esquinas de los sprites son transparentes y el contenido útil no ocupa el rectángulo completo. Los dos fondos son WebP 1920×1080.

## Audio

M14 no incorpora ni simula un archivo musical externo. Heliovorax utiliza únicamente el generador procedural existente del juego, etiquetado internamente como `Música procedural M14`. El botón global de música y la separación música/SFX permanecen en la arquitectura existente.

## Resultado para la siguiente fase

M14 puede producirse sin tocar fondos aprobados de M1–M13. M15–M20 conservan su estado de diseño canónico, pero sus assets específicos siguen `POR GENERAR`. La biblioteca futura genérica queda disponible como soporte ambiental, no como sustituto de identidad visual de los Guardianes.

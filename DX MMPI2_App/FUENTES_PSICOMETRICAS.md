# FUENTES PSICOMÉTRICAS Y TRAZABILIDAD · MMPI-2 App

Fecha de revisión: 2 de octubre de 2026.

Este documento distingue **estructura públicamente verificable** de **claves operativas protegidas**. La reconstrucción no incorpora listas de ítems/direcciones obtenidas de copias no autorizadas.

## Fuentes oficiales prioritarias

1. **University of Minnesota Press — MMPI-2**  
   https://www.upress.umn.edu/test-division/mmpi-2/  
   Verifica MMPI-2 de 567 ítems; muestra normativa US N=2.600 (1.138 hombres, 1.462 mujeres); lista de escalas; referencia al Apéndice A del manual 2001 para conversiones raw→T con y sin K.

2. **University of Minnesota Press — Test Division / About**  
   https://www.upress.umn.edu/test-division/about-us/  
   Política de propiedad intelectual y sistemas de corrección independientes. La editorial indica que no autoriza desarrollar algoritmos/sistemas independientes derivados de claves protegidas, incluido mediante IA.

3. **University of Minnesota Press — Translations**  
   https://www.upress.umn.edu/test-division/translations/  
   Información de licencias/traducciones y tipificación; distingue T lineales y T uniformes.

4. **Pearson — MMPI-2 Hand-Scoring and Administration Materials**  
   https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Personality-%26-Biopsychosocial/Minnesota-Multiphasic-Personality-Inventory-2-Hand-Scoring-and-Administration-Materials/p/100000743  
   Productos oficiales: manual 24027; Validity/Clinical Answer Key 24012; Content 24013; Supplementary 24015; Harris-Lingoes 24016. Pearson señala claves reutilizables para las 121 escalas estándar.

5. **Pearson Clinical UK — MMPI-2**  
   https://www.pearsonclinical.co.uk/en-gb/mmpi-2/Minnesota-Multiphasic-Personality-Inventory-2/p/P100009060  
   Verifica la corrección especial de VRIN/TRIN: 49 pares VRIN y 20 pares TRIN, mediante rejilla y cuatro plantillas.

6. **Pearson — Introduction to MMPI-2 (training)**  
   https://www.pearsonclinical.ca/content/dam/school/global/clinical/us/assets/mmpi-2/introduction-to-mmpi-2.pdf  
   Confirma estrategia de corrección, tipos de T y que F−K se presenta como puntuación bruta/raw.

7. **TEA/Hogrefe — Extracto oficial MMPI-2, 4.ª ed. 2019**  
   https://hogrefe-tea.com/recursos/Ejemplos/MMPI-2-Extracto-manual.pdf  
   Adaptación española; el extracto confirma, entre otros aspectos, el alcance de la administración abreviada de 370 ítems y la necesidad de completar 567 para escalas adicionales.

8. **Bibliografía oficial MMPI-2/MMPI-A**  
   https://mmpi.umn.edu/sites/mmpi.umn.edu/files/2022-05/MMPI-2%20&%20MMPI-A%20References_4.1.20.pdf

## Artículos primarios localizados

- Arbisi, P. A. & Ben-Porath, Y. S. (1995), Fp. DOI: https://doi.org/10.1037/1040-3590.7.4.424
- Weed, N. C. et al. (1992), AAS/APS. DOI: https://doi.org/10.1207/s15327752jpa5802_15
- Ben-Porath, Y. S. et al. (1989), Si1–Si3. DOI: https://doi.org/10.1037/1040-3590.1.3.169
- Cook-Medley Ho en MMPI-2: PubMed https://pubmed.ncbi.nlm.nih.gov/16367714/

## Fuentes secundarias usadas solo para controles estructurales

Se utilizaron fuentes académicas/profesionales secundarias para contrastar tamaños de escalas cuando la página oficial pública no expone el conteo. Entre ellas, material académico indexado y páginas especializadas como MMPI-info. Estos datos alimentan `scale_registry.json` **solo como validación estructural**, no como clave de corrección.

## Materiales no oficiales encontrados

La búsqueda localizó reproducciones públicas de manuales, tablas y materiales MMPI-2 en plataformas como Scribd, PDFCoffee, blogs y repositorios de terceros. Se usaron únicamente para detectar referencias/pistas y contrastar afirmaciones; **no se copiaron al motor las listas protegidas de ítems/direcciones ni baremos completos desde esas reproducciones**. Esto evita convertir una copia no autorizada en la fuente maestra de un corrector clínico.

## Estado estructural del archivo activo

| Escala | Componentes activos | Esperado documentado | Estado |
|---|---:|---:|---|
| L | 15 | 15 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| F | 58 | 60 | CLAVE_INCOMPLETA |
| K | 30 | 30 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| Hs | 32 | 32 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| D | 55 | 57 | CLAVE_INCOMPLETA |
| Hy | 60 | 60 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| Pd | 50 | 50 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| Mf | 55 | 56 | CLAVE_INCOMPLETA |
| Pa | 37 | 40 | CLAVE_INCOMPLETA |
| Pt | 48 | 48 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| Sc | 78 | 78 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| Ma | 46 | 46 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| Si | 69 | 69 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| ANX | 23 | 23 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| FRS | 23 | 23 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| OBS | 16 | 16 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| DEP | 33 | 33 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| HEA | 35 | 36 | CLAVE_INCOMPLETA |
| BIZ | 22 | 24 | CLAVE_INCOMPLETA |
| ANG | 15 | 16 | CLAVE_INCOMPLETA |
| CYN | 23 | 23 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| ASP | 22 | 22 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| TPA | 19 | 19 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| LSE | 23 | 24 | CLAVE_INCOMPLETA |
| SOD | 24 | 24 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| FAM | 25 | 25 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| WRK | 32 | 33 | CLAVE_INCOMPLETA |
| TRT | 26 | 26 | CLAVE_ESTRUCTURAL_OK_NO_VALIDADA |
| A | 0 | 39 | CLAVE_NO_DISPONIBLE |
| R | 0 | 37 | CLAVE_NO_DISPONIBLE |
| Es | 0 | 52 | CLAVE_NO_DISPONIBLE |
| MAC-R | 0 | 49 | CLAVE_NO_DISPONIBLE |
| AAS | 0 | 13 | CLAVE_NO_DISPONIBLE |
| APS | 0 | 39 | CLAVE_NO_DISPONIBLE |
| MDS | 0 | 14 | CLAVE_NO_DISPONIBLE |
| Ho | 27 | 50 | CLAVE_INCOMPLETA |
| O-H | 0 | 28 | CLAVE_NO_DISPONIBLE |
| Do | 0 | 25 | CLAVE_NO_DISPONIBLE |
| Re | 0 | 30 | CLAVE_NO_DISPONIBLE |
| Mt | 0 | 41 | CLAVE_NO_DISPONIBLE |
| GM | 0 | 47 | CLAVE_NO_DISPONIBLE |
| GF | 1 | 46 | CLAVE_INCOMPLETA |
| PK | 0 | 46 | CLAVE_NO_DISPONIBLE |
| Fb | 1 | 40 | CLAVE_INCOMPLETA |
| Fp | 21 | 27 | CLAVE_INCOMPLETA |
| S | 24 | 50 | CLAVE_INCOMPLETA |
| D1 | 0 | 32 | CLAVE_NO_DISPONIBLE |
| D2 | 0 | 14 | CLAVE_NO_DISPONIBLE |
| D3 | 0 | 11 | CLAVE_NO_DISPONIBLE |
| D4 | 0 | 15 | CLAVE_NO_DISPONIBLE |
| D5 | 0 | 10 | CLAVE_NO_DISPONIBLE |
| Hy1 | 0 | 6 | CLAVE_NO_DISPONIBLE |
| Hy2 | 0 | 12 | CLAVE_NO_DISPONIBLE |
| Hy3 | 0 | 15 | CLAVE_NO_DISPONIBLE |
| Hy4 | 0 | 17 | CLAVE_NO_DISPONIBLE |
| Hy5 | 0 | 7 | CLAVE_NO_DISPONIBLE |
| Pd1 | 0 | 9 | CLAVE_NO_DISPONIBLE |
| Pd2 | 0 | 8 | CLAVE_NO_DISPONIBLE |
| Pd3 | 0 | 6 | CLAVE_NO_DISPONIBLE |
| Pd4 | 0 | 13 | CLAVE_NO_DISPONIBLE |
| Pd5 | 0 | 12 | CLAVE_NO_DISPONIBLE |
| Pa1 | 0 | 17 | CLAVE_NO_DISPONIBLE |
| Pa2 | 0 | 9 | CLAVE_NO_DISPONIBLE |
| Pa3 | 0 | 9 | CLAVE_NO_DISPONIBLE |
| Sc1 | 0 | 21 | CLAVE_NO_DISPONIBLE |
| Sc2 | 0 | 11 | CLAVE_NO_DISPONIBLE |
| Sc3 | 0 | 10 | CLAVE_NO_DISPONIBLE |
| Sc4 | 0 | 14 | CLAVE_NO_DISPONIBLE |
| Sc5 | 0 | 11 | CLAVE_NO_DISPONIBLE |
| Sc6 | 0 | 20 | CLAVE_NO_DISPONIBLE |
| Ma1 | 0 | 6 | CLAVE_NO_DISPONIBLE |
| Ma2 | 0 | 11 | CLAVE_NO_DISPONIBLE |
| Ma3 | 0 | 8 | CLAVE_NO_DISPONIBLE |
| Ma4 | 0 | 9 | CLAVE_NO_DISPONIBLE |
| Si1 | 0 | 14 | CLAVE_NO_DISPONIBLE |
| Si2 | 0 | 8 | CLAVE_NO_DISPONIBLE |
| Si3 | 0 | 17 | CLAVE_NO_DISPONIBLE |
| VRIN | 0 | 49 pares | ALGORITMO_ESPECIAL_NO_DISPONIBLE |
| TRIN | 0 | 20 pares | ALGORITMO_ESPECIAL_NO_DISPONIBLE |

### Interpretación de estados

- `CLAVE_ESTRUCTURAL_OK_NO_VALIDADA`: el número de componentes coincide, pero la clave heredada no se declara equivalente a una clave oficial hasta cotejo autorizado.
- `CLAVE_INCOMPLETA`: el motor bloquea el cálculo local.
- `CLAVE_NO_DISPONIBLE`: el motor bloquea el cálculo local.
- `ALGORITMO_ESPECIAL_NO_DISPONIBLE`: VRIN/TRIN requieren lógica de pares autorizada; no se puntúan con suma convencional.

## Baremo español

El archivo heredado `data/baremos.json` se conserva para auditoría, pero **el motor 1.1-safe no genera T españolas locales**, porque la inspección detectó anomalías estructurales que impiden considerarlo validado. La vía segura es importar T desde una corrección oficial/autorizada hasta sustituir el dataset por uno verificable y licenciado.

## Baremo US

`data/baremo_us.json` se conserva como dataset heredado. El lookup ahora exige coincidencia exacta y cualquier resultado local se marca `T_LOCAL_NO_VALIDADA`. Para uso clínico/pericial, la prioridad es `T_OFICIAL_IMPORTADA`.

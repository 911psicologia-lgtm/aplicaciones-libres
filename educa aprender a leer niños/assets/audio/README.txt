EMILIA · AUDIO LOCAL · v0.9.0

Este directorio admite microaudios pedagógicos locales. La app separa expresamente:
- vowel: vocal aislada (a, e, i, o, u)
- phoneme: sonido consonántico aislado
- letterName: nombre de la letra (eme, pe, ese...)
- syllable: sílaba (ma, mi, po...)
- word: palabra completa
- instruction / sentence / story: voz narrativa

REGLA DE SEGURIDAD PEDAGÓGICA
Un clip solo se usa si su categoría en manifest.json coincide con el uso solicitado. Así un archivo de vocal no puede utilizarse accidentalmente como sílaba, ni un fonema como nombre de letra.

Mientras no exista un clip local, la app usa TTS para narración, palabras, vocales, sílabas y nombres de letras. Los fonemas consonánticos que el TTS no puede producir con fiabilidad NO se improvisan: quedan reservados al banco de audio local.

El control 0.90× / 1× / 1.12× modifica solo narración, consignas y cuentos. Las unidades fonológicas y las palabras aisladas conservan una velocidad estable.

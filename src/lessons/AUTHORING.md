# Cómo escribir lecciones de Recreo

Resumen aplicado de `assets/Recreo_ ciencia del aprendizaje y diseño de motivación para aprender a leer código.md`.
El esquema está en `types.ts`; el curso de referencia es `courses/demo.ts`.

**Lector:** sabe programar (Python, nivel medio) pero no conoce Java ni Spring. No le expliques
qué es un `if`, un bucle o una función; sí todo lo propio de Java/Spring (`Long` vs `long`,
anotaciones, `Optional`, beans…). Lenguaje llano, rioplatense, sin jerga sin presentar.

## Plantilla de lección (7–9 ejercicios, 5–10 min)

1. **Predicción en frío** (`predict`, `order` o `choice`): el fragmento real, con una pregunta de
   negocio sin jerga. Terminá la consigna con "(Arriesgá.)": equivocarse acá está bien.
2. **Ejemplo resuelto** (`concept`) con `subgoals` rotulados (¿qué dirección atiende? ¿qué entra?
   ¿a quién delega? ¿qué devuelve? ¿y en el error?). Recién acá aparecen los `terms` (máx. 2) y
   una sola `analogy`, diciendo dónde deja de valer.
3. **Investigar** (2–3): `tap-line`, `predict` de un valor, `fill-blank`.
4. **Modificar** (1): `choice` con `variant: 'what-if'` o `compare`.
5. **Transferir** (1): el mismo concepto en *otro* archivo (`level: 'transfer'`).
6. **Explicar** (1): `explain`, con `lineByLine` (lo que no queremos) y `purpose` (propósito + caso borde).
7. Cierre: `takeaway` de la lección en una frase ("A leer…").

## Reglas

**Contenido**
- Un concepto nuevo por lección; como máximo 2 términos nuevos, y siempre *después* de ver la idea en el código.
- Fragmentos de 5–20 líneas del repo real. Lo irrelevante se recorta con `// ...`. Si modificás código, decilo.
- Toda referencia a líneas (`answerLines`, `highlight`, `subgoals.lines`, "la línea 5" en el texto) es
  relativa al snippet. Verificala.

**Anti-adivinanza**
- Al menos 60% de los ejercicios evaluados con respuesta construida (`predict`, `tap-line`, `order`, `compare`, `explain`).
  `choice` y `fill-blank` son andamio.
- Distractores basados en errores conceptuales reales, de largo y estilo parecidos; la correcta no es siempre la más larga.
  Cada distractor lleva su `why`. Los `distractors` de `order` también tienen que ser un error real.
- Nada que se responda con una palabra de la consigna o del nombre del método. Preguntá "¿qué pasa si…?" o
  "¿qué línea…?", no "¿qué es…?".

**Feedback**
- `explanation`: por qué, citando la línea que lo decide. Sin elogios genéricos.
- `principle`: la regla para llevarse, en una frase.

**Calidad**
- ¿La respuesta es inequívoca? ¿Hay otra defendible? Si la hay, reformulá o agregala a `accept` / `answerLines`.
- Si la respuesta depende de la versión o de la configuración de Spring, decilo.
- Marcá cada ejercicio con `concept` y `level`.

## Repaso espaciado

El repaso trabaja por **concepto**, no por ejercicio (`src/state/review.ts`): cuando a un concepto le
toca volver, se muestra *uno* de sus ejercicios evaluados, rotando para no repetir el mismo fragmento.
Por eso:
- Cada `concept` que usen los ejercicios tiene que estar en `course.concepts`, con `title` y
  `canExplain` (completa la frase "Puedo explicar…" del mapa de dominio).
- Cada concepto necesita al menos 3 ejercicios evaluados que se entiendan **sueltos**, fuera de la
  lección: con su propio código y sin "como vimos recién".
- El ejemplo resuelto (`concept`) de cada concepto es el que vuelve cuando se falla dos veces seguidas.
- Al final de cada lección se intercalan hasta 2 conceptos **anteriores** que ya vencían
  (`buildInterleavedReview`). Es otra razón para que los ejercicios se entiendan sueltos: pueden
  aparecer justo después de una lección de otro tema.

## Dificultad adaptativa

Dentro de la sesión, la lección se ajusta según cómo vienen las respuestas (`src/state/adaptive.ts`).
La predicción en frío del principio no cuenta.
- **Trabado** (3 fallos seguidos, o menos del 60% después de 4 respuestas): vuelve el ejemplo resuelto
  del concepto, una vez por concepto. Lo fallado ya vuelve al final, así que siempre se cierra con un acierto.
- **Sobrado** (90% o más, con las 2 últimas bien, "Seguro" y en menos de 30 s): se saltean los `choice`
  y `fill-blank` que quedan y se sacan los `highlight` del código.

Por eso:
- Ninguna consigna puede depender de las líneas resaltadas ("mirá la línea marcada"): pueden desaparecer.
- Lo que solo se enseña en un `choice` o `fill-blank` puede no verse: el concepto tiene que quedar
  cubierto también por los ejercicios de respuesta construida.

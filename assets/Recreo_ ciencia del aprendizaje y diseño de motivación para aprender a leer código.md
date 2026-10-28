# Recreo: ciencia del aprendizaje y diseño de motivación para aprender a leer código (informe accionable)

La palanca más importante para Recreo es cambiar *qué le pide la app al usuario*: menos reconocer la opción correcta entre cuatro y más **predecir, trazar y explicar con sus palabras** qué hace un fragmento real, con repaso espaciado y feedback explicativo. La evidencia sobre leer código (BRACElet), sobre la práctica de recuperación y sobre la autoexplicación apunta en la misma dirección. Esa misma práctica, hecha en voz alta y con presión que sube de a poco, es además la mejor preparación con evidencia para las entrevistas.

## TL;DR

- **Que cada ejercicio obligue a generar, no a reconocer.** La práctica de recuperación (g≈0,50–0,61 en meta-análisis), la autoexplicación (g=0,55) y la investigación sobre leer código (trazar más explicar en lenguaje simple explicaron el 46% de la varianza en escribir código, en Lopez et al. 2008) respaldan los ejercicios de "predecí la salida", "trazá el valor" y "explicalo en una frase". Las opciones múltiples que se pueden adivinar deberían quedar como andamio, no como núcleo.
- **Hay que dosificar la carga cognitiva para alguien que sabe programar pero no Java/Spring.** Conviene usar ejemplos resueltos con submetas rotuladas que se van retirando a medida que mejora el desempeño (efecto de inversión por experiencia), presentar el sistema de arriba hacia abajo (un request de punta a punta antes que las anotaciones sueltas) y meter la jerga solo cuando el usuario ya vio la idea en el código.
- **Motivación sin manipulación.** La gamificación tiene efectos pequeños y frágiles (g=0,25–0,49 según Sailer & Homner 2020). Conviene una racha flexible con "congelador", sesiones mínimas de 2–3 minutos, progreso visible en dominio real y repaso espaciado con FSRS. Hay que evitar vidas, ligas y recompensas variables. Para la ansiedad: exposición gradual (de privado a cronometrado a "explicalo en voz alta") más reevaluación ("esto es activación, no amenaza"), sabiendo que el efecto de esta última es pequeño (d=0,23).

## Key Findings

### 1. Resumen ejecutivo: los 10 principios, ordenados por impacto esperado para este usuario

| # | Principio | Fuerza de la evidencia | Por qué importa para Recreo |
|---|---|---|---|
| 1 | Generar en vez de reconocer (recuperación + predicción) | Fuerte | Ataca directamente el problema de "adivinar sin aprender" |
| 2 | Explicar con sus palabras (autoexplicación / "explain in plain English") | Fuerte (general) / moderada (específica de código, correlacional) | Es la habilidad que exige la entrevista y la que falta al aceptar código de IA |
| 3 | Trazar el código: ejecución mental con una "máquina nocional" explícita | Moderada | Es el precursor de la explicación relacional, según la jerarquía de BRACElet |
| 4 | Repetición espaciada | Fuerte | Sin repaso, lo de hoy se pierde en días |
| 5 | Ejemplos resueltos → que se van retirando, con submetas rotuladas | Fuerte (con matices) | Reduce la sobrecarga de Java/Spring sin regalar respuestas |
| 6 | Carga cognitiva y orden de arriba hacia abajo en el sistema | Moderada-fuerte (teoría), moderada (orden en repos) | Evita "muy técnico de entrada" |
| 7 | Feedback explicativo e inmediato en práctica, con pedido de confianza | Fuerte (feedback en general, d=0,48) | Convierte cada error en aprendizaje y detecta aciertos por azar |
| 8 | Intercalado de conceptos parecidos | Moderada (g=0,42, depende del material) | Distinguir @Service de @Component, o Optional de null, se aprende comparando |
| 9 | Exposición gradual a la presión + reevaluación | Moderada (inoculación), pequeña (reevaluación) | Segundo objetivo: entrevistas |
| 10 | Motivación autónoma: competencia visible, hábito flexible, cero castigo | Moderada | Uso en solitario en ratos de 5–15 min |

Mitos populares con poca evidencia: los **"estilos de aprendizaje"** (visual/auditivo/kinestésico), cuya hipótesis de que adaptar la enseñanza al estilo mejora el aprendizaje no tiene respaldo experimental, así que no hay que construir nada sobre eso. Tampoco hay que suponer que **"más puntos = más aprendizaje"**: los elementos de recompensa y estatus son los de efecto más débil dentro de la gamificación.\[1\]

## Details

### 2. Cada principio: evidencia, aplicación en Recreo y errores comunes

#### Principio 1 — Generar, no reconocer (práctica de recuperación y predicción)

**Evidencia (fuerte).** La revisión de Dunlosky et al. (2013, *Psychological Science in the Public Interest*), sobre 10 técnicas, calificó la práctica con tests y la práctica distribuida como las únicas de "alta utilidad".\[2\] El meta-análisis de Adesope, Trevisan y Sundararajan (2017, *Review of Educational Research*; 272 comparaciones, 15.427 participantes) encontró g=0,61 en general.\[3\]\[4\] Los autores consideran g=0,51 (recuperación frente a releer) como el indicador más realista del beneficio cotidiano.\[5\]\[6\] El efecto apareció en laboratorio (0,62) y en aula (0,67), fue algo mayor cuando el formato de práctica se parece al del examen final, se mantuvo sin feedback y también en transferencia (0,53 frente a 0,63 en retención).\[6\]\[7\] Rowland (2014) reporta g=0,50.\[4\] Matiz importante: van Gog y Sweller (2015) sostienen que el efecto disminuye con material muy complejo.\[7\] Por eso la recuperación debe venir *después* de una explicación o un ejemplo, no reemplazarlos.

**En Recreo.** El problema de la v1 ("podía adivinar") es justamente reconocer en lugar de recuperar. Hay que convertir la mayoría de las preguntas en respuestas que el usuario construye:

```java
@GetMapping("/orders/{id}")
public ResponseEntity<OrderDto> get(@PathVariable Long id) {
    return orderService.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}
```

- *Predicción:* "Si no existe la orden 42, ¿qué código HTTP recibe el cliente?" El usuario escribe el número o elige en un teclado de códigos (200/201/204/400/404/500), no entre 4 opciones.
- *Pregunta de mecanismo:* "¿Qué línea decide eso?" Se responde tocando la línea en el código.

**Errores comunes.** Opciones múltiples con distractores obviamente absurdos. Preguntas que se responden por una palabra clave del enunciado ("¿qué hace `findById`?"). Recuperación inmediata de lo que se acaba de leer en la misma pantalla, que no es recuperación sino copia.

#### Principio 2 — Explicar con sus palabras (autoexplicación / "explain in plain English")

**Evidencia.** General (fuerte): el meta-análisis de Bisra et al. (2018, *Educational Psychology Review*; 64 informes, 69 efectos, 5.917 participantes) encontró g=0,55 a favor de pedir autoexplicaciones, y g=0,67 cuando la comparación no recibía ninguna explicación adicional.\[8\]\[9\] Específica de código (moderada, correlacional): el proyecto BRACElet mostró que, ante la consigna "explicá en lenguaje simple qué hace este segmento", los académicos casi siempre dan un resumen de *propósito* ("devuelve el máximo") y no una lectura línea por línea.\[10\] Esa respuesta "relacional" es la marca de comprensión. Lopez, Whalley, Robbins y Lister (2008, ICER) encontraron que trazar código iterativo y explicarlo, *combinados*, explicaban el 46% de la varianza en escribir código, contra 15% y 7% como aportes únicos de cada uno.\[11\] La muestra era pequeña (38 estudiantes), y Fowler et al. (2022) señalan que no alcanza para verificar el modelo, aunque con más de 600 estudiantes replican la relación general entre explicar y escribir.\[11\] Son correlaciones: no prueban que practicar explicación *cause* mejor escritura, pero sí que es un buen *indicador* de comprensión.\[11\]

**En Recreo.** Ejercicio "En una frase": se muestra el método y se pide "¿Qué hace este método, para alguien que no programa?" La IA evalúa con una rúbrica de tres niveles inspirada en SOLO/BRACElet: (a) línea por línea, (b) parcial, (c) propósito más caso borde ("Busca la orden; si no existe responde 404"). Después se muestran dos explicaciones modelo (una "multiestructural" y una "relacional") y se le pide que elija cuál se parece más a la suya. Eso agrega autoevaluación sin depender solo del juicio de la IA.

**Errores comunes.** Aceptar explicaciones que parafrasean la sintaxis ("llama a findById y luego a map"). Evaluar la longitud en lugar del propósito. Pedir explicaciones demasiado temprano, antes de que el usuario tenga vocabulario mínimo, lo que lleva a frustración.

#### Principio 3 — Trazar con una "máquina nocional" explícita

**Evidencia (moderada).** En BRACElet, quienes no trazan con confiabilidad casi nunca logran explicar código similar, lo que sugiere que el trazado es precursor de la explicación relacional.\[10\]\[12\] En el estudio de Behroozi et al. (2020), los participantes en condición privada hacían más "ejecución mental" de casos de prueba para ganar confianza: trazar es también una estrategia de regulación bajo estrés.\[13\] La idea de "máquina nocional" (du Boulay; Sorva) es enseñar explícitamente un modelo simplificado de cómo ejecuta el lenguaje. En Spring eso incluye la parte "mágica": el contenedor que crea beans, inyecta dependencias y envuelve métodos en proxies.

**En Recreo.** Hay que hacer visible la máquina nocional de Spring con una mini-animación o un diagrama de 4 cajas: *request HTTP → DispatcherServlet → Controller → Service (proxy @Transactional) → Repository → BD*. Ejercicios de trazado:

```java
@Transactional
public void transfer(Long from, Long to, BigDecimal amount) {
    Account a = repo.findById(from).orElseThrow();
    Account b = repo.findById(to).orElseThrow();
    a.withdraw(amount);   // lanza InsufficientFundsException si no alcanza
    b.deposit(amount);
}
```

"La cuenta A tiene 100, B tiene 50, se transfieren 150. ¿Cuánto tiene B al final en la base de datos?" (respuesta: 50, porque la excepción revierte la transacción). Para este usuario este tipo de pregunta vale oro: no se responde reconociendo sintaxis, se responde entendiendo el modelo.

**Errores comunes.** Trazados triviales (sumar dos variables). Omitir la máquina nocional del framework, que es justamente lo que un dev que viene de IA no ve. Tablas de trazado largas e incómodas en un celular: 1–3 valores por pregunta alcanzan.

#### Principio 4 — Repetición espaciada

**Evidencia (fuerte).** Dunlosky et al. (2013) califican la práctica distribuida como de alta utilidad.\[2\] La síntesis de Hattie (2008), citada por Latimier, Peyre y Ramus (2021, *Educational Psychology Review*), reporta un efecto de espaciado de d=0,71, y en su propio meta-análisis la recuperación espaciada frente a la masiva dio g=0,74, compatible con un efecto aditivo al de la recuperación. En Duolingo, Settles y Meeder (2016, ACL) mostraron que un modelo entrenado (half-life regression, HLR) predice el recuerdo con menor error que Leitner y otros esquemas fijos, y que en un experimento operativo mejoró la participación diaria un 12%.\[14\]\[15\]

**En Recreo.** Cada concepto genera "ítems de repaso" (ver sección 6). El repaso no repite la misma pregunta: usa el mismo concepto sobre *otro* fragmento del repo (por ejemplo, `Optional.orElseThrow` en otro servicio). Así se repasa la idea y no la memoria de la respuesta.

**Errores comunes.** Repasar las mismas tarjetas con las mismas opciones (se memoriza la posición de la respuesta). Sesiones de repaso infinitas que rompen el límite de 5–15 minutos. No distinguir "olvidé" de "nunca entendí".

#### Principio 5 — Ejemplos resueltos que se retiran de a poco, con submetas rotuladas

**Evidencia (fuerte, con matices).** El efecto de ejemplo resuelto dice que los novatos aprenden más estudiando soluciones completas que resolviendo desde cero.\[16\] El **efecto de inversión por experiencia** (Kalyuga, Ayres, Chandler y Sweller 2003) muestra que esa ventaja desaparece, y puede invertirse, cuando el aprendiz ya tiene esquemas: lo redundante pasa a ser carga.\[16\]\[17\] Los ejemplos que se retiran gradualmente (Renkl y colegas), y sobre todo el retiro adaptativo al desempeño (Kalyuga y Sweller 2005; Salden et al. 2010), resuelven esa tensión.\[18\]\[19\] En computación, los ejemplos con **submetas rotuladas** (Margulieux, Morrison y Decker) mejoraron el aprendizaje, la retención a una semana y la transferencia, y en un curso completo de introducción redujeron abandono y reprobación.\[20\]\[21\] Para este usuario el matiz es clave: es *experto en programar en general* y *novato en Java/Spring*. Explicarle qué es un `if` es redundante. Explicarle qué hace `@Transactional` no lo es.

**En Recreo.** Cada concepto nuevo sigue la secuencia ejemplo completo → ejemplo con 1 hueco → ejemplo con 2 huecos → problema completo, siempre con rótulos de submeta. Por ejemplo, para "leer un endpoint": ① ¿Qué URL y verbo atiende? ② ¿Qué datos entran? ③ ¿A quién delega? ④ ¿Qué devuelve en el camino feliz? ⑤ ¿Y en el camino de error? Los rótulos son reutilizables: con el tiempo pasan a ser la "checklist mental" para leer cualquier endpoint en una entrevista.

**Errores comunes.** Explicar lo que el usuario ya sabe (bucles, condicionales). Retirar el andamio por calendario y no por desempeño. Ejemplos sin rótulos, que se leen como "código más" y no como estructura.

#### Principio 6 — Carga cognitiva y orden de arriba hacia abajo

**Evidencia.** Teoría de la carga cognitiva (moderada-fuerte en sus efectos principales): la memoria de trabajo es limitada, así que hay que eliminar la carga ajena (pantallas divididas, jerga innecesaria) y dosificar la intrínseca. Comprensión de programas (modelos descriptivos, evidencia moderada): Brooks (1983) describe una comprensión de arriba hacia abajo guiada por hipótesis y "beacons" (nombres, patrones característicos como `findById`, `@RestController`).\[22\]\[23\]\[24\] Pennington (1987) describe una construcción de abajo hacia arriba a partir del flujo de control cuando el código es desconocido.\[25\]\[26\] El metamodelo integrado de von Mayrhauser y Vans (1995) muestra que los programadores reales alternan entre ambas estrategias según su conocimiento del dominio.\[25\]\[27\]\[28\]\[29\]

**En Recreo.** Como el usuario sabe programar pero no conoce este sistema, conviene darle primero el "mapa del dominio" (de arriba hacia abajo) y después bajar al código (de abajo hacia arriba), entrenando explícitamente el uso de beacons. Ejercicio "Detective de nombres": se muestran solo firmas y anotaciones (`@Service class PaymentService { Receipt charge(Order o) ... }`) y se pide la hipótesis "¿qué hace esta clase?" antes de ver el cuerpo. Después se ve el cuerpo y se confirma o corrige.

**Errores comunes.** Empezar por `pom.xml`, configuración o anotaciones sueltas. Mostrar más de ~15–20 líneas por pantalla en el celular. Introducir 3 términos nuevos en la misma tarjeta.

#### Principio 7 — Feedback explicativo y pedido de confianza

**Evidencia (fuerte, heterogénea).** Wisniewski, Zierer y Hattie (2020, *Frontiers in Psychology*; 435 estudios, más de 61.000 participantes) encontraron d=0,48, con mucha heterogeneidad: el feedback rico en información (por qué está mal, qué principio aplica) supera ampliamente al de "correcto/incorrecto" y al elogio genérico.\[30\]\[31\] Sobre el momento: en práctica de recuperación el efecto existe incluso sin feedback (Adesope et al. 2017), pero agregarlo corrige errores.\[6\] La evidencia sobre inmediato frente a demorado es mixta. Una regla práctica razonable: inmediato y breve en la lección, con una explicación más elaborada en la tarjeta de cierre.

**En Recreo.** Después de cada respuesta: (1) correcto/incorrecto, (2) *por qué*, citando la línea exacta, (3) el principio en una frase ("`orElse` se evalúa siempre; `orElseGet`, solo si hace falta"). Antes de confirmar, el usuario elige su confianza: "seguro / creo / adivino". Un acierto con "adivino" se trata como fallo para el repaso. Esto ataca directamente la ilusión de aprender adivinando.

**Errores comunes.** Mostrar la respuesta correcta sin explicación. Feedback largo que rompe el ritmo móvil. Elogios genéricos ("¡Genial!") en lugar de feedback sobre la tarea.

#### Principio 8 — Intercalado de conceptos parecidos

**Evidencia (moderada, condicional).** El meta-análisis de Brunmair y Richter (2019, *Psychological Bulletin*; 59 estudios, 238 efectos) encontró g=0,42 en general, pero muy dependiente del material: el intercalado funciona mejor cuando las categorías se parecen mucho *entre sí* y es más complejo. Con material verbal tipo palabras sueltas mostró efectos negativos. En matemáticas el efecto fue pequeño y variable.\[32\]\[33\]\[34\]

**En Recreo.** Hay que intercalar cuando el usuario debe *discriminar*: `@Component` / `@Service` / `@Repository`, `orElse` / `orElseGet` / `orElseThrow`, `@RequestParam` / `@PathVariable` / `@RequestBody`, `findById` frente a `getReferenceById`. Ejercicio: "¿Cuál de estos tres endpoints va a recibir `id` desde la URL?" con los tres juntos. No hay que intercalar durante la *primera* presentación de un concepto: primero en bloque, después intercalado en el repaso.

**Errores comunes.** Mezclar temas sin relación (no ayuda a discriminar y sube la carga). Intercalar antes de que exista una primera comprensión.

#### Principio 9 — Exposición gradual a la presión y reevaluación

**Evidencia.** Behroozi, Shirolkar, Barik y Parnin (2020, ESEC/FSE) hicieron un ensayo aleatorizado con 48 estudiantes de computación. Ser observado mientras se resuelve en pizarrón y se piensa en voz alta redujo la mediana de corrección a menos de la mitad: falló el 61,5% en condición pública contra el 36,3% en privada, con más estrés y carga cognitiva.\[35\]\[36\]\[37\] Es decir, la entrevista mide en parte el manejo de la ansiedad.\[38\] Sobre las intervenciones: el meta-análisis de Saunders, Driskell, Johnston y Salas (1996; 37 estudios, 1.837 participantes) encontró que el entrenamiento de inoculación al estrés reduce la ansiedad de rendimiento y la ansiedad de estado, con un efecto menor pero significativo sobre el rendimiento bajo estrés, incluso con pocas sesiones.\[39\]\[40\] Sobre reevaluación: Brooks (2014) mostró que decir "estoy entusiasmado" antes de cantar, hablar en público o resolver matemáticas mejora el rendimiento frente a "calmate".\[41\] El meta-análisis de Bosshard y Gomez (2024, *Scientific Reports*; 35 estudios, 5.638 participantes) estima un efecto pequeño de estas intervenciones sobre el rendimiento (d=0,23), algo mayor en tareas de desempeño público (d=0,34), con señales de sesgo de publicación (ajustado, d=0,14). Los autores advierten que no son una "bala de plata".\[42\]

**En Recreo.** Hay que separar dos cosas: primero *competencia* (leer bien en privado) y después *competencia bajo presión*. Ver la sección 3 (modo "Entrevista") y las mecánicas de la sección 7.

**Errores comunes.** Meter presión (timers obligatorios) desde el principio. Vender la reevaluación como solución mágica. Practicar solo en silencio cuando la entrevista exige hablar.

#### Principio 10 — Motivación autónoma y hábito flexible

**Evidencia (moderada).** Según la teoría de la autodeterminación (Deci y Ryan), la motivación sostenida depende de autonomía, competencia y relación. Para un usuario solitario, la competencia percibida ("ahora entiendo cosas que antes no") es el motor principal. Gamificación: el meta-análisis de Sailer y Homner (2020, *Educational Psychology Review*) encontró efectos pequeños sobre resultados cognitivos (g=0,49), motivacionales (g=0,36) y conductuales (g=0,25). Solo el cognitivo se mantuvo estable en los estudios más rigurosos.\[43\] Hábitos: repetir una acción en el mismo contexto la vuelve automática, y saltear un día ocasional no arruina la formación del hábito (Lally et al. 2010, *European Journal of Social Psychology*: 96 voluntarios seguidos 12 semanas, mediana de 66 días hasta la automaticidad, con un rango de 18 a 254 días; "missing one opportunity to perform the behaviour did not materially affect the habit formation process"). Duolingo (blog oficial, 2022) reporta que más de 6 millones de usuarios tenían rachas de 7 días o más, que una animación de racha mejorada subió +1,7% la retención a 7 días de usuarios nuevos y que permitir equipar hasta dos "Streak Freeze" (flexibilidad) aumentó un +0,38% el número relativo de usuarios activos diarios, apoyándose en un estudio de Penn/UCLA según el cual algo de "holgura" motiva más que reglas rígidas. Advertencia: son datos internos de una empresa que optimiza su participación, no de aprendizaje, y en parte se apoyan en la aversión a la pérdida.\[44\]

**En Recreo.** Ver la sección 7.

**Errores comunes.** Confundir participación con aprendizaje. Usar la culpa (notificaciones tipo "Duo está triste") como palanca principal.

### 3. Nuevos tipos de ejercicio propuestos

| Tipo | Ejemplo con código real | Habilidad que entrena | Por qué es difícil de adivinar |
|---|---|---|---|
| **Predecí la salida / el estado** | "Con este `@Transactional`, si `withdraw` lanza, ¿cuánto queda en B?" Respuesta numérica. | Trazado, máquina nocional | La respuesta es construida, no elegida |
| **Tocá la línea** | "¿Qué línea hace que la respuesta sea 404?" El usuario toca una línea del fragmento. | Localizar responsabilidad | Hay 10–20 líneas candidatas |
| **En una frase (explain in plain English)** | "Explicá qué hace `OrderController.get` para alguien de producto." Texto o voz, evaluado por IA con rúbrica. | Comprensión relacional, verbalización | Abierto |
| **Hipótesis por beacons** | Solo firmas y anotaciones de `PaymentService`: "¿qué hace?" Después se revela el cuerpo. | Lectura de arriba hacia abajo, código desconocido | Abierto, y se contrasta después |
| **Seguí el request** | "Ordená el viaje de `POST /orders`: Controller → Service → Repository → evento", con un distractor (un `@Scheduled` que no participa). | Arquitectura, flujo entre archivos | Parsons con distractores plausibles |
| **¿Qué cambia si…?** (Modify, de PRIMM) | "Si cambio `orElseThrow()` por `get()`, ¿qué pasa cuando no existe?" | Razonamiento contrafáctico | Exige un modelo causal |
| **Compará los dos** | Dos versiones de un método (`orElse(expensive())` frente a `orElseGet(this::expensive)`): "¿cuál llama a la BD siempre?" | Discriminación (intercalado) | Las diferencias son sutiles |
| **Revisá el PR de la IA** | Un "diff" generado (por ejemplo, quita `@Transactional`): "¿Aprobarías? ¿Qué riesgo ves?" | Lectura crítica de código de IA, el problema real del usuario | Abierto, con rúbrica |
| **Pregunta de entrevista** | "Tenés 90 s: contame qué hace esta clase y qué preguntarías." Grabación de voz con transcripción y rúbrica. | Verbalización bajo tiempo | Abierto, con presión |
| **Calibración** | Antes de responder: "¿Qué tan seguro estás?" | Metacognición | Penaliza los aciertos por azar |

Los problemas de Parsons (ordenar líneas) que ya tiene la app tienen buena evidencia como práctica *eficiente*: Ericson, Margulieux y Rick (2017) encontraron que resolver Parsons 2D con distractores toma significativamente menos tiempo que corregir o escribir el código equivalente, sin diferencias en aprendizaje ni en retención a una semana.\[45\] Los distractores, sin embargo, aumentan la carga y el tiempo, y en principiantes jóvenes reducen la eficiencia (Harms et al. 2016).\[46\]\[47\] La recomendación es usar distractores solo cuando representen un error conceptual real (por ejemplo, llamar al repositorio antes de validar), nunca como relleno.

### 4. Plantilla de lección ideal (5–10 minutos, 7–9 ejercicios)

Inspirada en PRIMM (Predict–Run–Investigate–Modify–Make; Sentance, Waite y Kallia 2019), adaptada a solo-lectura y a móvil.\[48\] En la evaluación de PRIMM en escuelas, los docentes destacaron "Predict" como la fase que más enganchaba a estudiantes de todos los niveles.\[49\]

1. **Gancho en el dominio (20–30 s).** Una pregunta de negocio sin jerga: "¿Qué pasa si alguien pide una orden que no existe?"
2. **Predicción en frío (1 ejercicio).** Se muestra el fragmento real y se pide predecir el comportamiento. Equivocarse acá está bien, y la app lo dice ("predecir antes de saber te ayuda a recordar").
3. **Ejemplo resuelto con submetas (1 tarjeta).** El mismo fragmento, anotado con los rótulos ①–⑤. Recién acá aparece el término técnico (`Optional`, `ResponseEntity`), con una analogía de una línea ("Optional es una caja que puede venir vacía").
4. **Investigar (2–3 ejercicios).** "Tocá la línea", trazado de un valor, completar un hueco con el andamio retirándose.
5. **Modificar (1 ejercicio).** "¿Qué cambia si…?"
6. **Transferencia (1 ejercicio).** El mismo concepto en *otro* archivo del repo.
7. **Explicalo (1 ejercicio).** Una frase o 30 s de voz. Después se comparan explicaciones modelo.
8. **Repaso intercalado (1–2 ítems).** De conceptos anteriores elegidos por el algoritmo.
9. **Cierre (15 s).** "Hoy aprendiste a leer: 'si no existe → 404'." Se muestra el progreso de dominio (no XP) y una pregunta de calibración: "¿Podrías explicarle esto a alguien?"

Reglas: un solo concepto nuevo por lección. Como máximo 2 términos nuevos. Al menos el 60% de los ejercicios de respuesta construida. La lección se puede pausar y retomar. Hay una versión "mínima" de 2–3 minutos (pasos 2, 4 y 8).

### 5. Estructura de un curso generado a partir de un repositorio

Orden recomendado para un backend Spring Boot. Es coherente con los modelos de comprensión de programas, aunque se trata de una inferencia de diseño, no de un orden validado experimentalmente:

1. **El sistema desde afuera (dominio).** Qué problema resuelve, qué entidades de negocio hay (Orden, Pago, Usuario), qué endpoints existen. Sin código, o con código mínimo.
2. **Un request de punta a punta (de arriba hacia abajo).** El caso de uso más simple (por ejemplo, `GET /orders/{id}`) recorrido por Controller → Service → Repository → Entity. Es el "esqueleto" sobre el que se cuelga todo lo demás.
3. **Las capas, una por una (de abajo hacia arriba).** Controllers (mapeo HTTP, validación) → Services (lógica, transacciones) → Repositories y JPA (consultas, relaciones) → DTOs y mapeo.
4. **La "magia" de Spring (máquina nocional).** Inyección de dependencias, beans, proxies, `@Transactional`, perfiles y configuración. Va *después* de que el usuario vio el efecto en el código, porque la explicación tiene a qué engancharse.
5. **Caminos de error y bordes.** Excepciones, `@ControllerAdvice`, validaciones, nulos y Optional.
6. **Transversales.** Seguridad, tests (leer un test es una forma excelente de leer especificación), eventos, jobs programados.
7. **Lectura de código desconocido.** Clases del repo no vistas, presentadas como práctica de entrevista.

**Dosificación de la jerga:** (a) concepto en lenguaje llano → (b) aparece en el código → (c) recién entonces se le pone nombre → (d) el término se usa sin explicación solo después de 2–3 repasos correctos. Conviene mantener un "glosario personal" que se va desbloqueando, con cada término enlazado al fragmento real donde se vio por primera vez.

### 6. Sistema de repaso: qué algoritmo usar

**Recomendación: FSRS (Free Spaced Repetition Scheduler), usando una implementación existente en TypeScript, con parámetros por defecto, retención objetivo de alrededor de 0,85–0,90 y revisión de parámetros cuando haya algunos cientos de repasos.**

Por qué:
- En el benchmark público de open-spaced-repetition, FSRS predice el recuerdo con mucho menos error que SM-2: log loss de 0,3874 (FSRS v4) contra 0,7317 (SM-2) en el benchmark de ankitects, FSRS-6 llega a 0,3460 en open-spaced-repetition/srs-benchmark, y queda por delante en ~99,6% de las colecciones según resúmenes posteriores. Anki lo integró como opción en la versión 23.10.
- Funciona con parámetros por defecto (entrenados con cientos de millones de repasos), lo que importa para una app de un solo usuario que no tiene datos al principio.\[50\]\[51\]
- Es open-source y corre localmente, compatible con el progreso guardado en el dispositivo.

Advertencias honestas: el benchmark lo mantiene el mismo equipo que creó FSRS. SM-2 no fue diseñado para predecir probabilidades, así que la comparación necesita fórmulas de adaptación. Y el benchmark mide *precisión de predicción*, no aprendizaje. La diferencia práctica que se cita (20–30% menos repasos para la misma retención) proviene de simulaciones.\[50\]\[52\]\[53\]

**Alternativa mínima viable:** Leitner con 5 cajas e intervalos 1–3–7–16–35 días. Es suficiente si se quiere salir rápido. Lo que importa más que el algoritmo:
- El **ítem de repaso es el concepto, no la tarjeta**: cada repaso muestra el concepto en un fragmento distinto o con otra forma de pregunta.
- La calificación combina corrección y confianza (acierto con "adivino" = "Again"; acierto lento o con duda = "Hard").
- Hay un tope diario de repasos (por ejemplo, 5–8 ítems) para respetar las sesiones cortas. Si hay más vencidos, se priorizan los de menor recuperabilidad.
- Errores de comprensión ("nunca lo entendí", 2 o más fallos seguidos) no vuelven al repaso: vuelven a una mini-lección con ejemplo resuelto.

El HLR de Duolingo es instructivo, pero está pensado para millones de usuarios y entrenamiento centralizado. Para una app chica, FSRS con valores por defecto es el equivalente práctico.

### 7. Mecánicas de motivación

**Implementar:**
- **Racha flexible.** Cuenta un día con una sesión mínima (un repaso o un ejercicio), con 1–2 "congeladores" automáticos por semana y la opción de "racha semanal" (por ejemplo, 5 de 7 días). Duolingo (Mansur 2022) reporta que permitir equipar hasta dos Streak Freezes aumentó un +0,38% el número relativo de usuarios activos diarios.
- **Sesión mínima viable** de 2–3 minutos con un botón único "Hacer mi rato". Disparador anclado a un contexto fijo elegido por el usuario ("después del café", "en el colectivo"): se apoya en la investigación sobre hábitos que depende del contexto.\[44\]
- **Progreso en dominio real, no XP.** Un "mapa del repo" que se va iluminando (qué clases y flujos ya puede explicar). Indicadores como "puedo explicar 12 de 40 clases" o "3 flujos completos entendidos". Esto alimenta la competencia (teoría de la autodeterminación) mejor que los puntos.
- **Evidencia de mejora.** Cada tanto, un mismo fragmento que hace un mes falló y hoy acierta ("antes / ahora"). Ataca directamente el "siento que no progreso".
- **Autonomía.** Elegir qué flujo del repo estudiar, elegir modo (aprender / repasar / entrevista), y timers y voz opcionales.
- **Mascota como acompañante informativo**, no como chantaje emocional: celebra hitos de comprensión y sugiere pausas.
- **Dificultad adaptativa** apuntando a ~70–85% de aciertos. Si baja de ~60%, la app agrega andamio. Si pasa del 90% sostenido, retira andamio o salta ejercicios (inversión por experiencia).

**Evitar:**
- **Vidas/corazones.** Castigan el error justo cuando el error es información útil, y empujan a no arriesgar respuestas construidas.
- **Ligas y rankings.** No hay componente social, y la comparación desmotiva a quien queda abajo.
- **Recompensas variables** (cofres, loot): explotan el refuerzo intermitente sin relación con aprender.
- **XP por volumen.** Premia hacer muchas lecciones fáciles y "atracones". El propio Duolingo observó que quienes se dan atracones abandonan más que quienes se dosifican.\[54\]
- **Notificaciones culposas** o más de una por día. Mejor una sola, a la hora elegida, con contenido concreto ("Tenés 4 conceptos para repasar, ~3 min").

**Detectar y prevenir el abandono:**
- *Frustración:* 3 o más fallos seguidos, o caída de la precisión por debajo de ~60% → bajar la dificultad, ofrecer un ejemplo resuelto o cortar la sesión con un acierto.
- *Aburrimiento:* más del 90% de aciertos con respuestas muy rápidas y confianza alta → retirar andamio, pasar a "pregunta de entrevista".
- *Sensación de estancamiento:* muchos días sin un concepto nuevo dominado → mostrar el "antes / ahora" y sugerir un flujo nuevo.
- *Sobrecarga de repaso:* la cola de vencidos crece más de 3 días → tope diario y mensaje explícito: "no pasa nada, repasamos lo más urgente".

### 8. Reglas para la IA que escribe las lecciones (checklist)

**Contenido y orden**
1. Un concepto nuevo por lección. Como máximo 2 términos técnicos nuevos, y cada término aparece *después* de mostrar la idea en el código.
2. Empezar por una pregunta de dominio o de negocio en lenguaje llano, nunca por la definición técnica.
3. No explicar fundamentos de programación general (bucles, condicionales, funciones): el usuario ya los sabe. Explicar lo específico de Java/Spring.
4. Usar fragmentos reales del repo de 5–20 líneas. Recortar lo irrelevante con `// ...`. Nunca inventar código que no exista sin marcarlo como "versión modificada".
5. Incluir siempre los rótulos de submeta (①–⑤) en el primer ejemplo de cada tipo de construcción.
6. Una analogía como máximo por concepto, y señalar dónde falla ("Optional es como una caja… pero no es una colección").

**Anti-adivinanza**
7. Al menos el 60% de los ejercicios con respuesta construida (valor, línea, frase, orden).
8. En opción múltiple: distractores basados en errores conceptuales reales (confundir `orElse`/`orElseGet`, creer que `@Transactional` funciona en llamadas internas), todos de longitud y estilo similares, y sin que la respuesta correcta sea siempre la más larga ni la más específica.
9. Ninguna pregunta debe poder responderse con una palabra del enunciado o del nombre del método. Prueba automática: si un modelo sin ver el código acierta, la pregunta se descarta.
10. Toda pregunta debe exigir el código: "¿qué pasa si…?" o "¿qué línea…?", y no "¿qué es…?".
11. Variar la posición de la respuesta correcta y cambiar de fragmento entre lección y repaso.

**Feedback**
12. Cada respuesta incorrecta explica *por qué* y señala la línea. Cada respuesta correcta refuerza el principio en una frase.
13. Prohibido el elogio genérico vacío. El feedback se refiere a la tarea.

**Progresión**
14. Secuencia ejemplo completo → con huecos → problema, que se retira según el desempeño registrado.
15. La última pregunta de la lección es de transferencia (otro archivo) o de explicación.
16. Marcar cada ejercicio con: concepto, nivel (reconocer / trazar / explicar / transferir) y prerrequisitos, para que el algoritmo de repaso y el de dificultad puedan usarlos.

**Calidad**
17. Autoverificación de la IA: "¿la respuesta es inequívoca? ¿hay otra respuesta defendible?" Si la hay, reformular.
18. Las respuestas que dependen de la versión de Spring o de configuración deben decirlo explícitamente.

### 9. Cómo medir si está aprendiendo de verdad

Métricas simples que la app puede registrar localmente:

| Señal | Qué indica | Cómo registrarla |
|---|---|---|
| **Precisión en el primer intento en repasos demorados** (≥7 días) | Retención real, no rendimiento inmediato | Por concepto, separando lección y repaso |
| **Precisión en transferencia** (concepto en un fragmento nuevo) | Comprensión frente a memoria de la respuesta | Ejercicios marcados como "transferencia" |
| **Calibración** (confianza frente a acierto) | Si sabe lo que sabe; detecta adivinanzas | % de aciertos con "adivino"; error de calibración por concepto |
| **Nivel de explicación** (rúbrica 1–3 de la IA) | Paso de línea por línea a propósito (relacional) | Promedio móvil por semana |
| **Tiempo de respuesta** en ítems dominados | Automatización (chunking) | Mediana por tipo de ejercicio |
| **Retención estimada** (recuperabilidad media de FSRS) | Salud del repaso | Del propio algoritmo |
| **Clases/flujos del repo que puede explicar** | Progreso significativo para el usuario | Mapa del repo |
| **Prueba fija periódica** | Progreso comparable en el tiempo | Cada 2–4 semanas, el mismo set de 5 fragmentos nunca usados en lecciones |

Señal de alarma: precisión alta en lecciones pero baja en repasos demorados o en transferencia significa que está aprendiendo la app, no el código. Es exactamente el problema de la v1.

### 10. Modo "Entrevista": cómo incorporar la ansiedad en la app

Escalera de exposición gradual (inspirada en inoculación al estrés: preparación → práctica de habilidades → aplicación bajo estrés creciente):

1. **Nivel 0, privado y sin tiempo:** "explicalo" escrito.
2. **Nivel 1, voz sin tiempo:** grabar 30–60 s explicando un fragmento ya visto. La app transcribe y evalúa con la rúbrica de submetas.
3. **Nivel 2, voz con tiempo amplio** (por ejemplo, 2 min) sobre código *nuevo* del repo.
4. **Nivel 3, simulación:** pregunta típica de entrevista ("¿qué hace esta clase?", "¿dónde podría fallar?", "¿cómo la testearías?") con 90 s, un "entrevistador" (mascota o voz) que hace una repregunta, y la opción de "pensar 30 s en silencio antes de hablar". Esto refleja la recomendación de Behroozi et al. de dar un tiempo privado al inicio.\[13\]
5. **Nivel 4, transferencia real:** sugerir practicar con una persona o grabarse en video.

Elementos concretos:
- **Guion de pensar en voz alta** basado en las submetas: "Primero miro qué entra… después a quién llama… el caso feliz es… el caso de error es…". Practicarlo hasta que sea automático baja la carga cognitiva bajo presión.
- **Reevaluación de 10 segundos** antes del modo entrevista: "La aceleración que sentís es tu cuerpo preparándose. Decí: 'estoy entusiasmado'." Es barato y tiene evidencia, aunque de efecto pequeño (d=0,23).
- **Timer siempre opcional** y solo en el modo entrevista, nunca en el aprendizaje inicial.
- **Registro de ansiedad** de 1 toque (1–5) antes y después del modo entrevista, para ver la tendencia propia.
- **Normalizar el no saber:** practicar frases como "no conozco esta anotación; por el nombre supongo que… lo verificaría así". Un buen lector de código desconocido formula hipótesis a partir de beacons y las verifica.\[22\]

## Recommendations

**Prioridad de implementación (de mayor a menor retorno):**
1. Reescribir el generador de lecciones con el checklist de la sección 8 y la plantilla de la sección 4. Agregar "Predecí", "Tocá la línea" y "En una frase". *Esto solo ya ataca el problema principal de la v1.*
2. Agregar el pedido de confianza en cada respuesta y tratar el "adivino" como fallo.
3. Implementar repaso con FSRS (o Leitner al principio) sobre *conceptos*, con fragmentos que rotan y un tope diario.
4. Reestructurar el curso de arriba hacia abajo: dominio → un request de punta a punta → capas → magia de Spring.
5. Cambiar XP y vidas por un mapa de dominio del repo y "antes / ahora". Racha flexible.
6. Agregar el modo Entrevista con la escalera de exposición y voz.
7. Agregar "Revisá el PR de la IA", que conecta con la motivación de fondo del usuario: dejar de aceptar código que no entiende.

**Umbrales de partida** (ajustables con los datos propios): objetivo de 70–85% de aciertos. Retiro de andamio tras 2 aciertos seguidos con confianza "seguro". Vuelta a ejemplo resuelto tras 2 fallos seguidos. Tope de 5–8 repasos por sesión.

## Caveats

- **Transferencia de la investigación.** La mayoría de los estudios de educación en computación son con estudiantes universitarios novatos en programación, no con desarrolladores con experiencia que aprenden un framework. Las recomendaciones para este usuario son extrapolaciones razonables, sobre todo las del efecto de inversión por experiencia.
- **Correlación, no causalidad, en BRACElet.** Que trazar y explicar predigan la escritura de código no demuestra que practicarlos *cause* mejoras. Además, el estudio de 2008 tiene una muestra pequeña (38) y hay cifras de correlación inconsistentes entre fuentes secundarias.\[10\]\[11\]
- **Datos de Duolingo.** Provienen de blogs y experimentos internos que optimizan la participación y la retención del producto, no necesariamente el aprendizaje. El 12% de HLR es participación diaria, no aprendizaje medido.\[14\]
- **Benchmark de FSRS.** Lo mantienen sus propios autores y mide predicción, no resultados de aprendizaje.\[52\]\[53\]
- **Reevaluación del estrés.** Efecto pequeño, con señales de sesgo de publicación. El estudio de Behroozi es con 48 estudiantes, no con candidatos reales.\[35\]\[42\]
- **Evaluación por IA de explicaciones abiertas.** Puede ser inconsistente. Conviene combinarla con autoevaluación (comparar con explicaciones modelo) y revisar a mano una muestra.
- **Orden del curso.** La secuencia "de arriba hacia abajo y después capas" está fundamentada en modelos de comprensión de programas y en la teoría de carga cognitiva, pero no hay ensayos controlados que comparen órdenes para enseñar un repositorio Spring.
- **Fuentes.** Las fuentes (papers, meta-análisis y blogs) se nombran en el texto de cada sección con autor, año y revista. Las más importantes: Dunlosky et al. 2013; Adesope et al. 2017; Bisra et al. 2018; Brunmair y Richter 2019; Wisniewski, Zierer y Hattie 2020; Kalyuga et al. 2003; Margulieux, Morrison y Decker; Lopez, Whalley, Robbins y Lister 2008; Fowler et al. 2022; Sentance, Waite y Kallia 2019; Ericson, Margulieux y Rick 2017; von Mayrhauser y Vans 1995; Settles y Meeder 2016; Sailer y Homner 2020; Behroozi et al. 2020; Saunders et al. 1996; Brooks 2014; Bosshard y Gomez 2024; blog de investigación de Duolingo (Mansur 2022); benchmark de open-spaced-repetition.

## Fuentes

1. [Does Gamified Learning Actually Work?](https://www.cogn-iq.org/blog/gamified-learning/)
2. [Which study strategies make the grade?](https://www.sciencedaily.com/releases/2013/01/130110111734.htm)
3. [EFFECT SIZES AND META-ANALYSES](https://pdf.retrievalpractice.org/MetaAnalysisGuide.pdf)
4. [META-ANALYSIS A Meta-Analytic Review of the Benefit of Spacing](http://www.lscp.net/persons/ramus/docs/EPR20.pdf)
5. [(PDF) Rethinking the Use of Tests: A Meta-Analysis of Practice Testing](https://www.researchgate.net/publication/315706448_Rethinking_the_Use_of_Tests_A_Meta-Analysis_of_Practice_Testing)
6. [Tests Are Not Just for 'Evaluation'｜ささもん先生](https://note.com/kind_willet0364/n/n4b406f29bf5a?hl=en)
7. [Does research on ‘retrieval practice’ translate into classroom…](https://educationendowmentfoundation.org.uk/news/does-research-on-retrieval-practice-translate-into-classroom-practice)
8. [META-ANALYSIS Inducing Self-Explanation: a Meta-Analysis](https://gwern.net/doc/psychology/spaced-repetition/2018-bisra.pdf)
9. [Visible Learning - Self explanation Details](https://www.visiblelearningmetax.com/influences/view/self_explanation)
10. [(PDF) A closer look at tracing, explaining and code writing skills in the novice programmer](https://www.researchgate.net/publication/221209606_A_closer_look_at_tracing_explaining_and_code_writing_skills_in_the_novice_programmer)
11. <https://par.nsf.gov/servlets/purl/10340072>
12. [(PDF) Relationships between reading, tracing and writing skills in introductory programming](https://www.researchgate.net/publication/230751881_Relationships_between_reading_tracing_and_writing_skills_in_introductory_programming)
13. [Does Stress Impact Technical Interview Performance? Mahnaz Behroozi](https://par.nsf.gov/servlets/purl/10196170)
14. [\[PDF\] A Trainable Spaced Repetition Model for Language Learning](https://www.semanticscholar.org/paper/A-Trainable-Spaced-Repetition-Model-for-Language-Settles-Meeder/cb836d2b8e126dc31ded5e674d73021604dcc6e0)
15. [A Trainable Spaced Repetition Model for Language Learning](https://research.duolingo.com/papers/settles.acl16.pdf)
16. [The worked example and expertise reversal effect in less structured tasks: Learning to reason about legal cases - ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0361476X12000677)
17. [Reconciling Different Theories of Learning with an Agent-based Model of Procedural Learning](https://arxiv.org/pdf/2408.13364)
18. [(PDF) The expertise reversal effect and worked examples in tutored problem solving](https://www.researchgate.net/publication/226748784_The_expertise_reversal_effect_and_worked_examples_in_tutored_problem_solving)
19. [The Expertise Reversal Effect: When Good Instruction Goes Wrong](https://idtips.substack.com/p/the-expertise-reversal-effect-when)
20. [(PDF) Reducing withdrawal and failure rates in introductory programming with subgoal labeled worked examples](https://www.researchgate.net/publication/341301511_Reducing_withdrawal_and_failure_rates_in_introductory_programming_with_subgoal_labeled_worked_examples)
21. [subgoal labeling](https://computinged.wordpress.com/tag/subgoal-labeling/)
22. [Brooks’ model of program comprehension.](https://www.researchgate.net/figure/Brooks-model-of-program-comprehension_fig1_220674064)
23. [Program Comprehension During Software Maintenance and Evolution Armeliese](https://www.cs.kent.edu/~jmaletic/cs63902/Papers/ProgramComprehension/von_mayrhauser95.pdf)
24. [Mental Models for Program Understanding Dr. Jonathan I. Maletic \<SDML\>](https://www.cs.kent.edu/~jmaletic/cs63903/Lecture-%20Prog%20Under.pdf)
25. [(PDF) Program understanding behavior during debugging of large scale software](https://www.researchgate.net/publication/234785606_Program_understanding_behavior_during_debugging_of_large_scale_software)
26. [(PDF) Program comprehension during software maintenance and evolution](https://www.researchgate.net/publication/2954431_Program_comprehension_during_software_maintenance_and_evolution)
27. [1 Software Comprehension](https://www.st.cs.uni-saarland.de/edu/empirical-se/2006/PDFs/brien03.pdf)
28. [GazePrinter: Visualizing Expert Gaze to Guide Novices in a New Codebase](https://arxiv.org/pdf/2603.19855)
29. [Code cognition models.](https://www.researchgate.net/figure/Code-cognition-models_tbl2_2954431)
30. [The Power of Feedback Revisited: A Meta-Analysis of Educational Feedback Research : Find an Expert : The University of Melbourne](https://findanexpert.unimelb.edu.au/scholarlywork/1437592-the-power-of-feedback-revisited--a-meta-analysis-of-educational-feedback-research)
31. [“Good job” teaches nothing — task feedback does](https://www.caadria2025.org/real-learning-gains-aren-from-pat/)
32. [BrunmairRichterin Press 2019 META-ANALYSISOFINTERLEAVEDLEARNING](https://www.scribd.com/document/711044262/BrunmairRichterin-press-2019-META-ANALYSISOFINTERLEAVEDLEARNING)
33. [Using Interleaving to Promote Inductive Learning in Educational Contexts: Promises and Challenges: Zeitschrift für Entwicklungspsychologie und Pädagogische Psychologie: Vol 54, No 4](https://econtent.hogrefe.com/doi/10.1026/0049-8637/a000260)
34. [Change One Category at a Time: Sequence Effects Beyond Interleaving and Blocking](https://www.researchgate.net/publication/348955346_Change_one_category_at_a_time_Sequence_effects_beyond_interleaving_and_blocking)
35. [\[PDF\] Does stress impact technical interview performance?](https://www.semanticscholar.org/paper/Does-stress-impact-technical-interview-performance-Behroozi-Shirolkar/adf930ae6f3712e083d2384c5aa6b13de82ff212)
36. [Whiteboarding and live-coding exercises in tech interviews are counterproductive - Nick's Blog and Digital Garden](https://nick.groenen.me/notes/problems-with-whiteboarding-and-live-coding-interviews/)
37. [Does Stress Impact Technical Interview Performance?](https://docshare.wps.com/document/does-stress-impact-technical-interview-performance/391979/)
38. [Does Stress Impact Technical Interview Performance?](https://gameweld.medium.com/the-case-for-the-private-technical-interview-4a92947e1692)
39. [The effect of stress inoculation training on anxiety and performance.](https://www.semanticscholar.org/paper/The-effect-of-stress-inoculation-training-on-and-Saunders-Driskell/fdc79789ad6f43329bc6d854fe35e23b2a8b3951)
40. [Motivation and emotion/Book/2014/Stress inoculation - Wikiversity](https://en.wikiversity.org/wiki/Motivation_and_emotion/Book/2014/Stress_inoculation)
41. [\[PDF\] Get excited: reappraising pre-performance anxiety as excitement.](https://www.semanticscholar.org/paper/Get-excited:-reappraising-pre-performance-anxiety-Brooks/b93ea924786686c771314aa4dd290a7f0a736824)
42. <https://www.nature.com/articles/s41598-024-58408-w.pdf>
43. [\[PDF\] The Gamification of Learning: a Meta-analysis](https://www.semanticscholar.org/paper/The-Gamification-of-Learning:-a-Meta-analysis-Sailer-Homner/be6769b967370c9852210e2fb7a34e499902f814)
44. [The habit-building research behind your Duolingo streak](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
45. [\[PDF\] Solving parsons problems versus fixing and writing code](https://www.semanticscholar.org/paper/Solving-parsons-problems-versus-fixing-and-writing-Ericson-Margulieux/2f1b7c75a3cc2f33fc34575bbe77eeb1f336debc)
46. [Evaluating the Efficiency and Effectiveness of Adaptive Parsons Problems](https://www.researchgate.net/publication/326918129_Evaluating_the_Efficiency_and_Effectiveness_of_Adaptive_Parsons_Problems)
47. [The Impact of Solving Adaptive Parsons Problems with Common and Uncommon Solutions](https://www.researchgate.net/publication/365473099_The_Impact_of_Solving_Adaptive_Parsons_Problems_with_Common_and_Uncommon_Solutions)
48. [Teaching computer programming with PRIMM: a sociocultural ...](https://primmportal.com/wp-content/uploads/2020/10/teaching-computer-programming-with-primm-a-sociocultural-perspective.pdf)
49. [Teaching computer programming with PRIMM: a sociocultural perspective](https://suesentance.net/wp-content/uploads/2020/02/teaching_computer_programming_with_primm__a_sociocultural_perspective_author_copy.pdf)
50. [fsrs-vs-sm2-spaced-repetition-algorithm](https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm)
51. [Anki (software)](<https://en.wikipedia.org/wiki/Anki_(software)>)
52. [Spaced Repetition Algorithms: From SM-2 to FSRS](https://www.mindomax.com/spaced-repetition-algorithms)
53. [what-makes-a-spaced-repetition-algorithm-effective](https://www.mindomax.com/what-makes-a-spaced-repetition-algorithm-effective)
54. [How Streaks keep Duolingo learners committed to their language goals](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)

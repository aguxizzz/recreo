import type { CodeSnippet, Course } from '@/lessons/types';

/**
 * Curso de muestra: el backend de una tienda online escrito con Spring.
 * El código es inventado (no viene de un repo real), pero sigue la forma típica
 * del código que genera una IA. Cada lección sigue la plantilla de `src/lessons/AUTHORING.md`.
 */

const java = (code: string, filename?: string, extra?: Partial<CodeSnippet>): CodeSnippet => ({
  language: 'java',
  code,
  filename,
  ...extra,
});

// ─── Unidad 1 ────────────────────────────────────────────────────────────────

const getOrder = `@GetMapping("/orders/{id}")
public Order get(@PathVariable Long id) {
    return orderService.findById(id);
}`;

const getOrderWithStatus = `@GetMapping("/orders/{id}")
public ResponseEntity<Order> get(@PathVariable Long id) {
    return orderService.findById(id)
        .map(order -> ResponseEntity.ok(order))
        .orElse(ResponseEntity.notFound().build());
}`;

// ─── Unidad 2 ────────────────────────────────────────────────────────────────

const orderService = `@Service
public class OrderService {

    private final OrderRepository orderRepository;
    // ... (el constructor lo omitimos)

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    public Order cancel(Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        if (order.isShipped()) {
            throw new IllegalStateException("Ya se envió");
        }
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}`;

const orderRepository = `public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status);
}`;

// ─── Unidad 3 ────────────────────────────────────────────────────────────────

const transferBody = `public void transfer(Long fromId, Long toId, int amount) {
    Account from = accountRepository.findById(fromId).orElseThrow();
    Account to = accountRepository.findById(toId).orElseThrow();
    to.deposit(amount);
    accountRepository.save(to);
    from.withdraw(amount);  // si no alcanza el saldo, lanza un error
    accountRepository.save(from);
}`;

const transfer = `@Transactional\n${transferBody}`;

const sameCustomer = `public boolean sameCustomer(Order a, Order b) {
    Long idA = a.getCustomerId();
    Long idB = b.getCustomerId();
    return idA == idB;
}`;

export const demoCourse: Course = {
  id: 'demo',
  title: 'Java con Spring',
  language: 'java',
  description: 'Curso de muestra: leer el backend de una tienda online, de afuera hacia adentro.',
  concepts: {
    endpoints: { title: 'Endpoints', canExplain: 'qué dirección atiende un método y qué dato le llega' },
    optional: { title: 'Optional', canExplain: 'qué pasa cuando lo que se busca no existe' },
    capas: { title: 'Las tres capas', canExplain: 'qué hace el controller, el service y el repository' },
    'spring data': { title: 'Consultas por nombre', canExplain: 'qué busca un método findBy… leyendo su nombre' },
    transacciones: { title: 'Transacciones', canExplain: 'por qué @Transactional deshace todo si algo falla' },
    'equals vs ==': { title: 'equals vs ==', canExplain: 'cuándo == compara mal dos valores en Java' },
  },
  units: [
    {
      id: 'demo-u1',
      title: 'Un pedido de punta a punta',
      description: 'Qué pasa cuando alguien pide una orden.',
      color: 'violet',
      lessons: [
        {
          id: 'demo-l1',
          title: 'Una dirección, un método',
          icon: 'navigate',
          takeaway: 'A leer qué dirección atiende un método y qué dato le llega desde esa dirección.',
          exercises: [
            {
              id: 'demo-l1-e1',
              type: 'predict',
              concept: 'endpoints',
              level: 'trace',
              prompt:
                'La app de la tienda recibe el pedido GET /orders/42. ¿Qué número le llega a este método en id? (Todavía no lo vimos: arriesgá.)',
              code: java(getOrder, 'OrderController.java'),
              answer: '42',
              keyboard: 'numeric',
              prefix: 'id =',
              explanation:
                'La línea 1 dice que este método atiende /orders/{algo}. Lo que venga en el lugar de {id} se copia en el parámetro id de la línea 2. Si te equivocaste no pasa nada: predecir antes de saber ayuda a recordar.',
              principle: 'Las llaves {…} en la dirección son huecos: lo que llega ahí entra al método.',
            },
            {
              id: 'demo-l1-e2',
              type: 'concept',
              concept: 'endpoints',
              title: 'Cómo leer un endpoint',
              prompt:
                'Un endpoint es una dirección de la app (como /orders/42) más el método que la atiende. Para leer cualquiera, respondé estas preguntas en orden. Tocá cada una.',
              code: java(getOrder, 'OrderController.java'),
              subgoals: [
                { label: '¿Qué dirección atiende?', lines: [1], answer: 'GET /orders/{id}: pedir una orden por su número.' },
                { label: '¿Qué dato entra?', lines: [2], answer: 'El número que vino en la dirección, como un Long llamado id.' },
                { label: '¿A quién le pasa el trabajo?', lines: [3], answer: 'A orderService, que es quien sabe buscar órdenes.' },
                { label: '¿Qué devuelve?', lines: [2, 3], answer: 'La orden encontrada (Order). Spring la convierte en JSON.' },
              ],
              terms: [
                {
                  term: '@GetMapping',
                  meaning: 'una anotación (una etiqueta con @) que le dice a Spring "este método atiende GET a esta dirección".',
                },
                { term: '@PathVariable', meaning: 'saca un dato de la dirección y lo pone en el parámetro.' },
              ],
              analogy:
                'Si usaste Flask, es como @app.get("/orders/<id>"). Diferencia: en Java la anotación no ejecuta nada por sí sola, es una etiqueta que Spring lee al arrancar.',
              explanation:
                'El controller casi no hace nada: recibe el pedido, saca los datos de la dirección y le pasa el trabajo a otro. Eso es bueno: la lógica vive en otro lado.',
            },
            {
              id: 'demo-l1-e3',
              type: 'tap-line',
              variant: 'where',
              concept: 'endpoints',
              level: 'trace',
              prompt: '¿Qué línea hace que este método responda a /customers/7 y no a /orders/7?',
              code: java(
                `@GetMapping("/customers/{id}")
public Customer get(@PathVariable Long id) {
    return customerService.findById(id);
}`,
                'CustomerController.java',
              ),
              answerLines: [1],
              explanation:
                'La dirección la decide la anotación de la línea 1. El nombre del método (get) o de la clase no influye: podrías llamarlo banana y seguiría atendiendo /customers/{id}.',
              principle: 'Para saber qué dirección atiende un método, mirá la anotación de arriba, no su nombre.',
            },
            {
              id: 'demo-l1-e4',
              type: 'predict',
              concept: 'endpoints',
              level: 'trace',
              prompt: 'Llega GET /customers/7/orders. ¿Qué valor tiene customerId?',
              code: java(
                `@GetMapping("/customers/{customerId}/orders")
public List<Order> ordersOf(@PathVariable Long customerId) {
    return orderService.findByCustomer(customerId);
}`,
                'OrderController.java',
              ),
              answer: '7',
              keyboard: 'numeric',
              prefix: 'customerId =',
              explanation:
                'El hueco {customerId} está en el segundo tramo de la dirección, así que toma el 7. La palabra "orders" del final es fija: no es un dato, es parte de la dirección.',
              principle: 'Cada {nombre} de la dirección va al parámetro con @PathVariable que se llama igual.',
            },
            {
              id: 'demo-l1-e5',
              type: 'choice',
              variant: 'what-if',
              concept: 'endpoints',
              level: 'recognize',
              prompt: 'Si cambiás @GetMapping por @PostMapping en la línea 1, ¿qué pasa con un GET /orders/42?',
              code: java(getOrder, 'OrderController.java', { highlight: [1] }),
              options: [
                {
                  id: 'a',
                  text: 'Ya no llega a este método: ahora solo atiende POST',
                },
                {
                  id: 'b',
                  text: 'Sigue funcionando igual, GET y POST son lo mismo',
                  why: 'GET y POST son pedidos distintos: GET suele ser "dame", POST suele ser "creá". Spring los separa.',
                },
                {
                  id: 'c',
                  text: 'El método empieza a crear una orden nueva',
                  why: 'La anotación solo cambia qué pedidos llegan. Lo que hace el método lo deciden sus líneas, y siguen buscando.',
                },
              ],
              answer: 'a',
              explanation:
                'La anotación filtra por dirección y por tipo de pedido. Con @PostMapping, un GET /orders/42 no encuentra a nadie y la app responde que esa dirección no acepta GET.',
              principle: 'La anotación elige qué pedidos llegan; el cuerpo del método decide qué se hace con ellos.',
            },
            {
              id: 'demo-l1-e6',
              type: 'tap-line',
              variant: 'where',
              concept: 'endpoints',
              level: 'transfer',
              prompt: 'Este es otro archivo. ¿Qué método atiende GET /products/5? Tocá su anotación.',
              code: java(
                `@GetMapping("/products")
public List<Product> all() {
    return productService.findAll();
}

@GetMapping("/products/{id}")
public Product one(@PathVariable Long id) {
    return productService.findById(id);
}

@PostMapping("/products")
public Product create(@RequestBody Product product) {
    return productService.save(product);
}`,
                'ProductController.java',
              ),
              answerLines: [6, 7],
              explanation:
                'Solo la línea 6 tiene un hueco {id} donde puede entrar el 5. La línea 1 atiende /products exacto (la lista entera) y la 11 es para POST.',
              principle: 'Buscá la dirección que encaja con el pedido, hueco por hueco.',
            },
            {
              id: 'demo-l1-e7',
              type: 'explain',
              concept: 'endpoints',
              level: 'explain',
              prompt: '¿Qué hace este método? Contalo en una frase, como para alguien de producto.',
              code: java(getOrder, 'OrderController.java'),
              lineByLine:
                'Tiene un @GetMapping con /orders/{id}, recibe un Long id con @PathVariable y llama a orderService.findById(id).',
              purpose: 'Cuando alguien pide /orders/ y un número, busca la orden con ese número y la devuelve.',
              explanation:
                'La primera explicación nombra las piezas; la segunda dice para qué sirve. En una entrevista o al revisar código de una IA, lo que importa es la segunda.',
            },
          ],
        },
        {
          id: 'demo-l2',
          title: 'Cuando no existe',
          icon: 'help-buoy',
          takeaway: 'A leer el camino de error: si la orden no existe, la caja viene vacía y se responde 404.',
          exercises: [
            {
              id: 'demo-l2-e1',
              type: 'predict',
              concept: 'optional',
              level: 'trace',
              prompt: 'Alguien pide GET /orders/42, pero esa orden no existe. ¿Qué código HTTP recibe? (Arriesgá.)',
              code: java(getOrderWithStatus, 'OrderController.java'),
              keys: ['200', '201', '204', '400', '404', '500'],
              answer: '404',
              prefix: 'HTTP',
              explanation:
                'La línea 5 dice qué hacer si no hay orden: notFound(), que es el código 404 ("no encontrado"). Las líneas 3 a 5 son como un if/else escrito en cadena.',
              principle: 'En una cadena …map(…).orElse(…), lo que está en orElse es el caso "no había nada".',
            },
            {
              id: 'demo-l2-e2',
              type: 'concept',
              concept: 'optional',
              title: 'La caja que puede venir vacía',
              prompt:
                'findById no devuelve la orden directamente: devuelve una caja que puede tener una orden o estar vacía. Tocá cada pregunta.',
              code: java(getOrderWithStatus, 'OrderController.java'),
              subgoals: [
                { label: '¿Qué dirección atiende?', lines: [1], answer: 'GET /orders/{id}, igual que antes.' },
                { label: '¿Qué dato entra?', lines: [2], answer: 'El id que vino en la dirección.' },
                { label: '¿A quién le pasa el trabajo?', lines: [3], answer: 'A orderService.findById, que devuelve la caja (Optional).' },
                {
                  label: '¿Qué devuelve si existe?',
                  lines: [4],
                  answer: 'map abre la caja y, si hay orden, la responde con 200 OK.',
                },
                {
                  label: '¿Y si no existe?',
                  lines: [5],
                  answer: 'orElse dice qué usar si la caja vino vacía: una respuesta 404.',
                },
              ],
              terms: [
                { term: 'Optional', meaning: 'una caja que tiene un valor o está vacía. Te obliga a decidir qué hacer en los dos casos.' },
                { term: 'ResponseEntity', meaning: 'la respuesta HTTP completa: el código (200, 404…) más el contenido.' },
              ],
              analogy:
                'En Python devolverías la orden o None y harías un if. Optional es parecido, pero es una caja: no podés usar la orden sin abrirla primero con map, orElse o similares.',
              explanation:
                'Leé estas cadenas como un if: "si hay orden → 200 con la orden; si no → 404". La línea 4 es el camino feliz y la 5 el camino de error.',
            },
            {
              id: 'demo-l2-e3',
              type: 'tap-line',
              variant: 'where',
              concept: 'optional',
              level: 'trace',
              prompt: '¿Qué línea hace que la respuesta sea 404?',
              code: java(getOrderWithStatus, 'OrderController.java'),
              answerLines: [5],
              explanation:
                'La línea 5 (orElse) solo se usa si la caja vino vacía, y arma un notFound(), que es 404. La línea 4 es el caso contrario.',
              principle: 'El camino de error de un Optional está en orElse (o en orElseThrow, que lanza un error).',
            },
            {
              id: 'demo-l2-e4',
              type: 'predict',
              concept: 'optional',
              level: 'trace',
              prompt: 'Ahora piden GET /orders/7, y la orden 7 sí existe. ¿Qué código HTTP recibe?',
              code: java(getOrderWithStatus, 'OrderController.java'),
              keys: ['200', '201', '204', '400', '404', '500'],
              answer: '200',
              prefix: 'HTTP',
              explanation:
                'La caja trae la orden, así que entra por la línea 4: ResponseEntity.ok(order) es un 200 con la orden adentro. La línea 5 se ignora.',
              principle: 'map solo actúa si la caja tiene algo; si está vacía, se salta.',
            },
            {
              id: 'demo-l2-e5',
              type: 'compare',
              concept: 'optional',
              level: 'trace',
              prompt: 'La orden no existe. ¿En cuál de las dos versiones el cliente recibe un 404?',
              a: java(`return orderService.findById(id)
    .map(order -> ResponseEntity.ok(order))
    .orElse(ResponseEntity.notFound().build());`),
              b: java(`Order order = orderService.findById(id).orElseThrow();
return ResponseEntity.ok(order);`),
              answer: 'a',
              explanation:
                'En la B, orElseThrow lanza un error cuando la caja está vacía. Si nadie atrapa ese error, Spring responde 500 ("se rompió algo"), no 404. Es un error común en código generado.',
              principle: 'orElse da un valor de reemplazo; orElseThrow corta con un error. No es lo mismo para quien llama.',
            },
            {
              id: 'demo-l2-e6',
              type: 'predict',
              concept: 'optional',
              level: 'transfer',
              prompt: 'Otro archivo. El cliente 99 no existe. ¿Qué devuelve customerName(99)?',
              code: java(
                `public String customerName(Long id) {
    return customerRepository.findById(id)
        .map(customer -> customer.getName())
        .orElse("Invitado");
}`,
                'CustomerService.java',
              ),
              answer: 'Invitado',
              accept: ['"Invitado"'],
              keyboard: 'text',
              explanation:
                'Es la misma forma que en el controller: la caja viene vacía, map se salta y orElse da el reemplazo, que acá es el texto "Invitado".',
              principle: 'Con Optional, buscá siempre el orElse: ahí está qué pasa cuando no hay nada.',
            },
            {
              id: 'demo-l2-e7',
              type: 'explain',
              concept: 'optional',
              level: 'explain',
              prompt: '¿Qué hace este método? Incluí qué pasa cuando la orden no existe.',
              code: java(getOrderWithStatus, 'OrderController.java'),
              lineByLine:
                'Llama a findById con el id, después hace map con ResponseEntity.ok y si no, orElse con notFound().build().',
              purpose: 'Busca la orden pedida: si existe la devuelve con 200 y, si no existe, responde 404.',
              explanation:
                'Una buena explicación cubre los dos caminos, el feliz y el de error. Ese "y si no…" es lo que más se le escapa a quien acepta código sin leerlo.',
            },
          ],
        },
      ],
    },
    {
      id: 'demo-u2',
      title: 'Quién hace qué',
      description: 'Las tres capas y dónde vive cada decisión.',
      color: 'teal',
      lessons: [
        {
          id: 'demo-l3',
          title: 'Las tres capas',
          icon: 'layers',
          takeaway: 'A ubicar cada cosa: el controller recibe, el service decide y el repository guarda.',
          exercises: [
            {
              id: 'demo-l3-e1',
              type: 'order',
              concept: 'capas',
              level: 'trace',
              prompt: 'Llega GET /orders/42. Ordená el viaje del pedido por la app. (Arriesgá: lo vemos enseguida.)',
              steps: [
                { id: 's1', text: 'El controller recibe el pedido y saca el 42' },
                { id: 's2', text: 'El service pide la orden al repository' },
                { id: 's3', text: 'El repository la busca en la base de datos' },
                { id: 's4', text: 'El controller responde 200 o 404' },
              ],
              distractors: [{ id: 'd1', text: 'El repository arma la respuesta HTTP' }],
              explanation:
                'El pedido entra y sale por el controller. En el medio, el service decide y el repository habla con la base. El repository nunca sabe nada de HTTP: solo guarda y busca.',
              principle: 'Entra por el controller, se decide en el service, se guarda en el repository.',
            },
            {
              id: 'demo-l3-e2',
              type: 'concept',
              concept: 'capas',
              title: 'Un service por dentro',
              prompt:
                'El service es donde viven las reglas del negocio, como "no se puede cancelar algo ya enviado". Tocá cada pregunta para leer cancel.',
              code: java(orderService, 'OrderService.java'),
              subgoals: [
                { label: '¿Qué rol tiene la clase?', lines: [1], answer: '@Service: es la capa de reglas del negocio.' },
                { label: '¿De quién depende?', lines: [4], answer: 'De orderRepository, para buscar y guardar órdenes.' },
                { label: '¿Qué entra?', lines: [11, 12], answer: 'Un id, y con él busca la orden (si no existe, corta con error).' },
                { label: '¿Qué regla aplica?', lines: [13, 14, 15], answer: 'Si la orden ya se envió, no deja cancelar.' },
                { label: '¿Qué cambia y qué devuelve?', lines: [16, 17], answer: 'Pasa la orden a CANCELLED, la guarda y la devuelve.' },
              ],
              terms: [
                { term: '@Service', meaning: 'marca la clase como la capa de reglas del negocio. Spring la crea y la conecta sola.' },
                { term: 'repository', meaning: 'la clase que guarda y busca datos en la base. No toma decisiones.' },
              ],
              explanation:
                'Si buscás una regla del negocio ("¿se puede cancelar?"), abrí el service. Si buscás cómo se guarda algo, el repository. Si buscás qué dirección existe, el controller.',
            },
            {
              id: 'demo-l3-e3',
              type: 'tap-line',
              variant: 'where',
              concept: 'capas',
              level: 'trace',
              prompt: '¿Qué línea impide cancelar una orden que ya se envió?',
              code: java(orderService, 'OrderService.java'),
              answerLines: [13, 14],
              explanation:
                'La línea 13 pregunta si ya se envió y la 14 corta con un error. Como el error sale antes de la línea 16, la orden nunca llega a cambiar de estado.',
              principle: 'Las reglas del negocio suelen ser un if que corta con un error antes de cambiar algo.',
            },
            {
              id: 'demo-l3-e4',
              type: 'predict',
              concept: 'capas',
              level: 'trace',
              prompt: 'Llaman a cancel(42) y la orden 42 ya se envió (está SHIPPED). ¿Con qué estado queda en la base?',
              code: java(orderService, 'OrderService.java', { highlight: [13, 14, 15, 16, 17] }),
              keys: ['PENDING', 'SHIPPED', 'CANCELLED'],
              answer: 'SHIPPED',
              explanation:
                'El throw de la línea 14 corta el método ahí mismo. Las líneas 16 y 17 nunca se ejecutan, así que la orden queda como estaba: SHIPPED.',
              principle: 'Un throw corta el método: nada de lo que está debajo se ejecuta.',
            },
            {
              id: 'demo-l3-e5',
              type: 'choice',
              variant: 'where-lives',
              concept: 'capas',
              level: 'recognize',
              prompt: 'Te piden que se pueda cancelar una orden hasta 1 día después de enviada. ¿Qué archivo abrís?',
              options: [
                {
                  id: 'a',
                  text: 'OrderController.java',
                  isCode: true,
                  why: 'El controller solo recibe el pedido y lo pasa. La regla de "¿se puede cancelar?" no está ahí.',
                },
                { id: 'b', text: 'OrderService.java', isCode: true },
                {
                  id: 'c',
                  text: 'OrderRepository.java',
                  isCode: true,
                  why: 'El repository guarda y busca, pero no decide si algo está permitido.',
                },
                {
                  id: 'd',
                  text: 'Order.java',
                  isCode: true,
                  why: 'Order tiene los datos de la orden (isShipped), pero la regla que los usa está en el service.',
                },
              ],
              answer: 'b',
              explanation: 'Cambiar una regla del negocio es cambiar el if de la línea 13 del service.',
              principle: 'Reglas del negocio → service.',
            },
            {
              id: 'demo-l3-e6',
              type: 'tap-line',
              variant: 'where',
              concept: 'capas',
              level: 'transfer',
              prompt: 'Un service que no viste. ¿En qué línea se guarda en la base el cambio del pago?',
              code: java(
                `@Service
public class RefundService {

    private final PaymentRepository paymentRepository;
    private final EmailSender emailSender;

    public void refund(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        payment.markRefunded();
        paymentRepository.save(payment);
        emailSender.send(payment.getEmail(), "Te devolvimos el dinero");
    }
}`,
                'RefundService.java',
              ),
              answerLines: [10],
              explanation:
                'La línea 9 cambia el pago en memoria, pero lo que lo guarda es save en el repository (línea 10). La 11 manda un mail: no toca la base.',
              principle: 'Para saber qué toca la base, seguí las llamadas al repository.',
            },
            {
              id: 'demo-l3-e7',
              type: 'explain',
              concept: 'capas',
              level: 'explain',
              prompt: '¿Qué hace el método cancel? Contalo para alguien que no programa.',
              code: java(orderService.split('\n').slice(10, 18).join('\n'), 'OrderService.java', { startLine: 11 }),
              lineByLine:
                'Busca la orden con findById, si isShipped() es true lanza IllegalStateException, si no hace setStatus(CANCELLED) y save.',
              purpose: 'Cancela una orden, salvo que ya se haya enviado: en ese caso no la toca y avisa con un error.',
              explanation: 'La segunda dice la regla del negocio. Es lo que tendrías que poder contar de cualquier método de un service.',
            },
          ],
        },
        {
          id: 'demo-l4',
          title: 'El repositorio que se escribe solo',
          icon: 'server',
          takeaway: 'A leer una búsqueda a partir del nombre del método: findBy + campos.',
          exercises: [
            {
              id: 'demo-l4-e1',
              type: 'choice',
              variant: 'what-does',
              concept: 'spring data',
              level: 'recognize',
              prompt: 'Este archivo no tiene ninguna línea de SQL. ¿Qué devuelve findByStatus(PAID)? (Arriesgá.)',
              code: java(orderRepository, 'OrderRepository.java'),
              options: [
                { id: 'a', text: 'Todas las órdenes con estado PAID' },
                {
                  id: 'b',
                  text: 'Nada, porque falta escribir el código',
                  why: 'Parece incompleto, pero Spring escribe la búsqueda solo, a partir del nombre del método.',
                },
                {
                  id: 'c',
                  text: 'Solo la primera orden con estado PAID',
                  why: 'Devuelve List<Order>: una lista, que puede tener muchas órdenes (o ninguna).',
                },
              ],
              answer: 'a',
              explanation:
                'Spring lee el nombre: find (buscar) + By (donde) + Status (el estado es igual a lo que pases). Arma la consulta a la base solo.',
              principle: 'En un repository, el nombre del método es la consulta.',
            },
            {
              id: 'demo-l4-e2',
              type: 'concept',
              concept: 'spring data',
              title: 'El nombre es la consulta',
              prompt: 'Un repository casi nunca tiene código adentro: Spring lo escribe a partir de los nombres. Tocá cada pregunta.',
              code: java(orderRepository, 'OrderRepository.java'),
              subgoals: [
                { label: '¿De qué datos es?', lines: [1], answer: 'De Order, que se identifican con un Long (el id).' },
                { label: '¿Qué devuelve?', lines: [5], answer: 'List<Order>: varias órdenes, o una lista vacía.' },
                { label: '¿Qué busca?', lines: [5], answer: 'findBy… = buscá las que cumplan…' },
                { label: '¿Con qué condiciones?', lines: [5], answer: 'CustomerId And Status: de ese cliente y con ese estado, las dos a la vez.' },
              ],
              terms: [
                { term: 'interface', meaning: 'una lista de métodos sin código adentro. Acá Spring pone el código por vos.' },
                { term: 'JpaRepository', meaning: 'lo que le da al repository los métodos básicos: findById, save, delete…' },
              ],
              analogy:
                'Si usaste el ORM de Django, findByStatus(PAID) es como Order.objects.filter(status=PAID), pero escrito en el nombre. Diferencia: si escribís mal un campo, la app no arranca.',
              explanation:
                'Leé el nombre en voz alta: "buscá por cliente y estado". Lo que viene después de By son los campos, y los parámetros son los valores, en el mismo orden.',
            },
            {
              id: 'demo-l4-e3',
              type: 'tap-line',
              variant: 'where',
              concept: 'spring data',
              level: 'trace',
              prompt: 'Necesitás "las órdenes pagadas del cliente 7". ¿Qué método usarías? Tocalo.',
              code: java(orderRepository, 'OrderRepository.java'),
              answerLines: [5],
              explanation:
                'findByStatus (línea 3) trae las pagadas de todos los clientes. La línea 5 filtra por cliente y por estado a la vez.',
              principle: 'Cada campo después de By es una condición más; And exige que se cumplan todas.',
            },
            {
              id: 'demo-l4-e4',
              type: 'predict',
              concept: 'spring data',
              level: 'trace',
              prompt: 'Con estos datos en la base, ¿cuántas órdenes devuelve la línea 7?',
              code: java(
                `// En la base:
//   id=1  cliente=7  PAID
//   id=2  cliente=7  PENDING
//   id=3  cliente=8  PAID
//   id=4  cliente=7  PAID

orderRepository.findByCustomerIdAndStatus(7L, OrderStatus.PAID);`,
                undefined,
                { highlight: [7] },
              ),
              answer: '2',
              keyboard: 'numeric',
              suffix: 'órdenes',
              explanation:
                'Tienen que ser del cliente 7 y estar PAID: la 1 y la 4. La 2 es del 7 pero está PENDING; la 3 está PAID pero es del 8. (El 7L es el número 7 escrito como Long.)',
              principle: 'And = las dos condiciones a la vez.',
            },
            {
              id: 'demo-l4-e5',
              type: 'compare',
              concept: 'spring data',
              level: 'trace',
              prompt: '¿Cuál de las dos puede devolver varias órdenes?',
              a: java('List<Order> findByStatus(OrderStatus status);'),
              b: java('Optional<Order> findByNumber(String number);'),
              answer: 'a',
              explanation:
                'List es una lista: cero, una o muchas. Optional es la caja de la lección 2: una o ninguna. Si en la B hubiera dos órdenes con el mismo número, la app da error.',
              principle: 'Mirá el tipo que devuelve: List = varios, Optional = uno o ninguno.',
            },
            {
              id: 'demo-l4-e6',
              type: 'fill-blank',
              concept: 'spring data',
              level: 'recognize',
              prompt: 'Completá el nombre para buscar las órdenes creadas antes de una fecha.',
              code: java('List<Order> ___(Instant date);', 'OrderRepository.java'),
              options: ['findByCreatedAtBefore', 'findCreatedAtBefore', 'findByBeforeCreatedAt', 'getCreatedAtBefore'],
              answer: 'findByCreatedAtBefore',
              explanation:
                'El orden importa: findBy + el campo (CreatedAt) + la comparación (Before). Sin By, o con las partes al revés, Spring no lo entiende y la app no arranca.',
              principle: 'findBy + Campo + Comparación (Before, After, LessThan…).',
            },
            {
              id: 'demo-l4-e7',
              type: 'explain',
              concept: 'spring data',
              level: 'transfer',
              prompt: 'Un repository que no viste. ¿Qué busca este método?',
              code: java(
                `public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryAndPriceLessThan(String category, BigDecimal price);
}`,
                'ProductRepository.java',
              ),
              lineByLine:
                'Es un método findBy con Category y PriceLessThan que recibe un String y un BigDecimal y devuelve una List de Product.',
              purpose: 'Busca los productos de una categoría que cuestan menos que un precio dado.',
              explanation: 'Traducir el nombre a una frase de negocio es justo lo que hace falta para revisar estos archivos rápido.',
            },
          ],
        },
      ],
    },
    {
      id: 'demo-u3',
      title: 'Lo que no se ve',
      description: 'Cosas que el código hace sin que lo diga a simple vista.',
      color: 'pink',
      lessons: [
        {
          id: 'demo-l5',
          title: 'Todo o nada',
          icon: 'swap-horizontal',
          takeaway: 'A leer @Transactional: si algo falla en el medio, los cambios en la base se deshacen todos.',
          exercises: [
            {
              id: 'demo-l5-e1',
              type: 'predict',
              concept: 'transacciones',
              level: 'trace',
              prompt:
                'La cuenta A tiene 100 y la B tiene 50. Se transfieren 150 de A a B. ¿Cuánto tiene B en la base al final? (Arriesgá.)',
              code: java(transfer, 'TransferService.java'),
              answer: '50',
              keyboard: 'numeric',
              explanation:
                'B recibe la plata en la línea 5 y se guarda en la 6. Pero en la línea 7 A no tiene saldo y salta un error. Por el @Transactional de la línea 1, todo lo guardado se deshace: B vuelve a 50.',
              principle: 'Con @Transactional, si el método termina en error, los cambios en la base se deshacen.',
            },
            {
              id: 'demo-l5-e2',
              type: 'concept',
              concept: 'transacciones',
              title: 'Todo o nada',
              prompt: 'Una transferencia tiene dos partes que tienen que pasar juntas o no pasar. Tocá cada pregunta.',
              code: java(transfer, 'TransferService.java'),
              subgoals: [
                { label: '¿Qué marca el método?', lines: [1], answer: '@Transactional: todo lo que haga en la base cuenta como un solo paso.' },
                { label: '¿Qué cambios hace?', lines: [5, 6, 7, 8], answer: 'Suma a B, lo guarda, resta a A, lo guarda.' },
                { label: '¿Qué puede fallar?', lines: [7], answer: 'withdraw, si A no tiene saldo suficiente.' },
                { label: '¿Qué pasa si falla?', lines: [1, 7], answer: 'Se deshace todo, incluido lo que ya se había guardado de B.' },
              ],
              terms: [
                { term: 'transacción', meaning: 'un grupo de cambios en la base que se aplican todos juntos o ninguno.' },
                { term: 'rollback', meaning: 'deshacer los cambios de una transacción que falló.' },
              ],
              analogy:
                'Es como pagar en el súper: o pagás todo y te llevás todo, o no te llevás nada. Ojo dónde no vale: solo deshace cambios en la base, no un mail que ya mandaste.',
              explanation:
                'Sin @Transactional, cada save se aplica al instante y queda aunque después algo falle. Con @Transactional, recién se aplica todo cuando el método termina bien.',
            },
            {
              id: 'demo-l5-e3',
              type: 'tap-line',
              variant: 'where',
              concept: 'transacciones',
              level: 'trace',
              prompt: '¿Qué línea puede hacer que se deshaga toda la transferencia?',
              code: java(transfer, 'TransferService.java'),
              answerLines: [7],
              explanation:
                'withdraw (línea 7) es la que puede lanzar el error. Cuando el error sale del método, @Transactional deshace todo lo anterior.',
              principle: 'Buscá dónde puede salir un error: desde ahí hacia atrás, todo se deshace.',
            },
            {
              id: 'demo-l5-e4',
              type: 'compare',
              concept: 'transacciones',
              level: 'trace',
              prompt: 'A tiene 100 y se intentan transferir 150. ¿En cuál de las dos B se queda con plata que nadie le dio?',
              a: java(transfer, 'TransferService.java'),
              b: java(transferBody, 'TransferService.java'),
              answer: 'b',
              explanation:
                'En la B no hay @Transactional: el save de B (línea 5) se aplica al instante. Cuando withdraw falla, ese cambio ya quedó, y apareció plata de la nada.',
              principle: 'Si dos cambios tienen que ir juntos, buscá el @Transactional. Si no está, es un bug.',
            },
            {
              id: 'demo-l5-e5',
              type: 'predict',
              concept: 'transacciones',
              level: 'trace',
              prompt: 'Ahora A tiene 200 y B tiene 50. Se transfieren 150. ¿Cuánto tiene A al final?',
              code: java(transfer, 'TransferService.java'),
              answer: '50',
              keyboard: 'numeric',
              explanation:
                'Esta vez alcanza el saldo: no hay error, el método termina bien y se aplican los dos cambios. A queda en 200 − 150 = 50 y B en 200.',
              principle: 'Si no hay error, @Transactional no cambia nada: aplica todo al final.',
            },
            {
              id: 'demo-l5-e6',
              type: 'choice',
              variant: 'what-if',
              concept: 'transacciones',
              level: 'transfer',
              prompt: 'Alguien agrega emailSender.send(...) entre las líneas 6 y 7 para avisarle a B. Si después withdraw falla, ¿qué pasa con el mail?',
              code: java(transfer, 'TransferService.java', { highlight: [6, 7] }),
              options: [
                { id: 'a', text: 'El mail ya salió: la transacción solo deshace la base' },
                {
                  id: 'b',
                  text: 'El mail se cancela junto con todo lo demás',
                  why: 'La transacción es de la base de datos. Un mail ya enviado no se puede "des-enviar".',
                },
                {
                  id: 'c',
                  text: 'El mail se manda recién cuando termina el método',
                  why: 'El código se ejecuta en orden: el mail sale en el momento en que se llama a send.',
                },
              ],
              answer: 'a',
              explanation:
                'B recibe un mail diciendo que le llegó plata que nunca le llegó. Por eso los avisos se mandan después de que todo salió bien, no en el medio.',
              principle: '@Transactional deshace la base, no lo que ya salió hacia afuera (mails, cobros, otras APIs).',
            },
            {
              id: 'demo-l5-e7',
              type: 'explain',
              concept: 'transacciones',
              level: 'explain',
              prompt: '¿Qué hace transfer? Incluí qué pasa si A no tiene saldo.',
              code: java(transfer, 'TransferService.java'),
              lineByLine:
                'Busca las dos cuentas, hace deposit en to y save, después withdraw en from y save, todo con @Transactional.',
              purpose: 'Pasa plata de una cuenta a otra; si la primera no tiene saldo, no se mueve nada.',
              explanation: 'Decir "no se mueve nada" muestra que entendiste el @Transactional sin nombrarlo.',
            },
          ],
        },
        {
          id: 'demo-l6',
          title: 'Comparar en Java',
          icon: 'git-compare',
          takeaway: 'A desconfiar de == entre objetos: en Java se compara con equals, como el == de Python.',
          exercises: [
            {
              id: 'demo-l6-e1',
              type: 'predict',
              concept: 'equals vs ==',
              level: 'trace',
              prompt: 'Las dos órdenes son del cliente 1000. ¿Qué devuelve sameCustomer(a, b)? (Arriesgá.)',
              code: java(sameCustomer, 'OrderService.java'),
              keys: ['true', 'false'],
              answer: 'false',
              explanation:
                'Sorpresa: false. En Java, == entre objetos (y Long es un objeto) pregunta "¿es el mismo objeto?", no "¿tienen el mismo valor?". Son dos objetos distintos con el mismo 1000 adentro.',
              principle: 'En Java, == entre objetos compara si son el mismo objeto, no si valen lo mismo.',
            },
            {
              id: 'demo-l6-e2',
              type: 'concept',
              concept: 'equals vs ==',
              title: 'Mismo valor, distinto objeto',
              prompt: 'Este es uno de los errores que más se cuelan en código generado. Tocá cada pregunta.',
              code: java(sameCustomer, 'OrderService.java'),
              subgoals: [
                { label: '¿Qué compara?', lines: [4], answer: 'idA == idB: si son el mismo objeto.' },
                { label: '¿Qué son idA e idB?', lines: [2, 3], answer: 'Long con mayúscula: objetos que tienen un número adentro.' },
                { label: '¿Cómo debería comparar?', lines: [4], answer: 'idA.equals(idB), que compara los valores.' },
              ],
              terms: [
                { term: 'equals', meaning: 'el método que compara si dos objetos valen lo mismo.' },
                { term: 'Long / long', meaning: 'Long (mayúscula) es un objeto; long (minúscula) es un número simple.' },
              ],
              analogy:
                'En Python, el == de Java entre objetos es como is, y equals es como ==. Dónde no vale: con números simples (int, long en minúscula) el == de Java sí compara valores.',
              explanation:
                'Lo traicionero: Java reutiliza los objetos Long chicos (de −128 a 127). Con IDs chicos == "funciona" por casualidad y los tests pasan; con IDs grandes falla.',
            },
            {
              id: 'demo-l6-e3',
              type: 'predict',
              concept: 'equals vs ==',
              level: 'trace',
              prompt: 'Ahora las dos órdenes son del cliente 42. ¿Qué devuelve sameCustomer(a, b)?',
              code: java(sameCustomer, 'OrderService.java'),
              keys: ['true', 'false'],
              answer: 'true',
              explanation:
                'true, pero por casualidad: el 42 está entre −128 y 127, así que Java usa el mismo objeto para los dos. Por eso este bug pasa los tests con datos chicos.',
              principle: 'Que funcione con números chicos no prueba nada: con objetos, usá equals.',
            },
            {
              id: 'demo-l6-e4',
              type: 'tap-line',
              variant: 'bug',
              concept: 'equals vs ==',
              level: 'transfer',
              prompt:
                'Otro archivo. status llega del pedido (por ejemplo "PAID") y las órdenes vienen de la base. El filtro casi nunca encuentra nada. Tocá la línea del bug.',
              code: java(
                `public List<Order> withStatus(List<Order> orders, String status) {
    return orders.stream()
        .filter(o -> o.getStatus() == status)
        .toList();
}`,
                'ReportService.java',
              ),
              answerLines: [3],
              explanation:
                'El mismo problema con textos: los dos String dicen "PAID", pero son objetos distintos (uno lo armó la base y otro el pedido), así que == da false. Con o.getStatus().equals(status) funciona.',
              principle: 'Los String también son objetos: se comparan con equals.',
            },
            {
              id: 'demo-l6-e5',
              type: 'compare',
              concept: 'equals vs ==',
              level: 'trace',
              prompt: 'Los dos clientes son el 1000. ¿Cuál devuelve true?',
              a: java('return idA == idB;'),
              b: java('return idA.equals(idB);'),
              answer: 'b',
              explanation: 'equals compara los valores: 1000 y 1000 son iguales. == compara objetos, y con 1000 son dos distintos.',
              principle: 'Objetos → equals. Números simples (int, long) → ==.',
            },
            {
              id: 'demo-l6-e6',
              type: 'choice',
              variant: 'what-if',
              concept: 'equals vs ==',
              level: 'recognize',
              prompt: 'Si en las líneas 2 y 3 cambiás Long por long (minúscula), ¿qué devuelve con el cliente 1000?',
              code: java(sameCustomer, 'OrderService.java', { highlight: [2, 3] }),
              options: [
                { id: 'a', text: 'true, porque long es un número simple y == compara su valor' },
                {
                  id: 'b',
                  text: 'false, igual que antes',
                  why: 'long en minúscula no es un objeto: es un número simple, y para esos == sí compara valores.',
                },
                {
                  id: 'c',
                  text: 'No compila, long no se puede comparar',
                  why: 'Los números simples se comparan con == sin problema: es justamente su uso normal.',
                },
              ],
              answer: 'a',
              explanation:
                'Con long, idA e idB son números, no objetos, y == compara el valor. Ojo: un long no puede ser null, así que si getCustomerId() devolviera null, fallaría.',
              principle: 'Mayúscula (Long, Integer, String) = objeto. Minúscula (long, int) = número simple.',
            },
            {
              id: 'demo-l6-e7',
              type: 'fill-blank',
              concept: 'equals vs ==',
              level: 'recognize',
              prompt: 'Completá una comparación que funcione aunque alguno de los dos sea null.',
              code: java('return ___(a.getCustomerId(), b.getCustomerId());'),
              options: ['Objects.equals', 'Objects.hash', 'String.valueOf', 'Optional.of'],
              answer: 'Objects.equals',
              explanation:
                'idA.equals(idB) falla si idA es null. Objects.equals(a, b) se encarga: true si los dos son null, false si solo uno lo es, y si no compara con equals.',
              principle: 'Objects.equals compara valores sin romperse con null.',
            },
          ],
        },
      ],
    },
  ],
};

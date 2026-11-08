/**
 * ==========================================================================
 * GUÍA DE CONFIGURACIÓN DE CARGA PARA EL LÍDER FUNCIONAL
 * ==========================================================================
 * Este archivo define el comportamiento y la cantidad de "Usuarios Virtuales"
 * que estresarán la aplicación. Al modificar los números aquí, el cambio se 
 * aplicará automáticamente a todos los escenarios (catálogo, alquiler, etc.).
 * 
 * ¿QUÉ SIGNIFICA CADA PARÁMETRO?
 * - 'duration': El tiempo que durará esa fase. Puedes usar segundos ('15s') 
 *               o minutos ('2m').
 * - 'target':   La cantidad de usuarios virtuales simultáneos a los que k6 
 *               debe llegar al finalizar el tiempo de esa fase.
 * 
 * EXPLICACIÓN DE LAS FASES (STAGES):
 * 1. RAMP-UP (Subida progresiva): 
 *    Simula la llegada gradual de personas a la app. Sirve para observar 
 *    cómo responde el servidor a medida que el tráfico aumenta, evitando 
 *    un golpe irreal instantáneo.
 * 
 * 2. CARGA SOSTENIDA (Mantenimiento): 
 *    Mantiene a los usuarios atacando la app al mismo tiempo. Es la prueba 
 *    de fuego para evaluar la utilización de memoria, CPU y los bloqueos 
 *    del hilo bajo alta concurrencia.
 * 
 * 3. RAMP-DOWN (Bajada progresiva): 
 *    Simula a los usuarios saliendo de la app. Sirve para verificar si el 
 *    backend libera la memoria y los recursos correctamente tras el estrés.
 * 
 * EJEMPLOS PRÁCTICOS DE MODIFICACIÓN:
 * - ¿Quieres probar con 50 usuarios en lugar de 10? 
 *   Cambia el "target" de la fase 1 y 2 a 50. (La fase 3 siempre debe ir a 0).
 * 
 * - ¿Quieres someter al servidor a 3 minutos de estrés continuo? 
 *   Cambia el "duration" de la fase 2 (la del medio) de '15s' a '3m'.
 *  
 * IMPORTANTE:
 * standardOptions solo se usa  para pruebas locales
 * (Catálogo, Persistencia, etc.), sus configuraciones solamente van a 
 * afectar a esos módulos.
 * ==========================================================================
 */

export const standardOptions = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '15s', target: 10 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        checks: ['rate>0.99'],
    },
};

// Pruebas que modifican datos.
// Un solo VU ejecuta las iteraciones secuencialmente para evitar
// interferencias entre compradores y operaciones sobre el stock.
export const statefulOptions = {
    scenarios: {
        stateful_sequential: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 10,
            maxDuration: '2m',
        },
    },
    thresholds: {
        checks: ['rate>0.99'],
    },
};

/**
 * apiLimitedOptions: ES EXCLUSIVO PARA ENDPOINTS QUE USAN OMDB API (Prioridad 4)
 * Para evitar el bloqueo por límite diario (1,000 consultas/día en la cuenta gratuita).
 * 
 * ¿CÓMO MODIFICARLO DE FORMA SEGURA?
 * - 'iterations': Límite MÁXIMO EXACTO de peticiones que se enviarán en total. 
 *                 NO SUPERAR LAS 300 POR PRUEBA para evitar bloqueos.
 * - 'vus': Usuarios simultáneos haciendo esas peticiones.
 */
export const apiLimitedOptions = {
    scenarios: {
        api_limit: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '30s',
        },
    },
    thresholds: {
        checks: ['rate>0.99'],
    },
};

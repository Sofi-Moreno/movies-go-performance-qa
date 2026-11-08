import http from 'k6/http';
import { check, sleep } from 'k6';
import { standardOptions } from '/github/workspace/qa/performance/k6/config/options.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = standardOptions;

export default function () {
    // Usamos el endpoint real /rent enviando un ID de prueba por query param
    const res = http.post('http://localhost:8080/rent?id=buyer-test-1');
    
    // Verificamos que el servidor responda sin caer en error crítico 500
    check(res, { 
        'Servidor activo (no 500)': (r) => r.status !== 500 
    });
    sleep(1);
}

export function handleSummary(data) {
    return { "reporte-1-rent-stock.html": htmlReport(data) };
}

import http from 'k6/http';
import { check, sleep } from 'k6';
import { standardOptions } from '/github/workspace/qa/performance/k6/config/options.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = standardOptions;

export default function () {
    // Endpoint para consultar el catálogo o realizar búsquedas en memoria
    const res = http.get('http://localhost:8080/');
    
    check(res, { 
        'Servidor activo (no 500)': (r) => r.status !== 500 
    });
    sleep(1);
}

export function handleSummary(data) {
    return { "reporte-3-search-local.html": htmlReport(data) };
}

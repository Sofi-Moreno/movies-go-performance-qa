import http from 'k6/http';
import { check, sleep } from 'k6';
// Importamos la configuración estricta de máximo 100 llamadas para cuidar la cuota de OMDb
import { apiLimitedOptions } from '/github/workspace/qa/performance/k6/config/options.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = apiLimitedOptions;

export default function () {
    // Endpoint /addMovie que interactúa con la integración externa y OMDb
    const res = http.post('http://localhost:8080/addMovie');
    
    check(res, { 
        'Servidor activo (no 500)': (r) => r.status !== 500 
    });
    sleep(1);
}

export function handleSummary(data) {
    return { "reporte-4-external-api.html": htmlReport(data) };
}

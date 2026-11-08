import http from 'k6/http';
import { check, sleep } from 'k6';
import { standardOptions } from '../config/options.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = standardOptions;

export default function () {
    // Usamos /returnMovie ya que fuerza la persistencia y recarga de JSON de usuarios y catálogo
    const res = http.post('http://localhost:8080/returnMovie');
    
    check(res, { 
        'Servidor activo (no 500)': (r) => r.status !== 500 
    });
    sleep(1);
}

export function handleSummary(data) {
    return { "reporte-2-persistence.html": htmlReport(data) };
}

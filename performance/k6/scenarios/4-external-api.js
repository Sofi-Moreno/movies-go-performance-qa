import http from 'k6/http';
import { check } from 'k6';

import { apiLimitedOptions } from '../config/standar-configuration.js';

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = apiLimitedOptions;

const BASE_URL = 'http://127.0.0.1:8080';

const MOVIE_ID = 'tt0133093';

function safeJson(response) {
    try {
        return response.json();
    } catch (_) {
        return null;
    }
}

export default function () {

    // 1. Consultar OMDb y agregar la película.
    const response = http.post(
        `${BASE_URL}/addMovie?id=${encodeURIComponent(MOVIE_ID)}&st=1&p=1`
    );

    const body = safeJson(response);

    check(response, {
        'addMovie returns HTTP 2xx': (r) =>
            r.status >= 200 && r.status < 300,

        'OMDb lookup and movie insertion succeed': () =>
            body?.error === false &&
            body?.value === 'Succes',
    });

    // 2. Comprobar que la película quedó almacenada.
    const catalogResponse = http.get(
        `${BASE_URL}/getMovies?id=${encodeURIComponent(MOVIE_ID)}`
    );

    const catalogBody = safeJson(catalogResponse);

    check(catalogResponse, {
        'New movie is persisted in local catalog': (r) =>
            r.status === 200 &&
            catalogBody?.error === false &&
            catalogBody?.value?.imdbID === MOVIE_ID &&
            catalogBody?.value?.stock === '1',
    });
}

export function handleSummary(data) {
    return {
        'reporte-4-external-api.html': htmlReport(data),
    };
}

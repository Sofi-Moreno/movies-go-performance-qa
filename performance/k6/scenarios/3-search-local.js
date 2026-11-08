import http from 'k6/http';
import { check, sleep } from 'k6';

import { standardOptions } from '../config/standar-configuration.js';

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = standardOptions;

const BASE_URL = 'http://127.0.0.1:8080';

const SEARCH = 'Men in Black II';

function safeJson(response) {
    try {
        return response.json();
    } catch (_) {
        return null;
    }
}

export default function () {

    const response = http.get(
        `${BASE_URL}/getMovies?s=${encodeURIComponent(SEARCH)}`
    );

    const body = safeJson(response);

    check(response, {
        'Local search returns HTTP 200': (r) =>
            r.status === 200,

        'Local search has no logical error': () =>
            body?.error === false,

        'Local search returns matching movies': () =>
            Array.isArray(body?.value) &&
            body.value.length > 0 &&
            body.value.some(
                (movie) =>
                    movie.title?.toLowerCase().includes(
                        SEARCH.toLowerCase()
                    )
            ),
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'reporte-3-search-local.html': htmlReport(data),
    };
}

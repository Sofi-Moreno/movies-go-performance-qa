import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

import { statefulOptions } from '../config/standar-configuration.js';

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = statefulOptions;

const BASE_URL = 'http://127.0.0.1:8080';

const MOVIE_ID = 'tt0451279';
const INITIAL_STOCK = 100;

function safeJson(response) {
    try {
        return response.json();
    } catch (_) {
        return null;
    }
}

export default function () {

    const index = exec.scenario.iterationInTest;
    const buyerId = String(9011 + index);

    // 1. Ejecutar devolución.
    const returnResponse = http.post(
        `${BASE_URL}/returnMovie?buyerId=${encodeURIComponent(buyerId)}&movieId=${encodeURIComponent(MOVIE_ID)}`
    );

    const returnBody = safeJson(returnResponse);

    check(returnResponse, {
        'Return returns HTTP 2xx': (r) =>
            r.status >= 200 && r.status < 300,

        'Return reports functional success': () =>
            returnBody?.error === false &&
            returnBody?.value === 'Succes',
    });

    // 2. Comprobar que el alquiler fue eliminado.
    const buyerResponse = http.get(
        `${BASE_URL}/getBuyers?id=${encodeURIComponent(buyerId)}`
    );

    const buyerBody = safeJson(buyerResponse);
    const buyer = buyerBody?.value;

    check(buyerResponse, {
        'Returned rental is removed from buyer': (r) =>
            r.status === 200 &&
            buyerBody?.error === false &&
            Array.isArray(buyer?.rentedMovies) &&
            !buyer.rentedMovies.some(
                (item) => item.movieId === MOVIE_ID
            ),
    });

    // 3. Comprobar que el stock aumentó.
    const movieResponse = http.get(
        `${BASE_URL}/getMovies?id=${encodeURIComponent(MOVIE_ID)}`
    );

    const movieBody = safeJson(movieResponse);

    const expectedStock = String(INITIAL_STOCK + index + 1);

    check(movieResponse, {
        'Returned movie stock increment is persisted': (r) =>
            r.status === 200 &&
            movieBody?.error === false &&
            movieBody?.value?.stock === expectedStock,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'reporte-2-persistence.html': htmlReport(data),
    };
}

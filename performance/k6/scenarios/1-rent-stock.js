import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

import { statefulOptions } from '../config/standar-configuration.js';

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = statefulOptions;

const BASE_URL = 'http://127.0.0.1:8080';

const MOVIE_ID = 'tt0120912';
const INITIAL_STOCK = 12311;

function safeJson(response) {
    try {
        return response.json();
    } catch (_) {
        return null;
    }
}

export default function () {

    const index = exec.scenario.iterationInTest;
    const buyerId = `qa-rent-${index}`;

    // 1. Ejecutar alquiler.
    const rentResponse = http.post(
        `${BASE_URL}/rent?id=${encodeURIComponent(buyerId)}`
    );

    const rentBody = safeJson(rentResponse);

    check(rentResponse, {
        'Rent returns HTTP 2xx': (r) =>
            r.status >= 200 && r.status < 300,

        'Rent reports functional success': () =>
            rentBody?.error === false &&
            rentBody?.value === 'Rent realizado correctamente',
    });

    // 2. Comprobar persistencia del comprador.
    const buyerResponse = http.get(
        `${BASE_URL}/getBuyers?id=${encodeURIComponent(buyerId)}`
    );

    const buyerBody = safeJson(buyerResponse);
    const buyer = buyerBody?.value;

    check(buyerResponse, {
        'Buyer cart is empty and rental is persisted': (r) =>
            r.status === 200 &&
            buyerBody?.error === false &&
            buyer?.cart?.movies?.length === 0 &&
            buyer?.rentedMovies?.some(
                (item) => item.movieId === MOVIE_ID
            ),
    });

    // 3. Comprobar disminución del stock.
    const movieResponse = http.get(
        `${BASE_URL}/getMovies?id=${encodeURIComponent(MOVIE_ID)}`
    );

    const movieBody = safeJson(movieResponse);

    const expectedStock = String(INITIAL_STOCK - index - 1);

    check(movieResponse, {
        'Movie stock decrement is persisted': (r) =>
            r.status === 200 &&
            movieBody?.error === false &&
            movieBody?.value?.stock === expectedStock,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'reporte-1-rent-stock.html': htmlReport(data),
    };
}

import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[3]

JSON_DIR = (
    WORKSPACE
    / "movies-go"
    / "Back/src/main/java/com/backend/moviesgo/json"
)

BUYERS_PATH = JSON_DIR / "buyers.json"
MOVIES_PATH = JSON_DIR / "movies.json"

RENT_ITERATIONS = 10

RENT_BUYER_PREFIX = 9000000000
RETURN_BUYER_PREFIX = 9100000000

OLD_QA_PREFIXES = ("qa-rent-", "qa-return-")

RENT_MOVIE_ID = "tt0120912"
RETURN_MOVIE_ID = "tt0451279"

RENT_INITIAL_STOCK = "12311"
RETURN_INITIAL_STOCK = "100"


def load_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path, data):
    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")


def create_rental(buyer_id, movie):
    return {
        "buyerId": buyer_id,
        "movieTitle": movie["title"],
        "movieId": movie["imdbID"],
        "startDate": "Sun Nov 08 2026",
        "endDate": "Tue Nov 10 2026",
        "price": "1",
        "days": "2",
    }


def create_buyer(buyer_id, rented_movies):
    return {
        "id": buyer_id,
        "name": "QA Performance Test",
        "email": f"{buyer_id}@example.invalid",
        "password": "qa-fixture",
        "address": "QA Test Address",
        "phone": "0",
        "cart": {
            "movies": []
        },
        "rentedMovies": rented_movies,
    }


def main():
    if not BUYERS_PATH.exists():
        raise SystemExit(f"Buyers file not found: {BUYERS_PATH}")

    if not MOVIES_PATH.exists():
        raise SystemExit(f"Movies file not found: {MOVIES_PATH}")

    buyers = load_json(BUYERS_PATH)
    movies = load_json(MOVIES_PATH)

    if not isinstance(buyers, list) or not isinstance(movies, list):
        raise SystemExit("Invalid JSON structure")

    rent_movie = next(
        (movie for movie in movies
         if movie.get("imdbID") == RENT_MOVIE_ID),
        None
    )

    return_movie = next(
        (movie for movie in movies
         if movie.get("imdbID") == RETURN_MOVIE_ID),
        None
    )

    if rent_movie is None:
        raise SystemExit(f"Movie {RENT_MOVIE_ID} not found")

    if return_movie is None:
        raise SystemExit(f"Movie {RETURN_MOVIE_ID} not found")

    # Restablecer los stocks iniciales.
    rent_movie["stock"] = RENT_INITIAL_STOCK
    return_movie["stock"] = RETURN_INITIAL_STOCK

    # Eliminar fixtures anteriores, incluyendo los alfanuméricos
    # creados por la versión anterior del script.
    buyers = [
        buyer for buyer in buyers
        if not str(buyer.get("id", "")).startswith(
            OLD_QA_PREFIXES
            + (
                str(RENT_BUYER_PREFIX),
                str(RETURN_BUYER_PREFIX),
            )
        )
    ]

    # Preparar compradores para alquiler.
    for index in range(RENT_ITERATIONS):
        buyer_id = str(RENT_BUYER_PREFIX + index)

        rental = create_rental(buyer_id, rent_movie)

        buyer = create_buyer(
            buyer_id,
            rented_movies=[]
        )

        buyer["cart"]["movies"] = [rental]
        buyers.append(buyer)

    # Preparar compradores para devolución.
    for index in range(RENT_ITERATIONS):
        buyer_id = str(RETURN_BUYER_PREFIX + index)

        rental = create_rental(buyer_id, return_movie)

        buyer = create_buyer(
            buyer_id,
            rented_movies=[rental]
        )

        buyers.append(buyer)

    save_json(BUYERS_PATH, buyers)
    save_json(MOVIES_PATH, movies)

    print("QA fixtures prepared successfully.")
    print("Rent buyer IDs: 9000000000 - 9000000009")
    print("Return buyer IDs: 9100000000 - 9100000009")
    print(f"Rent movie stock: {RENT_INITIAL_STOCK}")
    print(f"Return movie stock: {RETURN_INITIAL_STOCK}")


if __name__ == "__main__":
    main()

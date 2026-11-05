
from pathlib import Path

import requests
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"

API_URL = "https://www.cbr-xml-daily.ru/daily_json.js"

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)


@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/api/currencies")
def get_currencies():
    try:
        response = requests.get(API_URL, timeout=10)
        response.raise_for_status()

        data = response.json()

        currencies = []

        currencies.append({
            "code": "RUB",
            "name": "Российский рубль",
            "nominal": 1,
            "value": 1,
            "previous": 1
        })

        for code, currency in data["Valute"].items():
            nominal = currency["Nominal"]

            currencies.append({
                "code": code,
                "name": currency["Name"],
                "nominal": nominal,
                "value": currency["Value"] / nominal,
                "previous": currency["Previous"] / nominal
            })

        return {
            "date": data["Date"],
            "currencies": currencies
        }

    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Не удалось получить курсы валют"
        )

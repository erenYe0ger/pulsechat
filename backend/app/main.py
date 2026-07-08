from fastapi import FastAPI

from app.db.init_db import create_tables

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/health")
def health_check():
    return {"status": "ok"}

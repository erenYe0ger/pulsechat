from fastapi import FastAPI

from app.db.init_db import create_tables
from app.routes.auth import router as auth_router
from app.routes.conversations import router as conversations_router
from app.routes.users import router as users_router
from app.routes.websocket import router as websocket_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(users_router)
app.include_router(websocket_router)


@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/health")
def health_check():
    return {"status": "ok"}

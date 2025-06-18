from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from tortoise.contrib.fastapi import register_tortoise
from contextlib import asynccontextmanager
from utils.check_path import check_paths
import uvicorn
import config
from db import init_db
from routes import tests_route as tests_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up...")
    await init_db()
    yield
    print("🛑 Shutting down...")

app = FastAPI(lifespan=lifespan)
app.include_router(tests_routes.router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Tortoise ORM
register_tortoise(
    app,
    db_url=f"sqlite://{config.database_location}/{config.database_name}?check_same_thread=False",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

@app.get("/", include_in_schema=False)
async def index():
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    check_paths()
    uvicorn.run("main:app", host=config.server_address, port=config.server_port, reload=False)
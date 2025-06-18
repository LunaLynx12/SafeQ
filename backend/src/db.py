from tortoise import Tortoise
import config
from pathlib import Path

DATABASE_URL = f"sqlite://{Path(config.database_location)}/{config.database_name}?check_same_thread=False"

async def init_db():
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={"models": ["models"]}
    )
    await Tortoise.generate_schemas()
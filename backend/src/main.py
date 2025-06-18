from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi import FastAPI
import uvicorn
import config


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
async def index():
    """
    Root endpoint that redirects users to the API documentation page.

    return: RedirectResponse to /docs
    """
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    """
    Entry point for running the FastAPI application using Uvicorn.

    Starts the development server on localhost port 8000 with reload enabled.
    """

    uvicorn.run("main:app", host=config.server_address, port=config.server_port, reload=False)
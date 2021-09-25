from fastapi import FastAPI,APIRouter

app = FastAPI()

api = APIRouter()

@api.get("/")
async def get_api_root():
    return {"error": False, "data": {"message": "Hello, world!"}}

app.include_router(api,prefix="/api")

@app.get("/")
def get_root():
    return "Wsssup?"

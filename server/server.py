import sqlite3
from fastapi import FastAPI,APIRouter
from fastapi.responses import RedirectResponse

not_sus_website = "https://wikipedia.org/"

db = sqlite3.connect("datameridian.db")
cursor = db.cursor()

app = FastAPI()

api = APIRouter()

@api.get("/")
async def get_api_root():
    return {"error": False, "data": {"message": "Hello, world!"}}

@api.get("/url-aliases")
async def get_url_aliases():
    try:
        aliases = []
        for alias in cursor.execute("SELECT * FROM url_aliases ORDER BY created_at"):
            # print(alias)
            aliases.append({
                "id": alias[0],
                "slug": alias[1],
                "cannoncial_url": alias[2],
                "meta": {
                    "title": alias[3],
                    "description": alias[4],
                    "colour": alias[5],
                },
                "uses": alias[6],
                "created": alias[7]
            })

            return {"error": False, "data": aliases}

    except Exception:
        return {"error": True}

app.include_router(api,prefix="/api")

@app.get("/")
def get_root():
    return "Wsssup?"

@app.get("/a/{slug}")
async def go_to_alias(slug: str):
    try:
        cursor.execute("SELECT * FROM url_aliases WHERE alias_slug=:slug", {"slug": slug})
        alias = cursor.fetchone()
        if (alias):
            cursor.execute("UPDATE url_aliases SET uses=:updated_uses WHERE id=:id", {"id": alias[0], "updated_uses": alias[6]+1})
            db.commit()
            return RedirectResponse(alias[2])
        else:
            return RedirectResponse(not_sus_website)
    except Exception as e:
        print(e)
        return RedirectResponse(not_sus_website)

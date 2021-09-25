import sqlite3
from fastapi import FastAPI, APIRouter, Body
from fastapi.responses import RedirectResponse
from typing import Optional
from pydantic import BaseModel
import time

class NewURLAlias(BaseModel):
	slug: str
	canonical_url: str
	meta_title: Optional[str]
	meta_description: Optional[str]
	meta_colour: Optional[str]

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
				"canonical_url": alias[2],
				"meta": {
					"title": alias[3],
					"description": alias[4],
					"colour": alias[5],
				},
				"created": alias[6],
				"uses": alias[7]
			})

		return {"error": False, "data": aliases}

	except Exception:
		return {"error": True}

@api.post("/url-aliases")
async def create_url_alias(alias: NewURLAlias):
	try:
		cursor.execute("""INSERT INTO url_aliases
		(alias_slug, canonical_url, created_at, uses, meta_title, meta_description, meta_colour)
		values (:slug, :canonical_url, :created_at, :uses, :meta_title, :meta_description, :meta_colour)""",
			{"slug": alias.slug, "canonical_url": alias.canonical_url, "created_at": time.time(), "uses": 0, "meta_title": alias.meta_title,
				"meta_description": alias.meta_description, "meta_colour": alias.meta_colour})
		db.commit()
		return {"error": False}
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
		# print(alias)
		if (alias):
			cursor.execute("UPDATE url_aliases SET uses=:updated_uses WHERE id=:id", {"updated_uses": alias[7]+1, "id": alias[0]})
			db.commit()
			return RedirectResponse(alias[2])
		else:
			return RedirectResponse(not_sus_website)
	except Exception as e:
		print(e)
		return RedirectResponse(not_sus_website)

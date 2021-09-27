import sqlite3
from fastapi import FastAPI, APIRouter, Request, Response, status
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, Union, Tuple
from pydantic import BaseModel
import time
import re
import secrets

class NewURLAlias(BaseModel):
	slug: str
	canonical_url: str
	meta_title: Optional[str]
	meta_description: Optional[str]
	meta_colour: Optional[str]

class NewTokenData(BaseModel):
	username: str
class NewToken(BaseModel):
	mode: str
	data: NewTokenData

not_sus_website = "https://wikipedia.org/"

tokens = []

async def get_clearance_level(req: Request, returnToken = False) -> Union[int, Tuple[int, str]]:
	if req.headers["X-Clearance"]:
		clearance = req.headers["X-Clearance"]
		level_1_auth_regex = re.compile("^(?:Nerd|Peasant)\. No (?:doumentation|papers) found\.(?: Reccomended treatment: .+\.)*$")
		level_3_auth_regex = re.compile("^(?:Gigachad|Absolute lad)\. Proof: (.+)\.$")

		level_3_auth_regex_match = level_3_auth_regex.match(clearance)
		if level_3_auth_regex_match is not None:
			for token in tokens:
				if token["actual_token"] == level_3_auth_regex_match.group(1):
					if token["expires_at"] > time.time():
						if returnToken == True:
							return (3, token["actual_token"])
						return 3
					else:
						tokens.remove(token)
		elif level_1_auth_regex.match(clearance) is not None:
			return 1
	return 0

db = sqlite3.connect("datameridian.db")
cursor = db.cursor()

templates = Jinja2Templates(directory="templates")

app = FastAPI()

api = APIRouter()

@api.post("/auth/please-give-me-a-token-pretty-please")
async def get_auth_token(request: Request, response: Response, body: NewToken):
	level = await get_clearance_level(request)
	if level < 1:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have the clearance to even get a token lmao."}
	token = secrets.token_urlsafe(69)
	token_expires_at = time.time() + 60 * 60
	tokens.append({"actual_token": token, "expires_at": token_expires_at})
	return {"error": False, "data": {"your_shiny_new_token": token, "that_expires_at_this_unix_timestamp": token_expires_at, "username": body.data.username }}

@api.delete("/auth/please-revoke-my-clearance")
async def logout(request: Request, response: Response):
	level = await get_clearance_level(request, returnToken=True)
	print(level)
	if isinstance(level, tuple):
		level, actualToken = level
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You cant't revoke your clearance if you don't have any to begin with."}
	if actualToken:
		for token in tokens:
			if token["actual_token"] == actualToken:
				tokens.remove(token)
				return {"error": False}
	return {"error": True, "detail": "Token not found. This should never happen."}

@api.get("/url-aliases")
async def get_all_url_aliases(request: Request, response: Response):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to get information about all the url aliases."}
	try:
		aliases = []
		for alias in cursor.execute("SELECT * FROM url_aliases ORDER BY uses DESC"):
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

@api.get("/url-aliases/{slug}")
async def get_url_alias(request: Request, response: Response, slug: str):
	level = await get_clearance_level(request)
	if level < 1:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to get information on a url alias."}
	try:
		cursor.execute("SELECT * FROM url_aliases WHERE slug=:slug", {"slug": slug})
		alias = cursor.fetchone()
		return {"error": False, "data": {
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
		}}
	except Exception:
		return {"error": True}

@api.post("/url-aliases")
async def create_url_alias(request: Request, response: Response, alias: NewURLAlias):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create url aliases."}
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

@api.patch("/url-aliases/{id}")
async def update_url_alias(request: Request, response: Response, alias: NewURLAlias, id: int):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to edit url aliases."}
	try:
		cursor.execute("""UPDATE url_aliases SET 
		alias_slug=:slug, canonical_url=:canonical_url, meta_title=:meta_title, meta_description=:meta_description, meta_colour=:meta_colour
		WHERE id=:id""",
			{"slug": alias.slug, "canonical_url": alias.canonical_url, "meta_title": alias.meta_title,
				"meta_description": alias.meta_description, "meta_colour": alias.meta_colour, "id": id})
		db.commit()
		return {"error": False}
	except Exception:
		return {"error": True}

@api.delete("/url-aliases/{slug}")
async def delete_url_alias(request: Request, response: Response, slug: str):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to delete url aliases."}
	try:
		cursor.execute("DELETE FROM url_aliases WHERE alias_slug=:slug", {"slug": slug})
		db.commit()
		return {"error": False}
	except Exception as e:
		# print(e)
		return {"error": True}

app.include_router(api,prefix="/api")

@app.get("/a/{slug}", response_class=HTMLResponse)
async def go_to_alias(request: Request, slug: str):
	try:
		cursor.execute("SELECT * FROM url_aliases WHERE alias_slug=:slug", {"slug": slug})
		alias = cursor.fetchone()
		# print(alias)
		if (alias):
			cursor.execute("UPDATE url_aliases SET uses=:updated_uses WHERE id=:id", {"updated_uses": alias[7]+1, "id": alias[0]})
			db.commit()
			
			# TODO: Add something that takes the user agent and determines wether to
			#  do a http redirect (fast, for humans) or a meta redirect with a delay of 
			#  a couple of seconds (slow, for bots that generate previews).

			# return RedirectResponse(alias[2])
			return templates.TemplateResponse("alias.html", {"request": request, "url": alias[2], "title": alias[3], "description": alias[4], "colour": alias[5]},
			headers={"Location": alias[2]})
		else:
			return RedirectResponse(not_sus_website)
	except Exception as e:
		# print(e)
		return RedirectResponse(not_sus_website)

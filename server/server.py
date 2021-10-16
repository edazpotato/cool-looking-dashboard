from fastapi import FastAPI, APIRouter, Request, Response, status
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import Optional, Union, Tuple
from pydantic import BaseModel
import secrets
import sqlite3
import time
import math
import re
import os

print("Make sure to run this using the scripts, not directly with python!")

def db_safe_current_time() -> int:
	return math.floor(time.time()*1000)

not_sus_website = "https://wikipedia.org/"

tokens = []

db = sqlite3.connect("db/datameridian.db")
cursor = db.cursor()

templates = Jinja2Templates(directory="templates")

app = FastAPI()
api = APIRouter()

# Important stuff for CORP so that the frontend can use SharedArrayBuffer
@app.middleware("http")
async def add_corp_headers(request: Request, call_next):
	response = await call_next(request)
	response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
	response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
	return response

# Auth

async def get_clearance_level(req: Request, returnToken = False) -> Union[int, Tuple[int, str]]:
	if "X-Clearance" in req.headers:
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

class NewTokenData(BaseModel):
	username: str
class NewToken(BaseModel):
	mode: str
	data: NewTokenData

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


# URL ALiases

class URLAlias(BaseModel):
	slug: str
	canonical_url: str
	meta_title: Optional[str]
	meta_description: Optional[str]
	meta_colour: Optional[str]

@api.get("/url-aliases")
async def get_all_url_aliases(request: Request, response: Response):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to get information about all the url aliases."}
	try:
		aliases = []
		db_aliases = cursor.execute("SELECT * FROM url_aliases ORDER BY uses DESC").fetchall()
		for alias in db_aliases:
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
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.get("/url-aliases/{slug}")
async def get_url_alias(request: Request, response: Response, slug: str):
	level = await get_clearance_level(request)
	if level < 3:
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
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.post("/url-aliases")
async def create_url_alias(request: Request, response: Response, alias: URLAlias):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create url aliases."}
	try:
		cursor.execute("""INSERT INTO url_aliases
		(alias_slug, canonical_url, created_at, uses, meta_title, meta_description, meta_colour, updated_at)
		values (:slug, :canonical_url, :created_at, :uses, :meta_title, :meta_description, :meta_colour, :updated_at)""",
			{"slug": alias.slug, "canonical_url": alias.canonical_url, "created_at": db_safe_current_time(), "uses": 0, "meta_title": alias.meta_title,
				"meta_description": alias.meta_description, "meta_colour": alias.meta_colour, "updated_at": db_safe_current_time()})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.patch("/url-aliases/{id}")
async def update_url_alias(request: Request, response: Response, alias: URLAlias, id: int):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to edit url aliases."}
	try:
		cursor.execute("""UPDATE url_aliases SET 
		alias_slug=:slug, canonical_url=:canonical_url, meta_title=:meta_title, meta_description=:meta_description, meta_colour=:meta_colour, updated_at=:updated_at
		WHERE id=:id""",
			{"slug": alias.slug, "canonical_url": alias.canonical_url, "meta_title": alias.meta_title, "meta_description": alias.meta_description, "meta_colour": alias.meta_colour, "updated_at": db_safe_current_time(), "id": id})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

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
		print(e)
		return {"error": True, "detail": str(e)}

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
		print(e)
		#return {"error": True, "detail": str(e)}
		return RedirectResponse(not_sus_website)

# Todo lists

class TodoList(BaseModel):
	title: str

class TodoListItem(BaseModel):
	completed: bool
	content: str

@api.post("/todos")
async def create_todo_list(request: Request, response: Response, todo_list: TodoList):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create new todo lists."}
	try:
		cursor.execute("""INSERT INTO todo_lists
		(title, created_at, updated_at)
		values (:title, :created_at, :updated_at)""",
			{"title": todo_list.title, "created_at": db_safe_current_time(), "updated_at": db_safe_current_time()})
		db.commit()
		cursor.execute("SELECT MAX(id) FROM todo_lists")
		new_todo_list = cursor.fetchone()
		return {"error": False, "data": {"id": new_todo_list[0]}}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.get("/todos")
async def get_all_todo_lists(request: Request, response: Response):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to get all the todo lists."}
	try:
		todo_lists = []
		db_todo_lists = cursor.execute("SELECT * FROM todo_lists ORDER BY created_at ASC").fetchall()
		for todo_list in db_todo_lists:
			todo_items = []
			db_todo_items = cursor.execute("SELECT * FROM todo_items WHERE todo_list_id=:todo_list_id ORDER BY added_at ASC", {"todo_list_id": todo_list[0]}).fetchall()
			for todo_item in db_todo_items:
				todo_items.append({
					"id": todo_item[0],
					"is_completed": True if todo_item[1] == 1 else False,
					"completed": todo_item[5],
					"content": todo_item[2],
					"added": todo_item[4],
					"updated": todo_item[5]
				})
			
			todo_lists.append({
				"id": todo_list[0],
				"title": todo_list[1],
				"created": todo_list[2],
				"updated": todo_list[3],
				"todos": todo_items
			})

		return {"error": False, "data": todo_lists}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.patch("/todos/{todo_list_id}")
async def edit_todo_list(request: Request, response: Response, todo_list: TodoList, todo_list_id: str):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to edit todo lists."}
	try:
		cursor.execute("""UPDATE todo_lists SET 
		title=:title, updated_at=:updated_at
		WHERE id=:todo_list_id""",
			{"title": todo_list.title, "updated_at": db_safe_current_time(), "todo_list_id": todo_list_id})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.delete("/todos/{todo_list_id}")
async def delete_url_alias(request: Request, response: Response, todo_list_id: str):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to delete todo lists."}
	try:
		cursor.execute("DELETE FROM todo_items WHERE todo_list_id=:todo_list_id", {"todo_list_id": todo_list_id})
		cursor.execute("DELETE FROM todo_lists WHERE id=:todo_list_id", {"todo_list_id": todo_list_id})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.post("/todos/{todo_list_id}")
async def add_todo_list_item(request: Request, response: Response, todo_list_id: str, todo_item: TodoListItem):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create new todo list items."}
	try:
		completed_at = ""
		if todo_item.completed:
			completed_at = db_safe_current_time()
		cursor.execute("""INSERT INTO todo_items
		(todo_list_id, completed, content, added_at, completed_at, updated_at)
		values (:todo_list_id, :is_completed, :content, :added, :completed, :updated_at)""",
		{"todo_list_id": todo_list_id, "is_completed": 1 if todo_item.completed else 0, "content": todo_item.content, "added": db_safe_current_time(), "completed": completed_at, "updated_at": db_safe_current_time()})
		db.commit()
		cursor.execute("SELECT MAX(id) FROM todo_items")
		new_todo_item = cursor.fetchone()
		return {"error": False, "data": {"id": new_todo_item[0]}}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

# Todo items
@api.patch("/todos/{todo_list_id}/{todo_item_id}")
async def edit_todo_list_item(request: Request, response: Response, todo_list_id: str, todo_item_id: str, todo_item: TodoListItem):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to edit todo list items."}
	try:
		completed_at = ""
		if todo_item.completed:
			completed_at = db_safe_current_time()
		cursor.execute("""UPDATE todo_items SET 
		content=:content, completed=:is_completed, completed_at=:completed_at, updated_at=:updated_at
		WHERE todo_list_id=:todo_list_id AND id=:todo_item_id""",
			{"todo_list_id": todo_list_id, "todo_item_id": todo_item_id, "content": todo_item.content, "is_completed": 1 if todo_item.completed else 0, "completed_at": completed_at, "updated_at": db_safe_current_time()})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.delete("/todos/{todo_list_id}/{todo_item_id}")
async def delete_url_alias(request: Request, response: Response, todo_list_id: str, todo_item_id: str):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to delete todo list items."}
	try:
		cursor.execute("DELETE FROM todo_items WHERE todo_list_id=:todo_list_id AND id=:todo_item_id",
		{"todo_list_id": todo_list_id, "todo_item_id": todo_item_id})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

# Notes
class Note(BaseModel):
	title: str
	content: str

@api.get("/notes")
async def get_all_notes(request: Request, response: Response):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to get all the notes."}
	try:
		notes = []
		db_notes = cursor.execute("SELECT * FROM notes ORDER BY created_at ASC").fetchall()
		for note in db_notes:
			# print(alias)
			notes.append({
				"id": note[0],
				"title": note[1],
				"content": note[2],
				"created": note[3],
				"updated": note[4]
			})
		return {"error": False, "data": notes}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.post("/notes")
async def create_new_note(request: Request, response: Response, note: Note):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create a new note."}
	try:
		cursor.execute("""INSERT INTO notes (title, content, created_at, updated_at)
									VALUES (:title, :content, :created, :updated)""",
									{"title": note.title, "content": note.content, "created": db_safe_current_time(), "updated": db_safe_current_time()})
		db.commit()
		id = cursor.execute("SELECT MAX(id) FROM todo_lists").fetchone()
		return {"error": False, "data": {"id": id}}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.patch("/notes/{id}")
async def edit_note(request: Request, response: Response, id: str, note: Note):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create a new note."}
	try:
		
		cursor.execute("UPDATE notes SET title=:title, content=:content, updated_at=:updated_at WHERE id=:id",
					{"title":note.title, "content": note.content, "updated_at": db_safe_current_time(), "id": id})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.delete("/notes/{id}")
async def delete_note(request: Request, response: Response, id: str):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create a new note."}
	try:
		cursor.execute("DELETE FROM notes WHERE id=:id", {"id": id})
		db.commit()
		return {"error": False}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

# Boards!!

class Board(BaseModel):
	title: str

@api.get("/boards")
async def get_list_of_boards(request: Request, response: Response):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to get a list of the boards."}
	try:
		boards = []
		db_boards = cursor.execute("SELECT * FROM boards ORDER BY created_at ASC").fetchall()
		for board in db_boards:
			# print(board)
			board_id = board[0]
			boards.append({
				"id": board_id,
				"title": board[1],
				"created": board[2],
				"updated": board[3],
				
			})
		return {"error": False, "data": boards}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

@api.post("/boards")
async def create_new_boards(request: Request, response: Response, board: Board):
	level = await get_clearance_level(request)
	if level < 3:
		response.status_code = status.HTTP_406_NOT_ACCEPTABLE
		return {"error": True, "detail": "You don't have clearance to create new boards."}
	try:
		cursor.execute("""INSERT INTO boards (title, created_at, updated_at)
									VALUES (:title, :created, :updated)""",
									{"title": board.title, "created": db_safe_current_time(), "updated": db_safe_current_time()})
		db.commit()
		id = cursor.execute("SELECT MAX(id) FROM boards").fetchone()[0]
		return {"error": False, "data": {"id": id}}
	except Exception as e:
		print(e)
		return {"error": True, "detail": str(e)}

# Other setup

app.include_router(api, prefix="/api")

# Static files
# These should only be served in production mode in order to avoid... issues...
if "ENVIRONMENT" in os.environ and os.environ["ENVIRONMENT"] != "development":
	# Make the base route return index.html
	html_index_file = open(os.path.join("..", "pwa", "build", "index.html")).read()
	@app.get("/", response_class=HTMLResponse)
	def root():
		return html_index_file

	app.mount("/", StaticFiles(directory="../pwa/build"), name="static")

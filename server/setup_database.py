import sqlite3
import os

db_path = "db"

if (not os.path.exists(db_path)):
	os.makedirs(db_path)

db = sqlite3.connect(f"{db_path}/datameridian.db")
cursor = db.cursor()

try:
	cursor.execute("""
	CREATE TABLE "url_aliases" (
		"id"	INTEGER NOT NULL UNIQUE,
		"alias_slug"	TEXT NOT NULL UNIQUE,
		"canonical_url"	TEXT NOT NULL,
		"meta_title"	TEXT,
		"meta_description"	TEXT,
		"meta_colour"	TEXT,
		"created_at"	INTEGER NOT NULL,
		"uses"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT)
	);
	""")
	db.commit()
	print("Created url_aliases table")
except Exception as e:
	print(f"Exception occured: {e}")

try:
	cursor.execute("""
	CREATE TABLE "notes" (
		"id"	INTEGER NOT NULL UNIQUE,
		"title"	TEXT NOT NULL,
		"content"	TEXT,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT)
	);
	""")
	db.commit()
	print("Created notes table")
except Exception as e:
	print(f"Exception occured: {e}")

try:
	cursor.execute("""
	CREATE TABLE "todo_lists" (
		"id"	INTEGER NOT NULL UNIQUE,
		"title"	TEXT NOT NULL,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT)
	);
	""")
	db.commit()
	print("Created todo_lists table")
except Exception as e:
	print(f"Exception occured: {e}")

try:
	cursor.execute("""
	CREATE TABLE "todo_items" (
		"id"	INTEGER NOT NULL UNIQUE,
		"completed"	TEXT NOT NULL,
		"content"	INTEGER NOT NULL,
		"todo_list_id"	INTEGER NOT NULL,
		"added_at"	INTEGER NOT NULL,
		"completed_at"	INTEGER,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT),
		FOREIGN KEY("todo_list_id") REFERENCES "todo_lists"("id")
	);
	""")
	db.commit()
	print("Created todo_items table")
except Exception as e:
	print(f"Exception occured: {e}")

db.close()
exit()
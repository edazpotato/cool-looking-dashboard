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
		PRIMARY KEY("id" AUTOINCREMENT)
	);
	""")
	db.commit()
except Exception as e:
	print(f"Exception occured: {e}")

# for alias in cursor.execute("SELECT * FROM url_aliases ORDER BY created_at"):
# 	print(alias)

exit()
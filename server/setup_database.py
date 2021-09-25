import sqlite3

db = sqlite3.connect("datameridian.db")
cursor = db.cursor()

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

# for alias in cursor.execute("SELECT * FROM url_aliases ORDER BY created_at"):
# 	print(alias)

exit()
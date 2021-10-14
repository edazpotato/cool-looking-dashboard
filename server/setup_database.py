# This script is used for setting up tables in the database,
#   and also for refenceing column names / indexes.

import sqlite3
import os

# Ensure that the directory that houses the database exists.
db_path = "db"
if (not os.path.exists(db_path)):
	os.makedirs(db_path)

# Connect to the database and get a cursor that can be used 
#   to execute SQL queries.
db = sqlite3.connect(f"{db_path}/datameridian.db")
cursor = db.cursor()

# Below is the code that generates all the tables in the database.
# Each table is in it's own try/except block so that one query
#   failing won't cause the other to fail.
# The induviual queries are expected to fail if they have already
#   been created in the database.

###############
# URL ALiases
###############

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

###############
# Notes
# 	These will be used in the Kanban board system,
# 	  in adition to being used in their own section of
# 	  the dashboard.
###############

try:
	cursor.execute("""
	CREATE TABLE "notes" (
		"id"	INTEGER NOT NULL UNIQUE,
		"title"	TEXT NOT NULL,
		"content"	TEXT NOT NULL,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT)
	);
	""")
	db.commit()
	print("Created notes table")
except Exception as e:
	print(f"Exception occured: {e}")
###############
# Todo lists
# 	These will be used in the Kanban board system,
# 	  in adition to being used in their own section of
# 	  the dashboard.
###############

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
		"completed"	INTEGER NOT NULL,
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
###############
# Boards
# 	The fabled Kanban board system!
# 	This series of tables enables a system of "boards",
# 	  each consisting of several columns ("categories"),
# 	  which are filled with cards ("items") that can
#	  have todo-lists or notes (see above tables)
# 	  attached to them to add more information and can also
#	  be given "tags" (which have a colour and a name) to
# 	  help with sorting.
#
#   The naming, which may seem strange at first, is to 
#	  enable these same tables and posibly the same python
# 	  code to be used for a Gantt Chart system.
###############

try:
	cursor.execute("""
	CREATE TABLE "boards" (
		"id"	INTEGER NOT NULL UNIQUE,
		"title"	TEXT NOT NULL,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT)
	);
	""")
	db.commit()
	print("Created boards table")
except Exception as e:
	print(f"Exception occured: {e}")

try:
	cursor.execute("""
	CREATE TABLE "board_categories" (
		"id"	INTEGER NOT NULL UNIQUE,
		"title"	TEXT NOT NULL,
		"order"	INTEGER NOT NULL UNIQUE,
		"board_id"	INTEGER NOT NULL,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("order"),
		FOREIGN KEY("board_id") REFERENCES "boards"("id")
	);
	""")
	db.commit()
	print("Created board_categories table")
except Exception as e:
	print(f"Exception occured: {e}")

# These board items have start-dates and end-dates
#   because eventually they'll also be tasks on
#   Gannt Charts.
try:
	cursor.execute("""
	CREATE TABLE "board_items" (
		"id"	INTEGER NOT NULL UNIQUE,
		"title"	TEXT NOT NULL,
		"start_at"	INTEGER NOT NULL,
		"end_at"	INTEGER NOT NULL,
		"board_category_id"	INTEGER NOT NULL,
		"note_id"	INTEGER,
		"todo_list_id"	INTEGER,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT),
		FOREIGN KEY("board_category_id") REFERENCES "board_categories"("id"),
		FOREIGN KEY("note_id") REFERENCES "notes"("id"),
		FOREIGN KEY("todo_list_id") REFERENCES "todo_lists"("id")
	);
	""")
	db.commit()
	print("Created board_items table")
except Exception as e:
	print(f"Exception occured: {e}")

try:
	cursor.execute("""
	CREATE TABLE "board_tags" (
		"id"	INTEGER NOT NULL UNIQUE,
		"content"	TEXT NOT NULL,
		"colour"	TEXT NOT NULL,
		"board_id"	INTEGER NOT NULL,
		"created_at"	INTEGER NOT NULL,
		"updated_at"	INTEGER NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT),
		FOREIGN KEY("board_id") REFERENCES "boards"("id")
	);
	""")
	db.commit()
	print("Created board_tags table")
except Exception as e:
	print(f"Exception occured: {e}")

# This extra table is to model the many-to-many relationship between
# 	board items and the tags attached to them.
# Each tag can be attached to multiple board items, and each board
# 	item can have multiple tags attached to it.
try:
	cursor.execute("""
	CREATE TABLE "board_items_tags_link" (
		"board_item_id"	INTEGER NOT NULL,
		"board_tag_id"	INTEGER NOT NULL,
		FOREIGN KEY("board_tag_id") REFERENCES "board_tags"("id"),
		FOREIGN KEY("board_item_id") REFERENCES "board_items"("id"),
		PRIMARY KEY("board_tag_id","board_item_id")
	);
	""")
	db.commit()
	print("Created board_items_tags_link table")
except Exception as e:
	print(f"Exception occured: {e}")

# Close the database connection.
db.close()
exit()
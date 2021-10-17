from typing import TypedDict, Optional, List
from sqlite3 import Connection
import math
import time

IdType = str | int

URLAliasType = TypedDict(
    "URLAlias",
    {
        "id": IdType,
        "slug": str,
        "canonical_url": str,
        "created": int,
        "uses": int,
        "meta": TypedDict(
            "meta",
            {
                "title": Optional[str],
                "description": Optional[str],
                "colour": Optional[str],
            },
        ),
    },
)

TodoItemType = TypedDict(
    "TodoItemType",
    {
        "id": IdType,
        "is_completed": bool,
        "completed": int,
        "content": str,
        "added": int,
        "updated": int,
    },
)

TodoListType = TypedDict(
    "TodoListType",
    {
        "id": IdType,
        "title": str,
        "created": int,
        "updated": int,
        "todos": list[TodoItemType],
    },
)


class DatabaseHandler:
    def __init__(self, db: Connection) -> None:
        self.db = db
        self.cursor = db.cursor()

    def commit(self) -> None:
        self.db.commit()

    def get_safe_time() -> int:
        return math.floor(time.time() * 1000)

    async def get_url_aliases(self) -> List[URLAliasType]:
        aliases = []
        db_aliases = self.cursor.execute(
            "SELECT * FROM url_aliases ORDER BY uses DESC"
        ).fetchall()
        for alias in db_aliases:
            aliases.append(
                {
                    "id": alias[0],
                    "slug": alias[1],
                    "canonical_url": alias[2],
                    "meta": {
                        "title": alias[3],
                        "description": alias[4],
                        "colour": alias[5],
                    },
                    "created": alias[6],
                    "uses": alias[7],
                }
            )
        return aliases

    async def create_url_alias(
        self,
        slug: str,
        canonical_url: str,
        meta_title: Optional[str],
        meta_description: Optional[str],
        meta_colour: Optional[str],
    ) -> IdType:
        self.cursor.execute(
            """INSERT INTO url_aliases
		(alias_slug, canonical_url, created_at, uses, meta_title, meta_description, meta_colour, updated_at)
		values (:slug, :canonical_url, :created_at, :uses, :meta_title, :meta_description, :meta_colour, :updated_at)""",
            {
                "slug": slug,
                "canonical_url": canonical_url,
                "uses": 0,
                "meta_title": meta_title,
                "meta_description": meta_description,
                "meta_colour": meta_colour,
                "created_at": self.get_safe_time(),
                "updated_at": self.get_safe_time(),
            },
        )
        self.commit()
        id = self.cursor.execute("SELECT MAX(id) FROM url_aliases").fetchone()[0]
        return id

    async def get_url_alias_by_id(self, id: IdType) -> URLAliasType:
        self.cursor.execute("SELECT * FROM url_aliases WHERE id=:id", {"id": id})
        alias = self.cursor.fetchone()
        return {
            "id": alias[0],
            "slug": alias[1],
            "canonical_url": alias[2],
            "meta": {
                "title": alias[3],
                "description": alias[4],
                "colour": alias[5],
            },
            "created": alias[6],
            "uses": alias[7],
        }

    async def get_url_alias_by_slug(self, slug: str) -> URLAliasType:
        self.cursor.execute(
            "SELECT * FROM url_aliases WHERE slug=:slug", {"slug": slug}
        )
        alias = self.cursor.fetchone()
        return {
            "id": alias[0],
            "slug": alias[1],
            "canonical_url": alias[2],
            "meta": {
                "title": alias[3],
                "description": alias[4],
                "colour": alias[5],
            },
            "created": alias[6],
            "uses": alias[7],
        }

    async def update_url_alias_by_id(
        self,
        id: IdType,
        slug: str,
        canonical_url: str,
        meta_title: Optional[str],
        meta_description: Optional[str],
        meta_colour: Optional[str],
    ) -> None:
        self.cursor.execute(
            """UPDATE url_aliases SET 
		alias_slug=:slug, canonical_url=:canonical_url, meta_title=:meta_title, meta_description=:meta_description, meta_colour=:meta_colour, updated_at=:updated_at
		WHERE id=:id""",
            {
                "slug": slug,
                "canonical_url": canonical_url,
                "meta_title": meta_title,
                "meta_description": meta_description,
                "meta_colour": meta_colour,
                "updated_at": self.get_safe_time(),
                "id": id,
            },
        )
        self.commit()

    async def delete_url_alias_by_id(self, id: IdType) -> None:
        self.cursor.execute("DELETE FROM url_aliases WHERE id=:id", {"id": id})
        self.commit()

    async def create_todo_list(self, title: str) -> IdType:
        self.cursor.execute(
            """INSERT INTO todo_lists
		(title, created_at, updated_at)
		values (:title, :created_at, :updated_at)""",
            {
                "title": title,
                "created_at": self.get_safe_time(),
                "updated_at": self.get_safe_time(),
            },
        )
        self.commit()
        id = self.cursor.execute("SELECT MAX(id) FROM todo_lists").fetchone()[0]
        return id

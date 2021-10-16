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
        "meta": {"title": str, "description": str, "colour": str},
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

    def get_url_alias(self) -> URLAliasType:
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

    def get_url_aliases(self) -> List[URLAliasType]:
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

    def create_url_alias(
        self,
        slug: str,
        canonical_url: str,
        meta_title: str,
        meta_description: str,
        meta_colour: str,
    ) -> IdType:
        self.cursor.execute(
            """INSERT INTO url_aliases
		(alias_slug, canonical_url, created_at, uses, meta_title, meta_description, meta_colour, updated_at)
		values (:slug, :canonical_url, :created_at, :uses, :meta_title, :meta_description, :meta_colour, :updated_at)""",
            {
                "slug": slug,
                "canonical_url": canonical_url,
                "meta_title": meta_title,
                "meta_description": meta_description,
                "meta_colour": meta_colour,
                "uses": 0,
                "created_at": self.get_safe_time(),
                "updated_at": self.get_safe_time(),
            },
        )
        self.commit()
        id = self.cursor.execute("SELECT MAX(id) FROM todo_lists").fetchone()[0]
        return id

import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("gitpulse.postgres")

class PostgresService:
    _instance = None

    def __init__(self):
        self.host = settings.POSTGRES_HOST
        self.port = settings.POSTGRES_PORT
        self.database = settings.POSTGRES_DB
        self.user = settings.POSTGRES_USER
        self.password = settings.POSTGRES_PASSWORD

    def get_connection(self):
        """Creates and returns a connection to PostgreSQL."""
        return psycopg2.connect(
            host=self.host,
            port=self.port,
            dbname=self.database,
            user=self.user,
            password=self.password,
            connect_timeout=3
        )

    def init_db(self):
        """Initializes tables for repository bookmarks and telemetry history."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS bookmarked_repos (
                            id SERIAL PRIMARY KEY,
                            repo_name VARCHAR(255) NOT NULL UNIQUE,
                            category VARCHAR(100) DEFAULT 'General',
                            description TEXT,
                            stars INT DEFAULT 0,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                    conn.commit()
            logger.info("PostgreSQL database initialized with 'bookmarked_repos' table.")
        except Exception as e:
            logger.warning(f"Could not initialize PostgreSQL database on startup (will retry on demand): {e}")

    def check_health(self) -> Dict[str, Any]:
        """Verifies connection health to PostgreSQL."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1;")
                    cur.fetchone()
            return {"status": "connected", "database": self.database}
        except Exception as e:
            return {"status": "disconnected", "error": str(e)}

    def create_bookmark(self, repo_name: str, category: str = "General", description: str = "", stars: int = 0) -> Dict[str, Any]:
        """Inserts a new repository bookmark (write endpoint)."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO bookmarked_repos (repo_name, category, description, stars)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (repo_name) DO UPDATE 
                    SET category = EXCLUDED.category,
                        description = EXCLUDED.description,
                        stars = EXCLUDED.stars
                    RETURNING id, repo_name, category, description, stars, created_at;
                """, (repo_name, category, description, stars))
                row = cur.fetchone()
                conn.commit()
                if row and isinstance(row.get("created_at"), datetime):
                    row["created_at"] = row["created_at"].isoformat()
                return dict(row)

    def list_bookmarks(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Reads bookmarked repositories (read endpoint)."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, repo_name, category, description, stars, created_at
                    FROM bookmarked_repos
                    ORDER BY id DESC
                    LIMIT %s OFFSET %s;
                """, (limit, offset))
                rows = cur.fetchall()
                result = []
                for r in rows:
                    item = dict(r)
                    if isinstance(item.get("created_at"), datetime):
                        item["created_at"] = item["created_at"].isoformat()
                    result.append(item)
                return result

    def delete_bookmark(self, bookmark_id: int) -> bool:
        """Deletes a bookmark by ID."""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM bookmarked_repos WHERE id = %s RETURNING id;", (bookmark_id,))
                deleted = cur.fetchone()
                conn.commit()
                return deleted is not None

postgres_service = PostgresService()

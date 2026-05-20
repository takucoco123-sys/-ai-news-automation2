import sqlite3
import os
from pathlib import Path

_data_dir = Path(os.environ.get("DATA_DIR", str(Path(__file__).parent)))
DB_PATH = _data_dir / "budget.db"

DDL = """
CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    type       TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    color      TEXT NOT NULL DEFAULT '#6366f1',
    icon       TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    amount      REAL NOT NULL CHECK(amount > 0),
    type        TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    description TEXT,
    date        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    year_month  TEXT NOT NULL,
    amount      REAL NOT NULL CHECK(amount >= 0),
    UNIQUE(category_id, year_month)
);
"""

DEFAULT_CATEGORIES = [
    ("食費",     "expense", "#f59e0b", "🍽️"),
    ("交通費",   "expense", "#3b82f6", "🚃"),
    ("光熱費",   "expense", "#8b5cf6", "💡"),
    ("家賃",     "expense", "#ec4899", "🏠"),
    ("日用品",   "expense", "#06b6d4", "🧴"),
    ("医療費",   "expense", "#ef4444", "🏥"),
    ("娯楽費",   "expense", "#f97316", "🎮"),
    ("衣服",     "expense", "#84cc16", "👕"),
    ("外食",     "expense", "#d97706", "🍜"),
    ("その他支出", "expense", "#6b7280", "💸"),
    ("給与",     "income",  "#10b981", "💰"),
    ("副収入",   "income",  "#059669", "📈"),
    ("その他収入", "income", "#047857", "💵"),
]


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    conn = get_connection()
    try:
        conn.executescript(DDL)
        row = conn.execute("SELECT COUNT(*) FROM categories").fetchone()
        if row[0] == 0:
            conn.executemany(
                "INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)",
                DEFAULT_CATEGORIES,
            )
        conn.commit()
    finally:
        conn.close()

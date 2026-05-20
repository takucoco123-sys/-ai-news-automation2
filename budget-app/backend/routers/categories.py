import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import CategoryCreate, CategoryRead

router = APIRouter()


@router.get("", response_model=list[CategoryRead])
def list_categories(type: str | None = None, db: sqlite3.Connection = Depends(get_db)):
    if type:
        rows = db.execute(
            "SELECT * FROM categories WHERE type = ? ORDER BY name", (type,)
        ).fetchall()
    else:
        rows = db.execute("SELECT * FROM categories ORDER BY type, name").fetchall()
    return [dict(r) for r in rows]


@router.post("", response_model=CategoryRead, status_code=201)
def create_category(body: CategoryCreate, db: sqlite3.Connection = Depends(get_db)):
    try:
        cur = db.execute(
            "INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)",
            (body.name, body.type, body.color, body.icon),
        )
        db.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Category name already exists")
    row = db.execute("SELECT * FROM categories WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int, body: CategoryCreate, db: sqlite3.Connection = Depends(get_db)
):
    row = db.execute("SELECT id FROM categories WHERE id = ?", (category_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Category not found")
    try:
        db.execute(
            "UPDATE categories SET name=?, type=?, color=?, icon=? WHERE id=?",
            (body.name, body.type, body.color, body.icon, category_id),
        )
        db.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Category name already exists")
    row = db.execute("SELECT * FROM categories WHERE id = ?", (category_id,)).fetchone()
    return dict(row)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM categories WHERE id = ?", (category_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Category not found")
    used = db.execute(
        "SELECT COUNT(*) FROM transactions WHERE category_id = ?", (category_id,)
    ).fetchone()[0]
    if used > 0:
        raise HTTPException(
            status_code=400, detail="Cannot delete category with existing transactions"
        )
    db.execute("DELETE FROM categories WHERE id = ?", (category_id,))
    db.commit()

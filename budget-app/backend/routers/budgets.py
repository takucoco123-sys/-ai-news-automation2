import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import BudgetCreate, BudgetRead

router = APIRouter()

JOIN = """
    SELECT b.*, c.name AS category_name, c.color AS category_color
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
"""


@router.get("", response_model=list[BudgetRead])
def list_budgets(year_month: str, db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        JOIN + " WHERE b.year_month = ? ORDER BY c.name", (year_month,)
    ).fetchall()
    return [dict(r) for r in rows]


@router.post("", response_model=BudgetRead, status_code=201)
def upsert_budget(body: BudgetCreate, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM categories WHERE id = ?", (body.category_id,)).fetchone():
        raise HTTPException(status_code=400, detail="Category not found")
    db.execute(
        """INSERT INTO budgets (category_id, year_month, amount)
           VALUES (?, ?, ?)
           ON CONFLICT(category_id, year_month) DO UPDATE SET amount=excluded.amount""",
        (body.category_id, body.year_month, body.amount),
    )
    db.commit()
    row = db.execute(
        JOIN + " WHERE b.category_id = ? AND b.year_month = ?",
        (body.category_id, body.year_month),
    ).fetchone()
    return dict(row)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM budgets WHERE id = ?", (budget_id,)).fetchone():
        raise HTTPException(status_code=404, detail="Budget not found")
    db.execute("DELETE FROM budgets WHERE id = ?", (budget_id,))
    db.commit()

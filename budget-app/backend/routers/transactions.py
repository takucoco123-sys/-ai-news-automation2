import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import TransactionCreate, TransactionRead

router = APIRouter()

JOIN = """
    SELECT t.*, c.name AS category_name, c.color AS category_color
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
"""


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    year_month: str | None = None,
    type: str | None = None,
    category_id: int | None = None,
    db: sqlite3.Connection = Depends(get_db),
):
    where, params = [], []
    if year_month:
        where.append("t.date LIKE ?")
        params.append(f"{year_month}-%")
    if type:
        where.append("t.type = ?")
        params.append(type)
    if category_id:
        where.append("t.category_id = ?")
        params.append(category_id)
    sql = JOIN + (" WHERE " + " AND ".join(where) if where else "") + " ORDER BY t.date DESC, t.id DESC"
    rows = db.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


@router.post("", response_model=TransactionRead, status_code=201)
def create_transaction(body: TransactionCreate, db: sqlite3.Connection = Depends(get_db)):
    cat = db.execute("SELECT type FROM categories WHERE id = ?", (body.category_id,)).fetchone()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")
    if cat["type"] != body.type:
        raise HTTPException(status_code=400, detail="Transaction type must match category type")
    cur = db.execute(
        "INSERT INTO transactions (amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?)",
        (body.amount, body.type, body.category_id, body.description, body.date),
    )
    db.commit()
    row = db.execute(JOIN + " WHERE t.id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int, body: TransactionCreate, db: sqlite3.Connection = Depends(get_db)
):
    if not db.execute("SELECT id FROM transactions WHERE id = ?", (transaction_id,)).fetchone():
        raise HTTPException(status_code=404, detail="Transaction not found")
    cat = db.execute("SELECT type FROM categories WHERE id = ?", (body.category_id,)).fetchone()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")
    if cat["type"] != body.type:
        raise HTTPException(status_code=400, detail="Transaction type must match category type")
    db.execute(
        """UPDATE transactions
           SET amount=?, type=?, category_id=?, description=?, date=?,
               updated_at=datetime('now')
           WHERE id=?""",
        (body.amount, body.type, body.category_id, body.description, body.date, transaction_id),
    )
    db.commit()
    row = db.execute(JOIN + " WHERE t.id = ?", (transaction_id,)).fetchone()
    return dict(row)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM transactions WHERE id = ?", (transaction_id,)).fetchone():
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
    db.commit()

import sqlite3
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from database import get_db
from models import MonthlyReportResponse, CategoryReport, TrendPoint

router = APIRouter()


@router.get("/monthly", response_model=MonthlyReportResponse)
def monthly_report(year_month: str, db: sqlite3.Connection = Depends(get_db)):
    totals = db.execute(
        """SELECT type, SUM(amount) AS total
           FROM transactions
           WHERE date LIKE ?
           GROUP BY type""",
        (f"{year_month}-%",),
    ).fetchall()
    total_income = next((r["total"] for r in totals if r["type"] == "income"), 0.0)
    total_expense = next((r["total"] for r in totals if r["type"] == "expense"), 0.0)

    by_cat = db.execute(
        """SELECT c.id, c.name, c.color, t.type,
                  COALESCE(SUM(t.amount), 0) AS total,
                  b.amount AS budget
           FROM categories c
           LEFT JOIN transactions t ON t.category_id = c.id AND t.date LIKE ?
           LEFT JOIN budgets b ON b.category_id = c.id AND b.year_month = ?
           GROUP BY c.id
           HAVING total > 0 OR b.amount IS NOT NULL
           ORDER BY c.type, total DESC""",
        (f"{year_month}-%", year_month),
    ).fetchall()

    breakdown = []
    for r in by_cat:
        budget = r["budget"]
        pct = round(r["total"] / budget * 100, 1) if budget else None
        breakdown.append(
            CategoryReport(
                category_id=r["id"],
                category_name=r["name"],
                color=r["color"],
                total=r["total"],
                budget=budget,
                percent_used=pct,
            )
        )

    return MonthlyReportResponse(
        year_month=year_month,
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
        by_category=breakdown,
    )


@router.get("/trend", response_model=list[TrendPoint])
def trend(months: int = 6, db: sqlite3.Connection = Depends(get_db)):
    today = datetime.today()
    result = []
    for i in range(months - 1, -1, -1):
        d = today.replace(day=1) - timedelta(days=i * 28)
        ym = d.strftime("%Y-%m")
        rows = db.execute(
            """SELECT type, COALESCE(SUM(amount), 0) AS total
               FROM transactions
               WHERE date LIKE ?
               GROUP BY type""",
            (f"{ym}-%",),
        ).fetchall()
        income = next((r["total"] for r in rows if r["type"] == "income"), 0.0)
        expense = next((r["total"] for r in rows if r["type"] == "expense"), 0.0)
        result.append(TrendPoint(year_month=ym, income=income, expense=expense))
    return result

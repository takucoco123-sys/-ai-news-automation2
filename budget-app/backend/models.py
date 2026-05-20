from pydantic import BaseModel, field_validator
from typing import Optional


class CategoryCreate(BaseModel):
    name: str
    type: str
    color: str = "#6366f1"
    icon: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("income", "expense"):
            raise ValueError("type must be 'income' or 'expense'")
        return v


class CategoryRead(BaseModel):
    id: int
    name: str
    type: str
    color: str
    icon: Optional[str]
    created_at: str


class TransactionCreate(BaseModel):
    amount: float
    type: str
    category_id: int
    description: Optional[str] = None
    date: str

    @field_validator("amount")
    @classmethod
    def positive_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("amount must be positive")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("income", "expense"):
            raise ValueError("type must be 'income' or 'expense'")
        return v


class TransactionRead(BaseModel):
    id: int
    amount: float
    type: str
    category_id: int
    category_name: str
    category_color: str
    description: Optional[str]
    date: str
    created_at: str
    updated_at: str


class BudgetCreate(BaseModel):
    category_id: int
    year_month: str
    amount: float

    @field_validator("amount")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("amount must be non-negative")
        return v


class BudgetRead(BaseModel):
    id: int
    category_id: int
    category_name: str
    category_color: str
    year_month: str
    amount: float


class CategoryReport(BaseModel):
    category_id: int
    category_name: str
    color: str
    total: float
    budget: Optional[float]
    percent_used: Optional[float]


class MonthlyReportResponse(BaseModel):
    year_month: str
    total_income: float
    total_expense: float
    balance: float
    by_category: list[CategoryReport]


class TrendPoint(BaseModel):
    year_month: str
    income: float
    expense: float

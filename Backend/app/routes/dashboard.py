from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.category import Category
from sqlalchemy import func
from datetime import date

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    user_id = int(get_jwt_identity())

    total_income = db.session.query(func.sum(Transaction.amount)).filter_by(
        user_id=user_id, type="income"
    ).scalar() or 0.0

    total_expense = db.session.query(func.sum(Transaction.amount)).filter_by(
        user_id=user_id, type="expense"
    ).scalar() or 0.0

    today = date.today()
    budgets = Budget.query.filter_by(user_id=user_id, month=today.month, year=today.year).all()
    total_budget = sum(b.amount for b in budgets)

    spent_per_category = {}
    for b in budgets:
        spent = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.category_id == b.category_id,
            Transaction.type == "expense",
            func.strftime("%m", Transaction.date) == f"{today.month:02d}",
            func.strftime("%Y", Transaction.date) == str(today.year),
        ).scalar() or 0.0
        spent_per_category[b.category_id] = spent

    total_spent_in_budget = sum(spent_per_category.values())

    recent = Transaction.query.filter_by(user_id=user_id).order_by(
        Transaction.date.desc()
    ).limit(5).all()

    return jsonify({
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "balance": round(total_income - total_expense, 2),
        "total_budget": round(total_budget, 2),
        "budget_spent": round(total_spent_in_budget, 2),
        "recent_transactions": [t.to_dict() for t in recent],
    }), 200


@dashboard_bp.route("/expense-by-category", methods=["GET"])
@jwt_required()
def expense_by_category():
    user_id = int(get_jwt_identity())

    rows = db.session.query(
        Category.name,
        func.sum(Transaction.amount).label("total")
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense"
    ).group_by(Category.name).all()

    return jsonify([{"name": r.name, "value": round(r.total, 2)} for r in rows]), 200


@dashboard_bp.route("/monthly", methods=["GET"])
@jwt_required()
def monthly_summary():
    user_id = int(get_jwt_identity())

    income_rows = db.session.query(
        func.strftime("%Y-%m", Transaction.date).label("month"),
        func.sum(Transaction.amount).label("total")
    ).filter_by(user_id=user_id, type="income").group_by("month").order_by("month").all()

    expense_rows = db.session.query(
        func.strftime("%Y-%m", Transaction.date).label("month"),
        func.sum(Transaction.amount).label("total")
    ).filter_by(user_id=user_id, type="expense").group_by("month").order_by("month").all()

    income_map = {r.month: round(r.total, 2) for r in income_rows}
    expense_map = {r.month: round(r.total, 2) for r in expense_rows}
    months = sorted(set(list(income_map.keys()) + list(expense_map.keys())))

    return jsonify([
        {
            "month": m,
            "income": income_map.get(m, 0),
            "expense": expense_map.get(m, 0),
        }
        for m in months
    ]), 200


@dashboard_bp.route("/budget-progress", methods=["GET"])
@jwt_required()
def budget_progress():
    user_id = int(get_jwt_identity())
    today = date.today()
    month = request.args.get("month", today.month, type=int)
    year = request.args.get("year", today.year, type=int)

    budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()

    result = []
    for b in budgets:
        spent = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.category_id == b.category_id,
            Transaction.type == "expense",
            func.strftime("%m", Transaction.date) == f"{month:02d}",
            func.strftime("%Y", Transaction.date) == str(year),
        ).scalar() or 0.0

        result.append({
            "category": b.category.name if b.category else "Unknown",
            "budget": b.amount,
            "spent": round(spent, 2),
            "remaining": round(max(b.amount - spent, 0), 2),
            "percentage": round((spent / b.amount) * 100, 1) if b.amount > 0 else 0,
            "exceeded": spent > b.amount,
        })

    return jsonify(result), 200

@dashboard_bp.route("/debug", methods=["GET"])
def debug():
    budgets = Budget.query.all()
    return jsonify([b.to_dict() for b in budgets]), 200

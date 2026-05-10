from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.budget import Budget

budgets_bp = Blueprint("budgets", __name__)


@budgets_bp.route("/", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = int(get_jwt_identity())
    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)

    query = Budget.query.filter_by(user_id=user_id)
    if month:
        query = query.filter_by(month=month)
    if year:
        query = query.filter_by(year=year)

    budgets = query.all()
    return jsonify([b.to_dict() for b in budgets]), 200


@budgets_bp.route("/", methods=["POST"])
@jwt_required()
def create_budget():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    category_id = data.get("category_id")
    amount = data.get("amount")
    month = data.get("month")
    year = data.get("year")

    if not all([category_id, amount, month, year]):
        return jsonify({"error": "category_id, amount, month and year are required"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a positive number"}), 400

    existing = Budget.query.filter_by(
        user_id=user_id, category_id=category_id, month=month, year=year
    ).first()
    if existing:
        return jsonify({"error": "Budget for this category and period already exists"}), 409

    budget = Budget(
        category_id=category_id,
        amount=amount,
        month=int(month),
        year=int(year),
        user_id=user_id,
    )
    db.session.add(budget)
    db.session.commit()
    return jsonify(budget.to_dict()), 201


@budgets_bp.route("/<int:budget_id>", methods=["PUT"])
@jwt_required()
def update_budget(budget_id):
    user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({"error": "Budget not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "amount" in data:
        try:
            amount = float(data["amount"])
            if amount <= 0:
                raise ValueError()
            budget.amount = amount
        except (ValueError, TypeError):
            return jsonify({"error": "Amount must be a positive number"}), 400
    if "month" in data:
        budget.month = int(data["month"])
    if "year" in data:
        budget.year = int(data["year"])

    db.session.commit()
    return jsonify(budget.to_dict()), 200


@budgets_bp.route("/<int:budget_id>", methods=["DELETE"])
@jwt_required()
def delete_budget(budget_id):
    user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({"error": "Budget not found"}), 404

    db.session.delete(budget)
    db.session.commit()
    return jsonify({"message": "Budget deleted"}), 200

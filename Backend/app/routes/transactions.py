from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.transaction import Transaction
from datetime import datetime, date

transactions_bp = Blueprint("transactions", __name__)


def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


@transactions_bp.route("/", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())
    query = Transaction.query.filter_by(user_id=user_id)

    transaction_type = request.args.get("type")
    category_id = request.args.get("category_id")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if transaction_type:
        query = query.filter_by(type=transaction_type)
    if category_id:
        query = query.filter_by(category_id=int(category_id))
    if date_from:
        parsed = parse_date(date_from)
        if parsed:
            query = query.filter(Transaction.date >= parsed)
    if date_to:
        parsed = parse_date(date_to)
        if parsed:
            query = query.filter(Transaction.date <= parsed)

    transactions = query.order_by(Transaction.date.desc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200


@transactions_bp.route("/", methods=["POST"])
@jwt_required()
def create_transaction():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get("title", "").strip()
    amount = data.get("amount")
    transaction_type = data.get("type", "").strip()
    transaction_date = data.get("date")

    if not title or amount is None or not transaction_type:
        return jsonify({"error": "Title, amount and type are required"}), 400

    if transaction_type not in ["income", "expense"]:
        return jsonify({"error": "Type must be income or expense"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a positive number"}), 400

    parsed_date = parse_date(transaction_date) if transaction_date else date.today()

    transaction = Transaction(
        title=title,
        amount=amount,
        type=transaction_type,
        date=parsed_date,
        note=data.get("note"),
        category_id=data.get("category_id"),
        user_id=user_id,
    )
    db.session.add(transaction)
    db.session.commit()
    return jsonify(transaction.to_dict()), 201


@transactions_bp.route("/<int:transaction_id>", methods=["PUT"])
@jwt_required()
def update_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "title" in data:
        transaction.title = data["title"].strip()
    if "amount" in data:
        try:
            amount = float(data["amount"])
            if amount <= 0:
                raise ValueError()
            transaction.amount = amount
        except (ValueError, TypeError):
            return jsonify({"error": "Amount must be a positive number"}), 400
    if "type" in data:
        if data["type"] not in ["income", "expense"]:
            return jsonify({"error": "Type must be income or expense"}), 400
        transaction.type = data["type"]
    if "date" in data:
        parsed = parse_date(data["date"])
        if parsed:
            transaction.date = parsed
    if "note" in data:
        transaction.note = data["note"]
    if "category_id" in data:
        transaction.category_id = data["category_id"]

    db.session.commit()
    return jsonify(transaction.to_dict()), 200


@transactions_bp.route("/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": "Transaction deleted"}), 200

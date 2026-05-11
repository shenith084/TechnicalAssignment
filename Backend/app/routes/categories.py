from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("/", methods=["GET"])
@jwt_required()
def get_categories():
    user_id = int(get_jwt_identity())
    category_type = request.args.get("type")
    query = Category.query.filter_by(user_id=user_id)
    if category_type:
        query = query.filter_by(type=category_type)
    categories = query.all()
    return jsonify([c.to_dict() for c in categories]), 200


@categories_bp.route("/", methods=["POST"])
@jwt_required()
def create_category():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name", "").strip()
    category_type = data.get("type", "").strip()

    if not name or not category_type:
        return jsonify({"error": "Name and type are required"}), 400

    if category_type not in ["income", "expense"]:
        return jsonify({"error": "Type must be income or expense"}), 400

    existing = Category.query.filter_by(user_id=user_id, name=name, type=category_type).first()
    if existing:
        return jsonify({"error": "Category already exists"}), 409

    category = Category(name=name, type=category_type, user_id=user_id)
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201


@categories_bp.route("/<int:category_id>", methods=["PUT"])
@jwt_required()
def update_category(category_id):
    user_id = int(get_jwt_identity())
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    if not category:
        return jsonify({"error": "Category not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "name" in data:
        category.name = data["name"].strip()
    if "type" in data:
        if data["type"] not in ["income", "expense"]:
            return jsonify({"error": "Type must be income or expense"}), 400
        category.type = data["type"]

    db.session.commit()
    return jsonify(category.to_dict()), 200


@categories_bp.route("/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id):
    user_id = int(get_jwt_identity())
    category = Category.query.filter_by(id=category_id, user_id=user_id).first()
    if not category:
        return jsonify({"error": "Category not found"}), 404

    try:
        Transaction.query.filter_by(category_id=category_id, user_id=user_id).update({"category_id": None})
        Budget.query.filter_by(category_id=category_id, user_id=user_id).delete()
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete category"}), 500

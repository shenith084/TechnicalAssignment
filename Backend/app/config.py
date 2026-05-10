import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "finance-tracker-secret-2024")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-finance-secret-2024")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///finance.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 86400

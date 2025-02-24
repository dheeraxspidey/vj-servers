from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    

# Mock user database (for simplicity, replace with actual database usage)
users = {"user1": "password123", "user2": "securepass"}

def init_db(app):
    print("🔹 Initializing Database...")  # Moved print inside function
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("✅ Database Created Successfully!")



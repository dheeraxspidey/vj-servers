from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from database import db, init_db, User, users
from auth_routes import auth_routes
import config


app = Flask(__name__)
app.config.from_object(config)
CORS(app, supports_credentials=True, origins=["https://superapp.vnrzone.site"])

# Initialize database
init_db(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth_routes.login'

# Define user_loader function
@login_manager.user_loader
def load_user(user_id):
    if not user_id or user_id == "None":  # ✅ Prevent conversion errors
        return None

    # Check if user is a static user
    if user_id in users:
        return User(id=user_id, username=user_id, password=users[user_id])

    # Otherwise, check the database
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return "SSO Authentication Service is Running!"

# Register authentication routes
app.register_blueprint(auth_routes)

if __name__ == '__main__':
    app.run(debug=config.DEBUG, host='0.0.0.0', port=5000)

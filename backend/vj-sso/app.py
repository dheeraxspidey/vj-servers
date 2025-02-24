from flask import Flask, request, jsonify, redirect, session, url_for
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

app = Flask(__name__)
app.secret_key = 'your_secret_key'
CORS(app, supports_credentials=True)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Mock user database
users = {"user1": "password123", "user2": "securepass"}

class User(UserMixin):
    def __init__(self, username):
        self.id = username

@login_manager.user_loader
def load_user(user_id):
    return User(user_id) if user_id in users else None

@app.route('/api/check-login', methods=['GET'])
def check_login():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "user": current_user.id}), 200
    return jsonify({"logged_in": False}), 401

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    
    if username in users and users[username] == password:
        user = User(username)
        login_user(user)
        session['redirect_url'] = data.get("redirect_url", "/")  # Save redirect page
        return jsonify({"success": True, "redirect": session['redirect_url']}), 200
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"}), 200

if __name__ == '__main__':
    app.run(debug=True)

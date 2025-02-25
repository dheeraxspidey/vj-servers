from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user
from flask_cors import cross_origin
from database import User, users, db

auth_routes = Blueprint('auth_routes', __name__)

from flask_login import LoginManager
from database import User

@auth_routes.route('/api/check-login', methods=['GET', 'OPTIONS'])
@cross_origin(origins=["https://superapp.vnrzone.site"], supports_credentials=True)
def check_login():
    """Check if the user is logged in."""

    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight passed"}), 200  # ✅ Handles preflight

    # 🔍 Debug: Print received cookies
    print("Received Cookies:", request.cookies)

    if current_user.is_authenticated:
        print(f"User is authenticated: {current_user.username}")  # ✅ Debug output
        return jsonify({"logged_in": True, "user": current_user.username}), 200

    # 🔍 Debug Flask Session
    print("Flask Session Data:", session)  # ✅ Check if session stores the user

    return jsonify({"logged_in": False}), 401

@auth_routes.route('/api/login', methods=['POST'])
def login():
    """Handles user authentication for both static and database users."""

    data = request.json
    username = data.get("username")
    password = data.get("password")
    redirect_url = data.get("redirect_url", "https://superapp.vnrzone.site")

    # 🔹 Check static users first
    if username in users and users[username] == password:
        user = User(id=username, username=username, password=users[username])  # Create User object

        print(f"🔍 User Object Before login_user(): {user.__dict__}")  # ✅ Debug output

        login_user(user, remember=True)  # ✅ Log in the user
        session["_user_id"] = username  # ✅ Explicitly store _user_id in session
        session["redirect_url"] = redirect_url

        print(f"✅ User logged in: {current_user}")  # ✅ Check if current_user is set

        response = jsonify({"success": True, "redirect": redirect_url})
        response.set_cookie(
            "sso_token", "your_secure_token",
            domain=".vnrzone.site",  # ✅ Works for all subdomains
            httponly=True,
            secure=True,
            samesite="None"
        )
        return response, 200

    return jsonify({"success": False, "error": "Invalid credentials"}), 401


@auth_routes.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    response = jsonify({"success": True, "message": "Logged out"})
    response.set_cookie("sso_token", "", expires=0)
    return response, 200

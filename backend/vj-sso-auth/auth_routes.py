from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user
from database import User, users, db

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/api/check-login', methods=['GET'])
def check_login():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "user": current_user.username}), 200
    return jsonify({"logged_in": False}), 401


@auth_routes.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    redirect_url = data.get("redirect_url", "https://cool.vnrzone.site")
    
    # Check if the user is in the static users dictionary
    if username in users and users[username] == password:
        user = User(id=username, username=username, password=users[username])  # Static user object
        login_user(user)
        session['redirect_url'] = redirect_url
        response = jsonify({"success": True, "redirect": redirect_url})
        response.set_cookie("sso_token", "your_secure_token", httponly=True, samesite="Lax")
        return response, 200
    
    # Otherwise, check in the database
    user = User.query.filter_by(username=username, password=password).first()
    if user:
        login_user(user)
        session['redirect_url'] = redirect_url
        response = jsonify({"success": True, "redirect": redirect_url})
        response.set_cookie("sso_token", "your_secure_token", httponly=True, samesite="Lax")
        return response, 200

    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@auth_routes.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    response = jsonify({"success": True, "message": "Logged out"})
    response.set_cookie("sso_token", "", expires=0)
    return response, 200

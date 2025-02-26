import os
from flask import Flask, redirect, url_for, session, jsonify, request
from authlib.integrations.flask_client import OAuth
from flask_session import Session
import logging

app = Flask(__name__)

from flask_session import Session

app.config["SECRET_KEY"] = "your_very_secret_key"  # ✅ Use a strong, random key
app.config["SESSION_TYPE"] = "filesystem"  # ✅ Stores session data on disk
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_FILE_DIR"] = "/tmp/flask_sessions"  # ✅ Custom directory for session storage
Session(app)


# ✅ Configure Flask logs
logging.basicConfig(level=logging.DEBUG)  # Logs all debug information
app.logger.setLevel(logging.DEBUG)  # Ensures logs are captured


# ✅ Flask session config
app.config['SECRET_KEY'] = 'GO%^PX-oB0@wd6-gs4wdy8yCpZDh#oVQslb1'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# ✅ OAuth Configuration
GOOGLE_CLIENT_ID = ""
GOOGLE_CLIENT_SECRET = ""


oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params=None,
    authorize_token_url="https://oauth2.googleapis.com/token",
    authorize_token_params=None,
    userinfo_url="https://www.googleapis.com/oauth2/v2/userinfo",
    userinfo_params=None,
    client_kwargs={"scope": "openid email profile"}
)

# ✅ Login Route
@app.route("/login")
def login():
    session.permanent = True  # ✅ Ensure session persists across requests

    # ✅ Generate OAuth state and store it in session
    authorization_url = google.create_authorization_url("https://accounts.google.com/o/oauth2/auth")
    session["oauth_state"] = authorization_url["state"]

    return google.authorize_redirect(redirect_uri="http://localhost:3109/authorize")

@app.route("/authorize")
def authorize():
    try:
        app.logger.debug("OAuth callback triggered!")  # ✅ Log when OAuth is called

        # ✅ Log received state
        received_state = request.args.get("state")
        expected_state = session.get("oauth_state")

        if not expected_state:
            app.logger.error("Session state missing! Possible session expiration.")
            return "Session state missing. Try logging in again.", 400

        if received_state != expected_state:
            app.logger.error(f"CSRF Warning! Received state '{received_state}', but expected '{expected_state}'")
            return "CSRF Warning! State parameter mismatch.", 400

        # ✅ Log OAuth token request
        token = google.authorize_access_token()
        app.logger.debug(f"Received OAuth Token: {token}")

        if not token:
            app.logger.error("OAuth token missing!")
            return "OAuth token missing. Please try logging in again.", 400

        # ✅ Fetch user info
        user_info = google.get("userinfo").json()
        app.logger.debug(f"User Info: {user_info}")

        if not user_info:
            app.logger.error("User info missing from Google!")
            return "User info not received from Google.", 400

        # ✅ Store session
        session["user"] = user_info
        session["user_token"] = token["access_token"]

        response = redirect("https://superapp.vnrzone.site/")
        response.set_cookie("user", jsonify(user_info), domain=".vnrzone.site", httponly=True, secure=True)
        return response

    except Exception as e:
        app.logger.error(f"Error during OAuth authorization: {str(e)}", exc_info=True)
        return f"OAuth authentication failed: {str(e)}", 500



# ✅ Logout Route
@app.route("/logout")
def logout():
    session.pop("user", None)
    response = redirect("https://superapp.vnrzone.site/")
    response.delete_cookie("user", domain=".vnrzone.site")
    response.delete_cookie("userToken", domain=".vnrzone.site")
    return response

# ✅ API to Get User Info
@app.route("/user")
def user():
    if "user" in session:
        return jsonify(session["user"])
    return jsonify({"error": "Unauthorized"}), 401

# ✅ Main App Route
@app.route("/")
def index():
    return """
    <h1>Flask Child App</h1>
    <a href='/login'>Login with Google</a>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3109, debug=True)

import os
import logging
from flask import Flask, redirect, session, jsonify, request, make_response
from authlib.integrations.flask_client import OAuth
from flask_session import Session
from dotenv import load_dotenv

# ✅ Load .env file
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)

# ✅ Configure Logging
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# ✅ Flask Session Config
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY", "default_secret_key")
app.config['SESSION_TYPE'] = 'filesystem'
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_FILE_DIR"] = "/tmp/flask_sessions"  # ✅ Store sessions in a persistent directory

Session(app)

# ✅ Google OAuth Configuration
app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
app.config["GOOGLE_CLIENT_SECRET"] = os.getenv("GOOGLE_CLIENT_SECRET")
app.config["REDIRECT_URI"] = "https://flaskapp.vnrzone.site/authorize"  # ✅ Set redirect URI explicitly

# ✅ Ensure environment variables are loaded correctly
if not app.config["GOOGLE_CLIENT_ID"] or not app.config["GOOGLE_CLIENT_SECRET"]:
    raise ValueError("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env file!")

# ✅ Initialize OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=app.config["GOOGLE_CLIENT_ID"],
    client_secret=app.config["GOOGLE_CLIENT_SECRET"],
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_token_url="https://oauth2.googleapis.com/token",
    userinfo_url="https://www.googleapis.com/oauth2/v2/userinfo",
    client_kwargs={"scope": "openid email profile"},
)

# ✅ Auto-redirect logged-in users
@app.route("/")
def index():
    if "user" in session:
        return redirect("https://superapp.vnrzone.site/")  # ✅ Redirect if already logged in
    return """
    <h1>Flask Child App</h1>
    <a href='/login'>Login with Google</a>
    """

# ✅ Google OAuth Login
@app.route("/login")
def login():
    session.permanent = True  # ✅ Ensure session persists

    # ✅ Generate OAuth state
    authorization_url = google.create_authorization_url("https://accounts.google.com/o/oauth2/auth")
    oauth_state = authorization_url["state"]

    app.logger.debug(f"✅ Generated OAuth State: {oauth_state}")

    # ✅ Store state securely in a cookie (fix for Incognito mode)
    response = google.authorize_redirect(
        redirect_uri=app.config["REDIRECT_URI"],
        state=oauth_state  # ✅ Explicitly pass state
    )
    response.set_cookie("oauth_state", oauth_state, httponly=True, secure=True, samesite="Lax")
    return response

# ✅ OAuth Authorization Callback
@app.route("/authorize")
def authorize():
    try:
        app.logger.debug("✅ OAuth callback triggered!")

        received_state = request.args.get("state")
        expected_state = request.cookies.get("oauth_state")

        app.logger.debug(f"🔍 Received OAuth State: {received_state}")
        app.logger.debug(f"🔍 Expected OAuth State: {expected_state}")

        # ✅ CSRF Check: Ensure state parameter matches
        if not expected_state:
            app.logger.error("❌ OAuth state missing in cookies! Possible session expiration.")
            return "Session state missing. Try logging in again.", 400

        if received_state != expected_state:
            app.logger.error(f"❌ CSRF Warning! Received state '{received_state}', but expected '{expected_state}'")
            return "CSRF Warning! State parameter mismatch.", 400

        # ✅ Attempt to retrieve OAuth Token
        app.logger.debug(f"🔍 Attempting OAuth Token Exchange with Google...")
        token = google.authorize_access_token()
        app.logger.debug(f"✅ OAuth Token Received: {token}")

        if not token:
            app.logger.error("❌ OAuth token missing!")
            return "OAuth token missing. Please try logging in again.", 400

        # ✅ Fetch User Info
        user_info = google.get("userinfo").json()
        app.logger.debug(f"✅ User Info Received: {user_info}")

        if not user_info:
            return "User info not received from Google.", 400

        # ✅ Store user session
        session["user"] = user_info
        session["user_token"] = token["access_token"]

        # ✅ Set authentication cookies for SuperApp
        response = redirect("https://superapp.vnrzone.site/")
        response.set_cookie("user", jsonify(user_info), domain=".vnrzone.site", httponly=True, secure=True)
        response.set_cookie("userToken", token["access_token"], domain=".vnrzone.site", httponly=True, secure=True)

        return response

    except Exception as e:
        app.logger.error(f"❌ Error during OAuth authorization: {str(e)}", exc_info=True)
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3109, debug=True)

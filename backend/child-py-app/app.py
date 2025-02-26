import os
from flask import Flask, redirect, url_for, session, jsonify, request
from authlib.integrations.flask_client import OAuth
from flask_session import Session
import logging

import os
from dotenv import load_dotenv

# ✅ Load .env file
load_dotenv()


app = Flask(__name__)


# ✅ Configure Flask logs
logging.basicConfig(level=logging.DEBUG)  # Logs all debug information
app.logger.setLevel(logging.DEBUG)  # Ensures logs are captured


# ✅ Flask session config
app.config['SECRET_KEY'] = 'GO%^PX-oB0@wd6-gs4wdy8yCpZDh#oVQslb1'
app.config['SESSION_TYPE'] = 'filesystem'

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_FILE_DIR"] = "/tmp/flask_sessions"  # ✅ Custom directory for session storage

Session(app)

# ✅ OAuth Configuration
app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
app.config["GOOGLE_CLIENT_SECRET"] = os.getenv("GOOGLE_CLIENT_SECRET")

# ✅ Debugging: Print loaded variables
print("GOOGLE_CLIENT_ID:", os.getenv("GOOGLE_CLIENT_ID"))
print("GOOGLE_CLIENT_SECRET:", os.getenv("GOOGLE_CLIENT_SECRET"))

# ✅ Ensure environment variables are loaded correctly
if not app.config["GOOGLE_CLIENT_ID"] or not app.config["GOOGLE_CLIENT_SECRET"]:
    raise ValueError("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env file!")

# ✅ Initialize OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=app.config["GOOGLE_CLIENT_ID"],  # ✅ Corrected: Uses loaded variables
    client_secret=app.config["GOOGLE_CLIENT_SECRET"],  # ✅ Corrected
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params=None,
    authorize_token_url="https://oauth2.googleapis.com/token",
    authorize_token_params=None,
    userinfo_url="https://www.googleapis.com/oauth2/v2/userinfo",
    userinfo_params=None,
    client_kwargs={"scope": "openid email profile"}
)

from flask import request, redirect, session, make_response

@app.route("/login")
def login():
    session.permanent = True  # ✅ Ensure session persists

    # ✅ Generate OAuth state correctly
    authorization_url = google.create_authorization_url("https://accounts.google.com/o/oauth2/auth")
    oauth_state = authorization_url["state"]

    app.logger.debug(f"Generated OAuth State: {oauth_state}")

    # ✅ Store state in a cookie instead of session (for Incognito mode)
    response = google.authorize_redirect(
        redirect_uri="https://flaskapp.vnrzone.site/authorize",
        state=oauth_state  # ✅ Explicitly pass state
    )
    response.set_cookie("oauth_state", oauth_state, httponly=True, secure=True, samesite="Lax")  # ✅ Use cookie to persist state
    return response

@app.route("/authorize")
def authorize():
    try:
        app.logger.debug("OAuth callback triggered!")

        # ✅ Retrieve state from the cookie instead of session
        received_state = request.args.get("state")
        expected_state = request.cookies.get("oauth_state")  # ✅ Read state from cookie

        app.logger.debug(f"Received OAuth State: {received_state}")
        app.logger.debug(f"Expected OAuth State: {expected_state}")

        if not expected_state:
            app.logger.error("❌ OAuth state missing in cookies! Possible session expiration.")
            return "❌ Session state missing. Try logging in again.", 400

        if received_state != expected_state:
            app.logger.error(f"❌ CSRF Warning! Received state '{received_state}', but expected '{expected_state}'")
            return "❌ CSRF Warning! State parameter mismatch.", 400

        # ✅ Proceed with token exchange
        token = google.authorize_access_token()
        if not token:
            app.logger.error("❌ OAuth token missing!")
            return "❌ OAuth token missing. Please try logging in again.", 400

        user_info = google.get("userinfo").json()
        if not user_info:
            app.logger.error("❌ User info not received from Google!")
            return "❌ User info not received from Google.", 400

        app.logger.debug(f"✅ User Info Received: {user_info}")

        session["user"] = user_info
        session["user_token"] = token["access_token"]

        # ✅ Set authentication cookies for SuperApp
        response = redirect("https://superapp.vnrzone.site/")
        response.set_cookie("user", jsonify(user_info), domain=".vnrzone.site", httponly=True, secure=True)
        response.set_cookie("userToken", token["access_token"], domain=".vnrzone.site", httponly=True, secure=True)

        return response

    except Exception as e:
        app.logger.error(f"❌ Error during OAuth authorization: {str(e)}", exc_info=True)
        return f"❌ OAuth authentication failed: {str(e)}", 500



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

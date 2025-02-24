import os

SECRET_KEY = os.getenv("SECRET_KEY", "vj_campus_secret_key")

# Ensure the database file is stored in the correct location
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Get absolute path
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}")

DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

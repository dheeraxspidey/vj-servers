from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ✅ Replace with your MySQL credentials
MYSQL_USER = "campus_server_user"
MYSQL_PASSWORD = "Campus123#"
MYSQL_HOST = "localhost"  # Change to server IP if remote
MYSQL_PORT = 3306  # Default MySQL port
MYSQL_DATABASE = "vj_users"

# ✅ MySQL Connection URL
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# ✅ Create MySQL Database Connection
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

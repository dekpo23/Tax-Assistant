from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pymysql.constants import CLIENT
import os
from fastapi import HTTPException

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"client_flag": CLIENT.MULTI_STATEMENTS}
)

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

create_users = text("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        usertype VARCHAR(50) NOT NULL
    );
""")







db.execute(create_users)

try:
    db.commit()

except Exception as e:
    db.rollback()
    raise HTTPException(status_code=400, detail={"error": "something went wrong"})
finally:
    db.close()

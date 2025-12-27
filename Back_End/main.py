from database.database import db
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
# from typing import Optional, Dict
from sqlalchemy import text
import os
from dotenv import load_dotenv

import bcrypt
import uvicorn
from database.middleware import create_token, verify_token
import json





load_dotenv()

token_time = int(os.getenv("token_time"))

app = FastAPI(title="Tax Assitant", version="1.0.0")

class User(BaseModel):
    name: str = Field(..., examples=["Azumi Abby"])
    email: str = Field(..., examples=["abby@gmail.com"])
    password: str = Field(..., examples=["abby12345"])
    usertype: str = Field(..., examples=["user"])



class Login(BaseModel):
    email: str = Field(..., examples=["abby@gmail.com"])
    password: str = Field(..., examples=["abby12345"])




@app.post("/signup")
def signup(input: User):
    try:

        duplicate_query = text("""
            SELECT * FROM users WHERE email = :email
            
        """)

        existing = db.execute(duplicate_query, {"email": input.email}).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")


        query = text("""
            INSERT INTO users (name, email, password, usertype)
            VALUES (:name, :email, :password, :usertype)
        """)
            
        salt = bcrypt.gensalt()
        hashedPassword = bcrypt.hashpw(input.password.encode('utf-8'), salt)

       
        db.execute(query, {"name": input.name, "email": input.email, "password":hashedPassword, "usertype": input.usertype})
        db.commit()
        return ({"message": "user created successfully"})
    

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail = str(e))
    finally:
        db.close()





@app.get("/")
def home():
    return {"message": "welcome to tax assistant"}


@app.post("/login")
def login(input: Login):
    try:
        query = text("SELECT * FROM users WHERE email = :email")
        user = db.execute(query, {"email": input.email}).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # password is stored as bytes — ensure both are bytes before checking
        stored_password = user.password if isinstance(user.password, bytes) else user.password.encode('utf-8')


        verified_password = bcrypt.checkpw(input.password.encode('utf-8'), stored_password)


        if not verified_password:
            raise HTTPException(status_code=401, detail="Invalid password")
        
        encoded_token = create_token(details={
            "email": user.email,
            "usertype": user.usertype,
            "user_id": user.id
        }, expiry=token_time)

        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "usertype": user.usertype
            },
            "token": encoded_token
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    




if __name__ == "__main__":
    uvicorn.run("main:app", host=os.getenv("host"), port=int(os.getenv("port")), reload=True)
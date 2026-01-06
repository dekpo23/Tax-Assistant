from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
# --- ADDED IMPORTS FOR STREAMING ---
from fastapi.responses import StreamingResponse
import json
import time
# -----------------------------------
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Import routers and dependencies
from api import router as auth_router
from database.middleware import verify_token
from app import get_tax_assistant

load_dotenv()

app = FastAPI(
    title="Nigeria Tax Assistant API",
    description="API for Nigerian tax information and calculations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

class TaxQuestion(BaseModel):
    question: str

class TaxImpactRequest(BaseModel):
    monthly_income: float

@app.get("/")
def home():
    return {
        "message": "Welcome to Nigeria Tax Assistant API",
        "endpoints": {
            "auth": ["POST /auth/signup", "POST /auth/login"],
            "tax": ["POST /ask", "POST /calculate"],
            "health": ["GET /health"]
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Nigeria Tax Assistant API"
    }

@app.get("/get/user")
def get_user_info(
    user_info: dict = Depends(verify_token)
):
    return {
        "user_id": user_info["user_id"],
        "email": user_info["email"],
        "name": user_info["name"]
    }

# Tax endpoints
@app.post("/ask")
def ask_tax_question(
    request: TaxQuestion,
    user_info: dict = Depends(verify_token)
):
    """Ask a tax-related question (requires authentication)."""
    try:
        assistant = get_tax_assistant()
        user_id = f"user_{user_info['user_id']}"
        
        response = assistant.ask_question(
            question=request.question,
            user_id=user_id
        )
        
        return {
            "success": True,
            "user_id": user_info["user_id"],
            "question": request.question,
            "answer": response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )

# --- ADDED STREAMING ENDPOINT ---
@app.post("/ask/stream")
def ask_tax_question_stream(
    request: TaxQuestion,
    user_info: dict = Depends(verify_token)
):
    """Streams the answer token by token."""
    assistant = get_tax_assistant()
    
    # Generator function to yield data in SSE format
    def response_generator():
        try:
            # Call the streaming method we added to app.py
            stream = assistant.ask_question_stream(request.question)
            
            for token in stream:
                # Format as Server-Sent Events (SSE) JSON
                data = json.dumps({"token": token})
                yield f"data: {data}\n\n"
                # Optional: tiny sleep to ensure frontend can catch up if local
                time.sleep(0.01)
                
            # Signal that the stream is finished
            yield "data: [DONE]\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(response_generator(), media_type="text/event-stream")
# --------------------------------

@app.post("/tax/impact")
def tax_impact(
    request: TaxImpactRequest,
    user_info: dict = Depends(verify_token)
):
    try:
        from engine.tax_engine import calculate_tax_impact

        result = calculate_tax_impact(request.monthly_income)

        return {
            "success": True,
            "user_id": user_info["user_id"],
            "data": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Public endpoint (no auth required)
@app.post("/public/impact")
def public_tax_impact(
    request: TaxImpactRequest,
):
    try:
        from engine.tax_engine import calculate_tax_impact

        result = calculate_tax_impact(request.monthly_income)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
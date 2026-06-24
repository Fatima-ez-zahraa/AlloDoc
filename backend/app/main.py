from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.interfaces.api import routes
from app.db.init_db import init_db
from app.core.ai_engine import assistant_ia
from app.db.session import SessionLocal
from app.models.database import TrainingMessage

app = FastAPI(title="AlloDoc API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # 1. Initialize tables and seed default data
    try:
        init_db()
    except Exception as e:
        print(f"Error during DB initialization: {e}")
        
    # 2. Train intent model if there are training messages
    db = SessionLocal()
    try:
        msgs = db.query(TrainingMessage).all()
        if msgs:
            texts = [m.content for m in msgs]
            labels = [m.actual_intent for m in msgs]
            print(f"Training ML intent classifier on {len(msgs)} examples...")
            assistant_ia.train_ml(texts, labels)
    except Exception as e:
        print(f"Error training model on startup: {e}")
    finally:
        db.close()

app.include_router(routes.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to AlloDoc API"}

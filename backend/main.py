from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AlloDoc API",
    description="Medical appointment assistant API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "online", "service": "AlloDoc FastAPI"}

@app.post("/api/v1/webhook/whatsapp")
async def whatsapp_webhook(payload: dict):
    # n8n routes WhatsApp messages here
    return {"status": "received"}

@app.post("/api/v1/ml/classify-intent")
async def classify_intent(message: dict):
    # Dummy ML classification endpoint
    return {
        "intent": "BOOK_APPOINTMENT",
        "confidence": 0.89
    }

@app.post("/api/v1/ml/predict-no-show")
async def predict_no_show(appointment_data: dict):
    # Dummy ML inference endpoint
    return {
        "risk_score": 0.15
    }

@app.get("/api/v1/appointments")
async def get_appointments():
    return []

@app.post("/api/v1/chat")
async def chat_endpoint(payload: dict):
    # Dummy response for the frontend chat
    return {
        "status": "success",
        "reply": "Ceci est une réponse générée par l'IA d'AlloDoc (Simulation)."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

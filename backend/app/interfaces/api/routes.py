from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/webhooks/whatsapp")
def whatsapp_webhook():
    return {"status": "success"}

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "AlloDocIA API"}

@router.get("/dashboard")
def get_dashboard():
    return {
        "status": "success",
        "data": {
            "absence_rate": 12,
            "appointments_today": 48,
            "high_risk_count": 5,
            "summary": "Le modèle prédictif a permis de réduire les absences de 15% ce mois-ci.",
        },
    }

@router.post("/chat")
def chat(request: ChatRequest):
    text = request.message.strip()
    if not text:
        return {"status": "error", "reply": "Veuillez écrire un message."}

    return {
        "status": "success",
        "reply": f"J'ai bien reçu votre message : « {text} ». Un assistant AlloDocIA peut maintenant traiter cette demande.",
    }

@router.post("/appointments/book")
def book_appointment():
    return {"status": "success", "message": "Appointment booked"}

@router.put("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(appointment_id: str):
    return {"status": "success", "message": f"Appointment {appointment_id} rescheduled"}

@router.delete("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str):
    return {"status": "success", "message": f"Appointment {appointment_id} canceled"}

@router.get("/patients/{patient_id}/history")
def get_patient_history(patient_id: str):
    return {"status": "success", "data": []}

@router.post("/ml/predict_no_show")
def predict_no_show():
    return {"status": "success", "risk_score": 0.15}

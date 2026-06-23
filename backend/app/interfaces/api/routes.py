from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.core.n8n_client import n8n_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"

class AppointmentBookingRequest(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    time: str
    reason: str

class AppointmentCancellationRequest(BaseModel):
    appointment_id: str
    reason: str = None

class AppointmentReminderRequest(BaseModel):
    appointment_id: str
    phone: str
    reminder_type: str = "j-1"

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
async def chat(request: ChatRequest):
    """Envoie un message au workflow N8N sans exécution manuelle."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message vide")
    
    try:
        result = await n8n_client.send_chat_message(
            from_user=request.user_id,
            message=request.message,
            user_id=request.user_id
        )
        return {
            "status": "success",
            "reply": "Message envoyé au workflow N8N",
            "n8n_response": result
        }
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointments/book")
async def book_appointment(request: AppointmentBookingRequest):
    """Déclenche le workflow de prise de RDV dans N8N."""
    try:
        result = await n8n_client.trigger_appointment_booking(
            patient_id=request.patient_id,
            doctor_id=request.doctor_id,
            appointment_date=request.date,
            appointment_time=request.time,
            reason=request.reason
        )
        return {
            "status": "success",
            "message": "Appointment booking workflow triggered",
            "n8n_response": result
        }
    except Exception as e:
        logger.error(f"Booking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/appointments/{appointment_id}/reschedule")
async def reschedule_appointment(appointment_id: str):
    """Placeholder pour reschedule (sera implémenté dans N8N)."""
    return {"status": "success", "message": f"Appointment {appointment_id} rescheduled"}

@router.delete("/appointments/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, request: AppointmentCancellationRequest = None):
    """Déclenche l'annulation de RDV dans N8N."""
    try:
        result = await n8n_client.trigger_appointment_cancellation(
            appointment_id=appointment_id,
            reason=request.reason if request else None
        )
        return {
            "status": "success",
            "message": f"Appointment {appointment_id} cancellation workflow triggered",
            "n8n_response": result
        }
    except Exception as e:
        logger.error(f"Cancellation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patients/{patient_id}/history")
def get_patient_history(patient_id: str):
    return {"status": "success", "data": []}

@router.post("/appointments/{appointment_id}/reminder")
async def send_reminder(appointment_id: str, request: AppointmentReminderRequest):
    """Envoie un rappel J-1 via le workflow N8N."""
    try:
        result = await n8n_client.trigger_appointment_reminder(
            appointment_id=appointment_id,
            patient_phone=request.phone,
            reminder_type=request.reminder_type
        )
        return {
            "status": "success",
            "message": f"Reminder sent for appointment {appointment_id}",
            "n8n_response": result
        }
    except Exception as e:
        logger.error(f"Reminder error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ml/predict_no_show")
def predict_no_show():
    return {"status": "success", "risk_score": 0.15}

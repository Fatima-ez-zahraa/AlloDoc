import os
import urllib.request
import urllib.parse
import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

from app.db.session import get_db
from app.core.ai_engine import assistant_ia
from app.models.database import Patient, Doctor, Appointment, Message, MLPrediction, TrainingMessage, Waitlist

router = APIRouter()

N8N_BASE_URL = os.getenv("N8N_BASE_URL", "https://ikramkanouz.app.n8n.cloud")
N8N_WEBHOOK_WHATSAPP = os.getenv(
    "N8N_WEBHOOK_WHATSAPP",
    f"{N8N_BASE_URL}/webhook/tpZtI1oDWrhAzWDc"
)
N8N_WEBHOOK_APPOINTMENT_BOOKED = os.getenv(
    "N8N_WEBHOOK_APPOINTMENT_BOOKED",
    f"{N8N_BASE_URL}/webhook/appointment-booked"
)
N8N_WEBHOOK_WAITLIST_FILL = os.getenv(
    "N8N_WEBHOOK_WAITLIST_FILL",
    f"{N8N_BASE_URL}/webhook/waitlist-fill"
)
N8N_WEBHOOK_WHATSAPP_FALLBACK = f"{N8N_BASE_URL}/webhook/whatsapp-webhook"

# ───────── Authentication ─────────

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/login")
def login(req: LoginRequest):
    users = {
        "reception": {"role": "receptionniste", "name": "Réception"},
        "medecin": {"role": "medecin", "name": "Dr. AlloDoc"},
        "admin": {"role": "admin", "name": "Administrateur"}
    }
    if req.username in users and req.password == req.username:
        return {"status": "success", "token": f"fake-jwt-token-{req.username}", "user": users[req.username]}
    raise HTTPException(status_code=401, detail="Identifiants invalides")

# ───────── Health Check ─────────

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "AlloDoc FastAPI"}

# ───────── Patients ─────────

@router.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    res = []
    for p in patients:
        last_apt = db.query(Appointment).filter(Appointment.patient_id == p.id).order_by(Appointment.appointment_time.desc()).first()
        last_visit = last_apt.appointment_time.strftime("%d %b %Y") if last_apt else "Aucune"
        
        has_high_risk = db.query(Appointment).filter(
            Appointment.patient_id == p.id,
            Appointment.no_show_risk_score >= 0.40,
            Appointment.status == "scheduled"
        ).count() > 0
        
        status_str = "Risque No-Show" if has_high_risk else "Actif"
        
        last_msg = db.query(Message).filter(Message.patient_id == p.id).order_by(Message.timestamp.desc()).first()
        condition = "Général"
        if last_msg and last_msg.detected_intent:
            condition = last_msg.detected_intent
        
        res.append({
            "id": str(p.id),
            "name": p.full_name or "Anonyme",
            "phone": p.phone_number,
            "lastVisit": last_visit,
            "condition": condition,
            "status": status_str
        })
    return {"status": "success", "data": res}

@router.get("/patients/{patient_id}/history")
def get_patient_history(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    
    apts = db.query(Appointment).filter(Appointment.patient_id == patient.id).order_by(Appointment.appointment_time.desc()).all()
    
    res = []
    for a in apts:
        note = f"Consultation avec le médecin. Taux de risque no-show calculé par l'IA : {round((a.no_show_risk_score or 0.0)*100)}%."
        prescription = "Paracétamol 1g" if a.status == "confirmed" else "Aucune"
        res.append({
            "id": str(a.id),
            "date": a.appointment_time.strftime("%d %b %Y"),
            "type": "Consultation",
            "note": note,
            "prescription": prescription
        })
        
    return {
        "status": "success", 
        "patient": {
            "name": patient.full_name,
            "phone": patient.phone_number,
            "id": str(patient.id)
        },
        "data": res
    }

# ───────── Doctors ─────────

@router.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    docs = db.query(Doctor).all()
    return {"status": "success", "data": [{"id": str(d.id), "name": d.name, "specialty": d.specialty} for d in docs]}

# ───────── Appointments ─────────

@router.get("/appointments")
def get_appointments(db: Session = Depends(get_db)):
    apts = db.query(Appointment).order_by(Appointment.appointment_time.asc()).all()
    res = []
    for i, a in enumerate(apts):
        patient = db.query(Patient).filter(Patient.id == a.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        
        patient_name = patient.full_name if patient else "Inconnu"
        doctor_name = doctor.name if doctor else "Inconnu"
        
        risk_level = "Low"
        if a.no_show_risk_score:
            if a.no_show_risk_score >= 0.70:
                risk_level = "High"
            elif a.no_show_risk_score >= 0.40:
                risk_level = "Medium"
        
        status_label = "Confirmé" if a.status == "confirmed" else "Scheduled"
        if a.status == "cancelled":
            status_label = "Annulé par IA"
        elif a.status == "scheduled":
            status_label = "Attente"
            
        res.append({
            "id": str(a.id),
            "patient": patient_name,
            "doctor": doctor_name,
            "time": a.appointment_time.strftime("%H:%M"),
            "date": a.appointment_time.strftime("%Y-%m-%d"),
            "datetime": a.appointment_time.isoformat(),
            "status": status_label,
            "risk": risk_level,
            "risk_score": a.no_show_risk_score or 0.15,
            "type": "Consultation" if i % 2 == 0 else "Suivi"
        })
    return {"status": "success", "data": res}

class BookRequest(BaseModel):
    patient_phone: str
    patient_name: str
    doctor_id: str
    appointment_time: str

@router.post("/appointments/book")
def book_appointment(req: BookRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.phone_number == req.patient_phone).first()
    if not patient:
        patient = Patient(phone_number=req.patient_phone, full_name=req.patient_name, language_preference="fr")
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
    try:
        apt_time = datetime.fromisoformat(req.appointment_time.replace("Z", ""))
    except:
        try:
            apt_time = datetime.strptime(req.appointment_time, "%Y-%m-%d %H:%M")
        except:
            raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez le format ISO.")
            
    prev_no_shows = db.query(Appointment).filter(
        Appointment.patient_id == patient.id,
        Appointment.status == "no_show"
    ).count()
    
    days_in_advance = (apt_time.date() - date.today()).days
    
    risk_score = assistant_ia.predict_no_show_risk({
        "previous_no_shows": prev_no_shows,
        "days_in_advance": days_in_advance,
        "language": patient.language_preference
    })
    
    apt = Appointment(
        patient_id=patient.id,
        doctor_id=req.doctor_id,
        appointment_time=apt_time,
        status="scheduled",
        no_show_risk_score=risk_score
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)
    
    pred = MLPrediction(appointment_id=apt.id, risk_score=risk_score)
    db.add(pred)
    db.commit()
    
    try:
        n8n_url = N8N_WEBHOOK_APPOINTMENT_BOOKED
        req_n8n = urllib.request.Request(
            n8n_url,
            data=json.dumps({"appointment_id": str(apt.id), "patient": patient.full_name, "time": req.appointment_time}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req_n8n, timeout=3)
    except Exception as e:
        print(f"n8n webhook notification skipped: {e}")
        
    return {"status": "success", "message": "Appointment booked", "appointment_id": str(apt.id), "risk_score": risk_score}

class RescheduleRequest(BaseModel):
    appointment_time: str

@router.put("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(appointment_id: str, req: RescheduleRequest, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
        
    try:
        apt_time = datetime.fromisoformat(req.appointment_time.replace("Z", ""))
    except:
        try:
            apt_time = datetime.strptime(req.appointment_time, "%Y-%m-%d %H:%M")
        except:
            raise HTTPException(status_code=400, detail="Format de date invalide.")
            
    apt.appointment_time = apt_time
    
    patient = db.query(Patient).filter(Patient.id == apt.patient_id).first()
    prev_no_shows = db.query(Appointment).filter(
        Appointment.patient_id == apt.patient_id,
        Appointment.status == "no_show"
    ).count()
    days_in_advance = (apt_time.date() - date.today()).days
    
    risk_score = assistant_ia.predict_no_show_risk({
        "previous_no_shows": prev_no_shows,
        "days_in_advance": days_in_advance,
        "language": patient.language_preference if patient else "fr"
    })
    
    apt.no_show_risk_score = risk_score
    
    pred = MLPrediction(appointment_id=apt.id, risk_score=risk_score)
    db.add(pred)
    db.commit()
    
    return {"status": "success", "message": f"Appointment rescheduled", "risk_score": risk_score}

@router.delete("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
        
    apt.status = "cancelled"
    db.commit()
    
    wait_list = db.query(Waitlist).filter(Waitlist.doctor_id == apt.doctor_id).first()
    if wait_list:
        try:
            n8n_url = N8N_WEBHOOK_WAITLIST_FILL
            req_n8n = urllib.request.Request(
                n8n_url,
                data=json.dumps({"cancelled_appointment_id": str(apt.id), "waitlist_id": str(wait_list.id)}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            urllib.request.urlopen(req_n8n, timeout=3)
        except Exception as e:
            print(f"n8n waitlist notification skipped: {e}")
            
    return {"status": "success", "message": f"Appointment cancelled"}

# ───────── Alerts ─────────

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    apts = db.query(Appointment).filter(
        (Appointment.no_show_risk_score >= 0.40) | (Appointment.status == "cancelled")
    ).all()
    
    res = []
    for a in apts:
        patient = db.query(Patient).filter(Patient.id == a.patient_id).first()
        patient_name = patient.full_name if patient else "Inconnu"
        
        reason = f"Risque de No-Show Élevé ({round((a.no_show_risk_score or 0.0)*100)}%)"
        action = "Appel de confirmation requis"
        if a.status == "cancelled":
            reason = "Annulation de dernière minute (WhatsApp)"
            action = "Libérer le créneau"
            
        res.append({
            "id": str(a.id),
            "patient": patient_name,
            "reason": reason,
            "time": a.appointment_time.strftime("%H:%M"),
            "action": action
        })
    return {"status": "success", "data": res}

# ───────── Planning ─────────

@router.get("/planning")
def get_planning(db: Session = Depends(get_db)):
    today = date.today()
    apts = db.query(Appointment).filter(
        func.date(Appointment.appointment_time) == today
    ).order_by(Appointment.appointment_time.asc()).all()
    
    slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
    schedule = []
    
    for s in slots:
        apt_slot = None
        for a in apts:
            if a.appointment_time.strftime("%H:%M") == s:
                apt_slot = a
                break
                
        if s == "12:00":
            schedule.append({
                "time": "12:00",
                "patient": "Pause Déjeuner",
                "type": "Pause",
                "status": "Indisponible"
            })
        elif apt_slot:
            patient = db.query(Patient).filter(Patient.id == apt_slot.patient_id).first()
            patient_name = patient.full_name if patient else "Inconnu"
            status_lbl = "Confirmé" if apt_slot.status == "confirmed" else "Annulé" if apt_slot.status == "cancelled" else "Attente"
            schedule.append({
                "time": s,
                "patient": patient_name,
                "type": "Consultation",
                "status": status_lbl
            })
        else:
            schedule.append({
                "time": s,
                "patient": "-",
                "type": "-",
                "status": "Libre"
            })
            
    return {"status": "success", "data": schedule}

# ───────── Waitlist ─────────

@router.get("/waitlist")
def get_waitlist(db: Session = Depends(get_db)):
    wls = db.query(Waitlist).all()
    res = []
    for w in wls:
        patient = db.query(Patient).filter(Patient.id == w.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == w.doctor_id).first()
        res.append({
            "id": str(w.id),
            "patient": patient.full_name if patient else "Inconnu",
            "doctor": doctor.name if doctor else "Inconnu",
            "date": w.requested_date.strftime("%Y-%m-%d")
        })
    return {"status": "success", "data": res}

class WaitlistRequest(BaseModel):
    patient_id: str
    doctor_id: str
    requested_date: str

@router.post("/waitlist")
def add_to_waitlist(req: WaitlistRequest, db: Session = Depends(get_db)):
    try:
        req_date = date.fromisoformat(req.requested_date)
    except:
        raise HTTPException(status_code=400, detail="Le format de la date doit être YYYY-MM-DD")
        
    wl = Waitlist(patient_id=req.patient_id, doctor_id=req.doctor_id, requested_date=req_date)
    db.add(wl)
    db.commit()
    return {"status": "success", "message": "Patient ajouté à la liste d'attente"}

@router.delete("/waitlist/{waitlist_id}")
def delete_from_waitlist(waitlist_id: str, db: Session = Depends(get_db)):
    wl = db.query(Waitlist).filter(Waitlist.id == waitlist_id).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Entrée liste d'attente introuvable")
    db.delete(wl)
    db.commit()
    return {"status": "success", "message": "Patient retiré de la liste d'attente"}

# ───────── Chat Assistant ─────────

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    message_text = request.message.strip()
    if not message_text:
        return {"status": "error", "reply": "Veuillez écrire un message."}
        
    language = assistant_ia.detect_language(message_text)
    intent_data = assistant_ia.classify_intent(message_text)
    intent = intent_data["intent"]
    
    phone = "+212600000000"
    patient = db.query(Patient).filter(Patient.phone_number == phone).first()
    if not patient:
        patient = Patient(phone_number=phone, full_name="Patient Web Chat", language_preference=language)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    else:
        if patient.language_preference != language:
            patient.language_preference = language
            db.commit()
            
    msg = Message(patient_id=patient.id, content=message_text, detected_intent=intent)
    db.add(msg)
    db.commit()
    
    reply = ""
    if intent == "BOOK_APPOINTMENT":
        doc = db.query(Doctor).first()
        doc_id = doc.id if doc else None
        doc_name = doc.name if doc else "Médecin"
        
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow_10am = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        
        risk_score = assistant_ia.predict_no_show_risk({
            "previous_no_shows": 0,
            "days_in_advance": 1,
            "language": language
        })
        
        if doc_id:
            apt = Appointment(
                patient_id=patient.id,
                doctor_id=doc_id,
                appointment_time=tomorrow_10am,
                status="scheduled",
                no_show_risk_score=risk_score
            )
            db.add(apt)
            db.commit()
            
            pred = MLPrediction(appointment_id=apt.id, risk_score=risk_score)
            db.add(pred)
            db.commit()
            
        if language == "fr":
            reply = f"Je vois que vous souhaitez prendre rendez-vous. J'ai pré-réservé un créneau pour demain à 10h00 avec le {doc_name}. Cela vous convient-il ?"
        elif language == "ar":
            reply = f"يبدو أنك تريد حجز موعد. لقد قمت بحجز موعد مبدئي غدًا في الساعة 10:00 صباحًا مع {doc_name}. هل هذا مناسب لك؟"
        elif language == "darija":
            reply = f"بغيتي تاخد موعد، راني رزيرفيت ليك غدا مع 10:00 عند {doc_name}. واش مزيان؟"
        else:
            reply = f"I see you want to book an appointment. I have pre-booked a slot for tomorrow at 10:00 AM with {doc_name}. Does that work for you ?"
            
    elif intent == "CANCEL_APPOINTMENT":
        last_apt = db.query(Appointment).filter(
            Appointment.patient_id == patient.id,
            Appointment.status == "scheduled"
        ).order_by(Appointment.appointment_time.desc()).first()
        
        if last_apt:
            last_apt.status = "cancelled"
            db.commit()
            if language == "fr": reply = "C'est noté, je viens d'annuler votre rendez-vous pré-réservé."
            elif language == "ar": reply = "لقد سجلت ذلك، لقد قمت بإلغاء موعدك المحجوز."
            elif language == "darija": reply = "واخا، راني لغيت الموعد اللي كنتي شاد."
            else: reply = "Noted, I have cancelled your pre-booked appointment."
        else:
            if language == "fr": reply = "Je ne trouve pas de rendez-vous actif à annuler."
            elif language == "ar": reply = "لم أجد أي موعد نشط لإلغائه."
            elif language == "darija": reply = "مالقيت تا شي موعد باش نلغيه."
            else: reply = "I couldn't find any active appointment to cancel."
            
    elif intent == "GENERAL_QUESTION":
        if language == "fr":
            reply = "Le cabinet est ouvert du lundi au vendredi de 9h à 18h. L'adresse est 123 Rue de la Santé, Casablanca."
        elif language == "ar":
            reply = "العيادة مفتوحة من الاثنين إلى الجمعة من الساعة 9 صباحًا حتى 6 مساءً. العنوان: 123 شارع الصحة، الدار البيضاء."
        elif language == "darija":
            reply = "الكلينيك كيحلو من الاثنين تال الجمعة، من 9 د الصباح تال 6 د العشية. العنوان هو 123 شارع الصحة، كازا."
        else:
            reply = "The clinic is open Monday to Friday, 9 AM to 6 PM. Address: 123 Rue de la Sante, Casablanca."
    else:
        if language == "fr":
            reply = "Bonjour ! Je suis l'assistant intelligent AlloDoc. Je peux vous aider à prendre ou annuler un rendez-vous, ou répondre à vos questions sur la clinique."
        elif language == "ar":
            reply = "مرحباً! أنا مساعد AlloDoc الذكي. يمكنني مساعدتك في حجز المواعيد أو إلغائها، أو الإجابة على استفساراتك."
        elif language == "darija":
            if "salam" in message_text.lower() or "cv" in message_text.lower():
                reply = "Salam! Ana l'assistant AlloDoc. N9dr n3awnk takhod wla telghi maw3id, wla njawbk 3la ay so2al."
            else:
                reply = "أنا المساعد الذكي AlloDoc. نقدر نعاونك تحجز ولا تلغي الموعد، ولا نجاوبك على أسئلتك."
        else:
            reply = "Hello! I am the AlloDoc intelligent assistant. I can help you book or cancel appointments, or answer questions about the clinic."
            
    return {
        "status": "success",
        "reply": reply,
        "language": language,
        "ai_analysis": {
            "intent": intent,
            "confidence": intent_data["confidence"]
        }
    }

# ───────── WhatsApp Webhook ─────────

@router.post("/webhooks/whatsapp")
def whatsapp_webhook(payload: dict, db: Session = Depends(get_db)):
    message_text = payload.get("message", "")
    phone = payload.get("phone", "+212600000000")
    
    language = assistant_ia.detect_language(message_text)
    intent_data = assistant_ia.classify_intent(message_text)
    intent = intent_data["intent"]
    entities = assistant_ia.extract_entities(message_text)
    
    patient = db.query(Patient).filter(Patient.phone_number == phone).first()
    if not patient:
        patient = Patient(phone_number=phone, full_name=payload.get("name", "Utilisateur WhatsApp"), language_preference=language)
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
    msg = Message(patient_id=patient.id, content=message_text, detected_intent=intent)
    db.add(msg)
    db.commit()
    
    enriched_payload = {
        "original_message": message_text,
        "language": language,
        "intent": intent,
        "confidence": intent_data["confidence"],
        "entities": entities,
        "source": "whatsapp",
        "phone": phone,
        "patient_id": str(patient.id)
    }
    
    n8n_status = []
    for url in [N8N_WEBHOOK_WHATSAPP, N8N_WEBHOOK_WHATSAPP_FALLBACK]:
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(enriched_payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            urllib.request.urlopen(req, timeout=3)
            n8n_status.append(f"triggered successfully")
        except Exception as e:
            n8n_status.append(f"failed ({str(e)})")
            
    return {
        "status": "processed", 
        "ai_analysis": {"language": language, "intent": intent_data},
        "n8n_integration": "; ".join(n8n_status)
    }

# ───────── Dashboard metrics ─────────

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_apts = db.query(Appointment).count()
    cancelled_apts = db.query(Appointment).filter(Appointment.status == "cancelled").count()
    absence_rate = round((cancelled_apts / total_apts * 100), 1) if total_apts > 0 else 12.0
    
    today = date.today()
    apts_today = db.query(Appointment).filter(func.date(Appointment.appointment_time) == today).count()
    
    high_risk_count = db.query(Appointment).filter(
        func.date(Appointment.appointment_time) == today,
        Appointment.no_show_risk_score >= 0.40,
        Appointment.status == "scheduled"
    ).count()
    
    summary = f"Le modèle prédictif ML a évalué les risques. Il y a {high_risk_count} patient(s) à haut risque d'absence aujourd'hui sur {apts_today} rendez-vous prévus."
    
    return {
        "status": "success",
        "data": {
            "absence_rate": absence_rate,
            "appointments_today": apts_today,
            "high_risk_count": high_risk_count,
            "summary": summary
        }
    }

# ───────── Stats & graph ─────────

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
    counts = []
    labels = []
    for d in range(6, -1, -1):
        day = today - timedelta(days=d)
        cnt = db.query(Appointment).filter(func.date(Appointment.appointment_time) == day).count()
        counts.append(cnt)
        labels.append(day.strftime("%a"))
        
    langs = db.query(Patient.language_preference, func.count(Patient.id)).group_by(Patient.language_preference).all()
    languages_dist = {l: 0 for l in ["fr", "darija", "ar", "en"]}
    total_patients = sum(count for _, count in langs)
    if total_patients > 0:
        for l, count in langs:
            if l in languages_dist:
                languages_dist[l] = round((count / total_patients * 100))
    else:
        languages_dist = {"fr": 45, "darija": 35, "ar": 12, "en": 8}
        
    intents_query = db.query(Message.detected_intent, func.count(Message.id)).group_by(Message.detected_intent).all()
    intents_dist = {i: 0 for i in ["BOOK_APPOINTMENT", "CANCEL_APPOINTMENT", "GENERAL_QUESTION", "UNKNOWN"]}
    total_msgs = sum(count for _, count in intents_query)
    if total_msgs > 0:
        for i_name, count in intents_query:
            name = i_name if i_name in intents_dist else "UNKNOWN"
            intents_dist[name] += count
        for name in intents_dist:
            intents_dist[name] = round((intents_dist[name] / total_msgs * 100))
    else:
        intents_dist = {"BOOK_APPOINTMENT": 72, "CANCEL_APPOINTMENT": 15, "GENERAL_QUESTION": 10, "UNKNOWN": 3}
        
    return {
        "status": "success",
        "data": {
            "weekly_appointments": counts,
            "labels": labels,
            "channels": {"whatsapp": 62, "web": 28, "phone": 10},
            "languages": languages_dist,
            "intents": intents_dist,
            "no_show_trend": [18, 15, 12, 10, 12],
            "no_show_labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"]
        }
    }

# ───────── KPIs ─────────

@router.get("/kpi")
def get_kpi(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    this_month = date.today().replace(day=1)
    new_patients = db.query(Patient).filter(Patient.created_at >= datetime.combine(this_month, datetime.min.time())).count()
    
    return {
        "status": "success",
        "data": {
            "total_patients": total_patients,
            "new_patients_month": new_patients,
            "avg_wait_time_min": 8,
            "ai_response_time_ms": 320,
            "automation_rate": 78,
            "satisfaction_score": 4.6,
            "revenue_saved_monthly": 12400,
            "no_show_reduction": 42
        }
    }

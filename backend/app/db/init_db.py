from sqlalchemy import text
from app.db.session import engine, Base
from app.models.database import Patient, Doctor, Appointment, Message, MLPrediction, TrainingMessage, Waitlist
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta

def init_db():
    print("Initializing database...")
    if "postgresql" in str(engine.url):
        # Enable extension only for PostgreSQL
        with engine.connect() as conn:
            conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
            conn.commit()
        
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
    
    # Seeding initial data
    db = Session(bind=engine)
    try:
        # Check if doctors exist
        if db.query(Doctor).count() == 0:
            print("Seeding initial data...")
            # 1. Doctors
            dr1 = Doctor(name="Dr. Sarah El Fassi", specialty="Généraliste", google_calendar_id="sarah.elfassi@gmail.com")
            dr2 = Doctor(name="Dr. Amine Benali", specialty="Pédiatre", google_calendar_id="amine.benali@gmail.com")
            dr3 = Doctor(name="Dr. Kenza Idrissi", specialty="Cardiologue", google_calendar_id="kenza.idrissi@gmail.com")
            db.add_all([dr1, dr2, dr3])
            db.commit()
            
            # 2. Patients
            p1 = Patient(phone_number="+212612345678", full_name="Youssef Tazi", language_preference="darija")
            p2 = Patient(phone_number="+212698765432", full_name="Fatima Zahra", language_preference="fr")
            p3 = Patient(phone_number="+212611223344", full_name="Omar Chraibi", language_preference="ar")
            p4 = Patient(phone_number="+212655667788", full_name="Khadija Mansouri", language_preference="en")
            db.add_all([p1, p2, p3, p4])
            db.commit()
            
            # 3. Appointments (scheduled for today and upcoming days)
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Past and upcoming appointments
            apts = [
                Appointment(patient_id=p1.id, doctor_id=dr1.id, appointment_time=today + timedelta(hours=9, minutes=0), status="confirmed", no_show_risk_score=0.10),
                Appointment(patient_id=p2.id, doctor_id=dr1.id, appointment_time=today + timedelta(hours=9, minutes=30), status="scheduled", no_show_risk_score=0.75),
                Appointment(patient_id=p3.id, doctor_id=dr2.id, appointment_time=today + timedelta(hours=10, minutes=15), status="confirmed", no_show_risk_score=0.15),
                Appointment(patient_id=p4.id, doctor_id=dr3.id, appointment_time=today + timedelta(hours=11, minutes=0), status="cancelled", no_show_risk_score=0.90),
                Appointment(patient_id=p1.id, doctor_id=dr2.id, appointment_time=today + timedelta(hours=11, minutes=45), status="confirmed", no_show_risk_score=0.25),
                # Next day appointments
                Appointment(patient_id=p2.id, doctor_id=dr1.id, appointment_time=today + timedelta(days=1, hours=10, minutes=0), status="scheduled", no_show_risk_score=0.35),
                Appointment(patient_id=p3.id, doctor_id=dr3.id, appointment_time=today + timedelta(days=1, hours=14, minutes=30), status="scheduled", no_show_risk_score=0.12),
            ]
            db.add_all(apts)
            db.commit()
            
            # 4. Waitlist
            wl1 = Waitlist(patient_id=p4.id, doctor_id=dr1.id, requested_date=date.today())
            db.add(wl1)
            db.commit()
            
            # 5. Messages
            msgs = [
                Message(patient_id=p1.id, content="Bghit nchouf tbib f a9rab wa9t 3afak", detected_intent="BOOK_APPOINTMENT"),
                Message(patient_id=p2.id, content="Bonjour, je souhaite annuler mon rendez-vous de demain.", detected_intent="CANCEL_APPOINTMENT"),
                Message(patient_id=p3.id, content="السلام عليكم، ما هي أوقات عمل العيادة؟", detected_intent="GENERAL_QUESTION"),
            ]
            db.add_all(msgs)
            db.commit()
            
            # 6. ML Predictions
            predictions = [
                MLPrediction(appointment_id=apts[0].id, risk_score=0.10),
                MLPrediction(appointment_id=apts[1].id, risk_score=0.75),
                MLPrediction(appointment_id=apts[2].id, risk_score=0.15),
                MLPrediction(appointment_id=apts[3].id, risk_score=0.90),
                MLPrediction(appointment_id=apts[4].id, risk_score=0.25),
            ]
            db.add_all(predictions)
            db.commit()
            
            # 7. Training Messages seed
            t_msgs = [
                # BOOK_APPOINTMENT
                TrainingMessage(content="je veux prendre rdv", actual_intent="BOOK_APPOINTMENT", language="fr"),
                TrainingMessage(content="pouvez-vous me réserver un rendez-vous ?", actual_intent="BOOK_APPOINTMENT", language="fr"),
                TrainingMessage(content="je souhaite voir le médecin s'il vous plaît", actual_intent="BOOK_APPOINTMENT", language="fr"),
                TrainingMessage(content="est-il possible de fixer une consultation ?", actual_intent="BOOK_APPOINTMENT", language="fr"),
                TrainingMessage(content="I want to book an appointment", actual_intent="BOOK_APPOINTMENT", language="en"),
                TrainingMessage(content="can I get a consultation tomorrow?", actual_intent="BOOK_APPOINTMENT", language="en"),
                TrainingMessage(content="schedule a visit with the doctor", actual_intent="BOOK_APPOINTMENT", language="en"),
                TrainingMessage(content="أريد حجز موعد طبي", actual_intent="BOOK_APPOINTMENT", language="ar"),
                TrainingMessage(content="هل يمكنني تسجيل موعد مع الطبيب؟", actual_intent="BOOK_APPOINTMENT", language="ar"),
                TrainingMessage(content="أريد مقابلة الدكتور غدا", actual_intent="BOOK_APPOINTMENT", language="ar"),
                TrainingMessage(content="bghit nchouf tbib", actual_intent="BOOK_APPOINTMENT", language="darija"),
                TrainingMessage(content="bghit nakhod rdv", actual_intent="BOOK_APPOINTMENT", language="darija"),
                TrainingMessage(content="chouf lia chi wa9t khawi", actual_intent="BOOK_APPOINTMENT", language="darija"),
                TrainingMessage(content="3afak bghit ndir rendez vous", actual_intent="BOOK_APPOINTMENT", language="darija"),

                # CANCEL_APPOINTMENT
                TrainingMessage(content="je veux annuler mon rendez-vous", actual_intent="CANCEL_APPOINTMENT", language="fr"),
                TrainingMessage(content="je ne viendrai pas à ma consultation", actual_intent="CANCEL_APPOINTMENT", language="fr"),
                TrainingMessage(content="veuillez supprimer ma réservation de demain", actual_intent="CANCEL_APPOINTMENT", language="fr"),
                TrainingMessage(content="please cancel my appointment", actual_intent="CANCEL_APPOINTMENT", language="en"),
                TrainingMessage(content="I need to cancel my booking", actual_intent="CANCEL_APPOINTMENT", language="en"),
                TrainingMessage(content="I can't make it to my consultation", actual_intent="CANCEL_APPOINTMENT", language="en"),
                TrainingMessage(content="يرجى إلغاء موعدي المحجوز", actual_intent="CANCEL_APPOINTMENT", language="ar"),
                TrainingMessage(content="أود إلغاء الحجز من فضلكم", actual_intent="CANCEL_APPOINTMENT", language="ar"),
                TrainingMessage(content="لن أستطيع الحضور للعيادة", actual_intent="CANCEL_APPOINTMENT", language="ar"),
                TrainingMessage(content="annuler rdv", actual_intent="CANCEL_APPOINTMENT", language="darija"),
                TrainingMessage(content="baghi n'annuler rendez-vous", actual_intent="CANCEL_APPOINTMENT", language="darija"),
                TrainingMessage(content="mabghitch nji lrdv", actual_intent="CANCEL_APPOINTMENT", language="darija"),
                TrainingMessage(content="mab9itch ghadi nji", actual_intent="CANCEL_APPOINTMENT", language="darija"),
                TrainingMessage(content="ghadi n'annuler rendez vous dyali", actual_intent="CANCEL_APPOINTMENT", language="darija"),

                # GENERAL_QUESTION
                TrainingMessage(content="quelles sont vos horaires d'ouverture ?", actual_intent="GENERAL_QUESTION", language="fr"),
                TrainingMessage(content="quel est le prix de la consultation ?", actual_intent="GENERAL_QUESTION", language="fr"),
                TrainingMessage(content="où se trouve le cabinet médical ?", actual_intent="GENERAL_QUESTION", language="fr"),
                TrainingMessage(content="what are your clinical hours?", actual_intent="GENERAL_QUESTION", language="en"),
                TrainingMessage(content="how much does a consultation cost?", actual_intent="GENERAL_QUESTION", language="en"),
                TrainingMessage(content="where is your clinic located?", actual_intent="GENERAL_QUESTION", language="en"),
                TrainingMessage(content="ما هي أوقات عمل العيادة؟", actual_intent="GENERAL_QUESTION", language="ar"),
                TrainingMessage(content="كم سعر الكشفية الطبية؟", actual_intent="GENERAL_QUESTION", language="ar"),
                TrainingMessage(content="أين يقع موقع العيادة بالضبط؟", actual_intent="GENERAL_QUESTION", language="ar"),
                TrainingMessage(content="fin jina", actual_intent="GENERAL_QUESTION", language="darija"),
                TrainingMessage(content="fin blassa kaynin", actual_intent="GENERAL_QUESTION", language="darija"),
                TrainingMessage(content="chhal taman dial rdv", actual_intent="GENERAL_QUESTION", language="darija"),
                TrainingMessage(content="fin kayn lclinique", actual_intent="GENERAL_QUESTION", language="darija"),

                # GREETING
                TrainingMessage(content="bonjour", actual_intent="GREETING", language="fr"),
                TrainingMessage(content="salut", actual_intent="GREETING", language="fr"),
                TrainingMessage(content="bonjour, comment allez-vous ?", actual_intent="GREETING", language="fr"),
                TrainingMessage(content="hello", actual_intent="GREETING", language="en"),
                TrainingMessage(content="hi there", actual_intent="GREETING", language="en"),
                TrainingMessage(content="hi there, can you help me?", actual_intent="GREETING", language="en"),
                TrainingMessage(content="السلام عليكم", actual_intent="GREETING", language="ar"),
                TrainingMessage(content="أهلاً وسهلاً بك", actual_intent="GREETING", language="ar"),
                TrainingMessage(content="salam alaykom", actual_intent="GREETING", language="darija"),
                TrainingMessage(content="salam cv labas", actual_intent="GREETING", language="darija"),
                TrainingMessage(content="salamo alaykom khti", actual_intent="GREETING", language="darija"),
            ]
            db.add_all(t_msgs)
            db.commit()
            print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True, index=True)
    full_name = Column(String(100))
    language_preference = Column(String(10), default="fr")
    created_at = Column(DateTime, default=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100))
    specialty = Column(String(100))
    google_calendar_id = Column(String(255))

    appointments = relationship("Appointment", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"))
    appointment_time = Column(DateTime)
    status = Column(String(20), default="scheduled")
    no_show_risk_score = Column(Float, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"))
    requested_date = Column(Date)

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    content = Column(String)
    detected_intent = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

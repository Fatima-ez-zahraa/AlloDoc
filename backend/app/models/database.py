import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class Patient(Base):
    __tablename__ = 'patients'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(100))
    language_preference = Column(String(10), default='fr')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="patient", cascade="all, delete-orphan")
    waitlist_entries = relationship("Waitlist", back_populates="patient", cascade="all, delete-orphan")

class Doctor(Base):
    __tablename__ = 'doctors'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    specialty = Column(String(100))
    google_calendar_id = Column(String(255))
    
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan")
    waitlist_entries = relationship("Waitlist", back_populates="doctor", cascade="all, delete-orphan")

class Appointment(Base):
    __tablename__ = 'appointments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id', ondelete='CASCADE'))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey('doctors.id', ondelete='CASCADE'))
    appointment_time = Column(DateTime, nullable=False)
    status = Column(String(20), default='scheduled')
    no_show_risk_score = Column(Float)
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    ml_predictions = relationship("MLPrediction", back_populates="appointment", cascade="all, delete-orphan")

class Waitlist(Base):
    __tablename__ = 'waitlist'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id', ondelete='CASCADE'))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey('doctors.id', ondelete='CASCADE'))
    requested_date = Column(Date, nullable=False)
    
    patient = relationship("Patient", back_populates="waitlist_entries")
    doctor = relationship("Doctor", back_populates="waitlist_entries")

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id', ondelete='CASCADE'))
    content = Column(Text, nullable=False)
    detected_intent = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="messages")

class MLPrediction(Base):
    __tablename__ = 'ml_predictions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey('appointments.id', ondelete='CASCADE'))
    risk_score = Column(Float, nullable=False)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    
    appointment = relationship("Appointment", back_populates="ml_predictions")

class TrainingMessage(Base):
    __tablename__ = 'training_messages'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    actual_intent = Column(String(50), nullable=False)
    language = Column(String(10))
    added_at = Column(DateTime, default=datetime.utcnow)

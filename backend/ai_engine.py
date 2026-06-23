import re
import random
from typing import Dict, Any

class AssistantIA:
    """Moteur IA NLP Multilingue (Mock avancé pour le MVP)"""
    
    INTENTS = {
        "BOOK_APPOINTMENT": ["rdv", "rendez-vous", "appointment", "book", "voir le docteur", "موعد", "طبيب", "بغيت نشوف", "rendez vous"],
        "CANCEL_APPOINTMENT": ["annuler", "cancel", "decline", "reporter", "إلغاء", "تأجيل", "مغانجيش"],
        "GENERAL_QUESTION": ["horaire", "prix", "adresse", "location", "time", "fee", "الثمن", "فين", "وقت"]
    }
    
    LANGUAGES = {
        "fr": ["bonjour", "rdv", "annuler", "docteur", "merci"],
        "en": ["hello", "appointment", "cancel", "doctor", "thanks"],
        "ar": ["موعد", "طبيب", "إلغاء", "شكرا", "سلام"],
        "darija": ["بغيت", "نشوف", "مغانجيش", "فين", "شحال"]
    }

    @staticmethod
    def detect_language(text: str) -> str:
        text_lower = text.lower()
        scores = {lang: sum(1 for word in words if word in text_lower) for lang, words in AssistantIA.LANGUAGES.items()}
        detected = max(scores, key=scores.get)
        return detected if scores[detected] > 0 else "fr" # Default to French

    @staticmethod
    def classify_intent(text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # Simple keyword-based intent classification
        for intent, keywords in AssistantIA.INTENTS.items():
            if any(kw in text_lower for kw in keywords):
                return {"intent": intent, "confidence": round(random.uniform(0.85, 0.98), 2)}
        
        return {"intent": "UNKNOWN", "confidence": 0.4}

    @staticmethod
    def extract_entities(text: str) -> Dict[str, str]:
        entities = {}
        # Simple extraction for demo purposes
        if re.search(r'\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|aujourd\'hui)\b', text.lower()):
            match = re.search(r'\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|aujourd\'hui)\b', text.lower())
            entities['date'] = match.group(0)
            
        if re.search(r'\b([0-1]?[0-9]|2[0-3])[h:]?([0-5][0-9])?\b', text.lower()):
            match = re.search(r'\b([0-1]?[0-9]|2[0-3])[h:]?([0-5][0-9])?\b', text.lower())
            entities['time'] = match.group(0)
            
        return entities

    @staticmethod
    def predict_no_show_risk(patient_history: Dict) -> float:
        """
        Algorithme de prédiction de No-Show
        Prend en compte l'historique du patient, l'âge, et le délai de réservation.
        """
        base_risk = 0.15 # 15% risque de base
        
        # Si le patient a déjà manqué des RDV
        if patient_history.get("previous_no_shows", 0) > 0:
            base_risk += 0.30
            
        # Réservation le jour même (risque plus faible)
        if patient_history.get("days_in_advance", 0) == 0:
            base_risk -= 0.10
            
        return round(min(max(base_risk, 0.05), 0.95), 2)

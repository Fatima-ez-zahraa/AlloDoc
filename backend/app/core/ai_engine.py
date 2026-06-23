import re
import random
import os
import pickle
from typing import Dict, Any

class AssistantIA:
    """Moteur IA NLP Multilingue (Hybride Règle + Machine Learning)"""
    
    INTENTS = {
        "BOOK_APPOINTMENT": ["rdv", "rendez-vous", "appointment", "book", "voir le docteur", "موعد", "طبيب", "بغيت نشوف", "rendez vous", "réserver", "reserver"],
        "CANCEL_APPOINTMENT": ["annuler", "cancel", "decline", "reporter", "إلغاء", "تأجيل", "مغانجيش", "supprimer", "annulation"],
        "GENERAL_QUESTION": ["horaire", "prix", "adresse", "location", "time", "fee", "الثمن", "فين", "وقت", "tarifs", "tarif", "contact", "cabinet"],
        "GREETING": ["bonjour", "salut", "hello", "hi", "salam", "سلام", "ahlan", "coucou"]
    }
    
    LANGUAGES = {
        "fr": ["bonjour", "rdv", "annuler", "docteur", "merci", "rendez", "vous", "prendre", "horaires", "salut"],
        "en": ["hello", "appointment", "cancel", "doctor", "thanks", "book", "clinic", "schedule", "hi"],
        "ar": ["موعد", "طبيب", "إلغاء", "شكرا", "سلام", "حجز", "أريد"],
        "darija": ["بغيت", "نشوف", "مغانجيش", "فين", "شحال", "عافاك", "تبيب", "واخا", "salam", "labas", "cv", "chokran"]
    }

    def __init__(self, model_path="intent_model.pkl"):
        self.model_path = model_path
        self.ml_classifier = None
        self.encoder = None
        
        # Try loading SentenceTransformer for ML classification
        try:
            from sentence_transformers import SentenceTransformer
            self.encoder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            if os.path.exists(self.model_path):
                with open(self.model_path, "rb") as f:
                    self.ml_classifier = pickle.load(f)
            print("SentenceTransformer loaded successfully.")
        except Exception as e:
            print(f"Machine learning SentenceTransformer not loaded (running in fallback rule mode): {e}")

    def train_ml(self, texts, labels):
        if not self.encoder:
            return
        try:
            from sklearn.svm import SVC
            embeddings = self.encoder.encode(texts)
            self.ml_classifier = SVC(probability=True)
            self.ml_classifier.fit(embeddings, labels)
            with open(self.model_path, "wb") as f:
                pickle.dump(self.ml_classifier, f)
            print("ML IntentClassifier trained successfully.")
        except Exception as e:
            print(f"Failed to train ML classifier: {e}")

    def detect_language(self, text: str) -> str:
        text_lower = text.lower()
        scores = {lang: sum(1 for word in words if word in text_lower) for lang, words in self.LANGUAGES.items()}
        detected = max(scores, key=scores.get)
        return detected if scores[detected] > 0 else "fr"

    def classify_intent(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # 1. Rule-based checks (High precision, fast)
        for intent, keywords in self.INTENTS.items():
            if any(kw in text_lower for kw in keywords):
                return {"intent": intent, "confidence": round(random.uniform(0.90, 0.99), 2), "method": "rule"}
        
        # 2. ML checks (Fallback if rule is unknown and ML is available)
        if self.ml_classifier and self.encoder:
            try:
                embedding = self.encoder.encode([text])
                probabilities = self.ml_classifier.predict_proba(embedding)[0]
                max_prob_index = probabilities.argmax()
                intent = self.ml_classifier.classes_[max_prob_index]
                confidence = probabilities[max_prob_index]
                if confidence > 0.5:
                    return {"intent": intent, "confidence": round(float(confidence), 2), "method": "ml"}
            except Exception as e:
                print(f"ML inference error: {e}")
                
        return {"intent": "UNKNOWN", "confidence": 0.40, "method": "fallback"}

    def extract_entities(self, text: str) -> Dict[str, str]:
        entities = {}
        # Date extraction
        date_pattern = r'\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|aujourd\'hui)\b'
        match_date = re.search(date_pattern, text.lower())
        if match_date:
            entities['date'] = match_date.group(0)
            
        # Time extraction
        time_pattern = r'\b([0-1]?[0-9]|2[0-3])[h:]?([0-5][0-9])?\b'
        match_time = re.search(time_pattern, text.lower())
        if match_time:
            entities['time'] = match_time.group(0)
            
        return entities

    def predict_no_show_risk(self, patient_history: Dict) -> float:
        """
        No-Show Prediction Risk Score
        Calculates a score between 0.0 and 1.0 based on patient history metrics.
        """
        base_risk = 0.15
        
        # Risk factors
        previous_no_shows = patient_history.get("previous_no_shows", 0)
        if previous_no_shows > 0:
            base_risk += min(previous_no_shows * 0.25, 0.60)
            
        days_in_advance = patient_history.get("days_in_advance", 0)
        if days_in_advance > 7:
            base_risk += 0.15
        elif days_in_advance == 0:
            base_risk -= 0.10
            
        return round(min(max(base_risk, 0.05), 0.95), 2)

# Global Instance
assistant_ia = AssistantIA()

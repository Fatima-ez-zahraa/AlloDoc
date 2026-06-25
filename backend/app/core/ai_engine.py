import re
import random
import os
import pickle
from typing import Dict, Any, List

class AssistantIA:
    """Moteur IA NLP Multilingue (Hybride Règle + Similarité de Mots + Machine Learning)"""
    
    INTENTS = {
        "BOOK_APPOINTMENT": [
            "rdv", "rendez-vous", "appointment", "book", "voir le docteur", "voir le medecin", 
            "موعد", "طبيب", "بغيت نشوف", "rendez vous", "réserver", "reserver", "booking", 
            "consultation", "visite", "créneau", "creneau", "hجز", "nakhod", "ndir", "taking rdv"
        ],
        "CANCEL_APPOINTMENT": [
            "annuler", "cancel", "decline", "reporter", "إلغاء", "تأجيل", "مغانجيش", 
            "supprimer", "annulation", "lghi", "mabghitch", "mab9itch", "mabghitsh", 
            "mab9itsh", "delete", "remove", "postpone"
        ],
        "GENERAL_QUESTION": [
            "horaire", "prix", "adresse", "location", "time", "fee", "الثمن", "فين", "وقت", 
            "tarifs", "tarif", "contact", "cabinet", "clinique", "clinic", "working hours", 
            "cost", "où", "ou se trouve", "heures", "ouvert", "blassa", "taman"
        ],
        "GREETING": [
            "bonjour", "salut", "hello", "hi", "salam", "سلام", "ahlan", "coucou", 
            "hey", "yo", "bonsoir", "labas", "cv", "ki dayr", "marhaba", "salamo"
        ]
    }
    
    LANGUAGES = {
        "fr": [
            "bonjour", "rdv", "annuler", "docteur", "merci", "rendez", "vous", "prendre", 
            "horaires", "salut", "cabinet", "clinique", "consultation", "prix", "adresse", 
            "sil", "plait", "je", "le", "la", "pour"
        ],
        "en": [
            "hello", "appointment", "cancel", "doctor", "thanks", "book", "clinic", 
            "schedule", "hi", "hours", "location", "please", "want", "cost", "where", 
            "is", "to", "with", "the", "my"
        ],
        "ar": [
            "موعد", "طبيب", "إلغاء", "شكرا", "سلام", "حجز", "أريد", "العيادة", "موقع", 
            "أوقات", "عمل", "سعر", "الكشف", "هل", "يمكنني", "من", "فضلكم", "مع", "الدكتور"
        ],
        "darija": [
            "بغيت", "نشوف", "مغانجيش", "فين", "شحال", "عافاك", "تبيب", "واخا", "salam", 
            "labas", "cv", "chokran", "bghit", "nchouf", "tbib", "mabghitch", "mab9itch", 
            "blassa", "taman", "lghi", "khti", "baraka", "lah", "lia", "mabghitsh", "mab9itsh"
        ]
    }

    def __init__(self, model_path="intent_model.pkl"):
        self.model_path = model_path
        self.ml_classifier = None
        self.encoder = None
        self.db_phrases: List[Dict[str, Any]] = []  # Dynamic database vocabulary memory
        
        # Load db phrases initially
        self.load_db_knowledge()
        
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

    def load_db_knowledge(self):
        """Loads training messages from the database and tokenizes them for fast similarity matching."""
        try:
            from app.db.session import SessionLocal
            from app.models.database import TrainingMessage
            db = SessionLocal()
            try:
                msgs = db.query(TrainingMessage).all()
                self.db_phrases = []
                for m in msgs:
                    self.db_phrases.append({
                        "id": str(m.id),
                        "content": m.content,
                        "intent": m.actual_intent,
                        "language": m.language,
                        "tokens": self._tokenize(m.content)
                    })
                print(f"Loaded {len(self.db_phrases)} phrases from database.")
            finally:
                db.close()
        except Exception as e:
            print(f"Error loading phrases from database: {e}")

    def _tokenize(self, text: str) -> set:
        """Helper to convert text into clean word tokens, preserving Arabic letters."""
        clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
        return {word for word in clean_text.split() if word}

    def train_ml(self, texts, labels):
        # Reload database cache when training is called
        self.load_db_knowledge()
        
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
        
        # 1. Rule-based language check (Word overlap)
        scores = {lang: sum(1 for word in words if word in text_lower) for lang, words in self.LANGUAGES.items()}
        detected = max(scores, key=scores.get)
        if scores[detected] > 0:
            return detected
            
        # 2. Dynamic DB phrase-based language check
        if not self.db_phrases:
            self.load_db_knowledge()
            
        user_tokens = self._tokenize(text)
        if user_tokens and self.db_phrases:
            best_score = 0.0
            best_lang = "fr"
            for phrase in self.db_phrases:
                phrase_tokens = phrase["tokens"]
                intersection = user_tokens.intersection(phrase_tokens)
                if intersection:
                    jaccard = len(intersection) / len(user_tokens.union(phrase_tokens))
                    overlap = len(intersection) / len(phrase_tokens)
                    score = 0.3 * jaccard + 0.7 * overlap
                    if score > best_score:
                        best_score = score
                        best_lang = phrase["language"]
            if best_score > 0.35:
                return best_lang
                
        return "fr"

    def classify_intent(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # 1. Rule-based checks (High precision, fast)
        for intent, keywords in self.INTENTS.items():
            if any(kw in text_lower for kw in keywords):
                return {"intent": intent, "confidence": round(random.uniform(0.92, 0.99), 2), "method": "rule"}
        
        # 2. Fallback Jaccard/Overlap word-similarity checks using Dynamic DB knowledge
        if not self.db_phrases:
            self.load_db_knowledge()
            
        user_tokens = self._tokenize(text)
        if user_tokens and self.db_phrases:
            best_score = 0.0
            best_match = None
            for phrase in self.db_phrases:
                phrase_tokens = phrase["tokens"]
                intersection = user_tokens.intersection(phrase_tokens)
                if intersection:
                    jaccard = len(intersection) / len(user_tokens.union(phrase_tokens))
                    overlap = len(intersection) / len(phrase_tokens)
                    score = 0.3 * jaccard + 0.7 * overlap
                    if score > best_score:
                        best_score = score
                        best_match = phrase
            
            if best_score > 0.35 and best_match:
                confidence = round(0.5 + 0.49 * best_score, 2)
                return {
                    "intent": best_match["intent"],
                    "confidence": confidence,
                    "method": "phrase_similarity",
                    "matched_phrase": best_match["content"]
                }
        
        # 3. ML checks (Fallback if similarity is low and ML is available)
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

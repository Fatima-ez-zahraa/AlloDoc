class MLPipeline:
    def __init__(self):
        # Placeholder for loading models
        pass

    def detect_language(self, text: str) -> str:
        # Placeholder for FastText language detection
        return "fr"

    def predict_intent(self, text: str):
        # Placeholder for Intent classification using SentenceTransformers and Scikit-learn
        return {
            "intent": "BOOK_APPOINTMENT",
            "confidence": 0.95
        }

    def predict_no_show(self, appointment_data: dict) -> float:
        # Placeholder for No-Show risk prediction
        return 0.15

ml_pipeline = MLPipeline()

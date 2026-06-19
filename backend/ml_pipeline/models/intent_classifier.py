import json
from sentence_transformers import SentenceTransformer
from sklearn.svm import SVC
import pickle
import os

class IntentClassifier:
    def __init__(self, model_path="intent_model.pkl"):
        self.encoder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.model_path = model_path
        self.classifier = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, "rb") as f:
                self.classifier = pickle.load(f)

    def train(self, texts, labels):
        embeddings = self.encoder.encode(texts)
        self.classifier = SVC(probability=True)
        self.classifier.fit(embeddings, labels)
        with open(self.model_path, "wb") as f:
            pickle.dump(self.classifier, f)

    def predict(self, text):
        if not self.classifier:
            return "UNKNOWN", 0.0
        embedding = self.encoder.encode([text])
        probabilities = self.classifier.predict_proba(embedding)[0]
        max_prob_index = probabilities.argmax()
        return self.classifier.classes_[max_prob_index], probabilities[max_prob_index]

if __name__ == "__main__":
    # Dummy training process
    texts = ["je veux prendre rdv", "cancel my appointment", "bghit nchouf tbib"]
    labels = ["BOOK_APPOINTMENT", "CANCEL_APPOINTMENT", "BOOK_APPOINTMENT"]
    clf = IntentClassifier()
    clf.train(texts, labels)
    print("Training complete. Model saved.")

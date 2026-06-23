# Intégration N8N dans AlloDoc

## Vue d'ensemble

L'intégration N8N permet d'automatiser les workflows AlloDoc sans exécution manuelle. Les webhooks N8N sont déclenchés automatiquement par les appels API du frontend ou du backend.

## Architecture

```
Frontend (Next.js)
    ↓
API Backend (FastAPI)
    ↓
N8N Workflows
    ↓
WhatsApp, Email, Base de données, etc.
```

## Fichiers créés

### Backend (Python)

- **`backend/app/core/n8n_client.py`** : Client N8N pour déclencher les webhooks
- **`backend/app/core/__init__.py`** : Import du client N8N
- **`backend/app/interfaces/api/routes.py`** : Routes mises à jour avec intégration N8N
- **`backend/.env.example`** : Variables d'environnement exemple

### Frontend (TypeScript/Next.js)

- **`frontend/src/lib/n8n-client.ts`** : Client N8N TypeScript
- **`frontend/src/components/ChatWidget.tsx`** : Composant React pour envoyer des messages
- **`frontend/.env.local.example`** : Variables d'environnement exemple

## Configuration

### 1. Variables d'environnement Backend

Crée `backend/.env` avec :

```bash
N8N_BASE_URL=https://ikramkanouz.app.n8n.cloud
N8N_WEBHOOK_TOKEN=your_webhook_token_here
```

### 2. Variables d'environnement Frontend

Crée `frontend/.env.local` avec :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_N8N_URL=https://ikramkanouz.app.n8n.cloud
```

### 3. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

```bash
cd frontend
npm install
```

## Utilisation

### Option 1 : Via le Backend (Recommandé)

Le backend expose les endpoints qui déclenchent N8N :

```bash
# Endpoint Chat
POST /api/v1/chat
{
  "message": "Bonjour, je veux prendre un RDV",
  "user_id": "user123"
}

# Endpoint Prise de RDV
POST /api/v1/appointments/book
{
  "patient_id": "p123",
  "doctor_id": "d456",
  "date": "2024-12-25",
  "time": "10:00",
  "reason": "Consultation générale"
}

# Endpoint Annulation
DELETE /api/v1/appointments/{appointment_id}/cancel
{
  "reason": "Imprévu"
}

# Endpoint Rappel
POST /api/v1/appointments/{appointment_id}/reminder
{
  "phone": "+212612345678",
  "reminder_type": "j-1"
}
```

### Option 2 : Direct aux Webhooks N8N

Depuis le frontend, envoyer directement aux webhooks N8N (bypass backend) :

```javascript
// Méthode 2 du ChatWidget
const result = await N8NClient.sendChatMessageDirect(
  "Mon message",
  "web-user-123",
);
```

### Exemple d'utilisation dans un composant React

```typescript
import N8NClient from "@/lib/n8n-client";

export default function AppointmentForm() {
  const handleBooking = async () => {
    await N8NClient.bookAppointment({
      patient_id: "p123",
      doctor_id: "d456",
      date: "2024-12-25",
      time: "10:00",
      reason: "Consultation",
    });
  };

  return <button onClick={handleBooking}>Réserver</button>;
}
```

## Workflows N8N à créer

D'après ta demande, voici les workflows à créer dans N8N :

### 1. Workflow Chat (`allodoc-message`)

- Webhook reçoit le message du chat
- Traite le message avec IA
- Envoie la réponse back

### 2. Workflow Prise de RDV (`allodoc-book-appointment`)

- Reçoit les détails du RDV
- Crée l'entrée en base de données
- Envoie confirmation WhatsApp

### 3. Workflow Annulation (`allodoc-cancel-appointment`)

- Reçoit l'ID du RDV
- Annule dans la base de données
- Envoie notification WhatsApp

### 4. Workflow Rappel (`allodoc-reminder`)

- Déclenché J-1 du RDV
- Envoie rappel WhatsApp ou Email
- Enregistre l'interaction

## Erreurs courantes

### 1. "N8N webhook error: Connection refused"

- Vérifier que `N8N_BASE_URL` est correct
- Vérifier la connexion internet

### 2. "404 Not Found" sur le webhook

- Vérifier que le chemin du webhook existe dans N8N
- Exemple: `https://ikramkanouz.app.n8n.cloud/webhook/allodoc-message`

### 3. CORS error depuis le frontend

- Si tu appelles directement N8N depuis le frontend, N8N doit autoriser les CORS
- Alternative: toujours passer par le backend

## Prochaines étapes

1. ✅ Créer le client N8N (fait)
2. ✅ Intégrer les routes FastAPI (fait)
3. ✅ Créer le composant frontend (fait)
4. ⏳ Créer les webhooks dans N8N
5. ⏳ Tester chaque workflow
6. ⏳ Ajouter la gestion des erreurs robuste
7. ⏳ Déployer en production

## Démarrage rapide

```bash
# Terminal 1 : Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2 : Frontend
cd frontend
npm run dev

# Tester le chat depuis le frontend
# http://localhost:3000
```

## Notes de sécurité

- ✅ Ne pas commiter `.env` (ajouter à `.gitignore`)
- ✅ Utiliser des variables d'environnement pour les secrets
- ✅ N8N doit valider les requêtes (signature webhook)
- ✅ Limiter les rates limit sur les webhooks

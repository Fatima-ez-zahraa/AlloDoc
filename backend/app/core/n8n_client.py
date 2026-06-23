import os
import httpx
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class N8NClient:
    """Client pour interagir avec N8N sans exécution manuelle."""
    
    def __init__(self):
        self.base_url = os.getenv("N8N_BASE_URL", "https://ikramkanouz.app.n8n.cloud")
        self.webhook_token = os.getenv("N8N_WEBHOOK_TOKEN", "")
        self.timeout = 30
    
    async def trigger_webhook(
        self,
        webhook_path: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Déclenche un webhook N8N avec les données payload.
        
        Args:
            webhook_path: le chemin du webhook (ex: 'allodoc-message')
            payload: données à envoyer
            headers: en-têtes optionnels
        
        Returns:
            Réponse du webhook
        """
        url = f"{self.base_url}/webhook/{webhook_path}"
        
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"N8N webhook error: {e}")
            raise
    
    async def send_chat_message(
        self,
        from_user: str,
        message: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Envoie un message au workflow chat de N8N."""
        payload = {
            "body": {
                "From": f"web:{user_id or from_user}",
                "Body": message
            }
        }
        return await self.trigger_webhook("allodoc-message", payload)
    
    async def trigger_appointment_booking(
        self,
        patient_id: str,
        doctor_id: str,
        appointment_date: str,
        appointment_time: str,
        reason: str
    ) -> Dict[str, Any]:
        """Déclenche le workflow de prise de RDV."""
        payload = {
            "body": {
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "date": appointment_date,
                "time": appointment_time,
                "reason": reason
            }
        }
        return await self.trigger_webhook("allodoc-book-appointment", payload)
    
    async def trigger_appointment_cancellation(
        self,
        appointment_id: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Déclenche le workflow d'annulation de RDV."""
        payload = {
            "body": {
                "appointment_id": appointment_id,
                "reason": reason or "Cancellation requested"
            }
        }
        return await self.trigger_webhook("allodoc-cancel-appointment", payload)
    
    async def trigger_appointment_reminder(
        self,
        appointment_id: str,
        patient_phone: str,
        reminder_type: str = "j-1"  # j-1, j0, h-2
    ) -> Dict[str, Any]:
        """Déclenche un rappel d'appointment J-1."""
        payload = {
            "body": {
                "appointment_id": appointment_id,
                "phone": patient_phone,
                "reminder_type": reminder_type
            }
        }
        return await self.trigger_webhook("allodoc-reminder", payload)


# Instance singleton
n8n_client = N8NClient()

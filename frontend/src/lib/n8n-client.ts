// src/lib/n8n-client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || "https://ikramkanouz.app.n8n.cloud";

interface ChatPayload {
  message: string;
  user_id?: string;
}

interface AppointmentBookingPayload {
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  reason: string;
}

interface AppointmentCancellationPayload {
  appointment_id: string;
  reason?: string;
}

interface AppointmentReminderPayload {
  appointment_id: string;
  phone: string;
  reminder_type?: "j-1" | "j0" | "h-2";
}

export class N8NClient {
  /**
   * Envoie un message au chat via le backend FastAPI
   * qui déclenche le workflow N8N
   */
  static async sendChatMessage(payload: ChatPayload) {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Chat error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Alternative : Envoie directement au webhook N8N sans passer par le backend
   * (Option pour décentraliser si voulu)
   */
  static async sendChatMessageDirect(message: string, userId?: string) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/allodoc-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: {
          From: `web:${userId || "anonymous"}`,
          Body: message,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Déclenche la prise de RDV
   */
  static async bookAppointment(payload: AppointmentBookingPayload) {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Booking error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Annule une RDV
   */
  static async cancelAppointment(
    appointmentId: string,
    reason?: string
  ) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/appointments/${appointmentId}/cancel`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cancellation error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Envoie un rappel J-1
   */
  static async sendReminder(
    appointmentId: string,
    phone: string,
    reminderType: "j-1" | "j0" | "h-2" = "j-1"
  ) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/appointments/${appointmentId}/reminder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          phone,
          reminder_type: reminderType,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Reminder error: ${response.statusText}`);
    }

    return response.json();
  }
}

export default N8NClient;

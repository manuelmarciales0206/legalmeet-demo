interface AppointmentData {
  radicado: string;
  phoneNumber: string;
  userName: string;
  userEmail: string;
  categoria: string;
  urgencia: string;
  preferredDate: string;
  preferredTime: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  createdAt: Date;
}

class AppointmentService {
  private appointments: AppointmentData[] = [];

  /**
   * Crear nueva cita
   */
  createAppointment(data: Omit<AppointmentData, 'status' | 'createdAt'>): AppointmentData {
    const appointment: AppointmentData = {
      ...data,
      status: 'PENDIENTE',
      createdAt: new Date(),
    };

    this.appointments.push(appointment);
    console.log('📅 Cita creada:', appointment.radicado);

    return appointment;
  }

  /**
   * Generar mensaje de confirmación de cita
   */
  generateConfirmationMessage(appointment: AppointmentData): string {
    const formattedDate = this.formatDate(appointment.preferredDate);

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ✅ CITA AGENDADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¡Listo ${appointment.userName}! Tu cita está confirmada.

📋 Radicado: ${appointment.radicado}

👤 Cliente: ${appointment.userName}
📧 Email: ${appointment.userEmail}
📱 WhatsApp: ${appointment.phoneNumber}

📂 Tipo de caso: ${appointment.categoria}
⚠️  Urgencia: ${appointment.urgencia}

📅 Fecha: ${formattedDate}
🕐 Hora: ${appointment.preferredTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 PRÓXIMOS PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Recibirás un email de confirmación
2. El abogado te contactará 15 min antes
3. La consulta será por videollamada

💡 Si necesitas reagendar, escribe:
   "reagendar ${appointment.radicado}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Gracias por confiar en LegalMeet

Cualquier duda: soporte@legalmeet.co
`.trim();
  }

  /**
   * Formatear fecha de manera amigable
   */
  private formatDate(dateString: string): string {
    // Lógica simple para parsear fechas naturales
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lower = dateString.toLowerCase();

    if (lower.includes('hoy')) {
      return today.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }

    if (lower.includes('mañana')) {
      return tomorrow.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }

    // Si es una fecha específica, intentar parsearla
    return dateString;
  }

  /**
   * Obtener todas las citas
   */
  getAllAppointments(): AppointmentData[] {
    return this.appointments;
  }

  /**
   * Buscar cita por radicado
   */
  findByRadicado(radicado: string): AppointmentData | undefined {
    return this.appointments.find(apt => apt.radicado === radicado);
  }
}

export const appointmentService = new AppointmentService();
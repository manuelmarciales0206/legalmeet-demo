import { dateTimeService } from './datetime.service';

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
      createdAt: dateTimeService.getNowInColombia(),
    };

    this.appointments.push(appointment);
    console.log('📅 Cita creada:', appointment.radicado);

    return appointment;
  }

  /**
   * Generar mensaje de confirmación de cita
   */
  generateConfirmationMessage(appointment: AppointmentData): string {
    const formattedDate = dateTimeService.formatDate(
      dateTimeService.parseNaturalDate(appointment.preferredDate)
    );
    const formattedTime = dateTimeService.parseNaturalTime(appointment.preferredTime);
    const createdAt = dateTimeService.formatShortDateTime(appointment.createdAt);

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

📅 Fecha de la cita: ${formattedDate}
🕐 Hora: ${formattedTime} (Hora Colombia)

📝 Solicitud creada: ${createdAt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 PRÓXIMOS PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Recibirás confirmación por email*
2. El abogado te contactará 15 min antes
3. La consulta será por videollamada
4. Prepara tus documentos relacionados

💡 Si necesitas reagendar, escribe:
   "reagendar ${appointment.radicado}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* El envío de emails está pendiente de
  configuración. Por ahora recibirás
  recordatorios solo por WhatsApp.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Gracias por confiar en LegalMeet

Atención: soporte@legalmeet.co
WhatsApp: +57 310 357 6748
`.trim();
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

  /**
   * Obtener citas de hoy
   */
  getTodayAppointments(): AppointmentData[] {
    const today = dateTimeService.formatDate(dateTimeService.getNowInColombia());
    
    return this.appointments.filter(apt => {
      const aptDate = dateTimeService.formatDate(
        dateTimeService.parseNaturalDate(apt.preferredDate)
      );
      return aptDate === today;
    });
  }

  /**
   * Obtener estadísticas de citas
   */
  getStats() {
    return {
      total: this.appointments.length,
      pendientes: this.appointments.filter(a => a.status === 'PENDIENTE').length,
      confirmadas: this.appointments.filter(a => a.status === 'CONFIRMADA').length,
      canceladas: this.appointments.filter(a => a.status === 'CANCELADA').length,
      hoy: this.getTodayAppointments().length,
    };
  }
}

export const appointmentService = new AppointmentService();
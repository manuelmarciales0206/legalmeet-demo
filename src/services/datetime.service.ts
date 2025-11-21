class DateTimeService {
  private readonly TIMEZONE = 'America/Bogota';

  /**
   * Obtener fecha/hora actual en Colombia
   */
  getNowInColombia(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: this.TIMEZONE }));
  }

  /**
   * Formatear fecha y hora completa en español colombiano
   */
  formatFullDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: this.TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  /**
   * Formatear solo fecha en español colombiano
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: this.TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Formatear solo hora en formato colombiano
   */
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: this.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  /**
   * Formatear fecha corta para tickets (DD/MM/YYYY HH:MM AM/PM)
   */
  formatShortDateTime(date: Date): string {
    const dateStr = new Intl.DateTimeFormat('es-CO', {
      timeZone: this.TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

    const timeStr = new Intl.DateTimeFormat('es-CO', {
      timeZone: this.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return `${dateStr} ${timeStr}`;
  }

  /**
   * Parsear fecha natural ("mañana", "jueves", etc.) a fecha real
   */
  parseNaturalDate(input: string): Date {
    const now = this.getNowInColombia();
    const lower = input.toLowerCase().trim();

    // Hoy
    if (lower.includes('hoy')) {
      return now;
    }

    // Mañana
    if (lower.includes('mañana')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Pasado mañana
    if (lower.includes('pasado mañana')) {
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      return dayAfter;
    }

    // Días de la semana
    const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const currentDay = now.getDay();
    
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lower.includes(daysOfWeek[i])) {
        const targetDay = i;
        let daysToAdd = targetDay - currentDay;
        
        if (daysToAdd <= 0) {
          daysToAdd += 7; // Siguiente semana
        }
        
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        return targetDate;
      }
    }

    // Si no es reconocido, devolver fecha ingresada como está
    // Los ingenieros pueden mejorar esto con una librería como date-fns
    return now;
  }

  /**
   * Parsear hora natural ("2pm", "3:30pm", "10 de la mañana")
   */
  parseNaturalTime(input: string): string {
    const lower = input.toLowerCase().trim();

    // Detectar formato "2pm", "3:30pm", etc.
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?m\.?|p\.?m\.?)/i;
    const match = lower.match(timeRegex);

    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] || '00';
      const period = match[3].toLowerCase().replace(/\./g, '');

      if (period.includes('pm') && hours !== 12) {
        hours += 12;
      } else if (period.includes('am') && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes} ${period.includes('pm') ? 'PM' : 'AM'}`;
    }

    // Si no se puede parsear, devolver como está
    return input;
  }
}

export const dateTimeService = new DateTimeService();
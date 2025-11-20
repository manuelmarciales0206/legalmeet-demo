import { CaseClassification } from './ai.service';

class PDFTicketService {
  /**
   * Genera el contenido del ticket en formato texto estructurado
   * (En producción esto sería un PDF real con PDFKit o similar)
   */
  generateTicketContent(data: {
    radicado: string;
    classification: CaseClassification;
    phoneNumber: string;
    timestamp: Date;
    estimatedCost: {
      min: number;
      max: number;
      estimated: number;
    };
  }): string {
    const formattedDate = data.timestamp.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const urgencyEmoji = {
      'BAJA': '🟢',
      'MEDIA': '🟡',
      'ALTA': '🔴'
    }[data.classification.urgencia];

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      🏛️ LEGALMEET
   Asesoría Legal Inteligente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CASO REGISTRADO EXITOSAMENTE

📋 Radicado: ${data.radicado}
📅 Fecha: ${formattedDate}
📱 Contacto: ${data.phoneNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETALLES DEL CASO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Categoría: ${data.classification.categoria}

${urgencyEmoji} Urgencia: ${data.classification.urgencia}

📝 Descripción:
${data.classification.descripcion}

💵 COSTO ESTIMADO DE CONSULTA:
   ${this.formatPrice(data.estimatedCost.estimated)}
   
   Rango: ${this.formatPrice(data.estimatedCost.min)} - ${this.formatPrice(data.estimatedCost.max)}
   ${data.classification.urgencia === 'ALTA' ? '   (Incluye recargo por urgencia)' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 PRÓXIMOS PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Revisa abogados en la plataforma
2️⃣ Selecciona el de tu preferencia
3️⃣ Agenda tu consulta
4️⃣ Realiza el pago seguro

⚡ Los abogados especializados en
   ${data.classification.categoria}
   han sido notificados.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 ACCEDE A LA PLATAFORMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

https://legalmeet-demo.vercel.app/dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 NOTA IMPORTANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este radicado es tu referencia única.
Guárdalo para seguimiento de tu caso.

Los precios son estimados y pueden
variar según el abogado seleccionado
y la complejidad del caso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Gracias por confiar en LegalMeet

Atención al cliente: soporte@legalmeet.co
WhatsApp: xxx-xxx-xxxx
`;
  }

  private formatPrice(amount: number): string {
    return `$${amount.toLocaleString('es-CO')} COP`;
  }

  /**
   * Genera URL del PDF (para futuro)
   */
  generatePDFUrl(radicado: string): string {
    // En producción esto generaría el PDF y devolvería URL
    return `https://legalmeet-demo.vercel.app/api/pdf/${radicado}`;
  }
}

export const pdfTicketService = new PDFTicketService();
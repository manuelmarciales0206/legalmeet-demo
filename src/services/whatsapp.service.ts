import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!;

const client = twilio(accountSid, authToken);

export class WhatsAppService {
  /**
   * Enviar mensaje de texto
   */
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      // Asegurar formato correcto del número
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const result = await client.messages.create({
        from: whatsappFrom,
        to: formattedTo,
        body: message,
      });

      console.log('✅ WhatsApp enviado:', result.sid);
      return true;
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error);
      return false;
    }
  }

  /**
   * Enviar mensaje con link
   */
  async sendMessageWithLink(to: string, message: string, url: string): Promise<boolean> {
    const fullMessage = `${message}\n\n🔗 ${url}`;
    return this.sendTextMessage(to, fullMessage);
  }
}

export const whatsappService = new WhatsAppService();
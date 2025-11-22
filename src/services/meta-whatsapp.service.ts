import axios from 'axios';

interface SendMessageParams {
  to: string;
  message: string;
}

class MetaWhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private apiUrl: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}`;

    if (!this.phoneNumberId || !this.accessToken) {
      console.warn('⚠️ Meta WhatsApp credentials not configured');
    }
  }

  /**
   * Verificar si Meta está configurado
   */
  isConfigured(): boolean {
    return !!(this.phoneNumberId && this.accessToken);
  }

  /**
   * Enviar mensaje de texto
   */
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.error('❌ Meta WhatsApp no configurado');
        return false;
      }

      // Limpiar número (quitar "whatsapp:" si viene de otra parte)
      const cleanNumber = to.replace('whatsapp:', '').replace('+', '');
      
      console.log(`📤 Enviando mensaje Meta a: ${cleanNumber}`);

      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Mensaje Meta enviado:', response.data.messages[0].id);
      return true;

    } catch (error: any) {
      console.error('❌ Error enviando mensaje Meta:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      if (!this.isConfigured()) return;

      await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('✅ Mensaje marcado como leído');
    } catch (error) {
      console.error('❌ Error marcando como leído:', error);
    }
  }

  /**
   * Descargar media (audio, imágenes, etc)
   */
  async downloadMedia(mediaId: string): Promise<Buffer | null> {
    try {
      if (!this.isConfigured()) return null;

      console.log('📥 Descargando media:', mediaId);

      // 1. Obtener URL del media
      const mediaResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const mediaUrl = mediaResponse.data.url;
      console.log('🔗 Media URL obtenida');

      // 2. Descargar el archivo
      const fileResponse = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      console.log('✅ Media descargada:', fileResponse.data.byteLength, 'bytes');
      return Buffer.from(fileResponse.data);

    } catch (error: any) {
      console.error('❌ Error descargando media:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Obtener información del número
   */
  async getPhoneNumberInfo(): Promise<any> {
    try {
      if (!this.isConfigured()) return null;

      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo info del número:', error);
      return null;
    }
  }
}

export const metaWhatsAppService = new MetaWhatsAppService();
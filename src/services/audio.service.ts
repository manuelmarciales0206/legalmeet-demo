import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

class AudioService {
  /**
   * Transcribir audio con timeout y manejo de errores
   */
  async transcribeAudio(audioUrl: string): Promise<string | null> {
    try {
      console.log('🎙️ Iniciando transcripción de audio');
      console.log('   URL:', audioUrl);
      
      // Timeout de 8 segundos (antes de que Twilio corte a los 10)
      const timeout = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Audio demasiado largo')), 8000);
      });
      
      const transcriptionPromise = this.transcribeAudioInternal(audioUrl);
      
      // Race entre transcripción y timeout
      const result = await Promise.race([transcriptionPromise, timeout]);
      
      return result;
      
    } catch (error: any) {
      console.error('❌ Error transcribiendo audio:', error);
      
      if (error.message.includes('Timeout')) {
        console.error('⏱️ Audio muy largo - timeout alcanzado');
      }
      
      return null;
    }
  }

  /**
   * Transcripción interna con validaciones
   */
  private async transcribeAudioInternal(audioUrl: string): Promise<string | null> {
    try {
      // Autenticación de Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      console.log('🎙️ Descargando audio de Twilio...');
      
      // Descargar audio con timeout de 5 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const audioResponse = await fetch(audioUrl, {
        headers: {
          'Authorization': `Basic ${auth}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!audioResponse.ok) {
        console.error('❌ Error descargando audio:', audioResponse.status);
        return null;
      }

      console.log('✅ Audio descargado, procesando...');
      
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
      const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });
      
      const sizeKB = Math.round(audioFile.size / 1024);
      console.log('🎙️ Tamaño:', sizeKB, 'KB');
      
      // Si el audio es muy grande, rechazar
      if (sizeKB > 500) {
        console.error('❌ Audio demasiado grande:', sizeKB, 'KB');
        return null;
      }
      
      console.log('🎙️ Enviando a Whisper...');
      
      // Transcribir con Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'es',
        response_format: 'text',
      });

      const transcribedText = String(transcription).trim();
      
      console.log('✅ Audio transcrito exitosamente');
      console.log('   Texto:', transcribedText.substring(0, 100));
      
      return transcribedText;
      
    } catch (error: any) {
      console.error('❌ Error en transcripción interna:', error);
      
      if (error.name === 'AbortError') {
        console.error('⏱️ Timeout descargando audio');
      }
      
      return null;
    }
  }

  /**
   * Formatear mensaje con transcripción de forma natural
   */
  formatTranscriptionMessage(transcription: string): string {
    const options = [
      `Perfecto, escuché: "${transcription}"`,
      `Entendido, me dijiste: "${transcription}"`,
      `Ok, te escuché decir: "${transcription}"`,
    ];
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Validar que es un mensaje de audio válido
   */
  isAudioMessage(mediaContentType: string | null): boolean {
    if (!mediaContentType) return false;
    
    const audioTypes = [
      'audio/ogg',
      'audio/mpeg',
      'audio/mp4',
      'audio/amr',
      'audio/wav',
    ];
    
    return audioTypes.some(type => mediaContentType.toLowerCase().includes(type));
  }

  /**
   * Mensaje de ayuda para audios
   */
  getAudioGuidance(): string {
    return '🎙️ Tips para enviar audio:\n\n' +
           '• Mantén el audio corto (máximo 30 segundos)\n' +
           '• Habla claro y sin ruido de fondo\n' +
           '• Si falla, puedes escribir el mensaje\n\n' +
           '💡 Si algo falla, escribe "cancelar" para reiniciar.';
  }
}

export const audioService = new AudioService();
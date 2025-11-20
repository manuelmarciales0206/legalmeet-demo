import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

class AudioService {
  /**
   * Transcribir audio usando Whisper de OpenAI
   */
  async transcribeAudio(audioUrl: string): Promise<string | null> {
    try {
      console.log('🎙️ Iniciando transcripción de audio');
      console.log('   URL:', audioUrl);
      
      // Autenticación de Twilio (necesaria para descargar media)
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      console.log('🎙️ Descargando audio de Twilio...');
      
      // Descargar audio con autenticación
      const audioResponse = await fetch(audioUrl, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      
      if (!audioResponse.ok) {
        console.error('❌ Error descargando audio:', audioResponse.status, audioResponse.statusText);
        return null;
      }

      console.log('✅ Audio descargado, procesando...');
      
      // Obtener el buffer del audio
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
      
      // Convertir a File para OpenAI
      const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });
      
      console.log('🎙️ Enviando a Whisper para transcripción...');
      console.log('   Tamaño:', Math.round(audioFile.size / 1024), 'KB');
      
      // Transcribir con Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'es',
        response_format: 'text',
        prompt: 'Esta es una conversación legal sobre casos en Colombia. El usuario está describiendo su situación legal.'
      });

      // Whisper con response_format: 'text' devuelve el texto directamente
      const transcribedText = String(transcription).trim();
      
      console.log('✅ Audio transcrito exitosamente');
      console.log('   Texto:', transcribedText.substring(0, 100) + (transcribedText.length > 100 ? '...' : ''));
      
      return transcribedText;
      
    } catch (error: any) {
      console.error('❌ Error transcribiendo audio:', error);
      console.error('   Mensaje:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
      return null;
    }
  }

  /**
   * Formatear mensaje con transcripción de forma natural
   */
  formatTranscriptionMessage(transcription: string): string {
    // Más natural, menos robótico
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
}

export const audioService = new AudioService();
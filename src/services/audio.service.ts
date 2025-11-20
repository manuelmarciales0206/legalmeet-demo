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
      console.log('🎙️ Descargando audio desde:', audioUrl);
      
      // Descargar audio desde Twilio
      const audioResponse = await fetch(audioUrl);
      
      if (!audioResponse.ok) {
        console.error('❌ Error descargando audio:', audioResponse.status);
        return null;
      }

      // Obtener el buffer del audio
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
      
      // Convertir a File para OpenAI
      const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });
      
      console.log('🎙️ Transcribiendo con Whisper...');
      
      // Transcribir con Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'es', // Español
        response_format: 'text',
      });

      const transcribedText = transcription.toString();
      
      console.log('✅ Audio transcrito:', transcribedText.substring(0, 100) + '...');
      
      return transcribedText;
      
    } catch (error) {
      console.error('❌ Error transcribiendo audio:', error);
      return null;
    }
  }

  /**
   * Formatear mensaje con transcripción
   */
  formatTranscriptionMessage(transcription: string): string {
    return `🎙️ Escuché: "${transcription}"`;
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
    
    return audioTypes.some(type => mediaContentType.includes(type));
  }
}

export const audioService = new AudioService();
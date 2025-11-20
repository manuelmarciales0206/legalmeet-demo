import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';
import { conversationService } from '@/services/conversation.service';
import { radicadoService } from '@/services/radicado.service';
import { pricingService } from '@/services/pricing.service';
import { pdfTicketService } from '@/services/pdf-ticket.service';
import { analyticsService } from '@/services/analytics.service';
import { audioService } from '@/services/audio.service';

export async function POST(req: NextRequest) {
  try {
    console.log('\n🔔 Webhook recibido');
    
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageId = formData.get('MessageSid') as string;
    
    // Datos de audio/media
    const numMedia = parseInt(formData.get('NumMedia') as string || '0');
    const mediaContentType = formData.get('MediaContentType0') as string | null;
    const mediaUrl = formData.get('MediaUrl0') as string | null;
    
    if (!from) {
      console.error('❌ Missing from parameter');
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const phoneNumber = from.replace('whatsapp:', '');
    
    console.log(`📱 De: ${phoneNumber}`);
    console.log(`🆔 Message ID: ${messageId}`);
    console.log(`🎵 NumMedia: ${numMedia}`);
    console.log(`🎵 MediaType: ${mediaContentType}`);

    // Variable para almacenar el texto del mensaje (ya sea escrito o transcrito)
    let messageText = body;

    // Si hay audio, transcribirlo
    if (numMedia > 0 && mediaUrl && audioService.isAudioMessage(mediaContentType)) {
      console.log('🎙️ Mensaje de audio detectado');
      
      // Enviar mensaje de "estoy procesando"
      await whatsappService.sendTextMessage(
        phoneNumber,
        '🎙️ Procesando tu audio...'
      );
      
      // Transcribir el audio
      const transcription = await audioService.transcribeAudio(mediaUrl);
      
      if (transcription) {
        messageText = transcription;
        console.log(`💬 Transcripción: "${messageText}"`);
        
        // Enviar confirmación de transcripción
        const confirmationMessage = audioService.formatTranscriptionMessage(transcription);
        await whatsappService.sendTextMessage(phoneNumber, confirmationMessage);
      } else {
        console.error('❌ No se pudo transcribir el audio');
        await whatsappService.sendTextMessage(
          phoneNumber,
          'Disculpa, no pude procesar el audio. ¿Podrías escribir tu mensaje?'
        );
        return NextResponse.json({ 
          success: false, 
          error: 'Audio transcription failed' 
        });
      }
    }

    // Si no hay texto (ni escrito ni transcrito), es comando de inicio
    if (!messageText || messageText.trim() === '') {
      const isNew = conversationService.isNewConversation(phoneNumber);
      const isStartCommand = true; // Si no hay texto, iniciamos
      
      if (isNew || isStartCommand) {
        console.log('🆕 Iniciando nueva conversación');
        
        conversationService.clearConversation(phoneNumber);
        
        const welcomeMessage = `¡Hola! 👋 Soy el asistente legal de LegalMeet.\n\n¿En qué situación legal puedo ayudarte hoy?\n\n💡 Puedes escribir o enviar audio.`;
        
        conversationService.addMessage(phoneNumber, 'assistant', welcomeMessage);
        await whatsappService.sendTextMessage(phoneNumber, welcomeMessage);
        
        console.log('✅ Conversación iniciada exitosamente');
        return NextResponse.json({ 
          success: true, 
          action: 'welcome',
          message: 'Conversation started'
        });
      }
    }

    console.log(`💬 Mensaje procesado: "${messageText}"`);

    // Verificar comandos de inicio
    const isStartCommand = ['iniciar', 'hola', 'start', 'empezar'].includes(
      messageText.toLowerCase().trim()
    );

    if (isStartCommand) {
      console.log('🆕 Comando de inicio recibido');
      
      conversationService.clearConversation(phoneNumber);
      
      const welcomeMessage = `¡Hola! 👋 Soy el asistente legal de LegalMeet.\n\n¿En qué situación legal puedo ayudarte hoy?\n\n💡 Puedes escribir o enviar audio.`;
      
      conversationService.addMessage(phoneNumber, 'assistant', welcomeMessage);
      await whatsappService.sendTextMessage(phoneNumber, welcomeMessage);
      
      console.log('✅ Conversación reiniciada exitosamente');
      return NextResponse.json({ 
        success: true, 
        action: 'welcome',
        message: 'Conversation restarted'
      });
    }

    // Agregar mensaje del usuario (ya sea texto o audio transcrito)
    conversationService.addMessage(phoneNumber, 'user', messageText);
    
    const messages = conversationService.getMessages(phoneNumber);
    console.log(`📊 Total mensajes en conversación: ${messages.length}`);
    
    // Verificar si hay suficiente información para clasificar
    if (aiService.hasEnoughInformation(messages)) {
      console.log('✅ Suficiente información recopilada, clasificando caso...');
      
      const classification = await aiService.classifyCase(messages);
      
      if (classification) {
        console.log('🎯 Clasificación exitosa:', classification);
        
        // 1. Generar radicado único
        const radicado = radicadoService.generateRadicado(classification.categoria);
        console.log('📋 Radicado generado:', radicado);
        
        // 2. Estimar costos basados en categoría y urgencia
        const estimatedCost = pricingService.estimateCost(
          classification.categoria,
          classification.urgencia
        );
        console.log('💵 Costo estimado:', estimatedCost);
        
        // 3. Registrar en analytics para dashboard
        analyticsService.registerCase({
          radicado,
          categoria: classification.categoria,
          urgencia: classification.urgencia,
          timestamp: new Date(),
          estimatedRevenue: estimatedCost.estimated * 0.15,
        });
        console.log('📊 Caso registrado en analytics');
        
        // 4. Generar ticket profesional completo
        const timestamp = new Date();
        const ticketContent = pdfTicketService.generateTicketContent({
          radicado,
          classification,
          phoneNumber,
          timestamp,
          estimatedCost,
        });
        
        // 5. Enviar ticket por WhatsApp
        await whatsappService.sendTextMessage(phoneNumber, ticketContent);
        
        // 6. Guardar ticket en conversación
        conversationService.addMessage(phoneNumber, 'assistant', ticketContent);
        
        // 7. Limpiar conversación después de 10 segundos
        setTimeout(() => {
          conversationService.clearConversation(phoneNumber);
        }, 10000);
        
        console.log('✅ Ticket enviado exitosamente');
        
        return NextResponse.json({ 
          success: true, 
          action: 'classified', 
          classification,
          radicado,
          estimatedCost,
          audioTranscribed: numMedia > 0
        });
      }
    }

    // Generar respuesta con IA si no hay suficiente información
    console.log('🤖 Generando respuesta con IA...');
    const aiResponse = await aiService.generateResponse(messages);
    
    conversationService.addMessage(phoneNumber, 'assistant', aiResponse);
    await whatsappService.sendTextMessage(phoneNumber, aiResponse);
    
    console.log('✅ Respuesta IA enviada exitosamente');
    return NextResponse.json({ 
      success: true, 
      action: 'conversation',
      response: aiResponse,
      audioTranscribed: numMedia > 0
    });
    
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  console.log('✅ Webhook health check');
  
  return NextResponse.json({ 
    status: 'ok',
    service: 'LegalMeet WhatsApp Webhook',
    version: '2.1.0',
    features: [
      'AI Classification',
      'Unique Radicado',
      'Price Estimation',
      'Professional Ticket',
      'Analytics Tracking',
      '🎙️ Audio Transcription (Whisper)'
    ],
    timestamp: new Date().toISOString(),
  });
}
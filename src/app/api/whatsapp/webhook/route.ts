import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';
import { conversationService } from '@/services/conversation.service';
import { radicadoService } from '@/services/radicado.service';
import { pricingService } from '@/services/pricing.service';
import { pdfTicketService } from '@/services/pdf-ticket.service';
import { analyticsService } from '@/services/analytics.service';
import { audioService } from '@/services/audio.service';
import { appointmentService } from '@/services/appointment.service';

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

    // Variable para almacenar el texto del mensaje
    let messageText = body;

    // Si hay audio, transcribirlo CON MANEJO DE ERRORES MEJORADO
    if (numMedia > 0 && mediaUrl && audioService.isAudioMessage(mediaContentType)) {
      console.log('🎙️ Mensaje de audio detectado');
      
      await whatsappService.sendTextMessage(phoneNumber, '🎙️ Procesando tu audio...');
      
      const transcription = await audioService.transcribeAudio(mediaUrl);
      
      if (transcription) {
        messageText = transcription;
        console.log(`💬 Transcripción exitosa: "${messageText}"`);
        
        const confirmationMessage = audioService.formatTranscriptionMessage(transcription);
        await whatsappService.sendTextMessage(phoneNumber, confirmationMessage);
      } else {
        console.error('❌ No se pudo transcribir el audio');
        
        // Resetear estado si estaba en proceso de agendamiento
        const currentState = conversationService.getState(phoneNumber);
        if (currentState !== 'CHATTING') {
          conversationService.setState(phoneNumber, 'CHATTING');
          console.log('🔄 Estado reseteado por error de audio');
        }
        
        // Mensaje de error más amigable
        const errorMessage = 'Disculpa, no pude procesar tu audio. Puede ser muy largo o tener problemas de conexión.\n\n¿Podrías escribirlo en texto? 😊\n\nSi prefieres, escribe "cancelar" para reiniciar.';
        
        await whatsappService.sendTextMessage(phoneNumber, errorMessage);
        
        return NextResponse.json({ 
          success: false, 
          error: 'Audio transcription failed',
          action: 'audio_failed_fallback_to_text'
        });
      }
    }

    // Obtener estado actual
    const currentState = conversationService.getState(phoneNumber);
    console.log(`📊 Estado actual: ${currentState}`);

    // COMANDO DE RESET
    const isResetCommand = ['reiniciar', 'reset', 'cancelar', 'salir'].includes(
      messageText.toLowerCase().trim()
    );

    if (isResetCommand) {
      console.log('🔄 Comando de reset recibido');
      
      conversationService.clearConversation(phoneNumber);
      conversationService.setState(phoneNumber, 'CHATTING');
      
      const response = 'Ok, reiniciamos. 😊\n\nCuéntame, ¿en qué situación legal puedo ayudarte?';
      conversationService.addMessage(phoneNumber, 'assistant', response);
      await whatsappService.sendTextMessage(phoneNumber, response);
      
      return NextResponse.json({ success: true, action: 'reset' });
    }

    // MANEJO DE ESTADOS DE AGENDAMIENTO
    if (currentState === 'WAITING_APPOINTMENT_DECISION') {
      const answer = messageText.toLowerCase().trim();
      
      if (['si', 'sí', 'yes', 'claro', 'dale', 'ok'].some(word => answer.includes(word))) {
        conversationService.setState(phoneNumber, 'COLLECTING_NAME');
        const response = 'Perfecto! 😊 ¿Cuál es tu nombre completo?';
        conversationService.addMessage(phoneNumber, 'assistant', response);
        await whatsappService.sendTextMessage(phoneNumber, response);
        return NextResponse.json({ success: true, action: 'collecting_name' });
      } else if (['no', 'nope', 'ahora no', 'después', 'luego'].some(word => answer.includes(word))) {
        conversationService.setState(phoneNumber, 'CHATTING');
        const response = 'Perfecto, sin problema. Cuando estés listo, escribe "agendar cita" y te ayudo. 👍';
        conversationService.addMessage(phoneNumber, 'assistant', response);
        await whatsappService.sendTextMessage(phoneNumber, response);
        
        setTimeout(() => conversationService.clearConversation(phoneNumber), 5000);
        return NextResponse.json({ success: true, action: 'appointment_declined' });
      } else {
        const response = 'No entendí bien. ¿Quieres agendar una cita? Responde "sí" o "no" 😊';
        await whatsappService.sendTextMessage(phoneNumber, response);
        return NextResponse.json({ success: true, action: 'clarification_needed' });
      }
    }

    if (currentState === 'COLLECTING_NAME') {
      const userName = messageText.trim();
      
      if (userName.length < 3) {
        const response = 'Por favor escribe tu nombre completo 😊';
        await whatsappService.sendTextMessage(phoneNumber, response);
        return NextResponse.json({ success: true, action: 'name_invalid' });
      }

      conversationService.setAppointmentData(phoneNumber, { userName });
      conversationService.setState(phoneNumber, 'COLLECTING_EMAIL');
      
      const response = `Gracias ${userName}! ¿Cuál es tu email? 📧`;
      conversationService.addMessage(phoneNumber, 'assistant', response);
      await whatsappService.sendTextMessage(phoneNumber, response);
      return NextResponse.json({ success: true, action: 'collecting_email' });
    }

    if (currentState === 'COLLECTING_EMAIL') {
      const userEmail = messageText.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(userEmail)) {
        const response = 'Ese email no parece válido. Por favor escribe un email correcto. Ej: nombre@gmail.com';
        await whatsappService.sendTextMessage(phoneNumber, response);
        return NextResponse.json({ success: true, action: 'email_invalid' });
      }

      conversationService.setAppointmentData(phoneNumber, { userEmail });
      conversationService.setState(phoneNumber, 'COLLECTING_DATE');
      
      const response = 'Perfecto! ¿Qué día te viene bien para la cita?\n\nPuedes decir: "mañana", "jueves", "25 de noviembre", etc. 📅';
      conversationService.addMessage(phoneNumber, 'assistant', response);
      await whatsappService.sendTextMessage(phoneNumber, response);
      return NextResponse.json({ success: true, action: 'collecting_date' });
    }

    if (currentState === 'COLLECTING_DATE') {
      const preferredDate = messageText.trim();
      
      if (preferredDate.length < 3) {
        const response = 'Por favor indica una fecha válida 😊';
        await whatsappService.sendTextMessage(phoneNumber, response);
        return NextResponse.json({ success: true, action: 'date_invalid' });
      }

      conversationService.setAppointmentData(phoneNumber, { preferredDate });
      conversationService.setState(phoneNumber, 'COLLECTING_TIME');
      
      const response = 'Excelente! ¿A qué hora prefieres?\n\nEj: "2pm", "10:30am", "3 de la tarde" 🕐\n\n💡 También puedes enviar audio si prefieres.';
      conversationService.addMessage(phoneNumber, 'assistant', response);
      await whatsappService.sendTextMessage(phoneNumber, response);
      return NextResponse.json({ success: true, action: 'collecting_time' });
    }

    if (currentState === 'COLLECTING_TIME') {
      const preferredTime = messageText.trim();
      
      conversationService.setAppointmentData(phoneNumber, { preferredTime });
      
      const appointmentData = conversationService.getAppointmentData(phoneNumber);
      
      if (!appointmentData?.radicado || !appointmentData.userName || !appointmentData.userEmail) {
        console.error('❌ Datos incompletos para crear cita');
        const response = 'Hubo un error. Escribe "agendar cita" para empezar de nuevo.';
        await whatsappService.sendTextMessage(phoneNumber, response);
        conversationService.setState(phoneNumber, 'CHATTING');
        return NextResponse.json({ success: false, error: 'Incomplete data' });
      }

      const appointment = appointmentService.createAppointment({
        radicado: appointmentData.radicado,
        phoneNumber,
        userName: appointmentData.userName,
        userEmail: appointmentData.userEmail,
        categoria: appointmentData.categoria || 'General',
        urgencia: appointmentData.urgencia || 'MEDIA',
        preferredDate: appointmentData.preferredDate || '',
        preferredTime: preferredTime,
      });

      const confirmationMessage = appointmentService.generateConfirmationMessage(appointment);
      await whatsappService.sendTextMessage(phoneNumber, confirmationMessage);
      conversationService.addMessage(phoneNumber, 'assistant', confirmationMessage);

      setTimeout(() => conversationService.clearConversation(phoneNumber), 10000);

      console.log('✅ Cita agendada exitosamente');
      return NextResponse.json({ 
        success: true, 
        action: 'appointment_created',
        appointment 
      });
    }

    // FLUJO NORMAL DE CONVERSACIÓN
    if (!messageText || messageText.trim() === '') {
      const welcomeMessage = `¡Hola! 👋 Soy tu asistente legal de LegalMeet.

Cuéntame, ¿qué situación legal estás enfrentando?

💡 Puedes escribir o enviar audio corto (máximo 30 segundos)

Si algo falla, escribe "cancelar" para reiniciar.`;
      
      conversationService.addMessage(phoneNumber, 'assistant', welcomeMessage);
      await whatsappService.sendTextMessage(phoneNumber, welcomeMessage);
      
      return NextResponse.json({ success: true, action: 'welcome' });
    }

    const isStartCommand = ['iniciar', 'hola', 'start', 'empezar'].includes(
      messageText.toLowerCase().trim()
    );

    if (isStartCommand) {
      conversationService.clearConversation(phoneNumber);
      conversationService.setState(phoneNumber, 'CHATTING');
      
      const welcomeMessage = `¡Hola! 👋 Soy tu asistente legal de LegalMeet.

Cuéntame, ¿qué situación legal estás enfrentando?

💡 Puedes escribir o enviar audio corto (máximo 30 segundos)

Si algo falla, escribe "cancelar" para reiniciar.`;
      
      conversationService.addMessage(phoneNumber, 'assistant', welcomeMessage);
      await whatsappService.sendTextMessage(phoneNumber, welcomeMessage);
      
      return NextResponse.json({ success: true, action: 'welcome' });
    }

    conversationService.addMessage(phoneNumber, 'user', messageText);
    
    const messages = conversationService.getMessages(phoneNumber);
    console.log(`📊 Total mensajes: ${messages.length}`);
    
    if (aiService.hasEnoughInformation(messages)) {
      console.log('✅ Suficiente información, clasificando caso...');
      
      const classification = await aiService.classifyCase(messages);
      
      if (classification) {
        console.log('🎯 Clasificación exitosa:', classification);
        
        const radicado = radicadoService.generateRadicado(classification.categoria);
        const estimatedCost = pricingService.estimateCost(
          classification.categoria,
          classification.urgencia
        );
        
        analyticsService.registerCase({
          radicado,
          categoria: classification.categoria,
          urgencia: classification.urgencia,
          timestamp: new Date(),
          estimatedRevenue: estimatedCost.estimated * 0.15,
        });
        
        const timestamp = new Date();
        const ticketContent = pdfTicketService.generateTicketContent({
          radicado,
          classification,
          phoneNumber,
          timestamp,
          estimatedCost,
        });
        
        await whatsappService.sendTextMessage(phoneNumber, ticketContent);
        conversationService.addMessage(phoneNumber, 'assistant', ticketContent);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const appointmentQuestion = `¿Te gustaría agendar una cita con un abogado especializado en ${classification.categoria}? 📅\n\nResponde "sí" o "no"`;
        
        conversationService.addMessage(phoneNumber, 'assistant', appointmentQuestion);
        await whatsappService.sendTextMessage(phoneNumber, appointmentQuestion);
        
        conversationService.setAppointmentData(phoneNumber, {
          radicado,
          categoria: classification.categoria,
          urgencia: classification.urgencia,
        });
        
        conversationService.setState(phoneNumber, 'WAITING_APPOINTMENT_DECISION');
        
        return NextResponse.json({ 
          success: true, 
          action: 'classified_awaiting_appointment',
          classification,
          radicado 
        });
      }
    }

    console.log('🤖 Generando respuesta con IA...');
    const aiResponse = await aiService.generateResponse(messages);
    
    conversationService.addMessage(phoneNumber, 'assistant', aiResponse);
    await whatsappService.sendTextMessage(phoneNumber, aiResponse);
    
    return NextResponse.json({ 
      success: true, 
      action: 'conversation',
      response: aiResponse 
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
    version: '3.1.0',
    features: [
      'AI Classification',
      'Unique Radicado',
      'Price Estimation',
      'Professional Ticket',
      'Analytics Tracking',
      '🎙️ Audio Transcription (Optimized)',
      '📅 Appointment Scheduling',
      '🔄 Auto-recovery from stuck states'
    ],
    timestamp: new Date().toISOString(),
  });
}
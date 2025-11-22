import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '@/services/meta-whatsapp.service';
import { aiService } from '@/services/ai.service';
import { conversationService } from '@/services/conversation.service';
import { radicadoService } from '@/services/radicado.service';
import { pricingService } from '@/services/pricing.service';
import { pdfTicketService } from '@/services/pdf-ticket.service';
import { analyticsService } from '@/services/analytics.service';
import { audioService } from '@/services/audio.service';
import { appointmentService } from '@/services/appointment.service';

/**
 * Verificación del webhook (GET)
 * Meta llama a este endpoint para verificar que el webhook es tuyo
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  console.log('🔐 Verificación de webhook Meta');
  console.log('   Mode:', mode);
  console.log('   Token recibido:', token);
  console.log('   Token esperado:', verifyToken);

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificado correctamente');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('❌ Verificación de webhook falló');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * Recibir mensajes (POST)
 * Meta envía mensajes entrantes a este endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('\n🔔 Webhook Meta recibido');

    // Validar estructura del webhook
    if (!body.entry?.[0]?.changes?.[0]?.value) {
      console.log('⚠️ Webhook sin datos relevantes (probablemente status update)');
      return NextResponse.json({ success: true });
    }

    const value = body.entry[0].changes[0].value;

    // Solo procesar mensajes entrantes
    if (!value.messages) {
      console.log('⚠️ No hay mensajes para procesar');
      return NextResponse.json({ success: true });
    }

    const message = value.messages[0];
    const from = message.from; // Número del usuario
    const messageId = message.id;
    const messageType = message.type; // text, audio, image, etc.

    console.log(`📱 De: ${from}`);
    console.log(`🆔 Message ID: ${messageId}`);
    console.log(`📝 Tipo: ${messageType}`);

    // Marcar como leído
    await metaWhatsAppService.markAsRead(messageId);

    let messageText = '';

    // Procesar según tipo de mensaje
    if (messageType === 'text') {
      messageText = message.text.body;
      console.log(`💬 Texto: ${messageText}`);
    } 
    else if (messageType === 'audio') {
      console.log('🎙️ Audio detectado (transcripción por implementar)');
      
      await metaWhatsAppService.sendTextMessage(
        from, 
        '🎙️ Por el momento solo puedo procesar mensajes de texto. ¿Podrías escribirlo? 😊'
      );
      
      return NextResponse.json({ success: true, note: 'Audio not yet supported' });
    }
    else {
      console.log(`⚠️ Tipo de mensaje no soportado: ${messageType}`);
      await metaWhatsAppService.sendTextMessage(
        from,
        'Por el momento solo puedo procesar mensajes de texto. 😊'
      );
      return NextResponse.json({ success: true });
    }

    // Obtener estado actual
    const currentState = conversationService.getState(from);
    console.log(`📊 Estado actual: ${currentState}`);

    // COMANDO DE RESET
    const isResetCommand = ['reiniciar', 'reset', 'cancelar', 'salir'].includes(
      messageText.toLowerCase().trim()
    );

    if (isResetCommand) {
      console.log('🔄 Comando de reset recibido');
      
      conversationService.clearConversation(from);
      conversationService.setState(from, 'CHATTING');
      
      const response = 'Ok, reiniciamos. 😊\n\nCuéntame, ¿en qué situación legal puedo ayudarte?';
      conversationService.addMessage(from, 'assistant', response);
      await metaWhatsAppService.sendTextMessage(from, response);
      
      return NextResponse.json({ success: true, action: 'reset' });
    }

    // MANEJO DE ESTADOS DE AGENDAMIENTO
    if (currentState === 'WAITING_APPOINTMENT_DECISION') {
      const answer = messageText.toLowerCase().trim();
      
      if (['si', 'sí', 'yes', 'claro', 'dale', 'ok'].some(word => answer.includes(word))) {
        conversationService.setState(from, 'COLLECTING_NAME');
        const response = 'Perfecto! 😊 ¿Cuál es tu nombre completo?';
        conversationService.addMessage(from, 'assistant', response);
        await metaWhatsAppService.sendTextMessage(from, response);
        return NextResponse.json({ success: true, action: 'collecting_name' });
      } else if (['no', 'nope', 'ahora no', 'después', 'luego'].some(word => answer.includes(word))) {
        conversationService.setState(from, 'CHATTING');
        const response = 'Perfecto, sin problema. Cuando estés listo, escribe "agendar cita" y te ayudo. 👍';
        conversationService.addMessage(from, 'assistant', response);
        await metaWhatsAppService.sendTextMessage(from, response);
        
        setTimeout(() => conversationService.clearConversation(from), 5000);
        return NextResponse.json({ success: true, action: 'appointment_declined' });
      } else {
        const response = 'No entendí bien. ¿Quieres agendar una cita? Responde "sí" o "no" 😊';
        await metaWhatsAppService.sendTextMessage(from, response);
        return NextResponse.json({ success: true, action: 'clarification_needed' });
      }
    }

    if (currentState === 'COLLECTING_NAME') {
      const userName = messageText.trim();
      
      if (userName.length < 3) {
        const response = 'Por favor escribe tu nombre completo 😊';
        await metaWhatsAppService.sendTextMessage(from, response);
        return NextResponse.json({ success: true, action: 'name_invalid' });
      }

      conversationService.setAppointmentData(from, { userName });
      conversationService.setState(from, 'COLLECTING_EMAIL');
      
      const response = `Gracias ${userName}! ¿Cuál es tu email? 📧`;
      conversationService.addMessage(from, 'assistant', response);
      await metaWhatsAppService.sendTextMessage(from, response);
      return NextResponse.json({ success: true, action: 'collecting_email' });
    }

    if (currentState === 'COLLECTING_EMAIL') {
      const userEmail = messageText.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(userEmail)) {
        const response = 'Ese email no parece válido. Por favor escribe un email correcto. Ej: nombre@gmail.com';
        await metaWhatsAppService.sendTextMessage(from, response);
        return NextResponse.json({ success: true, action: 'email_invalid' });
      }

      conversationService.setAppointmentData(from, { userEmail });
      conversationService.setState(from, 'COLLECTING_DATE');
      
      const response = 'Perfecto! ¿Qué día te viene bien para la cita?\n\nPuedes decir: "mañana", "jueves", "25 de noviembre", etc. 📅';
      conversationService.addMessage(from, 'assistant', response);
      await metaWhatsAppService.sendTextMessage(from, response);
      return NextResponse.json({ success: true, action: 'collecting_date' });
    }

    if (currentState === 'COLLECTING_DATE') {
      const preferredDate = messageText.trim();
      
      if (preferredDate.length < 3) {
        const response = 'Por favor indica una fecha válida 😊';
        await metaWhatsAppService.sendTextMessage(from, response);
        return NextResponse.json({ success: true, action: 'date_invalid' });
      }

      conversationService.setAppointmentData(from, { preferredDate });
      conversationService.setState(from, 'COLLECTING_TIME');
      
      const response = 'Excelente! ¿A qué hora prefieres?\n\nEj: "2pm", "10:30am", "3 de la tarde" 🕐';
      conversationService.addMessage(from, 'assistant', response);
      await metaWhatsAppService.sendTextMessage(from, response);
      return NextResponse.json({ success: true, action: 'collecting_time' });
    }

    if (currentState === 'COLLECTING_TIME') {
      const preferredTime = messageText.trim();
      
      conversationService.setAppointmentData(from, { preferredTime });
      
      const appointmentData = conversationService.getAppointmentData(from);
      
      if (!appointmentData?.radicado || !appointmentData.userName || !appointmentData.userEmail) {
        console.error('❌ Datos incompletos para crear cita');
        const response = 'Hubo un error. Escribe "agendar cita" para empezar de nuevo.';
        await metaWhatsAppService.sendTextMessage(from, response);
        conversationService.setState(from, 'CHATTING');
        return NextResponse.json({ success: false, error: 'Incomplete data' });
      }

      const appointment = appointmentService.createAppointment({
        radicado: appointmentData.radicado,
        phoneNumber: from,
        userName: appointmentData.userName,
        userEmail: appointmentData.userEmail,
        categoria: appointmentData.categoria || 'General',
        urgencia: appointmentData.urgencia || 'MEDIA',
        preferredDate: appointmentData.preferredDate || '',
        preferredTime: preferredTime,
      });

      const confirmationMessage = appointmentService.generateConfirmationMessage(appointment);
      await metaWhatsAppService.sendTextMessage(from, confirmationMessage);
      conversationService.addMessage(from, 'assistant', confirmationMessage);

      setTimeout(() => conversationService.clearConversation(from), 10000);

      console.log('✅ Cita agendada exitosamente');
      return NextResponse.json({ 
        success: true, 
        action: 'appointment_created',
        appointment 
      });
    }

    // FLUJO NORMAL DE CONVERSACIÓN
    if (!messageText || messageText.trim() === '') {
      const welcomeMessage = `¡Hola! 👋 Soy tu asistente legal de LegalMeet.\n\nCuéntame, ¿qué situación legal estás enfrentando?`;
      
      conversationService.addMessage(from, 'assistant', welcomeMessage);
      await metaWhatsAppService.sendTextMessage(from, welcomeMessage);
      
      return NextResponse.json({ success: true, action: 'welcome' });
    }

    const isStartCommand = ['iniciar', 'hola', 'start', 'empezar'].includes(
      messageText.toLowerCase().trim()
    );

    if (isStartCommand) {
      conversationService.clearConversation(from);
      conversationService.setState(from, 'CHATTING');
      
      const welcomeMessage = `¡Hola! 👋 Soy tu asistente legal de LegalMeet.\n\nCuéntame, ¿qué situación legal estás enfrentando?`;
      
      conversationService.addMessage(from, 'assistant', welcomeMessage);
      await metaWhatsAppService.sendTextMessage(from, welcomeMessage);
      
      return NextResponse.json({ success: true, action: 'welcome' });
    }

    conversationService.addMessage(from, 'user', messageText);
    
    const messages = conversationService.getMessages(from);
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
          phoneNumber: from,
          timestamp,
          estimatedCost,
        });
        
        await metaWhatsAppService.sendTextMessage(from, ticketContent);
        conversationService.addMessage(from, 'assistant', ticketContent);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const appointmentQuestion = `¿Te gustaría agendar una cita con un abogado especializado en ${classification.categoria}? 📅\n\nResponde "sí" o "no"`;
        
        conversationService.addMessage(from, 'assistant', appointmentQuestion);
        await metaWhatsAppService.sendTextMessage(from, appointmentQuestion);
        
        conversationService.setAppointmentData(from, {
          radicado,
          categoria: classification.categoria,
          urgencia: classification.urgencia,
        });
        
        conversationService.setState(from, 'WAITING_APPOINTMENT_DECISION');
        
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
    
    conversationService.addMessage(from, 'assistant', aiResponse);
    await metaWhatsAppService.sendTextMessage(from, aiResponse);
    
    return NextResponse.json({ 
      success: true, 
      action: 'conversation',
      response: aiResponse 
    });
    
  } catch (error) {
    console.error('❌ Error en webhook Meta:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
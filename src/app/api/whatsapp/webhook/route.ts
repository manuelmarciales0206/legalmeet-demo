import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';
import { conversationService } from '@/services/conversation.service';
import { radicadoService } from '@/services/radicado.service';
import { pricingService } from '@/services/pricing.service';
import { pdfTicketService } from '@/services/pdf-ticket.service';

export async function POST(req: NextRequest) {
  try {
    console.log('\n🔔 Webhook recibido');
    
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageId = formData.get('MessageSid') as string;
    
    if (!from || !body) {
      console.error('❌ Missing parameters');
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const phoneNumber = from.replace('whatsapp:', '');
    
    console.log(`📱 De: ${phoneNumber}`);
    console.log(`💬 Mensaje: "${body}"`);
    console.log(`🆔 Message ID: ${messageId}`);

    const isNew = conversationService.isNewConversation(phoneNumber);
    const isStartCommand = ['iniciar', 'hola', 'start', 'empezar'].includes(
      body.toLowerCase().trim()
    );

    if (isNew || isStartCommand) {
      console.log('🆕 Iniciando nueva conversación');
      
      conversationService.clearConversation(phoneNumber);
      
      const welcomeMessage = `¡Hola! 👋 Soy el asistente legal de LegalMeet.\n\n¿En qué situación legal puedo ayudarte hoy?`;
      
      conversationService.addMessage(phoneNumber, 'assistant', welcomeMessage);
      await whatsappService.sendTextMessage(phoneNumber, welcomeMessage);
      
      console.log('✅ Conversación iniciada exitosamente');
      return NextResponse.json({ 
        success: true, 
        action: 'welcome',
        message: 'Conversation started'
      });
    }

    conversationService.addMessage(phoneNumber, 'user', body);
    
    const messages = conversationService.getMessages(phoneNumber);
    console.log(`📊 Total mensajes en conversación: ${messages.length}`);
    
    if (aiService.hasEnoughInformation(messages)) {
      console.log('✅ Suficiente información recopilada, clasificando caso...');
      
      const classification = await aiService.classifyCase(messages);
      
      if (classification) {
        console.log('🎯 Clasificación exitosa:', classification);
        
        // Generar radicado
        const radicado = radicadoService.generateRadicado(classification.categoria);
        console.log('📋 Radicado generado:', radicado);
        
        // Estimar costos
        const estimatedCost = pricingService.estimateCost(
          classification.categoria,
          classification.urgencia
        );
        console.log('💵 Costo estimado:', estimatedCost);
        
        // Generar ticket completo
        const timestamp = new Date();
        const ticketContent = pdfTicketService.generateTicketContent({
          radicado,
          classification,
          phoneNumber,
          timestamp,
          estimatedCost
        });
        
        // Enviar ticket por WhatsApp
        await whatsappService.sendTextMessage(phoneNumber, ticketContent);
        
        // Guardar en conversación
        conversationService.addMessage(phoneNumber, 'assistant', ticketContent);
        
        // Limpiar conversación después de 10 segundos
        setTimeout(() => {
          conversationService.clearConversation(phoneNumber);
        }, 10000);
        
        console.log('✅ Ticket enviado con radicado:', radicado);
        return NextResponse.json({ 
          success: true, 
          action: 'classified', 
          classification,
          radicado,
          estimatedCost
        });
      }
    }

    console.log('🤖 Generando respuesta con IA...');
    const aiResponse = await aiService.generateResponse(messages);
    
    conversationService.addMessage(phoneNumber, 'assistant', aiResponse);
    await whatsappService.sendTextMessage(phoneNumber, aiResponse);
    
    console.log('✅ Respuesta IA enviada exitosamente');
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
    timestamp: new Date().toISOString(),
    stats: conversationService.getStats()
  });
}
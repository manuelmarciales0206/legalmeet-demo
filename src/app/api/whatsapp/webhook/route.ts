import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';
import { conversationService } from '@/services/conversation.service';

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
        
        const caseData = encodeURIComponent(JSON.stringify(classification));
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const caseUrl = `${appUrl}/dashboard`;
        
        const finalMessage = `✅ Perfecto, entiendo tu caso.\n\n` +
          `📋 Tipo: ${classification.categoria}\n` +
          `⚠️ Urgencia: ${classification.urgencia}\n\n` +
          `Accede a la plataforma para ver abogados disponibles:\n` +
          `${caseUrl}`;
        
        conversationService.addMessage(phoneNumber, 'assistant', finalMessage);
        await whatsappService.sendTextMessage(phoneNumber, finalMessage);
        
        setTimeout(() => {
          conversationService.clearConversation(phoneNumber);
        }, 5000);
        
        console.log('✅ Caso clasificado y enviado');
        return NextResponse.json({ success: true, action: 'classified', classification });
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
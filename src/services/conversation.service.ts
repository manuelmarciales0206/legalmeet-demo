import { Message } from './ai.service';

type ConversationState = 
  | 'CHATTING' 
  | 'WAITING_APPOINTMENT_DECISION'
  | 'COLLECTING_NAME'
  | 'COLLECTING_EMAIL'
  | 'COLLECTING_DATE'
  | 'COLLECTING_TIME';

interface Conversation {
  phoneNumber: string;
  messages: Message[];
  startedAt: Date;
  lastMessageAt: Date;
  state: ConversationState;
  appointmentData?: {
    radicado?: string;
    categoria?: string;
    urgencia?: string;
    userName?: string;
    userEmail?: string;
    preferredDate?: string;
    preferredTime?: string;
  };
}

class ConversationService {
  private conversations = new Map<string, Conversation>();

  getConversation(phoneNumber: string): Conversation {
    const existing = this.conversations.get(phoneNumber);
    
    if (existing) {
      return existing;
    }

    const newConversation: Conversation = {
      phoneNumber,
      messages: [],
      startedAt: new Date(),
      lastMessageAt: new Date(),
      state: 'CHATTING',
    };

    this.conversations.set(phoneNumber, newConversation);
    console.log(`📝 Nueva conversación creada: ${phoneNumber}`);
    return newConversation;
  }

  addMessage(phoneNumber: string, role: 'user' | 'assistant', content: string): void {
    const conversation = this.getConversation(phoneNumber);
    
    conversation.messages.push({ role, content });
    conversation.lastMessageAt = new Date();
    
    this.conversations.set(phoneNumber, conversation);
    console.log(`💬 Mensaje agregado [${role}]: ${content.substring(0, 50)}...`);
  }

  getMessages(phoneNumber: string): Message[] {
    const conversation = this.conversations.get(phoneNumber);
    return conversation?.messages || [];
  }

  setState(phoneNumber: string, state: ConversationState): void {
    const conversation = this.getConversation(phoneNumber);
    conversation.state = state;
    conversation.lastMessageAt = new Date();
    this.conversations.set(phoneNumber, conversation);
    console.log(`🔄 Estado cambiado a: ${state}`);
  }

  getState(phoneNumber: string): ConversationState {
    const conversation = this.conversations.get(phoneNumber);
    return conversation?.state || 'CHATTING';
  }

  setAppointmentData(phoneNumber: string, data: Partial<Conversation['appointmentData']>): void {
    const conversation = this.getConversation(phoneNumber);
    conversation.appointmentData = {
      ...conversation.appointmentData,
      ...data,
    };
    this.conversations.set(phoneNumber, conversation);
    console.log('📅 Datos de cita actualizados:', data);
  }

  getAppointmentData(phoneNumber: string): Conversation['appointmentData'] {
    const conversation = this.conversations.get(phoneNumber);
    return conversation?.appointmentData;
  }

  clearConversation(phoneNumber: string): void {
    this.conversations.delete(phoneNumber);
    console.log(`🗑️ Conversación eliminada: ${phoneNumber}`);
  }

  isNewConversation(phoneNumber: string): boolean {
    const conversation = this.conversations.get(phoneNumber);
    return !conversation || conversation.messages.length === 0;
  }

  /**
   * Limpiar conversaciones antiguas (más de 1 hora)
   */
  cleanOldConversations(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [phoneNumber, conversation] of this.conversations.entries()) {
      if (conversation.lastMessageAt < oneHourAgo) {
        this.conversations.delete(phoneNumber);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Limpiadas ${cleaned} conversaciones antiguas`);
    }
  }

  /**
   * Resetear conversaciones colgadas (más de 5 minutos en estado no-CHATTING)
   */
  cleanStuckConversations(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let cleaned = 0;
    
    for (const [phoneNumber, conversation] of this.conversations.entries()) {
      // Si lleva más de 5 minutos en un estado que no es CHATTING
      if (
        conversation.state !== 'CHATTING' && 
        conversation.lastMessageAt < fiveMinutesAgo
      ) {
        console.log(`⚠️ Conversación colgada detectada: ${phoneNumber} en estado ${conversation.state}`);
        conversation.state = 'CHATTING';
        this.conversations.set(phoneNumber, conversation);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Reseteadas ${cleaned} conversaciones colgadas`);
    }
  }

  getStats() {
    return {
      activeConversations: this.conversations.size,
      conversations: Array.from(this.conversations.values()).map(c => ({
        phone: c.phoneNumber,
        messages: c.messages.length,
        started: c.startedAt,
        lastMessage: c.lastMessageAt,
        state: c.state,
      }))
    };
  }
}

export const conversationService = new ConversationService();

// Auto-limpieza en servidor
if (typeof window === 'undefined') {
  // Limpiar conversaciones antiguas cada 10 minutos
  setInterval(() => {
    conversationService.cleanOldConversations();
  }, 10 * 60 * 1000);
  
  // Limpiar conversaciones colgadas cada 2 minutos
  setInterval(() => {
    conversationService.cleanStuckConversations();
  }, 2 * 60 * 1000);
}
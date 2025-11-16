import { Message } from './ai.service';

interface Conversation {
  phoneNumber: string;
  messages: Message[];
  startedAt: Date;
  lastMessageAt: Date;
}

class ConversationService {
  private conversations = new Map<string, Conversation>();

  /**
   * Obtener o crear conversación
   */
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
    };

    this.conversations.set(phoneNumber, newConversation);
    console.log(`📝 Nueva conversación creada: ${phoneNumber}`);
    return newConversation;
  }

  /**
   * Agregar mensaje a conversación
   */
  addMessage(phoneNumber: string, role: 'user' | 'assistant', content: string): void {
    const conversation = this.getConversation(phoneNumber);
    
    conversation.messages.push({ role, content });
    conversation.lastMessageAt = new Date();
    
    this.conversations.set(phoneNumber, conversation);
    console.log(`💬 Mensaje agregado [${role}]: ${content.substring(0, 50)}...`);
  }

  /**
   * Obtener mensajes de conversación
   */
  getMessages(phoneNumber: string): Message[] {
    const conversation = this.conversations.get(phoneNumber);
    return conversation?.messages || [];
  }

  /**
   * Limpiar conversación
   */
  clearConversation(phoneNumber: string): void {
    this.conversations.delete(phoneNumber);
    console.log(`🗑️ Conversación eliminada: ${phoneNumber}`);
  }

  /**
   * Verificar si es conversación nueva
   */
  isNewConversation(phoneNumber: string): boolean {
    const conversation = this.conversations.get(phoneNumber);
    return !conversation || conversation.messages.length === 0;
  }

  /**
   * Limpiar conversaciones antiguas (> 1 hora)
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
   * Obtener estadísticas
   */
  getStats() {
    return {
      activeConversations: this.conversations.size,
      conversations: Array.from(this.conversations.values()).map(c => ({
        phone: c.phoneNumber,
        messages: c.messages.length,
        started: c.startedAt,
        lastMessage: c.lastMessageAt,
      }))
    };
  }
}

export const conversationService = new ConversationService();

// Limpiar conversaciones antiguas cada 10 minutos (solo en servidor)
if (typeof window === 'undefined') {
  setInterval(() => {
    conversationService.cleanOldConversations();
  }, 10 * 60 * 1000);
}
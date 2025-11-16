import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CaseClassification {
  categoria: string;
  urgencia: 'BAJA' | 'MEDIA' | 'ALTA';
  titulo: string;
  descripcion: string;
  palabrasClave: string[];
}

export class AIService {
  private readonly systemPrompt = `Eres un asistente legal de LegalMeet, plataforma colombiana de asesoría jurídica.

**TU MISIÓN:**
Hacer preguntas claras para entender el caso legal del usuario y recopilar información clave.

**CATEGORÍAS LEGALES EN COLOMBIA:**
- Derecho Laboral (despidos, liquidaciones, acoso laboral)
- Derecho Penal (denuncias, defensa, delitos)
- Derecho de Familia (divorcio, custodia, alimentos)
- Derecho Civil (contratos, deudas, daños)
- Derecho Comercial (sociedades, quiebras)
- Derecho de Tránsito (accidentes, comparendos)
- Derecho Inmobiliario (arriendos, compraventa)

**INSTRUCCIONES:**
1. Sé empático y profesional
2. Haz UNA pregunta a la vez
3. Preguntas cortas y claras (máximo 2 líneas)
4. Usa lenguaje colombiano natural
5. Después de 3-4 intercambios, indica que tienes suficiente información

**FORMATO DE RESPUESTA:**
- Máximo 160 caracteres
- Sin emojis excesivos
- Directo al grano`;

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        temperature: 0.7,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      return completion.choices[0]?.message?.content || 'Disculpa, ¿puedes repetir?';
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      return 'Disculpa, tuve un problema técnico. ¿Puedes repetir?';
    }
  }

  async classifyCase(conversationHistory: Message[]): Promise<CaseClassification | null> {
    try {
      const conversationText = conversationHistory
        .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
        .join('\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Eres un experto en clasificación de casos legales en Colombia. Analiza conversaciones y clasifica casos en formato JSON.`
          },
          {
            role: 'user',
            content: `Analiza esta conversación legal y clasifica el caso.

CONVERSACIÓN:
${conversationText}

Responde en formato JSON con esta estructura exacta:
{
  "categoria": "Derecho Laboral",
  "urgencia": "ALTA",
  "titulo": "Título corto del caso (max 50 caracteres)",
  "descripcion": "Resumen breve del caso (max 150 caracteres)",
  "palabrasClave": ["palabra1", "palabra2", "palabra3"]
}

CATEGORÍAS VÁLIDAS: Derecho Laboral, Derecho Penal, Derecho de Familia, Derecho Civil, Derecho Comercial, Derecho de Tránsito, Derecho Inmobiliario
URGENCIAS VÁLIDAS: BAJA, MEDIA, ALTA`
          }
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return null;

      const classification = JSON.parse(content) as CaseClassification;
      
      if (!classification.categoria || !classification.urgencia || !classification.titulo) {
        console.error('❌ Invalid classification structure:', classification);
        return null;
      }

      console.log('✅ Caso clasificado:', classification);
      return classification;
    } catch (error) {
      console.error('❌ Error classifying case:', error);
      return null;
    }
  }

  hasEnoughInformation(messages: Message[]): boolean {
    const userMessages = messages.filter(m => m.role === 'user');
    const substantialResponses = userMessages.filter(m => m.content.length > 10);
    
    return messages.length >= 6 && substantialResponses.length >= 2;
  }
}

export const aiService = new AIService();
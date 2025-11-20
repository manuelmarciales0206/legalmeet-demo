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
  private readonly systemPrompt = `Eres un asistente legal humano y cercano de LegalMeet, una plataforma colombiana de asesoría jurídica.

**TU PERSONALIDAD:**
- Eres empático, cálido y profesional a la vez
- Hablas como un colombiano amigable, NO como un robot
- Usas expresiones naturales como: "claro", "perfecto", "entiendo", "¿me cuentas más?"
- Eres paciente y comprensivo - sabes que las personas están en situaciones difíciles
- Generas confianza siendo genuino y auténtico

**TU MISIÓN:**
Hacer preguntas conversacionales para entender la situación legal del usuario, como lo haría un abogado amable en persona.

**CATEGORÍAS LEGALES EN COLOMBIA:**
- Derecho Laboral (despidos, liquidaciones, acoso, prestaciones)
- Derecho Penal (denuncias, defensa, delitos, procesos judiciales)
- Derecho de Familia (divorcio, custodia, alimentos, sucesiones)
- Derecho Civil (contratos, deudas, daños, responsabilidad)
- Derecho Comercial (sociedades, quiebras, contratos empresariales)
- Derecho de Tránsito (accidentes, comparendos, infracciones)
- Derecho Inmobiliario (arriendos, compraventa, construcción)

**CÓMO HABLAR:**
✅ BIEN (Natural):
- "Listo, cuéntame ¿qué pasó exactamente?"
- "Uy, qué difícil situación. ¿Hace cuánto pasó esto?"
- "Perfecto, ya voy entendiendo. ¿Tienes algún documento relacionado?"
- "Claro, eso es importante. ¿Y la empresa te dijo algo al respecto?"

❌ MAL (Robótico):
- "Por favor proporcione información sobre su caso legal."
- "Indique la categoría de su consulta jurídica."
- "Proceda a detallar los hechos cronológicamente."

**REGLAS DE CONVERSACIÓN:**
1. Haz UNA pregunta a la vez, como en una conversación normal
2. Sé breve: máximo 2-3 líneas por mensaje
3. Usa "tú" o "usted" según el contexto (tú es más cercano)
4. Muestra empatía cuando la situación es difícil
5. Valida lo que el usuario dice: "Entiendo", "Claro", "Ya veo"
6. Haz preguntas de seguimiento naturales según lo que te cuenten
7. Si detectas urgencia, reconócelo: "Veo que esto es urgente"
8. Usa emojis sutiles solo cuando sea apropiado (no en exceso)

**DESPUÉS DE 3-4 INTERCAMBIOS:**
Cuando tengas suficiente información, di algo como:
"Perfecto, ya tengo claro tu caso. Dame un momento para conectarte con los abogados especializados que pueden ayudarte."

**TU RESPUESTA DEBE SER:**
- Máximo 150 caracteres (WhatsApp friendly)
- Una pregunta directa y específica
- Natural, como hablarías con un amigo que necesita ayuda`;

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        temperature: 0.85, // Más creatividad para ser natural
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      return completion.choices[0]?.message?.content || 'Disculpa, ¿podrías repetir eso?';
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      
      // Respuestas de fallback más naturales
      const fallbacks = [
        'Disculpa, tuve un problemita técnico. ¿Me lo puedes contar de nuevo?',
        'Uy, se me trabó un poco. ¿Podrías repetir lo último que dijiste?',
        'Perdón, no te escuché bien. ¿Me cuentas de nuevo?',
      ];
      
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
            content: `Eres un experto en clasificación de casos legales en Colombia. 

Analiza conversaciones naturales y extrae la información clave para clasificar el caso.

Considera que las personas hablan de forma coloquial, no formal. Interpreta el contexto y las emociones.`
          },
          {
            role: 'user',
            content: `Analiza esta conversación legal REAL y clasifica el caso.

CONVERSACIÓN:
${conversationText}

Responde en formato JSON con esta estructura exacta:
{
  "categoria": "Derecho Laboral",
  "urgencia": "ALTA",
  "titulo": "Título descriptivo del caso (máximo 50 caracteres)",
  "descripcion": "Resumen claro y conciso del caso basado en lo que el usuario contó (máximo 150 caracteres)",
  "palabrasClave": ["palabra1", "palabra2", "palabra3"]
}

CATEGORÍAS VÁLIDAS: Derecho Laboral, Derecho Penal, Derecho de Familia, Derecho Civil, Derecho Comercial, Derecho de Tránsito, Derecho Inmobiliario

URGENCIAS:
- ALTA: Problemas urgentes, amenazas, plazos cortos, situaciones críticas
- MEDIA: Casos importantes pero sin urgencia inmediata
- BAJA: Consultas preventivas, dudas generales

Escribe la descripción de forma natural, como lo contaría una persona.`
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
    const substantialResponses = userMessages.filter(m => m.content.length > 15);
    
    // Necesitamos al menos 3 mensajes sustanciales del usuario
    return messages.length >= 6 && substantialResponses.length >= 2;
  }
}

export const aiService = new AIService();
import { supabase } from "@/integrations/supabase/client";

// Sistema de conversa humanizado para CyberClass
export interface ConversationContext {
  userName?: string;
  currentTopic?: string;
  showingCourse?: string;
  sessionHistory: string[];
}

export class ChatEngine {
  private contexts: Map<string, ConversationContext> = new Map();
  
  private courses = {
    excel: {
      name: "Excel",
      price: "R$ 49,90",
      description: "Curso prático de Excel do básico ao avançado",
      highlights: ["Fórmulas essenciais", "Tabelas dinâmicas", "Gráficos profissionais", "Automatização"]
    },
    powerpoint: {
      name: "PowerPoint", 
      price: "R$ 49,90",
      description: "Criação de apresentações profissionais e impactantes",
      highlights: ["Design profissional", "Animações", "Templates", "Storytelling"]
    },
    ia: {
      name: "IA - Como Não Ser Substituído",
      price: "R$ 49,90", 
      description: "Estratégias para se manter relevante na era da IA",
      highlights: ["Habilidades do futuro", "Adaptação profissional", "Colaboração com IA", "Networking digital"]
    }
  };

  async processMessage(message: string, userId: string): Promise<string> {
    try {
      // Obter ou criar contexto
      const context = this.getContext(userId);
      context.sessionHistory.push(message);
      
      // Detectar intenção e gerar resposta
      const response = this.generateHumanResponse(message, context);
      
      // Salvar conversa
      await this.saveConversation(userId, message, response);
      
      return response;
    } catch (error) {
      console.error('Erro no chat:', error);
      return "Ops, tive um probleminha aqui. Pode repetir sua pergunta?";
    }
  }

  private getContext(userId: string): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, { sessionHistory: [] });
    }
    return this.contexts.get(userId)!;
  }

  private generateHumanResponse(message: string, context: ConversationContext): string {
    const msg = message.toLowerCase().trim();
    
    // Detectar nome do usuário
    const nameMatch = message.match(/meu nome é (\w+)|eu sou (\w+)|me chamo (\w+)/i);
    if (nameMatch) {
      const name = nameMatch[1] || nameMatch[2] || nameMatch[3];
      context.userName = name;
      return `Prazer, ${name}! 😊 Sou o assistente da CyberClass. Em que posso te ajudar hoje?`;
    }

    // Saudações
    if (this.isGreeting(msg)) {
      if (context.sessionHistory.length === 1) {
        return "Oi! Tudo bem? 😊 Sou o assistente da CyberClass. Em que posso te ajudar hoje?";
      }
      return `Oi${context.userName ? `, ${context.userName}` : ''}! Em que mais posso ajudar?`;
    }

    // Perguntas sobre cursos
    if (this.isAskingAboutCourses(msg)) {
      context.currentTopic = 'courses';
      return this.getCoursesOverview();
    }

    // Cursos específicos
    if (msg.includes('excel') || msg.includes('planilha')) {
      context.showingCourse = 'excel';
      return this.getCourseDetails('excel');
    }
    
    if (msg.includes('powerpoint') || msg.includes('apresentação') || msg.includes('slides')) {
      context.showingCourse = 'powerpoint'; 
      return this.getCourseDetails('powerpoint');
    }
    
    if (msg.includes('ia') || msg.includes('inteligência') || msg.includes('substituído')) {
      context.showingCourse = 'ia';
      return this.getCourseDetails('ia');
    }

    // Preços
    if (this.isAskingAboutPrices(msg)) {
      return this.getPricingInfo();
    }

    // Compra
    if (this.isAskingAboutBuying(msg)) {
      return this.getBuyingInfo(context);
    }

    // Contato
    if (this.isAskingAboutContact(msg)) {
      return this.getContactInfo();
    }

    // Agradecimentos
    if (this.isThanking(msg)) {
      return "Por nada! 😊 Fico feliz em ajudar. Mais alguma dúvida sobre nossos cursos?";
    }

    // Resposta contextual baseada no histórico
    return this.getContextualResponse(msg, context);
  }

  private isGreeting(msg: string): boolean {
    const greetings = ['oi', 'olá', 'ola', 'hey', 'eai', 'salve', 'bom dia', 'boa tarde', 'boa noite'];
    return greetings.some(g => msg.includes(g));
  }

  private isAskingAboutCourses(msg: string): boolean {
    const keywords = ['curso', 'cursos', 'tem', 'oferece', 'disponível', 'ensina', 'aprende'];
    return keywords.some(k => msg.includes(k));
  }

  private isAskingAboutPrices(msg: string): boolean {
    const keywords = ['preço', 'valor', 'custa', 'quanto', 'pagamento', 'pagar'];
    return keywords.some(k => msg.includes(k));
  }

  private isAskingAboutBuying(msg: string): boolean {
    const keywords = ['comprar', 'compra', 'adquirir', 'quero', 'interesse'];
    return keywords.some(k => msg.includes(k));
  }

  private isAskingAboutContact(msg: string): boolean {
    const keywords = ['contato', 'falar', 'suporte', 'ajuda', 'atendimento'];
    return keywords.some(k => msg.includes(k));
  }

  private isThanking(msg: string): boolean {
    const keywords = ['obrigad', 'valeu', 'brigad', 'agradec'];
    return keywords.some(k => msg.includes(k));
  }

  private getCoursesOverview(): string {
    return `Temos 3 cursos que podem turbinar sua carreira:

📊 **Excel** - ${this.courses.excel.price}
Aprenda planilhas do zero ao avançado

🎨 **PowerPoint** - ${this.courses.powerpoint.price}  
Crie apresentações que impressionam

🤖 **IA** - ${this.courses.ia.price}
Como se manter relevante na era da IA

Qual desses te interessa mais?`;
  }

  private getCourseDetails(courseKey: keyof typeof this.courses): string {
    const course = this.courses[courseKey];
    const icon = courseKey === 'excel' ? '📊' : courseKey === 'powerpoint' ? '🎨' : '🤖';
    
    return `${icon} **${course.name}** - ${course.price}

${course.description}

**Principais tópicos:**
${course.highlights.map(h => `• ${h}`).join('\n')}

Material completo em PDF + suporte por email. Interessou? Posso te explicar como adquirir!`;
  }

  private getPricingInfo(): string {
    return `💰 **Preços dos nossos cursos:**

📊 Excel: R$ 49,90
🎨 PowerPoint: R$ 49,90  
🤖 IA: R$ 49,90

Todos incluem material completo em PDF e suporte. Qual você gostaria de adquirir?`;
  }

  private getBuyingInfo(context: ConversationContext): string {
    const course = context.showingCourse;
    if (course) {
      const courseData = this.courses[course as keyof typeof this.courses];
      return `Ótima escolha! Para adquirir o curso de ${courseData.name}:

💳 **Pagamento via PIX: R$ 49,90**
Chave: 056.740.767-58

📧 Após o pagamento, envie o comprovante para: suporte.cyberclass@gmail.com

📱 Ou fale conosco no Telegram: @cyberclass_company

O material é enviado em até 30 minutos!`;
    }
    
    return `Para comprar qualquer curso:

1️⃣ Escolha o curso que quer
2️⃣ Faça o PIX de R$ 49,90
3️⃣ Envie o comprovante
4️⃣ Receba o material por email

Chave PIX: 056.740.767-58
Email: suporte.cyberclass@gmail.com

Qual curso você gostaria de adquirir?`;
  }

  private getContactInfo(): string {
    return `📞 **Fale conosco:**

💬 Telegram: @cyberclass_company
📧 Email: suporte.cyberclass@gmail.com

Estamos aqui para tirar todas suas dúvidas! 😊`;
  }

  private getContextualResponse(msg: string, context: ConversationContext): string {
    // Se já estava falando sobre um curso específico
    if (context.showingCourse) {
      return `Sobre o curso de ${this.courses[context.showingCourse as keyof typeof this.courses].name}, você gostaria de saber mais alguma coisa? Posso explicar o conteúdo, processo de compra ou tirar qualquer dúvida.`;
    }

    // Se estava falando sobre cursos em geral
    if (context.currentTopic === 'courses') {
      return "Qual dos nossos cursos te chama mais atenção? Excel, PowerPoint ou IA? Posso explicar qualquer um em detalhes!";
    }

    // Resposta padrão amigável
    return "Não entendi bem sua pergunta. Posso te ajudar com informações sobre nossos cursos de Excel, PowerPoint ou IA. Sobre o que você gostaria de saber?";
  }

  private async saveConversation(userId: string, userMessage: string, botResponse: string): Promise<void> {
    try {
      await supabase
        .from('chat_conversations')
        .insert([{
          user_id: userId,
          session_id: `session_${Date.now()}`,
          user_message: userMessage,
          bot_response: botResponse,
          timestamp: new Date().toISOString(),
          source: 'web_chat'
        }]);
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
    }
  }
}

export const chatEngine = new ChatEngine();
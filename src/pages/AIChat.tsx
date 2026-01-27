import { memo, useState, useRef, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/ui/stars-background";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Sparkles,
  MessageCircle,
  Loader2,
  Trash2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Você é a IA assistente oficial da CyberClass, uma empresa especializada em educação tecnológica e serviços digitais. 

Sobre a CyberClass:
- Oferece cursos de tecnologia, programação, Excel, PowerPoint e muito mais
- Presta serviços de desenvolvimento web, automação e consultoria em IA
- Foco em educação acessível e prática para todos os níveis
- Localizada no Brasil, atendendo em português

Seu papel:
- Ajudar usuários com dúvidas sobre os serviços da CyberClass
- Fornecer informações sobre cursos disponíveis
- Orientar sobre como contratar serviços
- Responder dúvidas gerais sobre tecnologia de forma didática
- Ser amigável, profissional e prestativo

Sempre responda em português brasileiro de forma clara e objetiva. Se não souber algo específico sobre a empresa, direcione o usuário para entrar em contato através do formulário de contato no site ou pelo WhatsApp.`;

// Função para formatar markdown básico em HTML
const formatMarkdown = (text: string): string => {
  return text
    // Negrito: **texto** ou __texto__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Itálico: *texto* ou _texto_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Código inline: `código`
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-amber-neon">$1</code>');
};

const AIChat = memo(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key não configurada");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao processar sua mensagem");
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente ou entre em contato conosco pelo formulário de contato.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const suggestedQuestions = [
    "Quais cursos vocês oferecem?",
    "Como contratar um serviço?",
    "Quanto custa desenvolver um site?",
    "Vocês fazem automação com IA?",
  ];

  return (
    <div className="h-[100dvh] bg-background relative flex flex-col overflow-hidden">
      {/* Stars Background */}
      <StarsBackground
        starDensity={0.00015}
        allStarsTwinkle={true}
        minTwinkleSpeed={0.5}
        maxTwinkleSpeed={1.5}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Header */}
      <m.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0"
      >
        <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-amber-neon transition-colors" />
              <div className="flex items-center space-x-2">
                <img 
                  src="/cyberclass-logo.png" 
                  alt="CyberClass Logo" 
                  className="w-6 h-6 sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-bold">
                  <span className="text-amber-neon">Cyber</span>
                  <span className="text-foreground">Class</span>
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-amber-neon/10 rounded-full border border-amber-neon/20">
                <Bot className="w-4 h-4 text-amber-neon" />
                <span className="text-sm font-medium text-amber-neon">IA Assistente</span>
              </div>
              <div className="sm:hidden flex items-center px-2 py-1 bg-amber-neon/10 rounded-full border border-amber-neon/20">
                <Bot className="w-4 h-4 text-amber-neon" />
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-destructive p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </m.header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center w-full"
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-neon/20 to-amber-neon/5 flex items-center justify-center border border-amber-neon/30">
                    <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-amber-neon" />
                  </div>
                  <m.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-neon" />
                  </m.div>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                  Olá! Sou a <span className="text-amber-neon">IA da CyberClass</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
                  Estou aqui para ajudar você com dúvidas sobre nossos cursos e serviços. Como posso ajudar?
                </p>

                <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                  {suggestedQuestions.map((question, index) => (
                    <m.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => {
                        setInput(question);
                        inputRef.current?.focus();
                      }}
                      className="p-2.5 sm:p-3 text-left rounded-lg border border-border bg-card/50 hover:bg-card hover:border-amber-neon/30 transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-2">
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-neon mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="text-[11px] sm:text-xs text-foreground leading-tight">{question}</span>
                      </div>
                    </m.button>
                  ))}
                </div>
              </m.div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <m.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-amber-neon text-black"
                            : "bg-card border border-amber-neon/30"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-amber-neon" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-3 sm:px-5 py-2 sm:py-3 ${
                          message.role === "user"
                            ? "bg-amber-neon text-black"
                            : "bg-card border border-border"
                        }`}
                      >
                        <div 
                          className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap [&>strong]:font-bold [&>em]:italic"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                        />
                        <p
                          className={`text-[10px] sm:text-xs mt-1 sm:mt-2 ${
                            message.role === "user" ? "text-black/60" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card border border-amber-neon/30 flex items-center justify-center">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-amber-neon" />
                    </div>
                    <div className="rounded-2xl px-3 sm:px-5 py-3 sm:py-4 bg-card border border-border">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-amber-neon animate-spin" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Pensando...</span>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex-shrink-0">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-end space-x-2 p-1.5 sm:p-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-lg">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground px-2 sm:px-3 py-2 max-h-20 min-h-[36px] text-sm"
              style={{
                height: "auto",
                minHeight: "36px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 80)}px`;
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-amber-neon hover:bg-amber-neon/90 text-black rounded-lg px-3 py-2 h-9 sm:h-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

AIChat.displayName = "AIChat";

export default AIChat;

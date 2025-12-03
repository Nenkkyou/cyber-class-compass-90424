import { memo, useState } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Target, 
  Lightbulb, 
  Rocket, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Star,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  TrendingUp,
  MessageCircle
} from "lucide-react";
import { StarsBackground } from "@/components/ui/stars-background";
import Navbar from "@/components/Navbar";
import WaitlistModal from "@/components/WaitlistModal";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Events = memo(() => {
  const modules = [
    {
      number: 1,
      title: "Fundamentos de IA",
      description: "O que é Inteligência Artificial, Machine Learning e Deep Learning na prática. Construa uma base sólida para compreender o que está por trás das ferramentas modernas de IA.",
      icon: Brain,
      topics: [
        "Conceitos fundamentais de IA",
        "Machine Learning vs Deep Learning",
        "Como as IAs aprendem",
        "Casos de uso no mundo real"
      ]
    },
    {
      number: 2,
      title: "Ferramentas Essenciais",
      description: "ChatGPT é interessante, mas existem outras ferramentas que você precisa conhecer. Exploraremos desde o ChatGPT até plataformas que potencializam sua produtividade.",
      icon: Target,
      topics: [
        "ChatGPT e técnicas de prompts",
        "Claude, Gemini e alternativas",
        "Ferramentas de geração de imagens",
        "Automações com IA"
      ]
    },
    {
      number: 3,
      title: "Aplicações Práticas",
      description: "Como usar IA no marketing, vendas, produtividade e automação de tarefas do dia a dia.",
      icon: Lightbulb,
      topics: [
        "IA no marketing digital",
        "Automação de processos",
        "Criação de conteúdo",
        "Produtividade pessoal"
      ]
    },
    {
      number: 4,
      title: "Revisão Completa - Mapeamento",
      description: "Um mapa que conecta tudo o que você aprendeu e transforma em ação para seus projetos profissionais.",
      icon: Rocket,
      topics: [
        "Mapa mental completo",
        "Plano de ação pessoal",
        "Próximos passos",
        "Recursos adicionais"
      ]
    }
  ];

  const benefits = [
    {
      icon: GraduationCap,
      title: "Do Básico ao Avançado",
      description: "Não importa seu nível atual, você vai evoluir significativamente"
    },
    {
      icon: Users,
      title: "Comunidade Engajada",
      description: "Conecte-se com pessoas que também buscam desenvolvimento pessoal"
    },
    {
      icon: TrendingUp,
      title: "Aplicação Imediata",
      description: "Aprenda técnicas que você pode aplicar no mesmo dia"
    },
    {
      icon: MessageCircle,
      title: "Suporte Contínuo",
      description: "Tire dúvidas e receba orientações personalizadas"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empreendedora",
      text: "As aulas mudaram completamente minha forma de trabalhar. Hoje uso IA em praticamente tudo!",
      rating: 5
    },
    {
      name: "Carlos Santos",
      role: "Profissional de Marketing",
      text: "Finalmente entendi como usar ChatGPT de forma profissional. Conteúdo incrível!",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Estudante",
      text: "Didática excelente e conteúdo super atualizado. Recomendo demais!",
      rating: 5
    }
  ];

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleInscricao = () => {
    setIsWaitlistOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Stars Background */}
      <StarsBackground
        starDensity={0.00025}
        allStarsTwinkle={true}
        minTwinkleSpeed={0.5}
        maxTwinkleSpeed={1.5}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-neon transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Home
              </Link>
            </m.div>
            
            <m.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="inline-flex items-center gap-2 bg-amber-neon/10 border border-amber-neon/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-amber-neon" />
                <span className="text-amber-neon text-sm font-medium">Inscrições Abertas 2026</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-white">Aulas de </span>
                <span className="text-amber-neon">Inteligência Artificial</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Aprenda do básico ao avançado sobre IA com uma metodologia prática e 
                uma comunidade de pessoas que buscam desenvolvimento pessoal e profissional.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5 text-amber-neon" />
                  <span>Turmas 2026</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5 text-amber-neon" />
                  <span>4 Módulos Completos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-5 h-5 text-amber-neon" />
                  <span>Vagas Limitadas</span>
                </div>
              </div>
              
              <Button
                onClick={handleInscricao}
                size="lg"
                className="text-lg px-10 py-7 bg-amber-neon hover:bg-amber-neon/90 text-black font-bold transition-transform duration-200 hover:scale-105 shadow-lg shadow-amber-neon/25"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Quero Me Inscrever
              </Button>
            </m.div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="py-20 bg-gradient-to-b from-background via-white/5 to-background">
          <div className="max-w-6xl mx-auto px-4">
            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-white">O Que Você Vai </span>
                <span className="text-amber-neon">Aprender</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Conteúdo estruturado em 4 módulos estratégicos para você dominar a Inteligência Artificial
              </p>
            </m.div>

            <m.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {modules.map((module) => (
                <m.div
                  key={module.number}
                  variants={item}
                  className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-amber-neon/50 transition-all duration-300 group"
                >
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-neon rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                    {module.number}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-amber-neon/10 rounded-xl flex items-center justify-center group-hover:bg-amber-neon/20 transition-colors">
                      <module.icon className="w-7 h-7 text-amber-neon" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{module.title}</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{module.description}</p>
                  
                  <ul className="space-y-3">
                    {module.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-400">
                        <CheckCircle2 className="w-5 h-5 text-amber-neon flex-shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-white">Por Que Escolher a </span>
                <span className="text-amber-neon">CyberClass</span>
              </h2>
            </m.div>

            <m.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {benefits.map((benefit, idx) => (
                <m.div
                  key={idx}
                  variants={item}
                  className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-amber-neon/30 transition-colors"
                >
                  <div className="w-16 h-16 bg-amber-neon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-amber-neon" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-background via-amber-neon/5 to-background">
          <div className="max-w-6xl mx-auto px-4">
            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-white">O Que Nossos </span>
                <span className="text-amber-neon">Alunos Dizem</span>
              </h2>
            </m.div>

            <m.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {testimonials.map((testimonial, idx) => (
                <m.div
                  key={idx}
                  variants={item}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-neon fill-amber-neon" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </m.div>
              ))}
            </m.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="inscricao" className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="text-white">Pronto Para </span>
                <span className="text-amber-neon">Transformar Sua Carreira?</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-10">
                As vagas são limitadas. Garanta a sua e faça parte da próxima turma!
              </p>
              
              <div className="bg-white/5 backdrop-blur-sm border border-amber-neon/30 rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Turmas 2026</p>
                    <p className="text-3xl font-bold text-amber-neon">Em Breve</p>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Vagas por Turma</p>
                    <p className="text-3xl font-bold text-white">Limitadas</p>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Formato</p>
                    <p className="text-3xl font-bold text-white">Online</p>
                  </div>
                </div>
                
                <Button
                  onClick={handleInscricao}
                  size="lg"
                  className="text-lg px-12 py-7 bg-amber-neon hover:bg-amber-neon/90 text-black font-bold transition-transform duration-200 hover:scale-105 shadow-lg shadow-amber-neon/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Entrar na Lista de Espera
                </Button>
                
                <p className="text-gray-500 text-sm mt-6">
                  Ao se inscrever, você receberá novidades e será notificado quando as inscrições abrirem.
                </p>
              </div>
            </m.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-500">
              © 2025 CyberClass. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />
    </div>
  );
});

Events.displayName = "Events";

export default Events;

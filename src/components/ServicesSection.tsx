import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  MessageCircleCode,
  Shield,
  Wrench,
  Headphones,
  MapPin,
  ExternalLink,
  Phone,
  Code,
  FileText,
  Users
} from "lucide-react";
import ServiceRequestModal from "./ServiceRequestModal";

const ServicesSection = memo(() => {

  const services = [
    {
      icon: Brain,
      title: "Aulas de Inteligência Artificial",
      description: "Aulas online e presenciais sobre IA para todos os níveis",
      details: "Aprenda os fundamentos da inteligência artificial de forma prática e acessível. Nossos cursos são projetados para pessoas sem background técnico, abordando desde conceitos básicos até aplicações práticas no dia a dia.",
      features: ["Aulas online e presenciais", "Material didático exclusivo", "Exercícios práticos", "Certificado de conclusão", "Suporte individualizado"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: Users,
      title: "Mentoria de IA Personalizada",
      description: "Orientação personalizada online e presencial para sua jornada em IA",
      details: "Sessões individuais de mentoria para acelerar seu aprendizado em IA. Desenvolvimento de projetos personalizados e orientação técnica especializada.",
      features: ["Mentoria individual", "Modalidade online e presencial", "Projetos práticos", "Acompanhamento contínuo", "Networking com especialistas"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: Headphones,
      title: "Suporte e Assistência Técnica",
      description: "Atendimento técnico especializado online e presencial",
      details: "Suporte técnico completo para resolução de problemas tecnológicos. Atendimento remoto e presencial para empresas e usuários finais.",
      features: ["Suporte online e presencial", "Atendimento 24/7", "Diagnóstico remoto", "Manutenção preventiva", "Suporte multicanal"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: MessageCircleCode,
      title: "Consultoria e Treinamentos",
      description: "Consultoria e treinamentos em tecnologia online e presencial",
      details: "Soluções personalizadas de consultoria tecnológica e treinamentos corporativos. Desenvolvimento de estratégias digitais para empresas.",
      features: ["Consultoria especializada", "Treinamentos corporativos", "Modalidade online e presencial", "Planejamento estratégico", "Implementação personalizada"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: Shield,
      title: "Cibersegurança",
      description: "Práticas, auditoria e prevenção de riscos digitais",
      details: "Proteção completa contra ameaças digitais com práticas de segurança, auditorias técnicas e prevenção de riscos. Mantenha seus dados e sistemas seguros.",
      features: ["Auditoria de segurança", "Prevenção de ameaças", "Treinamento em segurança", "Políticas de proteção", "Monitoramento contínuo"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: Code,
      title: "Desenvolvimento de Sistemas",
      description: "Desenvolvimento de sistemas e agentes de IA sob medida",
      details: "Criação de soluções tecnológicas personalizadas, incluindo sistemas corporativos e agentes de IA adaptados às necessidades específicas do seu negócio.",
      features: ["Sistemas personalizados", "Agentes de IA", "Desenvolvimento full-stack", "Integração de APIs", "Manutenção e suporte"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: Wrench,
      title: "Manutenção e Auxílio Tecnológico",
      description: "Manutenção e auxílio tecnológico para empresas e usuários",
      details: "Serviços de manutenção tecnológica para empresas e usuários finais. Desde configuração de equipamentos até otimização de sistemas e redes.",
      features: ["Manutenção preventiva", "Configuração de equipamentos", "Otimização de sistemas", "Suporte a empresas", "Atendimento domiciliar"],
      whatsapp: "552199974421",
      telegram: "@CyberClass_Company"
    },
    {
      icon: FileText,
      title: "PDF Store",
      description: "Materiais originais, guias práticos e exercícios exclusivos",
      details: "Loja de materiais digitais com conteúdo exclusivo da CyberClass. Guias práticos, exercícios, tutoriais e materiais de estudo desenvolvidos por nossa equipe.",
      features: ["Materiais originais", "Guias práticos", "Exercícios exclusivos", "Tutoriais passo a passo", "Atualizações constantes"],
      whatsapp: "552199974421",
      telegram: "@pdfstore_cyberclass_bot"
    }
  ];

  const openWhatsApp = useCallback((phone: string, service: string) => {
    const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre o serviço: ${service}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }, []);

  const openTelegram = useCallback((username: string) => {
    window.open(`https://t.me/${username.replace('@', '')}`, '_blank');
  }, []);

  return (
    <>
      {/* Gradient separator before section */}
      <div className="h-24 bg-gradient-to-b from-background to-white"></div>
      
      <section id="servicos" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16 gpu-accelerated"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-black">Nossos </span><span className="text-amber-neon">Serviços</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Soluções completas para suas necessidades digitais, desde aprendizado até suporte técnico
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: Math.min(index * 0.03, 0.2), 
                ease: "easeOut",
                type: "tween"
              }}
              viewport={{ once: true, margin: "-30px" }}
              className="bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-amber-neon/50 transition-colors duration-300 group h-full flex flex-col shadow-sm"
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-amber-neon/10 rounded-lg mb-6 group-hover:bg-amber-neon/20 transition-colors duration-300 flex-shrink-0">
                <service.icon className="w-8 h-8 text-amber-neon" />
              </div>
              
              <h3 className="text-lg font-semibold mb-3 text-center text-black">{service.title}</h3>
              <p className="text-gray-700 mb-6 text-sm leading-relaxed text-center flex-grow">
                {service.description}
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-amber-neon hover:bg-amber-neon/90 text-black font-semibold">
                    Saiba Mais
                  </Button>
                </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-black">
                        <service.icon className="w-5 h-5 text-amber-neon" />
                        {service.title}
                      </DialogTitle>
                      <DialogDescription className="text-left text-gray-700">
                        {service.details}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-black">O que inclui:</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-neon rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-4">
                        {service.title === "PDF Store" ? (
                          <Button
                            variant="navy"
                            size="sm"
                            onClick={() => openTelegram(service.telegram)}
                            className="w-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Telegram
                          </Button>
                        ) : (
                          <ServiceRequestModal 
                            prefilledServiceType={service.title}
                            trigger={
                              <Button variant="glow" size="sm" className="w-full">
                                <Wrench className="w-4 h-4 mr-2" />
                                Solicitar Serviço
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient separator after section */}
      <div className="h-24 bg-gradient-to-b from-white to-background"></div>
    </>
  );
});

ServicesSection.displayName = "ServicesSection";

export default ServicesSection;
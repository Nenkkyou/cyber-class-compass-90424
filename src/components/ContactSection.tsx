import { useState, memo, useCallback } from "react";
import { m } from "framer-motion";
import { useForm } from "react-hook-form";
import { fadeUp, containerStagger, item, headingViewport, cardGridViewport } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MessageCircle,
  Mail,
  Clock,
  Instagram,
  Send,
  Phone,
  MapPin
} from "lucide-react";
import ServiceRequestModal from "./ServiceRequestModal";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

const ContactSection = memo(() => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", data);
      
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Entraremos em contato em breve. Obrigado!",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente ou entre em contato pelo WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = useCallback(() => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os serviços da Cyber Class.");
    window.open(`https://wa.me/552199974421?text=${message}`, '_blank');
  }, []);

  const openInstagram = useCallback(() => {
    window.open('https://www.instagram.com/cyberclass_company?igsh=OGRwbmtyNzc2d3Zz&utm_source=qr', '_blank');
  }, []);

  const openEmail = useCallback(() => {
    window.open('mailto:suporte.cyberclass@gmail.com?subject=Contato via Site', '_blank');
  }, []);


  return (
    <section id="contato" className="py-20 bg-muted/30 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={headingViewport}
          className="text-center mb-16 gpu-accelerated"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Entre em <span className="text-amber-neon">Contato</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Estamos prontos para ajudar você a dar o próximo passo no mundo digital
          </p>
        </m.div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Info */}
          <m.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={cardGridViewport}
            className="grid sm:grid-cols-2 gap-4 sm:gap-6 gpu-accelerated"
          >
            {/* Quick Contact Methods */}
            <m.div variants={item} className="bg-card p-4 sm:p-6 rounded-lg border border-border">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contato Direto</h3>
              <div className="space-y-3 sm:space-y-4">
                <Button
                  variant="glow"
                  size="lg"
                  onClick={openWhatsApp}
                  className="w-full justify-start text-sm sm:text-base h-auto py-3"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={openEmail}
                  className="w-full justify-start text-sm sm:text-base h-auto py-3"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">Email</span>
                </Button>
              </div>
            </m.div>

            {/* Social Media */}
            <m.div variants={item} className="bg-card p-4 sm:p-6 rounded-lg border border-border">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Redes Sociais</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <Button
                    variant="navy"
                    onClick={openInstagram}
                    className="justify-start text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                  >
                    <Instagram className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Instagram</span>
                  </Button>
                  <Button
                    variant="navy"
                    onClick={() => window.location.href = '/ia'}
                    className="justify-start text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">CyberClass AI</span>
                  </Button>
                </div>
                 <ServiceRequestModal />
              </div>
            </m.div>

            {/* Business Hours */}
            <m.div variants={item} className="bg-card p-4 sm:p-6 rounded-lg border border-border">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-neon flex-shrink-0" />
                <span>Horário de Atendimento</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0">Segunda - Sexta:</span>
                  <span>08:00 - 18:00</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0">Sábado:</span>
                  <span>09:00 - 14:00</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0">Domingo:</span>
                  <span>Emergências apenas</span>
                </div>
              </div>
            </m.div>

            {/* Service Areas */}
            <m.div variants={item} className="bg-card p-4 sm:p-6 rounded-lg border border-border">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-neon flex-shrink-0" />
                <span>Atendimento Presencial</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>📍 Rio de Janeiro</p>
                <p>📍 São Paulo</p>
                <p>📍 Interior de SP (consulte)</p>
                <p>🌐 Remoto em todo Brasil</p>
              </div>
            </m.div>
          </m.div>
        </div>
      </div>

    </section>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;
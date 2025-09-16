import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
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
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Entre em <span className="text-amber-neon">Contato</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos prontos para ajudar você a dar o próximo passo no mundo digital
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Quick Contact Methods */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4">Contato Direto</h3>
              <div className="space-y-4">
                <Button
                  variant="glow"
                  size="lg"
                  onClick={openWhatsApp}
                  className="w-full justify-start"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={openEmail}
                  className="w-full justify-start"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  suporte.cyberclass@gmail.com
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4">Redes Sociais</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="navy"
                    onClick={openInstagram}
                    className="justify-start"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant="navy"
                    onClick={() => window.open('https://t.me/pdfstore_cyberclass_bot', '_blank')}
                    className="justify-start"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    PDF STORE
                  </Button>
                </div>
                 <ServiceRequestModal />
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-amber-neon" />
                Horário de Atendimento
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Segunda - Sexta:</span>
                  <span>08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span>09:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span>Emergências apenas</span>
                </div>
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-amber-neon" />
                Atendimento Presencial
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📍 Rio de Janeiro</p>
                <p>📍 São Paulo</p>
                <p>📍 Interior de SP (consulte disponibilidade)</p>
                <p>🌐 Atendimento remoto em todo Brasil</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;
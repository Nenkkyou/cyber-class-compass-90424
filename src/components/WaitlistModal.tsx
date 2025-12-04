import { memo, useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  occupation: string;
  experienceLevel: string;
  howFoundUs: string;
  motivation: string;
}

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Iniciante - Nunca usei IA' },
  { value: 'basic', label: 'Básico - Já usei ChatGPT algumas vezes' },
  { value: 'intermediate', label: 'Intermediário - Uso IA regularmente' },
  { value: 'advanced', label: 'Avançado - Domino várias ferramentas' },
];

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'friend', label: 'Indicação de amigo' },
  { value: 'other', label: 'Outro' },
];

const WaitlistModal = memo(({ isOpen, onClose }: WaitlistModalProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    occupation: '',
    experienceLevel: '',
    howFoundUs: '',
    motivation: '',
  });

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setStatus('loading');

    try {
      const { error } = await (supabase as any)
        .from('waitlist')
        .insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || null,
          occupation: formData.occupation.trim() || null,
          experience_level: formData.experienceLevel || 'beginner',
          how_found_us: formData.howFoundUs || null,
          motivation: formData.motivation.trim() || null,
          source: 'events_page',
        });

      if (error) {
        console.error('Waitlist error:', error);
        
        // Verificar se é erro de duplicidade
        if (error.code === '23505') {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está na nossa lista de espera!",
            variant: "destructive",
          });
          setStatus('idle');
          return;
        }
        
        throw error;
      }

      setStatus('success');
      
      toast({
        title: "🎉 Inscrição confirmada!",
        description: "Você está na lista de espera. Entraremos em contato em breve!",
      });

      // Reset após 3 segundos
      setTimeout(() => {
        setStatus('idle');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          occupation: '',
          experienceLevel: '',
          howFoundUs: '',
          motivation: '',
        });
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Submit error:', error);
      setStatus('error');
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      setStatus('idle');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] bg-background border-white/10 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-amber-neon" />
            Lista de Espera - IA 2026
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha seus dados para garantir sua vaga nas aulas de Inteligência Artificial.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <m.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 text-center"
            >
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </m.div>
              <h3 className="text-xl font-bold text-white mb-2">
                Você está na lista! 🎉
              </h3>
              <p className="text-gray-400">
                Entraremos em contato quando as inscrições abrirem.
              </p>
            </m.div>
          ) : status === 'error' ? (
            <m.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 text-center"
            >
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Ops! Algo deu errado
              </h3>
              <p className="text-gray-400">
                Tente novamente em alguns instantes.
              </p>
            </m.div>
          ) : (
            <m.div
              key="form-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-4 pb-2"
              >
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4 text-amber-neon" />
                  Nome Completo *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  disabled={status === 'loading'}
                  autoComplete="name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-neon"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-white">
                  <Mail className="w-4 h-4 text-amber-neon" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={status === 'loading'}
                  autoComplete="email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-neon"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-white">
                  <Phone className="w-4 h-4 text-amber-neon" />
                  WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  disabled={status === 'loading'}
                  autoComplete="tel"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-neon"
                />
              </div>

              {/* Ocupação */}
              <div className="space-y-2">
                <Label htmlFor="occupation" className="flex items-center gap-2 text-white">
                  <Briefcase className="w-4 h-4 text-amber-neon" />
                  Ocupação
                </Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Ex: Empreendedor, Estudante, Marketing..."
                  disabled={status === 'loading'}
                  autoComplete="organization-title"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-neon"
                />
              </div>

              {/* Nível de Experiência */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-white">
                  <GraduationCap className="w-4 h-4 text-amber-neon" />
                  Seu nível com IA
                </Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleInputChange('experienceLevel', value)}
                  disabled={status === 'loading'}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-amber-neon">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem 
                        key={level.value} 
                        value={level.value}
                        className="text-white hover:bg-white/10"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Como nos encontrou */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-white">
                  Como nos encontrou?
                </Label>
                <Select
                  value={formData.howFoundUs}
                  onValueChange={(value) => handleInputChange('howFoundUs', value)}
                  disabled={status === 'loading'}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-amber-neon">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10">
                    {HOW_FOUND_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-white/10"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Motivação */}
              <div className="space-y-2">
                <Label htmlFor="motivation" className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-4 h-4 text-amber-neon" />
                  O que te motiva a aprender IA?
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  placeholder="Conte um pouco sobre seus objetivos..."
                  disabled={status === 'loading'}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-neon min-h-[80px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 text-right">
                  {formData.motivation.length}/500
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-6 text-lg bg-amber-neon hover:bg-amber-neon/90 text-black font-bold transition-transform duration-200 hover:scale-[1.02]"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Garantir Minha Vaga
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Seus dados estão seguros. Não compartilhamos com terceiros.
              </p>
              </form>
            </m.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
});

WaitlistModal.displayName = "WaitlistModal";

export default WaitlistModal;

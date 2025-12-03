import { useState, memo, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Send, Wrench, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

// Regex para validação de telefone brasileiro
const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}$/;

const formSchema = z.object({
  firstName: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome deve conter apenas letras"),
  lastName: z.string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "Sobrenome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Sobrenome deve conter apenas letras"),
  email: z.string()
    .email("Email inválido")
    .max(100, "Email muito longo"),
  phone: z.string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(20, "Telefone muito longo")
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, "Telefone deve ter 10 ou 11 dígitos"),
  serviceType: z.string().min(1, "Selecione um tipo de serviço"),
  description: z.string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição muito longa (máx. 1000 caracteres)"),
});

type SubmitStatus = "idle" | "loading" | "success" | "error";

type FormData = z.infer<typeof formSchema>;

const serviceTypes = [
  "Aulas de Inteligência Artificial",
  "Mentoria de IA Personalizada",
  "Suporte e Assistência Técnica",
  "Consultoria e Treinamentos",
  "Cibersegurança",
  "Desenvolvimento de Sistemas",
  "Manutenção e Auxílio Tecnológico"
] as const;

interface ServiceRequestModalProps {
  trigger?: React.ReactNode;
  prefilledServiceType?: string;
}

// Formatação de telefone em tempo real
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const ServiceRequestModal = memo(({ trigger, prefilledServiceType }: ServiceRequestModalProps) => {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      serviceType: prefilledServiceType || "",
      description: "",
    },
    mode: "onBlur", // Validação ao sair do campo
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Reset após animação de fechamento
    setTimeout(() => {
      if (submitStatus === "success") {
        form.reset();
        setSubmitStatus("idle");
      }
    }, 300);
  }, [submitStatus, form]);

  const onSubmit = async (data: FormData) => {
    setSubmitStatus("loading");
    
    try {
      const { data: response, error } = await supabase.functions.invoke('send-service-request', {
        body: data
      });

      if (error) {
        throw error;
      }

      if (!response?.success) {
        throw new Error(response?.message || "Erro ao enviar solicitação");
      }
      
      setSubmitStatus("success");
      
      toast({
        title: "✅ Solicitação enviada com sucesso!",
        description: "Recebemos sua solicitação e entraremos em contato em breve.",
      });
      
      // Fecha automaticamente após 2 segundos
      setTimeout(handleClose, 2000);
      
    } catch (error: unknown) {
      console.error("Error sending service request:", error);
      setSubmitStatus("error");
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro desconhecido";
      
      toast({
        title: "❌ Erro ao enviar solicitação",
        description: `${errorMessage}. Tente novamente ou entre em contato pelo WhatsApp.`,
        variant: "destructive",
      });
      
      // Reset status após 3 segundos
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  }, []);

  const defaultTrigger = (
    <Button variant="glow" size="lg" className="w-full">
      <Wrench className="w-5 h-5 mr-2" />
      Solicitar Serviço
    </Button>
  );

  const isLoading = submitStatus === "loading";
  const isSuccess = submitStatus === "success";
  const isError = submitStatus === "error";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-neon" />
            Solicitar Serviço
          </DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para solicitar um serviço. Entraremos em contato em breve.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-in zoom-in duration-300" />
            <h3 className="text-xl font-semibold text-green-500 mb-2">Enviado com Sucesso!</h3>
            <p className="text-muted-foreground">
              Sua solicitação foi recebida. Entraremos em contato em breve.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu nome" 
                          {...field} 
                          disabled={isLoading}
                          autoComplete="given-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu sobrenome" 
                          {...field} 
                          disabled={isLoading}
                          autoComplete="family-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="seu.email@exemplo.com" 
                        {...field} 
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field}
                        onChange={(e) => handlePhoneChange(e, field.onChange)}
                        disabled={isLoading}
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Serviço</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione o tipo de serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border border-border max-h-60 overflow-y-auto z-50">
                        {serviceTypes.map((service) => (
                          <SelectItem key={service} value={service} className="hover:bg-muted">
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descrição do Problema
                      <span className="text-muted-foreground text-xs ml-2">
                        ({field.value.length}/1000)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente seu problema ou necessidade..."
                        className="min-h-[100px] resize-none"
                        maxLength={1000}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isError}
                variant={isError ? "destructive" : "glow"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : isError ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Erro - Tente novamente
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
});

ServiceRequestModal.displayName = "ServiceRequestModal";

export default ServiceRequestModal;
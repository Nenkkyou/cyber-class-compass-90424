import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ServiceRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
}

// Validação de dados
function validateInput(data: ServiceRequestData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push("Nome deve ter pelo menos 2 caracteres");
  }
  
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push("Sobrenome deve ter pelo menos 2 caracteres");
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Email inválido");
  }
  
  const phoneDigits = data.phone?.replace(/\D/g, "") || "";
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.push("Telefone deve ter 10 ou 11 dígitos");
  }
  
  if (!data.serviceType || data.serviceType.trim().length < 1) {
    errors.push("Tipo de serviço é obrigatório");
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres");
  }
  
  return { valid: errors.length === 0, errors };
}

// Sanitização de HTML para prevenir XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

// Formatação de telefone
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Apenas aceita POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const data: ServiceRequestData = await req.json();

    // Validação
    const validation = validateInput(data);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: validation.errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { firstName, lastName, email, phone, serviceType, description } = data;

    // Sanitização
    const safeFirstName = escapeHtml(firstName.trim());
    const safeLastName = escapeHtml(lastName.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = formatPhone(phone);
    const safeServiceType = escapeHtml(serviceType.trim());
    const safeDescription = escapeHtml(description.trim());

    console.log("Sending service request email:", { 
      firstName: safeFirstName, 
      lastName: safeLastName, 
      email: safeEmail, 
      serviceType: safeServiceType,
      timestamp: new Date().toISOString()
    });

    // Template de email modernizado
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(255, 193, 7, 0.15);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center; border-bottom: 2px solid #ffc107;">
                    <h1 style="margin: 0; color: #ffc107; font-size: 28px; font-weight: 700;">
                      🚀 Nova Solicitação de Serviço
                    </h1>
                    <p style="margin: 8px 0 0; color: #a0aec0; font-size: 14px;">
                      ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </p>
                  </td>
                </tr>
                
                <!-- Service Type Badge -->
                <tr>
                  <td style="padding: 24px 40px 0;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: #0a0a0f; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                      ${safeServiceType}
                    </div>
                  </td>
                </tr>
                
                <!-- Client Info -->
                <tr>
                  <td style="padding: 24px 40px;">
                    <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 600; border-left: 3px solid #ffc107; padding-left: 12px;">
                      👤 Dados do Cliente
                    </h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 16px; background-color: #16213e; border-radius: 8px 8px 0 0;">
                          <span style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nome Completo</span>
                          <p style="margin: 4px 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">${safeFirstName} ${safeLastName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #16213e; border-top: 1px solid #2d3748;">
                          <span style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                          <p style="margin: 4px 0 0; color: #ffc107; font-size: 16px;">
                            <a href="mailto:${safeEmail}" style="color: #ffc107; text-decoration: none;">${safeEmail}</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #16213e; border-radius: 0 0 8px 8px; border-top: 1px solid #2d3748;">
                          <span style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Telefone</span>
                          <p style="margin: 4px 0 0; color: #ffffff; font-size: 16px;">
                            <a href="tel:+55${phone.replace(/\D/g, '')}" style="color: #4ade80; text-decoration: none;">${safePhone}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Description -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 600; border-left: 3px solid #ffc107; padding-left: 12px;">
                      📝 Descrição do Problema
                    </h2>
                    <div style="background-color: #16213e; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                      <p style="margin: 0; color: #e2e8f0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${safeDescription}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Quick Actions -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="text-align: center; padding: 8px;">
                          <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(safeServiceType)} - CyberClass" style="display: inline-block; background-color: #ffc107; color: #0a0a0f; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                            📧 Responder por Email
                          </a>
                        </td>
                        <td style="text-align: center; padding: 8px;">
                          <a href="https://wa.me/55${phone.replace(/\D/g, '')}" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                            💬 WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f0f1a; padding: 20px 40px; text-align: center;">
                    <p style="margin: 0; color: #718096; font-size: 12px;">
                      Esta solicitação foi enviada através do site da <strong style="color: #ffc107;">CyberClass</strong>
                    </p>
                    <p style="margin: 8px 0 0; color: #4a5568; font-size: 11px;">
                      © ${new Date().getFullYear()} CyberClass - Todos os direitos reservados
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "CyberClass <onboarding@resend.dev>",
      to: ["suporte.cyberclass@gmail.com"],
      replyTo: safeEmail,
      subject: `🚀 Nova Solicitação: ${safeServiceType} - ${safeFirstName} ${safeLastName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Solicitação enviada com sucesso",
      id: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in send-service-request function:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar solicitação", 
        message: errorMessage 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
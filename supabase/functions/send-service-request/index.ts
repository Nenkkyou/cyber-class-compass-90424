import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ServiceRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, serviceType, description }: ServiceRequestData = await req.json();

    console.log("Sending service request email:", { firstName, lastName, email, serviceType });

    const emailResponse = await resend.emails.send({
      from: "CyberClass <onboarding@resend.dev>",
      to: ["suporte.cyberclass@gmail.com"],
      subject: `Nova Solicitação de Serviço - ${serviceType}`,
      html: `
        <h1>Nova Solicitação de Serviço</h1>
        <h2>Dados do Cliente:</h2>
        <p><strong>Nome:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Tipo de Serviço:</strong> ${serviceType}</p>
        
        <h2>Descrição do Problema:</h2>
        <p>${description}</p>
        
        <hr>
        <p>Esta solicitação foi enviada através do site da CyberClass.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-service-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
import { createGroq } from "@ai-sdk/groq";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SYSTEM = `Eres Eva, la asistente virtual de Eventia — el marketplace de servicios para eventos en Iquitos, Perú.

Puedes ayudar con dos cosas:
1. Buscar servicios reales del catálogo (locales, fotografía, música, decoración)
2. Responder preguntas generales sobre organización de eventos (presupuestos, consejos, diferencias entre servicios, protocolo para bodas o quinceañeros, etc.)

Tu personalidad:
- Cálida, cercana y proactiva — nada de respuestas robóticas o formuladas
- Español natural, como hablaría una organizadora de eventos en Iquitos
- Si el usuario ya da suficiente información, buscas directamente sin hacer preguntas de más
- Si falta información para buscar, preguntas lo necesario — máximo una o dos cosas a la vez
- Para preguntas generales, respondes con confianza y criterio propio — no necesitas buscar en la base de datos

Cuándo buscar servicios:
- Cuando el usuario quiere contratar, ver opciones o conocer precios
- Puedes hacer búsquedas amplias si tienes poca información — mejor mostrar opciones que no encontrar nada
- Si hay resultados, preséntalos con entusiasmo y explica por qué son buena opción
- Si no hay resultados, sugiere ampliar presupuesto, cambiar categoría o buscar sin filtros

Categorías disponibles: local, fotografia, musica, decoracion

Regla importante: nunca inventes servicios — solo menciona lo que aparezca en los resultados.`;

const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "Chatbot no configurado. Agrega GROQ_API_KEY a .env.local" },
      { status: 503 }
    );
  }

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const body = await req.json();
    const modelMessages = await convertToModelMessages(body.messages ?? []);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM,
      messages: modelMessages,
      stopWhen: stepCountIs(10),
      tools: {
        searchServices: tool({
          description: "Busca servicios disponibles en el catálogo de Eventia según los criterios del usuario",
          inputSchema: z.object({
            category: z
              .enum(["local", "fotografia", "musica", "decoracion"])
              .optional()
              .describe("Categoría del servicio"),
            maxPrice: z
              .number()
              .optional()
              .describe("Presupuesto máximo en soles peruanos"),
            keyword: z
              .string()
              .optional()
              .describe("Término libre para buscar en el nombre del servicio"),
          }),
          execute: async ({ category, maxPrice, keyword }) => {
            const supabase = db();

            let query = supabase
              .from("services")
              .select(`
                id, title, description, base_price, pricing_type, location,
                provider:providers(business_name),
                category:service_categories(name, slug),
                images:service_images(url, is_cover, display_order)
              `)
              .eq("status", "active")
              .order("base_price", { ascending: true })
              .limit(5);

            if (category) {
              const { data: cat } = await supabase
                .from("service_categories")
                .select("id")
                .eq("slug", category)
                .single();
              if (cat) query = query.eq("category_id", (cat as { id: number }).id);
            }

            if (maxPrice)  query = query.lte("base_price", maxPrice);
            if (keyword)   query = query.ilike("title", `%${keyword}%`);

            const { data } = await query;

            const services = (data ?? []).map((s: Record<string, unknown>) => {
              const imgs = (s.images as { url: string; is_cover: boolean; display_order: number }[]) ?? [];
              const sorted = [...imgs].sort((a, b) => a.display_order - b.display_order);
              const cover = sorted.find((i) => i.is_cover)?.url ?? sorted[0]?.url ?? null;
              return {
                id:           s.id,
                title:        s.title,
                base_price:   s.base_price,
                pricing_type: s.pricing_type,
                location:     s.location,
                category:     s.category,
                provider:     s.provider,
                cover,
              };
            });

            return { services, count: services.length };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Eva] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

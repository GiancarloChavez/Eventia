import { google } from "@ai-sdk/google";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SYSTEM = `Eres Eva, la asistente virtual de Eventia, el marketplace de eventos en Iquitos, Perú.
Tu misión es ayudar a los usuarios a encontrar los servicios perfectos para su evento.

Categorías disponibles:
- local: Salones y espacios para eventos
- fotografia: Fotógrafos y videógrafos
- musica: DJs, orquestas y grupos musicales
- decoracion: Decoradores de eventos

Flujo de conversación:
1. Saluda brevemente y pregunta qué tipo de evento planean (boda, quinceaños, graduación, cumpleaños, corporativo)
2. Pregunta la fecha aproximada
3. Pregunta cuántas personas asistirán (solo si buscan local)
4. Pregunta el presupuesto aproximado para el servicio que buscan
5. Pregunta qué tipo de servicio necesitan si no lo han mencionado
6. Cuando tengas suficiente información, usa la herramienta searchServices
7. Presenta los resultados de forma amigable destacando lo más relevante

Reglas:
- Habla siempre en español, de forma amigable y concisa
- Haz máximo una o dos preguntas por mensaje
- Si el usuario ya menciona varios datos, reúnelos y busca directamente
- Si no hay resultados, sugiere ampliar el presupuesto o cambiar categoría
- Nunca inventes servicios que no aparezcan en los resultados`;

const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: SYSTEM,
    messages: modelMessages,
    stopWhen: stepCountIs(5),
    tools: {
      searchServices: tool({
        description: "Busca servicios en el catálogo de Eventia según los criterios recopilados del usuario",
        inputSchema: z.object({
          category: z
            .enum(["local", "fotografia", "musica", "decoracion"])
            .optional()
            .describe("Categoría del servicio a buscar"),
          maxPrice: z
            .number()
            .optional()
            .describe("Presupuesto máximo del usuario en soles peruanos"),
          eventType: z
            .string()
            .optional()
            .describe("Tipo de evento: boda, quinceaños, graduación, etc."),
        }),
        execute: async ({ category, maxPrice }: { category?: "local" | "fotografia" | "musica" | "decoracion"; maxPrice?: number; eventType?: string }) => {
          const supabase = db();

          let query = supabase
            .from("services")
            .select(`
              id,
              title,
              description,
              base_price,
              location,
              category:service_categories(name, slug),
              images:service_images(url, is_cover, display_order)
            `)
            .eq("status", "active")
            .order("base_price", { ascending: true })
            .limit(4);

          if (category) {
            const { data: cat } = await supabase
              .from("service_categories")
              .select("id")
              .eq("slug", category)
              .single();
            if (cat) query = query.eq("category_id", cat.id);
          }

          if (maxPrice) {
            query = query.lte("base_price", maxPrice);
          }

          const { data } = await query;

          const services = (data ?? []).map((s: Record<string, unknown>) => {
            const imgs = (s.images as { url: string; is_cover: boolean; display_order: number }[]) ?? [];
            const sorted = [...imgs].sort((a, b) => a.display_order - b.display_order);
            const cover = sorted.find((i) => i.is_cover)?.url ?? sorted[0]?.url ?? null;
            return {
              id:         s.id,
              title:      s.title,
              base_price: s.base_price,
              location:   s.location,
              category:   s.category,
              cover,
            };
          });

          return { services, count: services.length };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

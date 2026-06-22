export type Category = "local" | "fotografia" | "musica" | "decoracion";

export type ServiceStatus = "Pendiente" | "Confirmado" | "Completado" | "Cancelado";

/** Forma que devuelve Supabase al hacer el select con joins */
export interface DbService {
  id: string;
  title: string;
  description: string | null;
  base_price: number | null;
  location: string | null;
  capacity_min: number | null;
  capacity_max: number | null;
  category_id: number;
  status: string;
  category: { name: string; slug: string } | null;
  provider: { business_name: string; status: string; logo_url: string | null } | null;
  images: { url: string; is_cover: boolean; display_order: number }[];
}

/** Fragmento de select reutilizable en queries de servicios */
export const SERVICE_SELECT = `
  id,
  title,
  description,
  base_price,
  location,
  capacity_min,
  capacity_max,
  category_id,
  status,
  category:service_categories(name, slug),
  provider:providers(business_name, status, logo_url),
  images:service_images(url, is_cover, display_order)
` as const;

// --- datos estáticos que sí permanecen ---

// Placeholder para mantener compatibilidad durante la migración
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALL_SERVICES: any[] = [
  {
    id: 1,
    name: "Salón Grand Imperial",
    category: "local",
    categoryLabel: "Local",
    provider: "Eventos Supremos SAC",
    verified: true,
    rating: 4.8,
    reviews: 127,
    price: 8500,
    city: "Lima",
    description:
      "Majestuoso salón de 800 m² para 50–400 personas. Terraza exclusiva, estacionamiento propio, cocina equipada, cabina de sonido integrada y sala de ensayos. Amplia experiencia en quinceaños, bodas y graduaciones de alto nivel.",
    shortDesc: "Salón de lujo con terraza y estacionamiento en Miraflores.",
    capacity: { min: 50, max: 400 },
    images: [
      "https://picsum.photos/seed/evhall1a/800/520",
      "https://picsum.photos/seed/evhall2b/800/520",
      "https://picsum.photos/seed/evhall3c/800/520",
      "https://picsum.photos/seed/evhall4d/800/520",
    ],
    tags: ["Quinceaños", "Bodas", "Graduaciones"],
    availability: "Lunes a Domingo",
    includes: ["Mesas y sillas", "Mantelería", "Iluminación básica", "Estacionamiento", "Guardarropa"],
    reviews_list: [
      { author: "María González", date: "Marzo 2025", rating: 5, text: "Hermoso salón, el personal muy atento. Todo salió perfecto para la quinceaños de mi hija." },
      { author: "Carlos Mendoza", date: "Febrero 2025", rating: 5, text: "La boda de mis sueños se hizo realidad aquí. Muy recomendable." },
      { author: "Ana Ramírez", date: "Enero 2025", rating: 4, text: "Buena atención y espacio amplio. Un pequeño inconveniente con el estacionamiento en hora pico." },
    ],
  },
  {
    id: 2,
    name: "Jardín Colonial Los Arcos",
    category: "local",
    categoryLabel: "Local",
    provider: "Hacienda Los Arcos",
    verified: true,
    rating: 4.9,
    reviews: 84,
    price: 12000,
    city: "Arequipa",
    description:
      "Hermoso jardín de estilo colonial para bodas y eventos al aire libre. Fuente centenaria, jardines florales permanentes, área techada y capilla privada.",
    shortDesc: "Jardín colonial con fuente ideal para bodas y quinceaños.",
    capacity: { min: 100, max: 300 },
    images: [
      "https://picsum.photos/seed/evgarden1a/800/520",
      "https://picsum.photos/seed/evgarden2b/800/520",
      "https://picsum.photos/seed/evgarden3c/800/520",
    ],
    tags: ["Bodas", "Quinceaños", "Aniversarios"],
    availability: "Viernes a Domingo",
    includes: ["Mobiliario colonial", "Jardinería", "Seguridad", "Valet parking"],
    reviews_list: [
      { author: "Sofía Herrera", date: "Abril 2025", rating: 5, text: "El jardín es absolutamente mágico. Mis invitados quedaron enamorados." },
      { author: "Jorge Villanueva", date: "Marzo 2025", rating: 5, text: "La mejor decisión para nuestra boda. El ambiente colonial es incomparable." },
    ],
  },
  {
    id: 3,
    name: "Luna Fotografía & Video",
    category: "fotografia",
    categoryLabel: "Fotografía",
    provider: "Luna Fotografía",
    verified: true,
    rating: 4.7,
    reviews: 203,
    price: 3500,
    city: "Lima",
    description:
      "Paquete premium de fotografía y video. 8 horas de cobertura completa, edición profesional, álbum digital interactivo, álbum físico de 50 páginas y drone aéreo.",
    shortDesc: "8 horas de cobertura fotográfica con álbum y drone incluidos.",
    capacity: { min: 1, max: 500 },
    images: [
      "https://picsum.photos/seed/evphoto1a/800/520",
      "https://picsum.photos/seed/evphoto2b/800/520",
      "https://picsum.photos/seed/evphoto3c/800/520",
    ],
    tags: ["Quinceaños", "Bodas", "Graduaciones", "Aniversarios"],
    availability: "Todos los días",
    includes: ["8h cobertura", "Video highlight 3 min", "Álbum digital", "Álbum físico 50 pág.", "Drone aéreo"],
    reviews_list: [
      { author: "Roberto Flores", date: "Mayo 2025", rating: 5, text: "Increíbles fotografías. Capturaron cada momento con una perfección que jamás esperábamos." },
      { author: "Patricia Soto", date: "Abril 2025", rating: 5, text: "Muy profesionales. Las fotos del drone fueron espectaculares." },
    ],
  },
  {
    id: 4,
    name: "DJ Éxtasis & Animación",
    category: "musica",
    categoryLabel: "Música",
    provider: "Éxtasis Entretenimiento",
    verified: false,
    rating: 4.6,
    reviews: 98,
    price: 2200,
    city: "Trujillo",
    description:
      "DJ profesional con 10+ años de experiencia. Equipo Bose de alta gama, luces LED robotizadas, máquina de humo y animación dinámica para todos los géneros.",
    shortDesc: "DJ profesional con equipo premium y animación completa.",
    capacity: { min: 20, max: 500 },
    images: [
      "https://picsum.photos/seed/evdj1a/800/520",
      "https://picsum.photos/seed/evdj2b/800/520",
    ],
    tags: ["Quinceaños", "Bodas", "Graduaciones"],
    availability: "Viernes a Domingo",
    includes: ["Equipo Bose", "Luces LED robóticas", "Máquina de humo", "Animación 4h"],
    reviews_list: [{ author: "Daniela Castro", date: "Marzo 2025", rating: 5, text: "El DJ estuvo increíble. Todo el mundo bailó toda la noche." }],
  },
  {
    id: 5,
    name: "Orquesta Tropical Los Reyes",
    category: "musica",
    categoryLabel: "Música",
    provider: "Música y Fiesta Perú",
    verified: true,
    rating: 4.9,
    reviews: 61,
    price: 6500,
    city: "Lima",
    description:
      "Orquesta de 12 músicos en vivo: salsa, cumbia, chicha y pop latino. Animador carismático, cantante principal, coristas y vestuario de gala.",
    shortDesc: "Orquesta de 12 músicos con animador y vestuario de gala.",
    capacity: { min: 50, max: 1000 },
    images: [
      "https://picsum.photos/seed/evorch1a/800/520",
      "https://picsum.photos/seed/evorch2b/800/520",
    ],
    tags: ["Bodas", "Quinceaños", "Aniversarios"],
    availability: "Viernes a Domingo",
    includes: ["12 músicos", "Cantante + coristas", "Animador", "Vestuario de gala", "Sonido propio"],
    reviews_list: [{ author: "Alejandro Ríos", date: "Enero 2025", rating: 5, text: "La orquesta fue la sensación de la noche. Repertorio increíble." }],
  },
  {
    id: 6,
    name: "Magia Floral Decoraciones",
    category: "decoracion",
    categoryLabel: "Decoración",
    provider: "Encanto Eventos",
    verified: true,
    rating: 4.8,
    reviews: 156,
    price: 2800,
    city: "Cusco",
    description:
      "Decoración temática completa. Flores frescas de importación, globos personalizados, centros de mesa únicos, arreglos de entrada y photobooth digital.",
    shortDesc: "Decoración temática completa con flores y photobooth digital.",
    capacity: { min: 20, max: 400 },
    images: [
      "https://picsum.photos/seed/evdecor1a/800/520",
      "https://picsum.photos/seed/evdecor2b/800/520",
      "https://picsum.photos/seed/evdecor3c/800/520",
    ],
    tags: ["Quinceaños", "Bodas", "Cumpleaños"],
    availability: "Todos los días",
    includes: ["Flores importadas", "Centros de mesa ×10", "Photobooth digital", "Arreglo de entrada"],
    reviews_list: [{ author: "Valeria Torres", date: "Abril 2025", rating: 5, text: "Transformaron el salón en algo de revista. Cada detalle fue perfecto." }],
  },
  {
    id: 7,
    name: "Centro de Eventos Aqua",
    category: "local",
    categoryLabel: "Local",
    provider: "Grupo Aqua",
    verified: true,
    rating: 4.5,
    reviews: 89,
    price: 5500,
    city: "Piura",
    description:
      "Moderno centro con piscina decorativa iluminada, LED ambiental personalizable y capacidad para 250 personas. Ideal para fiestas temáticas.",
    shortDesc: "Centro moderno con piscina decorativa para fiestas temáticas.",
    capacity: { min: 30, max: 250 },
    images: [
      "https://picsum.photos/seed/evacua1a/800/520",
      "https://picsum.photos/seed/evacua2b/800/520",
    ],
    tags: ["Quinceaños", "Graduaciones", "Cumpleaños"],
    availability: "Jueves a Domingo",
    includes: ["Mesas y sillas", "Barra básica", "Cocina equipada", "LED ambiental"],
    reviews_list: [],
  },
  {
    id: 8,
    name: "Captura Momentos Pro",
    category: "fotografia",
    categoryLabel: "Fotografía",
    provider: "Studio PixelArt",
    verified: false,
    rating: 4.4,
    reviews: 47,
    price: 1800,
    city: "Chiclayo",
    description:
      "5 horas de fotografía profesional con edición artística personalizada y galería online privada en 72 horas.",
    shortDesc: "5 horas de fotografía con galería online privada en 72h.",
    capacity: { min: 1, max: 300 },
    images: [
      "https://picsum.photos/seed/evphoto4a/800/520",
      "https://picsum.photos/seed/evphoto5b/800/520",
    ],
    tags: ["Graduaciones", "Cumpleaños", "Quinceaños"],
    availability: "Todos los días",
    includes: ["5h cobertura", "Edición artística", "Galería online privada", "Entrega 72h"],
    reviews_list: [],
  },
  {
    id: 9,
    name: "Decorarte Premium",
    category: "decoracion",
    categoryLabel: "Decoración",
    provider: "Arte & Eventos Perú",
    verified: true,
    rating: 4.7,
    reviews: 74,
    price: 4200,
    city: "Lima",
    description:
      "Decoración de lujo: LED personalizado, manteles de seda, cristalería premium, candelabros y supervisión del director artístico durante todo el evento.",
    shortDesc: "Decoración de lujo con materiales importados y supervisión.",
    capacity: { min: 50, max: 500 },
    images: [
      "https://picsum.photos/seed/evdecor4a/800/520",
      "https://picsum.photos/seed/evdecor5b/800/520",
    ],
    tags: ["Bodas", "Aniversarios", "Quinceaños"],
    availability: "Todos los días",
    includes: ["Materiales importados", "LED personalizado", "Cristalería premium", "Manteles seda"],
    reviews_list: [],
  },
];

export const CATEGORIES = [
  { id: "local" as Category, label: "Locales", icon: "Building2" },
  { id: "fotografia" as Category, label: "Fotografía", icon: "Camera" },
  { id: "musica" as Category, label: "Música", icon: "Music" },
  { id: "decoracion" as Category, label: "Decoración", icon: "Sparkles" },
];

export const PERUVIAN_CITIES = [
  "Lima",
  "Arequipa",
  "Trujillo",
  "Cusco",
  "Piura",
  "Chiclayo",
  "Iquitos",
  "Huancayo",
];

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Cotizar";
  return `S/ ${price.toLocaleString("es-PE")}`;
}

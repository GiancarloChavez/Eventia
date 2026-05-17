# Eventia — Documento de Contexto y Requerimientos del Sistema

**Versión:** 1.1  
**Fecha:** 2026-05-16  
**Curso:** Análisis y Gestión de Sistemas de Información  
**Autor:** Andre Pezo

---

## 1. Descripción del Proyecto

**Eventia** es una plataforma digital de marketplace orientada a centralizar todos los servicios necesarios para la organización de eventos sociales (aniversarios, graduaciones, ceremonias, quinceaños, fiestas, entre otros).

### 1.1 Problema que resuelve

En el mercado local, el proceso de organizar un evento se realiza íntegramente mediante referidos y recomendaciones informales. Esto genera varios problemas:

- **Fricción alta:** el organizador debe buscar contactos de manera dispersa (WhatsApp, Facebook, conocidos)
- **Competencia limitada:** los proveedores sin red social quedan excluidos del mercado
- **Falta de transparencia:** no existen precios estandarizados, ni reseñas verificadas
- **Sin trazabilidad:** los acuerdos son verbales o informales, sin respaldo contractual
- **Alcance reducido:** el tamaño y calidad del evento depende de los contactos del organizador

### 1.2 Solución propuesta

Eventia centraliza la oferta de servicios para eventos en una sola plataforma web, permitiendo al organizador buscar, comparar, contratar y pagar proveedores de manera digital y trazable.

El modelo es comparable a lo que hace **Despegar.com** en el sector de viajes: agrupa servicios heterogéneos bajo una sola experiencia de usuario, aplicando comisiones sobre las transacciones realizadas.

### 1.3 Propósito dual

- **Académico:** entrega final del curso de Análisis y Gestión de Sistemas de Información
- **Empresarial:** sentar las bases de una empresa digital escalable

---

## 2. Modelo de Negocio

### 2.1 Tipo de plataforma

Marketplace de servicios de dos lados (two-sided marketplace):

- **Lado oferta:** proveedores de servicios para eventos
- **Lado demanda:** organizadores de eventos (clientes)

### 2.2 Monetización

El modelo principal de ingresos es la **comisión por contrato cerrado**:

- Eventia cobra un porcentaje sobre el valor total de cada contrato confirmado y pagado
- El porcentaje es configurable por categoría de servicio desde el panel de administración
- El pago completo ingresa a la plataforma; Eventia retiene su comisión y transfiere el saldo al proveedor una vez completado el evento

### 2.3 Flujo de dinero

```
Cliente paga 100%
    └── Eventia retiene X% (comisión)
    └── Proveedor recibe (100 - X)% al completar el evento
```

### 2.4 Ventajas del modelo

| Ventaja | Razón |
|---|---|
| Alineación de incentivos | Eventia gana solo si el proveedor gana |
| Barrera de entrada baja | Los proveedores se registran gratis |
| Trazabilidad natural | El contrato digital dispara el cobro |
| Escalable | Más eventos = más ingresos sin aumentar costos operativos |

---

## 3. Alcance del MVP

### 3.1 Plataforma

- Aplicación **web** (navegador), con diseño responsivo para uso desde móvil

### 3.2 Categorías de servicios incluidas

1. Locales y salones de evento
2. Fotografía y video
3. Música (DJ y orquestas)
4. Decoración y ambientación

### 3.3 Tipos de eventos objetivo

Aniversarios, graduaciones, ceremonias, quinceaños y fiestas en general.

---

## 4. Actores del Sistema

| Actor | Descripción |
|---|---|
| **Visitante** | Usuario no registrado. Puede explorar el catálogo de servicios sin restricciones. |
| **Cliente** | Persona que organiza un evento. Se registra, busca servicios, realiza contratos y paga. |
| **Proveedor** | Empresa o individuo que ofrece servicios para eventos. Se registra, publica servicios y gestiona sus reservas. |
| **Administrador** | Gestiona la plataforma. Aprueba proveedores, configura comisiones y supervisa transacciones. |

---

## 5. Requerimientos Funcionales

### Módulo 1 — Gestión de Usuarios

| ID | Requerimiento |
|---|---|
| RF01 | El visitante puede explorar y buscar servicios sin necesidad de registrarse |
| RF02 | El cliente puede registrarse en la plataforma con correo electrónico y contraseña |
| RF03 | El proveedor puede registrarse y enviar documentos de verificación (RUC / DNI) |
| RF04 | El administrador aprueba o rechaza el registro de proveedores antes de que publiquen servicios |
| RF05 | Cada usuario autenticado puede gestionar su perfil (foto, datos personales, contraseña) |

### Módulo 2 — Catálogo de Servicios

| ID | Requerimiento |
|---|---|
| RF06 | El proveedor puede crear publicaciones de servicio con: nombre, categoría, descripción, fotos, precio fijo o modalidad "solicitar cotización" |
| RF07 | El cliente puede buscar servicios por categoría, fecha disponible y rango de precio |
| RF08 | Cada servicio muestra: fotos, descripción, precio, calificación promedio y disponibilidad |
| RF09 | Los resultados de búsqueda se pueden filtrar y ordenar (precio, calificación, más recientes) |

### Módulo 3 — Reservas y Contratos

| ID | Requerimiento |
|---|---|
| RF10 | El cliente puede reservar directamente un servicio de precio fijo |
| RF11 | El cliente puede solicitar cotización en servicios que lo requieran, describiendo sus necesidades (fecha, cantidad de personas, detalles del evento) |
| RF12 | El proveedor recibe una notificación y puede aceptar o rechazar la solicitud de reserva o cotización |
| RF13 | En el flujo de cotización, el proveedor envía una propuesta de precio; el cliente la acepta o rechaza |
| RF14 | Al confirmar una reserva o cotización, el sistema genera un contrato digital con los términos del servicio |
| RF15 | Ambas partes deben aceptar el contrato digitalmente antes de proceder al pago |
| RF16 | El contrato/reserva maneja los siguientes estados: `Pendiente → Confirmado → Completado / Cancelado` |

### Módulo 4 — Pagos y Comisiones

| ID | Requerimiento |
|---|---|
| RF17 | El cliente realiza el pago completo de manera online al confirmar el contrato |
| RF18 | El sistema retiene automáticamente la comisión de Eventia (porcentaje configurable por el administrador) |
| RF19 | El monto restante se libera al proveedor una vez que el evento es marcado como completado |
| RF20 | El sistema genera comprobantes de pago para el cliente y para el proveedor |
| RF21 | Existe una política de cancelación que determina la devolución parcial o total según el tiempo de anticipación |

### Módulo 5 — Reseñas y Calificaciones

| ID | Requerimiento |
|---|---|
| RF22 | Tras completar el evento, el cliente puede calificar el servicio (1–5 estrellas) y dejar un comentario escrito |
| RF23 | El proveedor puede responder públicamente a la reseña recibida |
| RF24 | La calificación promedio se muestra en la ficha del servicio |
| RF25 | El administrador puede moderar y eliminar reseñas inapropiadas |

### Módulo 6 — Notificaciones

| ID | Requerimiento |
|---|---|
| RF26 | El sistema envía notificaciones por correo electrónico para: nueva solicitud de reserva, confirmación de contrato, pago recibido y recordatorio de evento próximo |
| RF27 | La plataforma cuenta con un centro de notificaciones interno para cada usuario |

### Módulo 7 — Panel de Administración

| ID | Requerimiento |
|---|---|
| RF28 | El administrador tiene un dashboard con métricas clave: reservas activas, ingresos generados, usuarios registrados, proveedores pendientes de aprobación |
| RF29 | El administrador puede revisar documentos y aprobar o rechazar el registro de proveedores |
| RF30 | El administrador puede configurar el porcentaje de comisión por categoría de servicio |
| RF31 | El administrador puede suspender o eliminar cuentas de usuarios y proveedores |
| RF32 | El administrador puede consultar el historial completo de contratos y pagos para resolver disputas |

---

## 6. Requerimientos No Funcionales

| ID | Requerimiento |
|---|---|
| RNF01 | Diseño web responsivo: la plataforma debe funcionar correctamente desde el navegador móvil |
| RNF02 | Todas las comunicaciones deben realizarse bajo protocolo HTTPS |
| RNF03 | El procesamiento de pagos debe realizarse a través de **Stripe** como pasarela certificada |
| RNF04 | Los datos personales y financieros deben almacenarse cifrados |
| RNF05 | El tiempo de carga de las páginas principales no debe superar los 3 segundos en condiciones normales |
| RNF06 | El sistema debe tener una disponibilidad mínima del 99.5% |
| RNF07 | El sistema debe soportar al menos 200 usuarios concurrentes en el MVP |

---

## 7. Flujos Principales del Sistema

### 7.1 Flujo de contratación — Precio fijo

```
Cliente busca servicio
    → Selecciona servicio
    → Elige fecha disponible
    → Solicita reserva
    → Proveedor acepta
    → Sistema genera contrato
    → Ambas partes firman digitalmente
    → Cliente paga online
    → Día del evento: proveedor entrega servicio
    → Cliente marca evento como completado
    → Sistema libera pago al proveedor (menos comisión)
    → Cliente deja reseña
```

### 7.2 Flujo de contratación — Cotización

```
Cliente solicita cotización (describe evento, fecha, necesidades)
    → Proveedor recibe solicitud y envía propuesta de precio
    → Cliente acepta o rechaza la propuesta
    → [Si acepta] Sistema genera contrato
    → Ambas partes firman digitalmente
    → Cliente paga online
    → ... (igual que flujo precio fijo desde este punto)
```

### 7.3 Flujo de registro de proveedor

```
Proveedor completa formulario de registro
    → Sube documentos de verificación (RUC / DNI / portafolio)
    → Cuenta queda en estado "Pendiente de aprobación"
    → Administrador revisa documentos
    → Aprueba o rechaza con comentario
    → Proveedor recibe notificación por correo
    → [Si aprobado] Puede publicar servicios
```

---

## 8. Restricciones y Supuestos

- El MVP se desarrolla para **una sola ciudad** (mercado local)
- Los pagos se procesan en **moneda local** (PEN / USD según la pasarela elegida)
- Los contratos son digitales dentro de la plataforma; no reemplazan contratos legales notariales
- El sistema no gestiona logística ni traslados de equipos
- La plataforma no intermedia en la comunicación directa posterior al contrato (mensajería fuera del flujo de cotización no es parte del MVP)

---

## 9. Arquitectura del Sistema

### 9.1 Patrón arquitectónico

**Monolito Modular** — un único repositorio y deployment con módulos internos bien delimitados. Permite escalar a microservicios en el futuro sin reescribir.

```
┌─────────────────────────────────────────────┐
│                  CLIENTE                    │
│         Navegador (Next.js SSR/CSR)         │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│              SERVIDOR                       │
│         Next.js App Router                  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Usuarios │ │ Catálogo │ │  Contratos  │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Pagos   │ │ Reseñas  │ │    Admin    │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           SERVICIOS EXTERNOS                │
│   Supabase DB │ Stripe │ Resend │ Storage   │
└─────────────────────────────────────────────┘
```

### 9.2 Stack Tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| **Frontend + Backend** | Next.js 15 (App Router) | Framework full-stack — SSR para SEO del catálogo, Server Actions para lógica de negocio |
| **UI** | Tailwind CSS + shadcn/ui | Estilos y componentes accesibles y personalizables |
| **Base de datos** | Supabase (PostgreSQL) | BD relacional — contratos, pagos, reseñas. Incluye Auth, Storage y Row Level Security |
| **ORM** | Prisma | Queries type-safe y migraciones declarativas |
| **Autenticación** | Supabase Auth | Sesiones y JWT. Soporta email/contraseña y OAuth (Google) |
| **Pagos** | Stripe | Pasarela internacional con soporte para Stripe Connect (pagos a proveedores) y webhooks |
| **Almacenamiento** | Supabase Storage | Fotos de servicios y documentos de verificación de proveedores |
| **Emails** | Resend | Notificaciones transaccionales. 3,000 emails/mes gratis |
| **Hosting** | Vercel | Deploy automático desde GitHub, CDN global, preview deployments por rama |
| **Versionado** | GitHub | Repositorio: https://github.com/GiancarloChavez/Eventia.git |

### 9.3 Pipeline de desarrollo (sin GitHub Actions)

Vercel se integra nativamente con GitHub, eliminando la necesidad de GitHub Actions en el MVP:

```
Push a rama feature/*
    → Vercel genera Preview Deployment (URL única)
    → Revisión y aprobación
    → Merge a main
    → Vercel despliega automáticamente a producción
    → Rollback disponible con un clic desde el dashboard
```

GitHub Actions se incorporará en una fase posterior si se agregan tests automatizados (Jest, Playwright) o linting obligatorio pre-merge.

### 9.4 Costo estimado en producción

| Servicio | Plan | Costo |
|---|---|---|
| Vercel | Hobby | $0/mes |
| Supabase | Free tier | $0/mes |
| Resend | Free tier | $0/mes |
| Stripe | Por transacción | 2.9% + $0.30 por cargo |
| **Total fijo** | | **$0/mes** |

---

## 10. Metodología de Desarrollo

**Scrum adaptado** para equipo pequeño, con sprints de 2 semanas:

| Ceremonia | Frecuencia | Duración |
|---|---|---|
| Sprint Planning | Inicio de sprint | 1 hora |
| Daily Standup | Diario | 15 min |
| Sprint Review | Fin de sprint | 30 min |
| Retrospectiva | Fin de sprint | 20 min |

**Herramienta de gestión:** GitHub Projects (integrado con el repositorio)

### Sprints planificados

| Sprint | Entregable |
|---|---|
| Sprint 1 | Autenticación, registro de usuarios y proveedores, panel admin básico |
| Sprint 2 | Catálogo de servicios, búsqueda y filtros |
| Sprint 3 | Flujo de reservas, cotizaciones y contratos digitales |
| Sprint 4 | Módulo de pagos con Stripe + comisiones |
| Sprint 5 | Reseñas, notificaciones, pulido UI y despliegue final |

---

## 11. Próximos pasos definidos

- [x] Definición de requerimientos funcionales y no funcionales
- [x] Arquitectura y stack tecnológico
- [ ] Diagrama entidad-relación (base de datos)
- [ ] Casos de uso detallados
- [ ] Prototipo de interfaces (wireframes)
- [ ] Inicialización del repositorio y proyecto Next.js
- [ ] Desarrollo del MVP (Sprint 1–5)

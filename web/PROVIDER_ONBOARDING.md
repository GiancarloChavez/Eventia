# Flujo de registro de proveedor — Eventia

Wizard de 5 pasos. El proveedor no puede recibir pagos ni aparecer en el catálogo
hasta completar todos los pasos y recibir aprobación del administrador.

---

## Paso 1 — Cuenta (auth)

**Ruta:** `/auth/registro?tipo=proveedor`

**Objetivo:** crear las credenciales de acceso.

**Campos:**
- Nombre del contacto (full_name en metadata)
- Correo electrónico
- Contraseña (mínimo 8 caracteres)
- Confirmar contraseña

**Autenticación disponible:**
- Email + contraseña (Supabase Auth)
- Google OAuth → redirige a `/auth/callback?role=provider&next=/proveedor`

**Al completar:**
- Email/contraseña: muestra pantalla de verificación de correo. El link del
  correo lleva a `/auth/callback` que redirige al siguiente paso.
- Google OAuth: sesión activa inmediata, redirige directo al paso 2.

**Estado del usuario:** `role = "provider"`, email sin verificar (si usó email).

---

## Paso 2 — Perfil del negocio

**Ruta:** `/proveedor/onboarding/negocio` *(pendiente de implementar)*

**Objetivo:** datos visibles en el catálogo.

**Campos:**
- Nombre del negocio (business_name)
- Categoría: Local / Fotografía / Música / Decoración
- Ciudad principal
- Teléfono de contacto
- Descripción (bio visible en el catálogo, hasta 300 caracteres)
- Logo / foto de perfil (Supabase Storage)

**Al completar:** crea registro en tabla `providers` con `status = "pending"`.

---

## Paso 3 — Primer servicio

**Ruta:** `/proveedor/onboarding/servicio` *(pendiente de implementar)*

**Objetivo:** publicar al menos un servicio antes de solicitar aprobación.

**Campos:**
- Nombre del servicio
- Descripción
- Tipo de precio: Precio fijo | Cotizar
- Precio base (si aplica)
- Capacidad mínima y máxima (personas)
- Tipos de evento que atiende (Boda, Quinceaños, Graduación, Aniversario, Otro)
- Mínimo 2 fotos del servicio (Supabase Storage)
- Días de anticipación requeridos

**Al completar:** crea registro en tabla `services` vinculado al proveedor.

---

## Paso 4 — Configuración de pagos (Stripe Connect)

**Ruta:** `/proveedor/onboarding/pagos` *(pendiente de implementar)*

**Objetivo:** habilitar la recepción de pagos cuando Eventia libere fondos.

**Flujo:**
1. Crear cuenta Stripe Connect vinculada al `provider.id`
2. Redirigir al onboarding hosted de Stripe (Stripe maneja KYC y cuenta bancaria)
3. Al regresar de Stripe: marcar `stripe_onboarding_complete = true` en BD
4. Guardar `stripe_account_id` en la tabla `providers`

**Notas:**
- Este paso es obligatorio antes de que el perfil quede activo.
- Stripe maneja la verificación de identidad y cuenta bancaria (no se implementa
  lógica propia de KYC).
- Si el proveedor abandona en este paso, puede retomarlo desde el dashboard.

**Al completar:** avanza al paso 5.

---

## Paso 5 — Revisión y envío

**Ruta:** `/proveedor/onboarding/revision` *(pendiente de implementar)*

**Objetivo:** preview del perfil y envío para aprobación del administrador.

**Contenido:**
- Vista previa del perfil como lo verá un cliente
- Checklist de lo completado (perfil, servicio, pagos)
- Botón "Enviar para aprobación"

**Al enviar:**
- `provider.status` cambia a `"pending_review"`
- Email al proveedor vía Resend: "Recibimos tu solicitud, revisaremos en 48h"
- Email al administrador: nueva solicitud pendiente de revisión

---

## Estados del proveedor

| Estado         | Descripción                                               |
|----------------|-----------------------------------------------------------|
| `draft`        | Registro iniciado, no todos los pasos completados         |
| `pending_review` | Todos los pasos completados, esperando aprobación       |
| `approved`     | Visible en catálogo, puede recibir solicitudes            |
| `rejected`     | Rechazado por el administrador (notificado por email)     |
| `suspended`    | Suspendido por el administrador (perfil oculto)           |

---

## Callback OAuth

**Ruta:** `/auth/callback`

Maneja tanto el flujo OAuth (Google) como la verificación de email por link.
Recibe parámetros `role` y `next` en la URL para asignar el rol correcto y
redirigir al paso correspondiente después de autenticar.

---

## Decisión de diseño: Stripe en el onboarding

A diferencia de Airbnb (que pide el pago al primer cobro), Eventia requiere
Stripe Connect durante el onboarding porque el modelo de negocio retiene la
comisión y libera el saldo al proveedor al completar el evento. Sin cuenta
Stripe configurada, ese flujo queda roto. Es mejor resolverlo antes de que
el perfil esté activo.

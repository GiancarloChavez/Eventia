"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Eye, EyeOff, User, Mail, Lock, Building2, Phone, MapPin, ChevronLeft } from "lucide-react";
import { PERUVIAN_CITIES } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "local",      label: "Local para eventos" },
  { value: "fotografia", label: "Fotografía y video" },
  { value: "musica",     label: "Música y entretenimiento" },
  { value: "decoracion", label: "Decoración y ambientación" },
];

function RegistroForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipo = searchParams.get("tipo") === "proveedor" ? "proveedor" : "cliente";
  const isProvider = tipo === "proveedor";

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    ciudad: "",
    categoria: "",
    password: "",
    confirm: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.nombre,
          role: isProvider ? "provider" : "client",
          phone: form.telefono || null,
          ...(isProvider && { business_name: form.empresa }),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push(isProvider ? "/proveedor" : "/cliente");
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Back */}
      <Link
        href="/auth"
        className="flex items-center gap-1.5 text-gray-400 text-[13px] hover:text-gray-700 transition-colors mb-6"
      >
        <ChevronLeft size={15} />
        Volver
      </Link>

      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
          style={{
            background: isProvider ? "rgba(243,158,16,0.1)" : "rgba(59,130,246,0.1)",
            color: isProvider ? "#f39e10" : "#3b82f6",
          }}
        >
          {isProvider ? "Cuenta de proveedor" : "Cuenta de organizador"}
        </div>
        <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
          {isProvider ? "Registra tu negocio" : "Crea tu cuenta"}
        </h1>
        <p className="text-gray-500 text-[14px]">
          {isProvider
            ? "Llega a miles de clientes que buscan tus servicios."
            : "Encuentra los mejores proveedores para tu evento."}
        </p>
      </div>

      {error && (
        <div className="mb-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Nombre completo / Nombre de contacto */}
        <InputField
          icon={<User size={14} />}
          label={isProvider ? "Nombre del contacto" : "Nombre completo"}
          type="text"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder={isProvider ? "Tu nombre y apellido" : "Juan Pérez"}
          required
        />

        {/* Provider-only: empresa + categoría */}
        {isProvider && (
          <>
            <InputField
              icon={<Building2 size={14} />}
              label="Nombre de la empresa"
              type="text"
              value={form.empresa}
              onChange={set("empresa")}
              placeholder="Ej. Eventos Supremos SAC"
              required
            />

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
                Categoría principal
              </label>
              <select
                value={form.categoria}
                onChange={set("categoria")}
                required
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none bg-white cursor-pointer transition-colors"
                style={{ fontFamily: "inherit", color: form.categoria ? "#111827" : "#9ca3af" }}
                onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              >
                <option value="">Selecciona tu categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Email */}
        <InputField
          icon={<Mail size={14} />}
          label="Correo electrónico"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="tu@correo.com"
          required
        />

        {/* Teléfono */}
        <InputField
          icon={<Phone size={14} />}
          label="Teléfono"
          type="tel"
          value={form.telefono}
          onChange={set("telefono")}
          placeholder="+51 999 999 999"
        />

        {/* Ciudad */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400" />
              Ciudad
            </span>
          </label>
          <select
            value={form.ciudad}
            onChange={set("ciudad")}
            required
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none bg-white cursor-pointer"
            style={{ fontFamily: "inherit", color: form.ciudad ? "#111827" : "#9ca3af" }}
            onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            <option value="">Selecciona tu ciudad</option>
            {PERUVIAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-[14px] outline-none"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPwd ? "text" : "password"}
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="Repite tu contraseña"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold mt-1 cursor-pointer border-none"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
            opacity: loading ? 0.75 : 1,
            transition: "opacity 200ms",
          }}
        >
          {loading ? "Creando cuenta..." : isProvider ? "Registrar mi negocio" : "Crear mi cuenta"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-[13px] mt-5">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-[#f39e10] font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

function InputField({
  icon, label, type, value, onChange, placeholder, required,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
          style={{ fontFamily: "inherit" }}
          onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[440px] animate-pulse" />}>
      <RegistroForm />
    </Suspense>
  );
}

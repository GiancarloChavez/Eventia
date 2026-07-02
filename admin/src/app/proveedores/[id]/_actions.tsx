"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function ProviderActions({ providerId }: { providerId: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason,     setReason]     = useState("");
  const [loading,    setLoading]    = useState<"approve" | "reject" | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const submit = async (action: "approve" | "reject") => {
    if (action === "reject" && !reason.trim()) {
      setError("Escribe el motivo de rechazo");
      return;
    }
    setError(null);
    setLoading(action);

    const res = await fetch(`/api/providers/${providerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: reason.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error desconocido");
      setLoading(null);
      return;
    }

    router.push("/proveedores");
    router.refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
      <h3 className="font-bold text-gray-900 mb-4 text-[15px]">Decisión de revisión</h3>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {!showReject ? (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => submit("approve")}
            disabled={!!loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors cursor-pointer border-none text-sm disabled:opacity-60"
          >
            {loading === "approve" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Aprobar proveedor
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={!!loading}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer border-none text-sm disabled:opacity-60"
          >
            <XCircle size={15} />
            Rechazar
          </button>
        </div>
      ) : (
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Motivo de rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Las fotos del servicio no son claras. Por favor sube imágenes reales del trabajo con buena iluminación."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none resize-none mb-2 transition-colors"
            onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
            onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            autoFocus
          />
          <p className="text-xs text-gray-400 mb-4">Este mensaje será enviado al proveedor por email.</p>
          <div className="flex gap-3">
            <button
              onClick={() => submit("reject")}
              disabled={!!loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer border-none text-sm disabled:opacity-60"
            >
              {loading === "reject" ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              Confirmar rechazo
            </button>
            <button
              onClick={() => { setShowReject(false); setReason(""); setError(null); }}
              disabled={!!loading}
              className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer bg-white text-sm disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ReservationWithService } from "@/lib/db/reservations";

// Etiquetas en español para los estados
const ESTADO_LABEL: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
};

// Colores para cada estado
const ESTADO_COLOR: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

// Convierte la lista de reservas a un archivo CSV y lo descarga
function exportarCSV(reservations: ReservationWithService[]) {
    // Cabecera del CSV
    const header = ["ID", "Fecha", "Hora", "Servicio", "Cliente", "Email", "Teléfono", "Estado"];

    // Una fila por reserva
    const rows = reservations.map((r) => [
        r.id.slice(0, 8).toUpperCase(),
        new Date(r.reservation_date).toLocaleDateString("es-CO"),
        new Date(r.start_time).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        r.service.name,
        r.client_name ?? "",
        r.client_email ?? "",
        r.client_phone ?? "",
        ESTADO_LABEL[r.status] ?? r.status,
    ]);

    // Unir todo con comas y saltos de línea
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");

    // Crear un enlace invisible y hacer click para descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reservas.csv";
    link.click();
    URL.revokeObjectURL(url);
}

type Props = {
    reservations: ReservationWithService[];
};

export default function TablaReservas({ reservations }: Props) {
    // filtroEstado puede ser "ALL", "PENDING", "CONFIRMED" o "CANCELLED"
    const [filtroEstado, setFiltroEstado] = useState("ALL");
    const [lista, setLista] = useState<ReservationWithService[]>(reservations);
    const [cargando, setCargando] = useState<string | null>(null); // ID de la reserva en proceso

    // Filtra la lista según el estado seleccionado
    const listaFiltrada =
        filtroEstado === "ALL" ? lista : lista.filter((r) => r.status === filtroEstado);

    // Cancela una reserva (cambia su estado a CANCELLED)
    async function cancelar(id: string) {
        setCargando(id);
        try {
            const res = await fetch(`/api/reservas/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            // Actualizar el estado en la lista local sin recargar la página
            setLista((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r)),
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al cancelar");
        } finally {
            setCargando(null);
        }
    }

    // Elimina una reserva permanentemente
    async function eliminar(id: string) {
        if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;
        setCargando(id);
        try {
            const res = await fetch(`/api/reservas/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            // Sacar la reserva de la lista local
            setLista((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al eliminar");
        } finally {
            setCargando(null);
        }
    }

    return (
        <div>
            {/* Barra de controles: filtro + exportar */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                <div className="flex gap-2">
                    {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((estado) => (
                        <button
                            key={estado}
                            onClick={() => setFiltroEstado(estado)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                                filtroEstado === estado
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                            }`}
                        >
                            {estado === "ALL" ? "Todas" : ESTADO_LABEL[estado]}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => exportarCSV(listaFiltrada)}
                    className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-700 transition"
                >
                    Exportar CSV
                </button>
            </div>

            {/* Tabla de reservas */}
            {listaFiltrada.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">
                    No hay reservas con ese filtro.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-left">Hora</th>
                                <th className="px-4 py-3 text-left">Servicio</th>
                                <th className="px-4 py-3 text-left">Cliente</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {listaFiltrada.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-gray-500">
                                        {r.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(r.reservation_date).toLocaleDateString("es-CO")}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(r.start_time).toLocaleTimeString("es-CO", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                    <td className="px-4 py-3">{r.service.name}</td>
                                    <td className="px-4 py-3">
                                        <div>{r.client_name ?? "—"}</div>
                                        <div className="text-xs text-gray-400">{r.client_email ?? ""}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[r.status] ?? ""}`}>
                                            {ESTADO_LABEL[r.status] ?? r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {/* Cancelar solo si está pendiente o confirmada */}
                                            {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                                                <button
                                                    onClick={() => cancelar(r.id)}
                                                    disabled={cargando === r.id}
                                                    className="text-orange-600 hover:underline text-xs disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                            {/* Eliminar solo si no está confirmada */}
                                            {r.status !== "CONFIRMED" && (
                                                <button
                                                    onClick={() => eliminar(r.id)}
                                                    disabled={cargando === r.id}
                                                    className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

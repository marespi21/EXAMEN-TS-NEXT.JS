"use client";

import { useState } from "react";
import type { ReservationWithService } from "@/lib/db/reservations";

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const ESTADO_LABEL: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
};

const ESTADO_COLOR: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

// Devuelve una clave "YYYY-MM-DD" para agrupar reservas por día
function toKey(date: Date): string {
    return date.toISOString().split("T")[0];
}

type Props = {
    reservations: ReservationWithService[];
};

export default function CalendarioMensual({ reservations }: Props) {
    const hoy = new Date();
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth()); // 0 = enero
    const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

    // Agrupa las reservas por día: { "2026-04-27": [reserva, reserva], ... }
    const reservasPorDia: Record<string, ReservationWithService[]> = {};
    for (const r of reservations) {
        const key = toKey(new Date(r.reservation_date));
        if (!reservasPorDia[key]) reservasPorDia[key] = [];
        reservasPorDia[key].push(r);
    }

    // Calcula los días que van en la grilla del mes
    const primerDiaDelMes = new Date(anio, mes, 1);
    const ultimoDiaDelMes = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDiaDelMes.getDate();
    const inicioSemana = primerDiaDelMes.getDay(); // 0 = domingo

    // Avanzar un mes
    function siguienteMes() {
        if (mes === 11) { setMes(0); setAnio((a) => a + 1); }
        else setMes((m) => m + 1);
        setDiaSeleccionado(null);
    }

    // Retroceder un mes
    function mesPrevio() {
        if (mes === 0) { setMes(11); setAnio((a) => a - 1); }
        else setMes((m) => m - 1);
        setDiaSeleccionado(null);
    }

    // Construir la clave del día que se hace click
    function seleccionarDia(dia: number) {
        const key = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        setDiaSeleccionado((prev) => (prev === key ? null : key)); // toggle
    }

    // Reservas del día seleccionado
    const reservasDiaSeleccionado = diaSeleccionado ? (reservasPorDia[diaSeleccionado] ?? []) : [];

    // Clave de hoy para destacarlo en el calendario
    const keyHoy = toKey(hoy);

    return (
        <div>
            {/* Controles de navegación del mes */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={mesPrevio}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                >
                    Anterior
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {MESES[mes]} {anio}
                </h2>
                <button
                    onClick={siguienteMes}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                >
                    Siguiente
                </button>
            </div>

            {/* Cabecera de días de la semana */}
            <div className="grid grid-cols-7 mb-1">
                {DIAS_SEMANA.map((dia) => (
                    <div key={dia} className="text-center text-xs font-medium text-gray-400 py-1">
                        {dia}
                    </div>
                ))}
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-1">
                {/* Celdas vacías para alinear el primer día */}
                {Array.from({ length: inicioSemana }).map((_, i) => (
                    <div key={`vacio-${i}`} />
                ))}

                {/* Un botón por cada día del mes */}
                {Array.from({ length: diasEnMes }).map((_, i) => {
                    const dia = i + 1;
                    const key = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                    const tieneReservas = !!reservasPorDia[key];
                    const esHoy = key === keyHoy;
                    const estaSeleccionado = key === diaSeleccionado;

                    return (
                        <button
                            key={key}
                            onClick={() => seleccionarDia(dia)}
                            className={`
                                relative rounded-lg py-2 text-sm font-medium transition
                                ${estaSeleccionado ? "bg-blue-600 text-white" : esHoy ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-100 text-gray-700"}
                            `}
                        >
                            {dia}
                            {/* Punto indicador si hay reservas ese día */}
                            {tieneReservas && (
                                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${estaSeleccionado ? "bg-white" : "bg-blue-500"}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Días con reservas
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-blue-50 border border-blue-200 inline-block" />
                    Hoy
                </span>
            </div>

            {/* Panel con reservas del día seleccionado */}
            {diaSeleccionado && (
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Reservas del {new Date(diaSeleccionado + "T12:00:00").toLocaleDateString("es-CO", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })}
                    </h3>

                    {reservasDiaSeleccionado.length === 0 ? (
                        <p className="text-sm text-gray-400">Sin reservas para este día.</p>
                    ) : (
                        <div className="space-y-2">
                            {reservasDiaSeleccionado.map((r) => (
                                <div
                                    key={r.id}
                                    className="flex items-start justify-between border border-gray-200 rounded-lg p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {new Date(r.start_time).toLocaleTimeString("es-CO", {
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                            {" — "}
                                            {r.service.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {r.client_name ?? "Sin nombre"} · {r.client_email ?? "Sin email"}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[r.status] ?? ""}`}>
                                        {ESTADO_LABEL[r.status] ?? r.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

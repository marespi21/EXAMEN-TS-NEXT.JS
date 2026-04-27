// Server Component: corre en el servidor, puede leer la sesión y la BD directamente
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserReservations } from "@/lib/db/reservations";
import TablaReservas from "./TablaReservas";

export default async function DashboardPage() {
    // 1. Verificar que el usuario esté logueado
    const user = await getSessionUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Traer todas sus reservas directamente desde la BD
    const reservations = await getUserReservations(user.id);

    return (
        <main className="max-w-5xl mx-auto mt-8 px-4">
            {/* Encabezado */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mis reservas</h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/dashboard/calendario"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                        Ver calendario
                    </a>
                    <a
                        href="/reservas"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Nueva reserva
                    </a>
                </div>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Pendientes", estado: "PENDING", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
                    { label: "Confirmadas", estado: "CONFIRMED", color: "text-green-700 bg-green-50 border-green-200" },
                    { label: "Canceladas", estado: "CANCELLED", color: "text-red-700 bg-red-50 border-red-200" },
                ].map(({ label, estado, color }) => (
                    <div key={estado} className={`border rounded-xl p-4 text-center ${color}`}>
                        <p className="text-2xl font-bold">
                            {reservations.filter((r) => r.status === estado).length}
                        </p>
                        <p className="text-sm">{label}</p>
                    </div>
                ))}
            </div>

            {/* Tabla interactiva con filtros, cancelar, eliminar y exportar CSV */}
            <TablaReservas reservations={reservations} />
        </main>
    );
}

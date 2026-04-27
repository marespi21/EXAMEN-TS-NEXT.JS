// Server Component: lee sesión y reservas en el servidor
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserReservations } from "@/lib/db/reservations";
import CalendarioMensual from "./CalendarioMensual";

export default async function CalendarioPage() {
    // Si no hay sesión, redirigir al login
    const user = await getSessionUser();
    if (!user) {
        redirect("/login");
    }

    // Traer todas las reservas del usuario
    const reservations = await getUserReservations(user.id);

    return (
        <main className="max-w-2xl mx-auto mt-8 px-4">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Calendario de reservas</h1>
                <a
                    href="/dashboard"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Volver al dashboard
                </a>
            </div>

            {/* Calendario interactivo (Client Component) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <CalendarioMensual reservations={reservations} />
            </div>
        </main>
    );
}

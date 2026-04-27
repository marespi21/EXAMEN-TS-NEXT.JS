// Este es un Server Component: corre en el servidor y puede leer cookies
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import ReservaForm from "./ReservaForm";

export default async function ReservarPage() {
    // Si el usuario no está logueado, lo mandamos al login
    const user = await getSessionUser();
    if (!user) {
        redirect("/login");
    }

    return (
        <main className="max-w-lg mx-auto mt-10 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Hacer una reserva</h1>
                <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
                    Mis reservas
                </a>
            </div>

            {/* El formulario es Client Component porque usa useState y fetch */}
            <ReservaForm />
        </main>
    );
}

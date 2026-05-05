import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
    createReservation,
    getUserReservations,
    type ReservationFormData,
} from "@/services/reservations";

// GET /api/reservas
// Devuelve todas las reservas del usuario logueado
export async function GET() {
    // 1. Verificar que hay sesión activa
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json(
            { success: false, message: "No estás autenticado" },
            { status: 401 },
        );
    }

    // 2. Buscar las reservas de ese usuario
    const reservations = await getUserReservations(user.id);

    return NextResponse.json({ success: true, data: reservations });
}

// POST /api/reservas
// Crea una nueva reserva para el usuario logueado
export async function POST(req: NextRequest) {
    // 1. Verificar sesión
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json(
            { success: false, message: "No estás autenticado" },
            { status: 401 },
        );
    }

    try {
        // 2. Leer el formulario del body
        const body = await req.json();
        const form: ReservationFormData = body.form;

        if (!form) {
            return NextResponse.json(
                { success: false, message: "Faltan datos del formulario" },
                { status: 400 },
            );
        }

        // 3. Crear la reserva con el userId real de la sesión
        const confirmation = await createReservation(user.id, form);

        return NextResponse.json(
            { success: true, data: confirmation },
            { status: 201 },
        );
    } catch (error) {
        console.error("[CREATE RESERVATION ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Error al crear la reserva" },
            { status: 500 },
        );
    }
}

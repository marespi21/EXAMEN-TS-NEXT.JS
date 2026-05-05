import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
    getReservationById,
    updateReservationStatus,
    deleteReservation,
} from "@/services/reservations";

// Tipo del parámetro dinámico [id] en Next.js App Router
type RouteParams = { params: Promise<{ id: string }> };

// GET /api/reservas/[id]
// Devuelve el detalle de una reserva específica
export async function GET(_req: NextRequest, { params }: RouteParams) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json(
            { success: false, message: "No estás autenticado" },
            { status: 401 },
        );
    }

    const { id } = await params;
    const reservation = await getReservationById(id, user.id);

    if (!reservation) {
        return NextResponse.json(
            { success: false, message: "Reserva no encontrada" },
            { status: 404 },
        );
    }

    return NextResponse.json({ success: true, data: reservation });
}

// PATCH /api/reservas/[id]
// Cambia el estado de una reserva: PENDING, CONFIRMED o CANCELLED
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json(
            { success: false, message: "No estás autenticado" },
            { status: 401 },
        );
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const status: string = body.status;

        if (!status) {
            return NextResponse.json(
                { success: false, message: "Falta el campo 'status'" },
                { status: 400 },
            );
        }

        const updated = await updateReservationStatus(id, user.id, status);
        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error al actualizar";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}

// DELETE /api/reservas/[id]
// Elimina una reserva (solo si no está CONFIRMED)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json(
            { success: false, message: "No estás autenticado" },
            { status: 401 },
        );
    }

    try {
        const { id } = await params;
        await deleteReservation(id, user.id);
        return NextResponse.json({ success: true, message: "Reserva eliminada" });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error al eliminar";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}

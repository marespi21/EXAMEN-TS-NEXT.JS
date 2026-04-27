import { NextRequest, NextResponse } from "next/server";
import { getAvailableTables } from "@/lib/db/reservations";

// GET /api/reservas/servicios?restaurantId=...&date=...&time=...&partySize=...
// Devuelve los servicios disponibles para una fecha, hora y número de personas
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get("restaurantId");
        const date = searchParams.get("date");
        const time = searchParams.get("time");
        const partySize = Number(searchParams.get("partySize"));

        if (!restaurantId || !date || !time || !partySize) {
            return NextResponse.json(
                { success: false, message: "Faltan parámetros requeridos" },
                { status: 400 }
            );
        }

        const services = await getAvailableTables(restaurantId, date, time, partySize);

        return NextResponse.json({ success: true, data: services });
    } catch (error) {
        console.error("[GET SERVICIOS ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Error al buscar servicios disponibles" },
            { status: 500 }
        );
    }
}

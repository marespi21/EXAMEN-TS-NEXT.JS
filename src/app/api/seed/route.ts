import { NextResponse } from "next/server";
import { RESTAURANT_ID, seedRestaurantServices } from "@/services/seed";

// GET /api/seed
// Crea servicios de ejemplo para poder probar las reservas
// Solo disponible en modo desarrollo
export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { success: false, message: "No disponible en producción" },
            { status: 403 },
        );
    }

    const services = await seedRestaurantServices();

    return NextResponse.json({
        success: true,
        message: `${services.count} servicios creados correctamente`,
        restaurantId: RESTAURANT_ID,
    });
}

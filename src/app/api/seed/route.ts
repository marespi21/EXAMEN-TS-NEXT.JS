import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// El ID del restaurante que usamos en toda la app
export const RESTAURANT_ID = "aion-restaurant-1";

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

    // Borra los servicios anteriores del restaurante para no duplicar
    await prisma.service.deleteMany({
        where: { restaurant_id: RESTAURANT_ID },
    });

    // Crea servicios de ejemplo (mesas del restaurante)
    const services = await prisma.service.createMany({
        data: [
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 1 — Terraza",
                description: "Mesa en la terraza exterior, hasta 4 personas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 4,
            },
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 2 — Salón",
                description: "Mesa interior con vista al jardín, hasta 6 personas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 6,
            },
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 3 — Salón VIP",
                description: "Mesa privada para grupos, hasta 10 personas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 10,
            },
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 4 — Barra",
                description: "Asientos en la barra, ideal para parejas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 2,
            },
        ],
    });

    return NextResponse.json({
        success: true,
        message: `${services.count} servicios creados correctamente`,
        restaurantId: RESTAURANT_ID,
    });
}

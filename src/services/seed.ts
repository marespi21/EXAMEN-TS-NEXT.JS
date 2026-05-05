import { prisma } from "@/lib/db/prisma";

export const RESTAURANT_ID = "aion-restaurant-1";

export async function seedRestaurantServices() {
    await prisma.service.deleteMany({
        where: { restaurant_id: RESTAURANT_ID },
    });

    return prisma.service.createMany({
        data: [
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 1 - Terraza",
                description: "Mesa en la terraza exterior, hasta 4 personas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 4,
            },
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 2 - Salon",
                description: "Mesa interior con vista al jardin, hasta 6 personas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 6,
            },
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 3 - Salon VIP",
                description: "Mesa privada para grupos, hasta 10 personas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 10,
            },
            {
                restaurant_id: RESTAURANT_ID,
                name: "Mesa 4 - Barra",
                description: "Asientos en la barra, ideal para parejas",
                price: 0,
                duration: 60,
                is_available: true,
                max_concurrent: 2,
            },
        ],
    });
}

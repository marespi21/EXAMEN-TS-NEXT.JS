import { prisma } from "@/lib/db/prisma";

export type AvailableService = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    max_concurrent: number;
};

export interface ReservationFormData {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    partySize: number;
    serviceId: string;
}

export interface ReservationConfirmation {
    id: string;
    serviceName: string;
    date: string;
    time: string;
    partySize: number;
}

export interface FormErrors {
    name?: string;
    email?: string;
    date?: string;
    time?: string;
    partySize?: string;
    serviceId?: string;
}

export type ReservationWithService = {
    id: string;
    reservation_date: Date;
    start_time: Date;
    end_time: Date;
    status: string;
    client_name: string | null;
    client_email: string | null;
    client_phone: string | null;
    notes: string | null;
    created_at: Date;
    service: {
        id: string;
        name: string;
        price: number;
        duration: number;
    };
};

export async function getAvailableTables(
    restaurantId: string,
    date: string,
    time: string,
    partySize: number,
): Promise<AvailableService[]> {
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const busyReservations = await prisma.reservation.findMany({
        where: {
            service: { restaurant_id: restaurantId },
            reservation_date: new Date(date),
            start_time: { gte: startTime, lt: endTime },
            status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { service_id: true },
    });

    const busyServiceIds = busyReservations.map((r) => r.service_id);

    const available = await prisma.service.findMany({
        where: {
            restaurant_id: restaurantId,
            is_available: true,
            max_concurrent: { gte: partySize },
            id: { notIn: busyServiceIds },
        },
    });

    return available.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        max_concurrent: s.max_concurrent,
    }));
}

export async function createReservation(
    userId: string,
    form: ReservationFormData,
): Promise<ReservationConfirmation> {
    const startTime = new Date(`${form.date}T${form.time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const reservation = await prisma.reservation.create({
        data: {
            user_id: userId,
            service_id: form.serviceId,
            reservation_date: new Date(form.date),
            start_time: startTime,
            end_time: endTime,
            client_name: form.name,
            client_email: form.email,
            client_phone: form.phone,
        },
        include: { service: true },
    });

    return {
        id: reservation.id,
        serviceName: reservation.service.name,
        date: form.date,
        time: form.time,
        partySize: form.partySize,
    };
}

export async function getUserReservations(
    userId: string,
): Promise<ReservationWithService[]> {
    return prisma.reservation.findMany({
        where: { user_id: userId },
        include: {
            service: {
                select: { id: true, name: true, price: true, duration: true },
            },
        },
        orderBy: { reservation_date: "desc" },
    });
}

export async function getReservationById(
    id: string,
    userId: string,
): Promise<ReservationWithService | null> {
    return prisma.reservation.findFirst({
        where: { id, user_id: userId },
        include: {
            service: {
                select: { id: true, name: true, price: true, duration: true },
            },
        },
    });
}

export async function updateReservationStatus(
    id: string,
    userId: string,
    status: string,
): Promise<ReservationWithService> {
    const allowed = ["PENDING", "CONFIRMED", "CANCELLED"];
    if (!allowed.includes(status)) {
        throw new Error("Estado no valido. Usa: PENDING, CONFIRMED o CANCELLED");
    }

    const reservation = await prisma.reservation.findFirst({
        where: { id, user_id: userId },
        select: { id: true },
    });

    if (!reservation) {
        throw new Error("Reserva no encontrada");
    }

    return prisma.reservation.update({
        where: { id: reservation.id },
        data: { status },
        include: {
            service: {
                select: { id: true, name: true, price: true, duration: true },
            },
        },
    });
}

export async function deleteReservation(id: string, userId: string): Promise<void> {
    const reservation = await prisma.reservation.findFirst({
        where: { id, user_id: userId },
    });

    if (!reservation) {
        throw new Error("Reserva no encontrada");
    }

    if (reservation.status === "CONFIRMED") {
        throw new Error("No puedes eliminar una reserva confirmada. Primero cancelala.");
    }

    await prisma.reservation.delete({ where: { id } });
}

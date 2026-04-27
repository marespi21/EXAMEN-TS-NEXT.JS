// src/types/database.ts
// =====================================================
// TYPES OPTIMIZADOS PARA MÓDULO DE RESERVAS
// Basado en tu schema.prisma actual
// =====================================================

// TIPOS BÁSICOS


export type UserRole = "customer" | "staff" | "admin";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";


//MODELOS DE DATOS (ENTIDADES)


// USER
export interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
}

// SERVICE (antes era MenuItem, ahora es genérico)
export interface Service {
    id: string;
    restaurant_id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number; // minutos
    is_available: boolean;
    max_concurrent: number; // cuántas reservas simultáneas
    created_at: string;
    updated_at: string;
}

// RESERVATION (PRINCIPAL)
export interface Reservation {
    id: string;
    user_id: string;
    service_id: string;
    reservation_date: string; // Date en ISO format
    start_time: string; // DateTime en ISO format
    end_time: string; // DateTime en ISO format
    status: ReservationStatus;
    client_name: string | null;
    client_email: string | null;
    client_phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

//  RESTAURANT (mínimo, solo referencia)
export interface Restaurant {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

//TIPOS DE ENTRADA (INSERT/CREATE)


export type CreateReservationInput = Omit<
    Reservation,
    "id" | "created_at" | "updated_at"
>;

export type UpdateReservationInput = Partial<
    Omit<Reservation, "id" | "created_at" | "updated_at" | "user_id" | "service_id">
>;

export type CreateServiceInput = Omit<
    Service,
    "id" | "created_at" | "updated_at"
>;

/**
 * TIPOS DE RESPUESTA (QUERIES + RELACIONES)
 */

// Reserva con datos del servicio
export interface ReservationWithService extends Reservation {
    service: Service;
}

// Reserva con usuario
export interface ReservationWithUser extends Reservation {
    user: User;
}

// Reserva completa (con servicio y usuario)
export interface ReservationWithRelations extends Reservation {
    service: Service;
    user: User;
}

/**
 * TIPOS DE DISPONIBILIDAD
 */

export interface AvailabilityResult {
    available: boolean;
    reason: string;
}

/**
 * TIPOS DE RESPUESTA (API / SERVER ACTIONS)
 */

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * DATABASE TYPE (Para Supabase / RLS - si lo necesitas)
 */

export type Database = {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
            };
            services: {
                Row: Service;
                Insert: Omit<Service, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Service, "id" | "created_at" | "updated_at">>;
            };
            reservations: {
                Row: Reservation;
                Insert: Omit<Reservation, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Reservation, "id" | "created_at" | "updated_at">>;
            };
            restaurants: {
                Row: Restaurant;
                Insert: Omit<Restaurant, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Restaurant, "id" | "created_at" | "updated_at">>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
};

/**
 * TIPOS UTILITARIOS (Para tu CRUD específico)
 */

// Parámetros para búsqueda
export interface ReservationFilters {
    serviceId?: string;
    userId?: string;
    status?: ReservationStatus;
    startDate?: string;
    endDate?: string;
    clientName?: string;
    clientEmail?: string;
}

// Parámetros para ordenamiento
export type ReservationSortField =
    | "startTime"
    | "clientName"
    | "status"
    | "created_at";

export type SortOrder = "asc" | "desc";

export interface SortParams {
    field: ReservationSortField;
    order: SortOrder;
}

// TIPOS PARA FORMULARIOS


export interface ReservationFormData {
    serviceId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    reservationDate: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    duration: number; // minutos
    notes?: string;
}

// TIPOS PARA CALENDARIO


export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: ReservationStatus;
    clientName?: string;
    clientEmail?: string;
}

export interface CalendarRange {
    startDate: Date;
    endDate: Date;
    serviceId?: string;
}

//TIPOS PARA EXPORTACIÓN PDF

export interface ReservationForPDF {
    id: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceName: string;
    servicePrice: number;
    startTime: Date;
    endTime: Date;
    status: ReservationStatus;
    notes?: string;
    createdAt: Date;
}


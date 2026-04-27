import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken, UserRole } from "@/lib/jwt";
import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
    clearAuthCookies,
    getRefreshToken,
} from "@/lib/cookies";

type ApiResponse = {
    success: boolean;
    message: string;
    data?: unknown;
};

export async function POST() {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Refresh token no encontrado",
                } as ApiResponse,
                { status: 401 }
            );
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!storedToken) {
            await clearAuthCookies();
            return NextResponse.json(
                {
                    success: false,
                    message: "Refresh token inválido o revocado",
                } as ApiResponse,
                { status: 401 }
            );
        }

        const now = new Date();
        if (now > storedToken.expiresAt) {
            await prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });
            await clearAuthCookies();
            return NextResponse.json(
                {
                    success: false,
                    message: "Sesión expirada. Inicia sesión nuevamente.",
                } as ApiResponse,
                { status: 401 }
            );
        }

        await verifyRefreshToken(refreshToken);

        const newAccessToken = await signAccessToken({
            id: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role as UserRole,
        });

        const newRefreshToken = await signRefreshToken({
            id: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role as UserRole,
        });

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        await prisma.$transaction([
            prisma.refreshToken.delete({
                where: { id: storedToken.id },
            }),
            prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: storedToken.user.id,
                    expiresAt: expirationDate,
                },
            }),
        ]);

        await setAccessTokenCookie(newAccessToken);
        await setRefreshTokenCookie(newRefreshToken);

        return NextResponse.json(
            {
                success: true,
                message: "Tokens renovados correctamente",
            } as ApiResponse,
            { status: 200 }
        );
    } catch (error) {
        // La librería jose usa nombres como "JWTExpired", "JWSInvalid", etc.
        const isJwtError = error instanceof Error && error.name.startsWith("JWT");
        if (isJwtError) {
            await clearAuthCookies();
            return NextResponse.json(
                {
                    success: false,
                    message: "Refresh token inválido",
                } as ApiResponse,
                { status: 401 }
            );
        }

        console.error("[REFRESH ERROR]", error);

        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            } as ApiResponse,
            { status: 500 }
        );
    }
}


/* Necesito inicio de sesion,register con JWT, Cookies, Hasheo y deshasheo, Crud de reservas: (fecha, cliente, servicio/producto, estado). - 
**Reto extra:**   - **Calendario interactivo:**     - Vista mensual/semanal con reservas.     
- Validación de disponibilidad (no permitir doble reserva en mismo horario). - **Bonus:**   - Exportar reservas a PDF o CSV. */
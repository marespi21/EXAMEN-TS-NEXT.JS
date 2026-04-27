// ============================================================
// src/app/api/auth/refresh/route.ts
// ============================================================
// Renueva el access token usando el refresh token.
//
// Flujo del cliente cuando el access token expira:
// 1. Request a ruta protegida → 401 TOKEN_EXPIRED
// 2. Cliente llama a POST /api/auth/refresh automáticamente
// 3. Si el refresh token es válido → nuevo access token en cookie
// 4. Cliente reintenta la request original
// ============================================================

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
    clearAuthCookies,
    getRefreshToken,
} from "@/lib/cookies";
import type { ApiResponse } from "@/types";

export async function POST() {
    try {
        const prisma = getPrisma();
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token no encontrado" } as ApiResponse,
                { status: 401 }
            );
        }

        // Buscar en DB (si no está → fue revocado o es falso)
        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: { select: { id: true, email: true, role: true } } },
        });

        if (!stored) {
            await clearAuthCookies();
            return NextResponse.json(
                { success: false, message: "Refresh token inválido o revocado" } as ApiResponse,
                { status: 401 }
            );
        }

        // Verificar expiración en DB
        if (new Date() > stored.expiresAt) {
            await prisma.refreshToken.delete({ where: { id: stored.id } });
            await clearAuthCookies();
            return NextResponse.json(
                { success: false, message: "Sesión expirada. Inicia sesión nuevamente." } as ApiResponse,
                { status: 401 }
            );
        }

        // Verificar firma JWT
        verifyRefreshToken(refreshToken);

        // Emitir nuevo access token y nuevo refresh token (rotación)
        const newAccessToken = generateAccessToken({
            userId: stored.user.id,
            email: stored.user.email,
            role: stored.user.role,
        });
        const newRefreshToken = generateRefreshToken({
            userId: stored.user.id,
            email: stored.user.email,
            role: stored.user.role,
        });

        await prisma.$transaction([
            prisma.refreshToken.delete({ where: { id: stored.id } }),
            prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: stored.user.id,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                },
            }),
        ]);

        await setAccessTokenCookie(newAccessToken);
        await setRefreshTokenCookie(newRefreshToken);

        return NextResponse.json(
            { success: true, message: "Tokens renovados correctamente" } as ApiResponse,
            { status: 200 }
        );
    } catch (error: unknown) {
        const e = error as { name?: string };
        if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
            await clearAuthCookies();
            return NextResponse.json(
                { success: false, message: "Refresh token inválido" } as ApiResponse,
                { status: 401 }
            );
        }
        console.error("[REFRESH]", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" } as ApiResponse,
            { status: 500 }
        );
    }
}
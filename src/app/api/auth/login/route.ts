import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const { email, password } = await req.json();
        const fieldErrors: Array<{ field: string; message: string }> = [];

        if (!email || !email.includes("@")) {
            fieldErrors.push({ field: "email", message: "Email inválido" });
        }

        if (!password || password.length < 6) {
            fieldErrors.push({ field: "password", message: "Contraseña inválida" });
        }

        if (fieldErrors.length > 0) {
            return NextResponse.json(
                { success: false, message: "Error de validación", errors: fieldErrors } as ApiResponse,
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Usuario no existe" } as ApiResponse,
                { status: 404 }
            );
        }

        if (user.status !== "ACTIVE") {
            return NextResponse.json(
                { success: false, message: "Tu cuenta no está activa" } as ApiResponse,
                { status: 403 }
            );
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return NextResponse.json(
                { success: false, message: "Contraseña incorrecta" } as ApiResponse,
                { status: 401 }
            );
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Guardar refresh token en DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 días
            },
        });

        await setAccessTokenCookie(accessToken);
        await setRefreshTokenCookie(refreshToken);
        await createAuditLog({
            action: "LOGIN",
            entity: "auth",
            userId: user.id,
            entityId: user.id,
            newValues: { email: user.email, role: user.role },
        });

        // Excluir password de la respuesta
        const { password: removedPassword, ...userWithoutPassword } = user;
        void removedPassword;

        return NextResponse.json(
            {
                success: true,
                message: "Login exitoso",
                data: { user: userWithoutPassword },
            } as ApiResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error("[LOGIN]", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" } as ApiResponse,
            { status: 500 }
        );
    }
}
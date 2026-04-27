import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const prisma = getPrisma();
        const { email, username, password, confirmPassword } = await req.json();

        // Validaciones básicas
        const fieldErrors: Array<{ field: string; message: string }> = [];

        if (!email || !email.includes("@")) {
            fieldErrors.push({ field: "email", message: "Email inválido" });
        }

        if (!username || username.trim().length < 2) {
            fieldErrors.push({ field: "username", message: "Username debe tener al menos 2 caracteres" });
        }

        if (!password || password.length < 6) {
            fieldErrors.push({ field: "password", message: "Contraseña debe tener al menos 6 caracteres" });
        }

        if (password !== confirmPassword) {
            fieldErrors.push({ field: "confirmPassword", message: "Las contraseñas no coinciden" });
        }

        if (fieldErrors.length > 0) {
            return NextResponse.json(
                { success: false, message: "Error de validación", errors: fieldErrors } as ApiResponse,
                { status: 400 }
            );
        }

        const exist = await prisma.user.findUnique({
            where: { email },
        });

        if (exist) {
            return NextResponse.json(
                { success: false, message: "Usuario ya existe" } as ApiResponse,
                { status: 400 }
            );
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name: username,
                password: hash,
            },
        });

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
        });

        await setAccessTokenCookie(accessToken);
        await setRefreshTokenCookie(refreshToken);

        // Excluir password de la respuesta
        const { password: removedPassword, ...userWithoutPassword } = user;
        void removedPassword;

        return NextResponse.json(
            {
                success: true,
                message: "Usuario creado",
                data: { user: userWithoutPassword },
            } as ApiResponse,
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER]", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" } as ApiResponse,
            { status: 500 }
        );
    }
}
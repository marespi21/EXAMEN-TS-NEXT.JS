import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signAccessToken, signRefreshToken, UserRole } from "@/lib/jwt";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";

type ApiResponse = {
    success: boolean;
    message: string;
    data?: unknown;
    errors?: Array<{ field: string; message: string }>;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = body.email as string;
        const username = body.username as string;
        const password = body.password as string;
        const confirmPassword = body.confirmPassword as string;

        const errors: Array<{ field: string; message: string }> = [];

        if (!email || !email.includes("@")) {
            errors.push({ field: "email", message: "Email inválido" });
        }

        if (!username || username.trim().length < 2) {
            errors.push({
                field: "username",
                message: "Username debe tener al menos 2 caracteres",
            });
        }

        if (!password || password.length < 6) {
            errors.push({
                field: "password",
                message: "Contraseña debe tener al menos 6 caracteres",
            });
        }

        if (password !== confirmPassword) {
            errors.push({
                field: "confirmPassword",
                message: "Las contraseñas no coinciden",
            });
        }

        if (errors.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error de validación",
                    errors: errors,
                } as ApiResponse,
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "El email ya está registrado",
                } as ApiResponse,
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10); // hgjfjhbgky#!@$@#$

        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: username,
                password: hashedPassword,
            },
        });

        const tokenPayload = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role as UserRole,
        };

        const accessToken = await signAccessToken(tokenPayload);  // my_token 
        const refreshToken = await signRefreshToken(tokenPayload); // my_refresh_token

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: newUser.id,
                expiresAt: expirationDate,
            },
        });

        await setAccessTokenCookie(accessToken);
        await setRefreshTokenCookie(refreshToken);

        const userResponse = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            status: newUser.status,
        };

        return NextResponse.json(
            {
                success: true,
                message: "Usuario creado correctamente",
                data: { user: userResponse },
            } as ApiResponse,
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER ERROR]", error);

        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            } as ApiResponse,
            { status: 500 }
        );
    }
}

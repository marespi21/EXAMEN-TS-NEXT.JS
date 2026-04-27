import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signAccessToken, signRefreshToken, type UserRole } from "@/lib/jwt";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies"

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
        const password = body.password as string;

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email inválido",
                    errors: [{ field: "email", message: "Email inválido" }],
                } as ApiResponse,
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Contraseña inválida",
                    errors: [{ field: "password", message: "Contraseña inválida" }],
                } as ApiResponse,
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Usuario no existe",
                } as ApiResponse,
                { status: 404 }
            );
        }

        if (user.status !== "ACTIVE") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tu cuenta no está activa",
                } as ApiResponse,
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Contraseña incorrecta",
                } as ApiResponse,
                { status: 401 }
            );
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
        };

        const accessToken = await signAccessToken(tokenPayload);
        const refreshToken = await signRefreshToken(tokenPayload);

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: expirationDate,
            },
        });

        await setAccessTokenCookie(accessToken);
        await setRefreshTokenCookie(refreshToken);

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
        };

        return NextResponse.json(
            {
                success: true,
                message: "Login exitoso",
                data: { user: userResponse },
            } as ApiResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error("[LOGIN ERROR]", error);

        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            } as ApiResponse,
            { status: 500 }
        );
    }
}
import { cookies } from "next/headers";
import { verifyAccessToken, ACCESS_COOKIE_NAME, type AuthJwtPayload } from "./jwt";

// Devuelve los datos del usuario logueado (id, email, role)
// Si no hay sesión o el token expiró, devuelve null
export async function getSessionUser(): Promise<AuthJwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        return await verifyAccessToken(token);
    } catch {
        // Token inválido o expirado
        return null;
    }
}

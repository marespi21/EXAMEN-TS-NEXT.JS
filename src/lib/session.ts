import { cookies } from "next/headers";
import { verifyAccessToken, ACCESS_COOKIE_NAME, type AuthJwtPayload } from "./jwt";

// Devuelve los datos del usuario logueado (id, email, role)
// Si no hay sesión o el token expiró, devuelve null
export async function getSessionUser(): Promise<AuthJwtPayload | null> {
    const cookieStore = await cookies();
    console.log('INSIDE GET SESSION USER', cookieStore);
    console.log('COOKIESTORE.GET(ACCESS_COOKIE_NAME)', cookieStore.get(ACCESS_COOKIE_NAME));
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    console.log('INSIDE GET SESSION USER', token);
    if (!token) return null;

    try {
        return await verifyAccessToken(token);
    } catch {
        // Token inválido o expirado
        return null;
    }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Error al iniciar sesión");
                return;
            }

            // Redirigir después del login
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            setError("Error del servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f8e1dc] p-4 md:p-8">
            <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl md:min-h-[calc(100vh-4rem)] md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                    <Image
                        src="/images/clockhub-auth.png"
                        alt="ClockHub ilustración"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="flex items-center justify-center bg-[#f7f7f8] p-8 md:p-12">
                    <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/70 p-7 text-black shadow-[0_20px_60px_-25px_rgba(244,114,182,0.45)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                        <h1 className="mb-8 text-center text-4xl font-extrabold text-black">Login</h1>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-lg font-semibold text-black">Email</label>
                                <input
                                    type="email"
                                    placeholder="tuemail@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border border-[#e8cfa4] bg-white px-4 py-3 text-black placeholder:text-black/50 outline-none transition-all duration-200 focus:border-[#f38f94] focus:ring-2 focus:ring-[#f7b7bc]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-lg font-semibold text-black">Password</label>
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-black placeholder:text-black/50 outline-none transition-all duration-200 focus:border-[#f38f94] focus:ring-2 focus:ring-[#f7b7bc]"
                                    required
                                />
                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-[#d79d40] underline decoration-2 underline-offset-2 transition hover:text-[#bf7a2a]"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full rounded-2xl bg-[#f57f87] py-3 text-xl font-semibold text-white shadow-[0_12px_30px_-10px_rgba(245,127,135,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef6f78] disabled:opacity-50"
                            >
                                {loading ? "Cargando..." : "Log In"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-black/80">
                            ¿No tienes cuenta?{" "}
                            <Link href="/register" className="font-semibold text-black underline">
                                Registrarse
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
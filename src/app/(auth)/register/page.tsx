"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FieldErrors {
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
}

// ─── Indicador de fuerza de contraseña ──────────────────────
function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;

    const checks = [
        { label: "8+ caracteres", ok: password.length >= 8 },
        { label: "Mayúscula", ok: /[A-Z]/.test(password) },
        { label: "Minúscula", ok: /[a-z]/.test(password) },
        { label: "Número", ok: /\d/.test(password) },
    ];

    const score = checks.filter(c => c.ok).length;
    const colors = ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#22c55e"];

    return (
        <div style={{ marginTop: "0.5rem" }}>
            {/* Barra de fuerza */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "0.5rem" }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        height: "3px", flex: 1, borderRadius: "2px",
                        background: i < score ? colors[score] : "var(--border)",
                        transition: "background 0.3s",
                    }} />
                ))}
            </div>
            {/* Checks */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {checks.map(c => (
                    <span key={c.label} style={{
                        fontSize: "0.72rem", fontFamily: "var(--font-mono)",
                        color: c.ok ? "#16a34a" : "#94a3b8",
                        display: "flex", alignItems: "center", gap: "3px",
                    }}>
                        {c.ok ? "✓" : "○"} {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "", username: "", password: "", confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError("");
        setFieldErrors({});
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!data.success) {
                if (data.errors?.length) {
                    const fe: FieldErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        fe[err.field as keyof FieldErrors] = err.message;
                    });
                    setFieldErrors(fe);
                } else {
                    setApiError(data.message);
                }
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch {
            setApiError("Error de conexión. Intenta nuevamente.");
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
                        <h1 className="mb-8 text-center text-4xl font-extrabold text-black">Registrarse</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {apiError && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{apiError}</p>}

                            <div>
                                <label htmlFor="email" className="mb-2 block text-lg font-semibold text-black">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={set("email")}
                                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-black placeholder:text-black/50 outline-none transition-all duration-200 focus:border-[#f38f94] focus:ring-2 focus:ring-[#f7b7bc] ${fieldErrors.email ? "border-red-400" : "border-[#e8cfa4]"}`}
                                    placeholder="usuario@ejemplo.com"
                                    autoComplete="email"
                                    disabled={loading}
                                />
                                {fieldErrors.email && <span className="mt-1 block text-sm text-red-600">{fieldErrors.email}</span>}
                            </div>

                            <div>
                                <label htmlFor="username" className="mb-2 block text-lg font-semibold text-black">Nombre</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={form.username}
                                    onChange={set("username")}
                                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-black placeholder:text-black/50 outline-none transition-all duration-200 focus:border-[#f38f94] focus:ring-2 focus:ring-[#f7b7bc] ${fieldErrors.username ? "border-red-400" : "border-slate-300"}`}
                                    placeholder="Tu nombre"
                                    autoComplete="username"
                                    disabled={loading}
                                />
                                {fieldErrors.username && <span className="mt-1 block text-sm text-red-600">{fieldErrors.username}</span>}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-lg font-semibold text-black">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    onChange={set("password")}
                                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-black placeholder:text-black/50 outline-none transition-all duration-200 focus:border-[#f38f94] focus:ring-2 focus:ring-[#f7b7bc] ${fieldErrors.password ? "border-red-400" : "border-slate-300"}`}
                                    placeholder="********"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <PasswordStrength password={form.password} />
                                {fieldErrors.password && <span className="mt-1 block text-sm text-red-600">{fieldErrors.password}</span>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-lg font-semibold text-black">Confirmar password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={set("confirmPassword")}
                                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-black placeholder:text-black/50 outline-none transition-all duration-200 focus:border-[#f38f94] focus:ring-2 focus:ring-[#f7b7bc] ${fieldErrors.confirmPassword ? "border-red-400" : "border-slate-300"}`}
                                    placeholder="********"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                {fieldErrors.confirmPassword && <span className="mt-1 block text-sm text-red-600">{fieldErrors.confirmPassword}</span>}
                            </div>

                            <button
                                type="submit"
                                className="mt-2 w-full rounded-2xl bg-[#f57f87] py-3 text-xl font-semibold text-white shadow-[0_12px_30px_-10px_rgba(245,127,135,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ef6f78] disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Cargando..." : "Registrarse"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-black/80">
                            ¿Ya tienes cuenta?{" "}
                            <Link href="/login" className="font-semibold text-black underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
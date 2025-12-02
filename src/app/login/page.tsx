"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";
import Link from "next/link";
import IconButton from "@/components/ui/IconButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ email, password });
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Sign in to access the dashboard</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <IconButton type="submit" disabled={loading} fullWidth variant="primary" icon={<LogIn className="w-4 h-4" />} className="py-3">
              {loading ? "Signing in..." : "Sign In"}
            </IconButton>
          </form>

          <div className=" text-center flex justify-between px-1 mt-10">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition">
              ← Back to Home
            </Link>
            <Link href="/register" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

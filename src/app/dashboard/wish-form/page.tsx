"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function WishFormPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, loading: loadingUser } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user && !loadingUser) {
        throw new Error("User not authenticated");
      }
      await api.wishes.create({ name, title, description, priority });
      setSubmitted(true);
      setName("");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to submit wish:", error);
    } finally {
      setLoading(false);
      router.push("/dashboard/wishes");
    }
  };

  return (
    // <div className="w-full max-w-5xl ">
    <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl min-h-[300px]">
      {/* Left side - decorative card cover */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 flex items-center justify-center border-r border-slate-200 relative">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="text-center relative z-10">
          <div className="text-6xl mb-4">✦</div>
          <h1 className="text-2xl text-slate-700 font-light">My Wish</h1>
        </div>
      </div>

      {/* Right side - form content */}
      <div className="p-12 flex flex-col justify-center">
        {submitted ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl text-slate-900 mb-2 font-light">Thank you!</h2>
            <p className="text-slate-600">Your wish has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm text-slate-600 mb-2">
                Your name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                placeholder="..."
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm text-slate-600 mb-2">
                I wish for
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                placeholder="..."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm text-slate-600 mb-2">
                Details
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full p-0 h-20 border-0 border-b border-slate-200 bg-transparent outline-none resize-none text-slate-900"
                placeholder="Write your wish..."
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-3">Priority</label>
              <div className="flex gap-4">
                {(["low", "medium", "high"] as const).map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} className="w-4 h-4" />
                    <span className="text-slate-700 capitalize text-sm">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading || loadingUser} fullWidth variant="primary" className="py-3">
                {loading ? "Sending..." : "Submit Wish"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
    // </div>
  );
}

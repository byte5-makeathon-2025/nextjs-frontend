"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const wish = searchParams.get("wish");
  const [allowed, setAllowed] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wish) {
      checkIfAllowed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wish]);

  const checkIfAllowed = async () => {
    try {
      console.log("Fetching wishes...");
      const isAllowed = await api.wishes.checkIfAllowed(String(wish));

      setAllowed(isAllowed);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to load wishes:", error);
      console.error("Error details:", error.message, error.status);
      setAllowed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
    }
  };

  return (
    <div
      className={`min-h-screen  flex items-center justify-center p-4 relative ${
        allowed ? "bg-slate-100" : "bg-red-300"
      }`}
    >
      <Link
        href="/login"
        className="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
      >
        staff
      </Link>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl min-h-[600px]">
          {/* Left side - decorative card cover */}
          <div
            className={`bg-gradient-to-br  p-12 flex items-center justify-center border-r border-slate-200 relative ${
              allowed ? "from-slate-50 to-slate-100" : "from-red-200 to-red-300"
            }`}
          >
            <div className="absolute inset-0 bg-white/40"></div>
            <div className="text-center relative z-10">
              <div className="text-6xl mb-4">✦</div>

              {!allowed ? (
                <>
                  <h1 className="text-2xl text-slate-700 font-light">
                    Ssory Kid, <br /> your Parent must to pay for your wish!
                  </h1>
                  <p className="my-4 text-slate-700 font-light">
                    Please share this Link with Mom or Dad!!!
                  </p>

                  <Link
                    href="/parent"
                    className="text-slate-700 mt-8 underline"
                  >
                    ← Registration
                  </Link>
                </>
              ) : (
                <h1 className="text-2xl text-slate-700 font-light">My Wish</h1>
              )}
            </div>
          </div>

          {/* Right side - form content */}
          <div className="p-12 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl text-slate-900 mb-2 font-light">
                  Thank you!
                </h2>
                <p className="text-slate-600">Your wish has been received.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className={`block text-sm  mb-2 ${
                      allowed ? "text-slate-600" : "text-slate-200"
                    }`}
                  >
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    disabled={!allowed}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg ${
                      allowed ? "" : "text-gray-50 cursor-not-allowed"
                    }`}
                    placeholder="..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="title"
                    className={`block text-sm  mb-2 ${
                      allowed ? "text-slate-600" : "text-slate-200"
                    }`}
                  >
                    I wish for
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    disabled={!allowed}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                    placeholder="..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className={`block text-sm  mb-2 ${
                      allowed ? "text-slate-600" : "text-slate-200"
                    }`}
                  >
                    Details
                  </label>
                  <textarea
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    disabled={!allowed}
                    className={`w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent outline-none resize-none  ${
                      allowed
                        ? "text-slate-900"
                        : "text-gray-50 cursor-not-allowed"
                    }`}
                    placeholder="Write your wish..."
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm  mb-2 ${
                      allowed ? "text-slate-600" : "text-slate-200"
                    }`}
                  >
                    Priority
                  </label>
                  <div className="flex gap-4">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <label
                        key={p}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          disabled={!allowed}
                          checked={priority === p}
                          onChange={() => setPriority(p)}
                          className="w-4 h-4"
                        />
                        <span
                          className={`text-slate-700 capitalize text-sm ${
                            allowed ? "" : "text-gray-50"
                          }`}
                        >
                          {p}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !allowed}
                    fullWidth
                    variant="primary"
                    className="py-3"
                  >
                    {loading ? "Sending..." : "Submit Wish"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

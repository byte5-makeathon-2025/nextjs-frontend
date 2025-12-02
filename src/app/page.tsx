"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import AddressField from "@/components/AddressStep";

export default function Home() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitFinal = async (addressData: any) => {
    setLoading(true);
    try {
      await api.wishes.create({
        name,
        title,
        description,
        priority,
        address: addressData,
      });

      setSubmitted(true);

      // Reset all fields
      setName("");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStep(1);

      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error("Failed to submit wish:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      <Link
        href="/login"
        className="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
      >
        staff
      </Link>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl min-h-[600px]">
          {/* Left side */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 flex items-center justify-center border-r border-slate-200 relative">
            <div className="absolute inset-0 bg-white/40"></div>
            <div className="text-center relative z-10">
              <div className="text-6xl mb-4">✦</div>
              <h1 className="text-2xl text-slate-700 font-light">My Wish</h1>
            </div>
          </div>

          {/* Right side */}
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
              <>
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Step 1 Form */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm text-slate-600 mb-2"
                      >
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
                      <label
                        htmlFor="title"
                        className="block text-sm text-slate-600 mb-2"
                      >
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
                      <label
                        htmlFor="description"
                        className="block text-sm text-slate-600 mb-2"
                      >
                        Details
                      </label>
                      <textarea
                        id="description"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent outline-none resize-none text-slate-900"
                        placeholder="Write your wish..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-3">
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
                              checked={priority === p}
                              onChange={() => setPriority(p)}
                              className="w-4 h-4"
                            />
                            <span className="text-slate-700 capitalize text-sm">
                              {p}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="button"
                      fullWidth
                      variant="primary"
                      className="py-3"
                      onClick={() => setStep(2)}
                    >
                      Next ➜
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <AddressField
                    onSubmit={handleSubmitFinal}
                    onBack={() => setStep(1)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

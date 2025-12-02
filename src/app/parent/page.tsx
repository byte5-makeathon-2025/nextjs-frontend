"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateParentPage() {
  const [name, setName] = useState("");
  const [amountOfChildren, setAmountOfChildren] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name,
        amount_of_children: Number(amountOfChildren),
        bank_name: bankName,
        iban,
        bic,
      };

      console.log("Parent payload:", payload);
      const parentResponse = await api.parents.create(payload);
      // demo success
      setSuccess("Parent information saved (demo only).");

      // optional: clear fields
      setName("");
      setAmountOfChildren("");
      setBankName("");
      setIban("");
      setBic("");
    } catch (err) {
      setError("Could not save parent information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareLink = "http://localhost:3000/wish?id=123";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {success ? "Parent Created" : "Create Parent"}
          </h1>
          <p className="text-slate-600">
            {success ? "Share this link with your children" : "Enter parent and bank details"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          {/* When success: show only success card */}
          {success ? (
            <div className="space-y-5">
              <div className="h-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm space-y-2">
                <p>{success}</p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-emerald-900 text-xs sm:text-sm">
                    Link for children:{" "}
                    <span className="font-mono">{shareLink}</span>
                  </span>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareLink);
                        alert("Link copied to clipboard!");
                      } catch (err) {
                        alert(
                          "Could not copy the link. Please copy it manually."
                        );
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs sm:text-sm font-medium hover:bg-emerald-700 transition"
                  >
                    Copy link
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
              >
                Create another parent
              </button>
            </div>
          ) : (
            // When no success: show form as before
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-slate-900 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                  placeholder="Parent name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Amount of children
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={amountOfChildren}
                  onChange={(e) => setAmountOfChildren(e.target.value)}
                  className="text-slate-900 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                  placeholder="e.g. 2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Bank name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="text-slate-900 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                  placeholder="e.g. Deutsche Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  required
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="text-slate-900 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                  placeholder="DE00 0000 0000 0000 0000 00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  BIC
                </label>
                <input
                  type="text"
                  required
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  className="text-slate-900 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                  placeholder="e.g. DEUTDEFFXXX"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-60 transition"
              >
                {loading ? "Saving..." : "Save Parent"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

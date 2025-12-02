import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Make a Wish</h1>
          <p className="text-slate-600">Submit your wish to the wish manager</p>
        </div>

        <div className="text-center flex flex-col gap-10">
          <Link href="/dashboard/wish-form" className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            Make a Wish
          </Link>

          <Link href="/register" className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            ...or Register
          </Link>
        </div>
      </div>
    </div>
  );
}

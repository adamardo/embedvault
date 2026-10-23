import Link from "next/link";
import { login } from "@/app/actions/auth";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#12141a] p-6">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Embed<span className="text-accent">Vault</span>
        </h1>
        <p className="mb-5 mt-1 text-sm text-gray-500">Log in to add, edit and delete.</p>

        {searchParams.error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {searchParams.error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? "/"} />
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent"
          />
          <button type="submit" className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light">
            Log in
          </button>
        </form>

        <Link href="/" className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-300">
          Continue as a guest (read only)
        </Link>
      </div>
    </div>
  );
}

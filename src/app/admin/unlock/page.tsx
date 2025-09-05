import { unlockAction, logoutAction } from "./actions";

export default function UnlockPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const next = (searchParams?.next as string) || "/admin";
  const error = searchParams?.error ? true : false;

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow p-6">
        <h1 className="text-2xl font-display mb-2">Admin Unlock</h1>
        <p className="text-sm opacity-70 mb-4">Enter the shared admin key to access controls.</p>

        <form action={unlockAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input
            name="key"
            type="password"
            inputMode="numeric"
            placeholder="Enter key"
            className="w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">That key didn’t match. Try again.</p>}
          <button className="w-full rounded-xl bg-charcoal text-white px-3 py-2 shadow">Unlock</button>
        </form>
      </div>

      <form action={logoutAction}>
        <button className="w-full rounded-xl bg-white/80 backdrop-blur shadow px-3 py-2">Logout</button>
      </form>
    </main>
  );
}

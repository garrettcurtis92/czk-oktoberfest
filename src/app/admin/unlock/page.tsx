import { unlockAction, logoutAction } from "./actions";

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function UnlockPage({ searchParams }: { searchParams?: Promise<unknown> }) {
  const resolved = (await searchParams) as RawSearchParams | undefined;
  const params = resolved;
  const next = (params?.next as string) || "/admin";
  const error = params?.error ? true : false;

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md shadow border border-white/20 dark:border-gray-700/30 p-6">
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
        <button className="w-full rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md shadow border border-white/20 dark:border-gray-700/30 px-3 py-2">Logout</button>
      </form>
    </main>
  );
}

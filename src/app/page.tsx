import { auth } from "@/auth";
import { login, logout } from "@/features/auth/actions";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            認証テスト
          </h1>

          <div className="flex flex-col gap-4">
            {session?.user ? (
              <>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  ログイン中:{" "}
                  <span className="font-semibold text-black dark:text-zinc-50">
                    {session.user.name}
                  </span>
                </p>
                {session.user.email && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    メール: {session.user.email}
                  </p>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  ログインしていません
                </p>
                <form action={login}>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Googleでログイン
                  </button>
                </form>
              </>
            )}
          </div>
          <a href="/home" className="text-blue-600 hover:underline">
            ホームページへ移動
          </a>
        </div>
      </main>
    </div>
  );
}

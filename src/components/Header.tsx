import { auth } from "@/auth";
import Link from "next/link";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-gray-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg">
          <h1 className="text-xl font-bold">Taskal</h1>
        </Link>
        <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded">
          {session?.user?.name || "未ログイン"}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSession } from "next-auth/react";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-gray-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* ハンバーガーメニューボタン（モバイルのみ） */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-200 rounded-lg md:hidden"
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="text-lg">
            <h1 className="text-xl font-bold">Taskal</h1>
          </Link>
        </div>
        <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded">
          {session?.user?.name || "未ログイン"}
        </div>
      </div>
    </header>
  );
}

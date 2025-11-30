"use client";

import Link from "next/link";
import { Home, Menu, X, Trash2, FolderKanban, Calendar } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ハンバーガーメニューボタン（モバイルのみ） */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-40 p-2 bg-white border border-gray-300 rounded-lg md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* オーバーレイ（モバイルのみ） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-300 z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">メニュー</h2>
          <nav className="space-y-1">
            <Link
              href="/home"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>ホーム</span>
            </Link>
            <Link
              href="/project"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FolderKanban className="h-5 w-5" />
              <span>プロジェクト</span>
            </Link>
            <Link
              href="/calendar"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="h-5 w-5" />
              <span>カレンダー</span>
            </Link>
            <Link
              href="/trashbox"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Trash2 className="h-5 w-5" />
              <span>ゴミ箱</span>
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}

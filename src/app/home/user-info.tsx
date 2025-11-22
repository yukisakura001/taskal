"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function UserInfo() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await client.api.user.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-500">エラー: {error.message}</div>;
  }

  if (!data?.user) {
    return <div>ユーザー情報が見つかりません</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md">
      <div className="flex items-center space-x-4">
        {data.user.image && (
          <img
            src={data.user.image}
            alt={data.user.name || "User"}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold">{data.user.name}</h2>
          <p className="text-gray-600">{data.user.email}</p>
        </div>
      </div>
    </div>
  );
}

import { QueryClient, dehydrate } from "@tanstack/react-query";
import { client } from "@/lib/client";
import QueryProvider from "@/providers/query-provider";
import { UserInfo } from "./user-info";

export default async function HomePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await client.api.user.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
  });

  return (
    <QueryProvider dehydratedState={dehydrate(queryClient)}>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">ユーザー</h1>
        <UserInfo />
      </div>
    </QueryProvider>
  );
}

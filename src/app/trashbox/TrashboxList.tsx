"use client";

import { useQuery } from "@tanstack/react-query";
import { getDeletedTasks } from "../home/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function TrashboxList() {
  const { data: deletedTasks = [], isLoading } = useQuery({
    queryKey: ["deletedTasks"],
    queryFn: getDeletedTasks,
  });

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-2">
      {deletedTasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-300 p-6 text-center text-gray-500 text-sm">
          削除されたタスクはありません
        </div>
      ) : (
        <div className="space-y-1.5">
          {deletedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-300 p-2.5 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate mb-1">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                    <span>期限: {task.deadline}</span>
                    <span>{task.time}h</span>
                    <span className="text-gray-500">{task.type}</span>
                    <span className="text-gray-500">{task.priority}</span>
                    <span className="text-gray-500">{task.status}</span>
                  </div>
                  {task.condition && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {task.condition}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

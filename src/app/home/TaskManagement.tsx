"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import TaskView from "./TaskView";
import { Task } from "./taskSchema";
import { groupTasksByDate } from "./groupTasks";
import { getManagementTasks, updateTask, deleteTask } from "./actions";

export default function TaskManagement() {
  const queryClient = useQueryClient();
  const [statusFilters, setStatusFilters] = useState<Task["status"][]>([
    "未着手",
    "仕掛中",
    "休止中",
  ]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["managementTasks"],
    queryFn: getManagementTasks,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: Task }) =>
      updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managementTasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managementTasks"] });
    },
  });

  const handleUpdateTask = async (task: Task) => {
    // 仕掛中に変更しようとしている場合、既存の仕掛中タスク数をチェック
    if (task.status === "仕掛中") {
      const inProgressCount = tasks.filter(
        (t) => t.status === "仕掛中" && t.id !== task.id
      ).length;

      if (inProgressCount >= 2) {
        alert(
          "仕掛中のタスクが既に2個以上あります。\n他のタスクを完了または休止してから変更してください。"
        );
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({ id: task.id, task });
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
      alert("タスクの更新に失敗しました");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
      alert("タスクの削除に失敗しました");
    }
  };

  const toggleStatusFilter = (status: Task["status"]) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // ステータスごとのタスク数を計算
  const statusCounts = useMemo(() => {
    return {
      未着手: tasks.filter((t) => t.status === "未着手").length,
      仕掛中: tasks.filter((t) => t.status === "仕掛中").length,
      休止中: tasks.filter((t) => t.status === "休止中").length,
    };
  }, [tasks]);

  // フィルタリングされたタスク
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => statusFilters.includes(task.status));
  }, [tasks, statusFilters]);

  const groupedTasks = groupTasksByDate(filteredTasks);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-300 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            ステータスフィルター
          </h3>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-600">
              未着手:{" "}
              <span className="font-semibold">{statusCounts.未着手}</span>
            </span>
            <span className="text-blue-600">
              仕掛中:{" "}
              <span className="font-semibold">{statusCounts.仕掛中}</span>
            </span>
            <span className="text-yellow-600">
              休止中:{" "}
              <span className="font-semibold">{statusCounts.休止中}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toggleStatusFilter("未着手")}
            variant="outline"
            size="sm"
            className={
              statusFilters.includes("未着手")
                ? "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                : "hover:bg-gray-100"
            }
          >
            未着手
          </Button>
          <Button
            onClick={() => toggleStatusFilter("仕掛中")}
            variant="outline"
            size="sm"
            className={
              statusFilters.includes("仕掛中")
                ? "bg-blue-200 text-blue-700 border-blue-300 hover:bg-blue-300"
                : "hover:bg-gray-100"
            }
          >
            仕掛中
          </Button>
          <Button
            onClick={() => toggleStatusFilter("休止中")}
            variant="outline"
            size="sm"
            className={
              statusFilters.includes("休止中")
                ? "bg-yellow-200 text-yellow-700 border-yellow-300 hover:bg-yellow-300"
                : "hover:bg-gray-100"
            }
          >
            休止中
          </Button>
        </div>
      </div>

      {groupedTasks.map((group) => (
        <div
          key={group.date}
          className="bg-white rounded-lg border border-gray-300 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-100 border-b border-orange-300">
            <h2 className="text-base font-bold text-gray-700">{group.date}</h2>
            <span className="text-base font-bold text-orange-700">
              {group.totalTime}h
            </span>
          </div>
          <div className="p-3 space-y-2">
            {group.tasks.map((task) => (
              <TaskView
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

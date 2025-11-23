"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskView from "./TaskView";
import { Task } from "./taskSchema";
import { groupTasksByDate } from "./groupTasks";
import {
  getCompletedTasksByDateRange,
  updateTask,
  deleteTask,
} from "./actions";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialDateRange() {
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 14); // 今日から過去14日（15日分）

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

export default function CompletedTasksView() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState(getInitialDateRange());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["completedTasks", dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      getCompletedTasksByDateRange(dateRange.startDate, dateRange.endDate),
    staleTime: 30 * 1000, // 30秒間はキャッシュを利用
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: Task }) =>
      updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managementTasks"] });
      queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managementTasks"] });
      queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });

  const handleUpdateTask = async (task: Task) => {
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

  const handlePrevPeriod = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    start.setDate(start.getDate() - 15);
    end.setDate(end.getDate() - 15);
    setDateRange({
      startDate: formatDate(start),
      endDate: formatDate(end),
    });
  };

  const handleNextPeriod = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    start.setDate(start.getDate() + 15);
    end.setDate(end.getDate() + 15);
    setDateRange({
      startDate: formatDate(start),
      endDate: formatDate(end),
    });
  };

  const groupedTasks = groupTasksByDate(tasks);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Button onClick={handlePrevPeriod} size="sm" variant="outline">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-gray-600 min-w-[200px] text-center">
          {dateRange.startDate} 〜 {dateRange.endDate}
        </div>
        <Button onClick={handleNextPeriod} size="sm" variant="outline">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {groupedTasks.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">
            この期間に完了したタスクはありません
          </div>
        </div>
      ) : (
        groupedTasks.map((group) => (
          <div
            key={group.date}
            className="bg-white rounded-lg border border-gray-300 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-100 border-b border-orange-300">
              <h2 className="text-base font-bold text-gray-700">
                {group.date}
              </h2>
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
                  readOnly={true}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

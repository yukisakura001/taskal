"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ListTodo, CheckCircle } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import TaskManagement from "./TaskManagement";
import CompletedTasksView from "./CompletedTasksView";
import { TaskInput } from "./taskSchema";
import { createTask } from "./actions";

export default function TaskList() {
  const [viewMode, setViewMode] = useState<"management" | "completed">("management");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (taskInput: TaskInput) => createTask(taskInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managementTasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasksByDateRange"] });
    },
  });

  const handleCreateTask = async (taskInput: TaskInput) => {
    try {
      await createMutation.mutateAsync(taskInput);
    } catch (error) {
      console.error("タスクの作成に失敗しました:", error);
      alert("タスクの作成に失敗しました");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <Button
            onClick={() => setViewMode("management")}
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${
              viewMode === "management"
                ? "bg-blue-200 text-blue-700 hover:bg-blue-300"
                : "hover:bg-gray-200"
            }`}
          >
            <ListTodo className="h-4 w-4" />
            未完了のみ
          </Button>
          <Button
            onClick={() => setViewMode("completed")}
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${
              viewMode === "completed"
                ? "bg-green-200 text-green-700 hover:bg-green-300"
                : "hover:bg-gray-200"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            完了済み
          </Button>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          + タスク作成
        </Button>
      </div>

      {viewMode === "management" ? <TaskManagement /> : <CompletedTasksView />}

      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateTask}
      />
    </div>
  );
}

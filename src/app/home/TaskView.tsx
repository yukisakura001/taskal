"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import EditTaskModal from "./EditTaskModal";
import { Task } from "./taskSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInProgressLimitError } from "./taskValidation";

type TaskViewProps = {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  readOnly?: boolean;
  currentTasks: Task[];
};

const statusColors = {
  未着手: "bg-gray-200 text-gray-700 border-gray-300",
  仕掛中: "bg-blue-200 text-blue-700 border-blue-300",
  休止中: "bg-yellow-200 text-yellow-700 border-yellow-300",
  完了: "bg-green-200 text-green-700 border-green-300",
};

const cardStatusColors = {
  未着手: "bg-gray-50",
  仕掛中: "bg-blue-50",
  休止中: "bg-yellow-50",
  完了: "bg-green-50",
};

const cardHoverColors = {
  未着手: "hover:bg-gray-100",
  仕掛中: "hover:bg-blue-100",
  休止中: "hover:bg-yellow-100",
  完了: "hover:bg-green-100",
};

const typeColors = {
  一般: "bg-gray-100 text-gray-600",
  依頼準備: "bg-purple-100 text-purple-600",
  "15分タスク": "bg-orange-100 text-orange-600",
};

const priorityColors = {
  今すぐ: "bg-red-100 text-red-700",
  後回し: "bg-gray-100 text-gray-600",
};

export default function TaskView({
  task,
  onUpdate,
  onDelete,
  readOnly = false,
  currentTasks,
}: TaskViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleStatusChange = (newStatus: Task["status"]) => {
    // 仕掛中に変更しようとしている場合、制限をチェック
    if (newStatus === "仕掛中") {
      const errorMessage = getInProgressLimitError(currentTasks, task.id);
      if (errorMessage) {
        setAlertMessage(errorMessage);
        setShowAlert(true);
        return;
      }
    }

    onUpdate({ ...task, status: newStatus });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 読み取り専用モードではモーダルを開かない
    if (readOnly) {
      return;
    }
    // Selectの中をクリックした場合はモーダルを開かない
    const target = e.target as HTMLElement;
    if (
      target.closest('[role="combobox"]') ||
      target.closest("[data-radix-select-trigger]")
    ) {
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>仕掛中タスクの上限に達しています</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        className={`p-1.5 ${cardStatusColors[task.status]} ${
          readOnly ? "cursor-default" : "cursor-pointer"
        } ${
          readOnly ? "" : cardHoverColors[task.status]
        } transition-colors border border-gray-200`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm flex-1 min-w-0 truncate leading-none">
            {task.title}
          </h3>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base font-semibold text-gray-700">
              {task.time}h
            </span>
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                typeColors[task.type]
              }`}
            >
              {task.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger
              className={`h-5 text-xs px-1.5 py-0 rounded border ${
                statusColors[task.status]
              }`}
              data-radix-select-trigger
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="未着手">未着手</SelectItem>
              <SelectItem value="仕掛中">仕掛中</SelectItem>
              <SelectItem value="休止中">休止中</SelectItem>
              <SelectItem value="完了">完了</SelectItem>
            </SelectContent>
          </Select>

          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>
      </Card>

      {!readOnly && (
        <EditTaskModal
          task={task}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={onUpdate}
          onDelete={onDelete}
          currentTasks={currentTasks}
        />
      )}
    </>
  );
}

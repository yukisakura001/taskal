"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Task, TaskInput, taskSchema } from "./taskSchema";
import { useState } from "react";
import { getInProgressLimitError } from "./taskValidation";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../project/actions";

type CreateTaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: TaskInput) => void;
  currentTasks: Task[];
};

const getEmptyTask = (): TaskInput => ({
  title: "",
  deadline: "",
  time: 1,
  condition: "",
  status: "未着手",
  type: "一般",
  priority: "今すぐ",
  project: undefined,
});

export default function CreateTaskModal({
  open,
  onOpenChange,
  onSave,
  currentTasks,
}: CreateTaskModalProps) {
  const [editedTask, setEditedTask] = useState<TaskInput>(getEmptyTask());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    enabled: open, // モーダルが開いているときだけクエリを実行
  });

  const handleSave = () => {
    const result = taskSchema.safeParse(editedTask);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // 仕掛中に設定しようとしている場合、制限をチェック
    if (result.data.status === "仕掛中") {
      const errorMessage = getInProgressLimitError(currentTasks);
      if (errorMessage) {
        setAlertMessage(errorMessage);
        setShowAlert(true);
        return;
      }
    }

    onSave(result.data);
    setEditedTask(getEmptyTask());
    setErrors({});
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedTask(getEmptyTask());
    setErrors({});
    onOpenChange(false);
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

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>タスク作成</DialogTitle>
          </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>タイトル</Label>
            <Input
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>期限</Label>
              <Input
                type="date"
                value={editedTask.deadline}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, deadline: e.target.value })
                }
              />
              {errors.deadline && (
                <p className="text-sm text-red-600 mt-1">{errors.deadline}</p>
              )}
            </div>
            <div>
              <Label>工数 (h)</Label>
              <Select
                value={editedTask.time.toString()}
                onValueChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    time: Number(value) as TaskInput["time"],
                  })
                }
                disabled={editedTask.type === "15分タスク"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="0.2">0.2</SelectItem>
                  <SelectItem value="0.5">0.5</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>ステータス</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    status: value as TaskInput["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="未着手">未着手</SelectItem>
                  <SelectItem value="仕掛中">仕掛中</SelectItem>
                  <SelectItem value="休止中">休止中</SelectItem>
                  <SelectItem value="完了">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>タスク種類</Label>
              <Select
                value={editedTask.type}
                onValueChange={(value) => {
                  const newType = value as TaskInput["type"];
                  setEditedTask({
                    ...editedTask,
                    type: newType,
                    time: newType === "15分タスク" ? 0.2 : editedTask.time,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="一般">一般</SelectItem>
                  <SelectItem value="依頼準備">依頼準備</SelectItem>
                  <SelectItem value="作業見積">作業見積</SelectItem>
                  <SelectItem value="15分タスク">15分タスク</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>重要度</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    priority: value as TaskInput["priority"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="今すぐ">今すぐ</SelectItem>
                  <SelectItem value="後回し">後回し</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>プロジェクト（任意）</Label>
            <Select
              value={editedTask.project || "__none__"}
              onValueChange={(value) =>
                setEditedTask({
                  ...editedTask,
                  project: value === "__none__" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="プロジェクトを選択" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="__none__">なし</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>達成条件</Label>
            <Textarea
              value={editedTask.condition}
              onChange={(e) =>
                setEditedTask({ ...editedTask, condition: e.target.value })
              }
              rows={3}
            />
            {errors.condition && (
              <p className="text-sm text-red-600 mt-1">{errors.condition}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel} variant="outline">
              キャンセル
            </Button>
            <Button onClick={handleSave}>作成</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

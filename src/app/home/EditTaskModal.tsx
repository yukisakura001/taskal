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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Task, TaskInput, taskSchema } from "./taskSchema";
import { useState } from "react";

type EditTaskModalProps = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export default function EditTaskModal({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditTaskModalProps) {
  const [editedTask, setEditedTask] = useState<TaskInput>(task);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    onSave({ ...result.data, id: task.id });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onOpenChange(false);
  };

  return (
    <Dialog key={task.id} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>タスク編集</DialogTitle>
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
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
                    status: value as Task["status"],
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
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, type: value as Task["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="一般">一般</SelectItem>
                  <SelectItem value="依頼準備">依頼準備</SelectItem>
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
                    priority: value as Task["priority"],
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

          <div className="flex justify-between gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="text-black">
                  削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。タスク「{task.title}
                    」を完全に削除します。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    削除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2 ml-auto">
              <Button onClick={() => onOpenChange(false)} variant="outline">
                キャンセル
              </Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

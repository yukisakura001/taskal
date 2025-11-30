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
import { Project, projectInputSchema } from "./projectSchema";
import { useState, useEffect } from "react";

type EditProjectModalProps = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Project) => void;
};

export default function EditProjectModal({
  project,
  open,
  onOpenChange,
  onSave,
}: EditProjectModalProps) {
  const [editedProject, setEditedProject] = useState({
    name: project.name,
    deadLine: project.deadLine,
    goal: project.goal,
    status: project.status,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setEditedProject({
        name: project.name,
        deadLine: project.deadLine,
        goal: project.goal,
        status: project.status,
      });
      setErrors({});
    }
  }, [open, project]);

  const handleSave = () => {
    const result = projectInputSchema.safeParse(editedProject);

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

    onSave({
      ...project,
      ...result.data,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>プロジェクト編集</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>名前</Label>
            <Input
              value={editedProject.name}
              onChange={(e) =>
                setEditedProject({ ...editedProject, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>期限</Label>
              <Input
                type="date"
                value={editedProject.deadLine}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, deadLine: e.target.value })
                }
              />
              {errors.deadLine && (
                <p className="text-sm text-red-600 mt-1">{errors.deadLine}</p>
              )}
            </div>
            <div>
              <Label>ステータス</Label>
              <Select
                value={editedProject.status}
                onValueChange={(value) =>
                  setEditedProject({
                    ...editedProject,
                    status: value as Project["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="計画中">計画中</SelectItem>
                  <SelectItem value="仕掛中">仕掛中</SelectItem>
                  <SelectItem value="完了">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>完了条件</Label>
            <Textarea
              value={editedProject.goal}
              onChange={(e) =>
                setEditedProject({ ...editedProject, goal: e.target.value })
              }
              rows={3}
            />
            {errors.goal && (
              <p className="text-sm text-red-600 mt-1">{errors.goal}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel} variant="outline">
              キャンセル
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { ProjectInput, projectInputSchema } from "./projectSchema";
import { useState } from "react";

type CreateProjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: ProjectInput) => void;
};

const getEmptyProject = (): ProjectInput => ({
  name: "",
  deadLine: "",
  goal: "",
  status: "計画中",
});

export default function CreateProjectModal({
  open,
  onOpenChange,
  onSave,
}: CreateProjectModalProps) {
  const [editedProject, setEditedProject] = useState<ProjectInput>(getEmptyProject());
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    onSave(result.data);
    setEditedProject(getEmptyProject());
    setErrors({});
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedProject(getEmptyProject());
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>プロジェクト作成</DialogTitle>
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
                    status: value as ProjectInput["status"],
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
            <Button onClick={handleSave}>作成</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

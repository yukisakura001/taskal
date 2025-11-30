"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Project, ProjectInput } from "./projectSchema";
import { getAllProjects, updateProject, createProject } from "./actions";
import CreateProjectModal from "./CreateProjectModal";
import { getIncompletedTasksByProject } from "../home/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProjectManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilters, setStatusFilters] = useState<Project["status"][]>([
    "計画中",
    "仕掛中",
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjects,
  });

  const createMutation = useMutation({
    mutationFn: (project: ProjectInput) => createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Project["status"] }) =>
      updateProject(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleCreateProject = async (project: ProjectInput) => {
    try {
      await createMutation.mutateAsync(project);
    } catch (error) {
      console.error("プロジェクトの作成に失敗しました:", error);
      alert("プロジェクトの作成に失敗しました");
    }
  };

  const handleUpdateStatus = async (projectId: string, status: Project["status"]) => {
    // 完了に変更しようとしている場合、未完了タスクをチェック
    if (status === "完了") {
      try {
        const incompleteTasks = await getIncompletedTasksByProject(projectId);
        if (incompleteTasks.length > 0) {
          setAlertMessage(
            `このプロジェクトには未完了のタスクが${incompleteTasks.length}件あります。\n` +
            `プロジェクトを完了するには、全てのタスクを完了させてください。\n\n` +
            `未完了タスク:\n` +
            incompleteTasks.slice(0, 5).map(t => `・${t.title} (${t.status})`).join('\n') +
            (incompleteTasks.length > 5 ? `\n...他${incompleteTasks.length - 5}件` : '')
          );
          setShowAlert(true);
          return;
        }
      } catch (error) {
        console.error("タスクのチェックに失敗しました:", error);
        alert("タスクのチェックに失敗しました");
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({ id: projectId, status });
    } catch (error) {
      console.error("プロジェクトの更新に失敗しました:", error);
      alert("プロジェクトの更新に失敗しました");
    }
  };

  const toggleStatusFilter = (status: Project["status"]) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const statusCounts = useMemo(() => {
    return {
      計画中: projects.filter((p) => p.status === "計画中").length,
      仕掛中: projects.filter((p) => p.status === "仕掛中").length,
      完了: projects.filter((p) => p.status === "完了").length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => statusFilters.includes(project.status));
  }, [projects, statusFilters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>プロジェクトを完了できません</AlertDialogTitle>
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

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateProject}
      />

      <div className="space-y-3">
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            プロジェクト作成
          </Button>
        </div>
      <div className="bg-white rounded-lg border border-gray-300 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            ステータスフィルター
          </h3>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-600">
              計画中:{" "}
              <span className="font-semibold">{statusCounts.計画中}</span>
            </span>
            <span className="text-blue-600">
              仕掛中:{" "}
              <span className="font-semibold">{statusCounts.仕掛中}</span>
            </span>
            <span className="text-green-600">
              完了:{" "}
              <span className="font-semibold">{statusCounts.完了}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toggleStatusFilter("計画中")}
            variant="outline"
            size="sm"
            className={
              statusFilters.includes("計画中")
                ? "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                : "hover:bg-gray-100"
            }
          >
            計画中
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
            onClick={() => toggleStatusFilter("完了")}
            variant="outline"
            size="sm"
            className={
              statusFilters.includes("完了")
                ? "bg-green-200 text-green-700 border-green-300 hover:bg-green-300"
                : "hover:bg-gray-100"
            }
          >
            完了
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-300 p-3 hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => router.push(`/project/${project.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  {project.name}
                </h3>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span>期限: {project.deadLine}</span>
                  <span
                    className={
                      project.status === "計画中"
                        ? "text-gray-700 font-semibold"
                        : project.status === "仕掛中"
                        ? "text-blue-700 font-semibold"
                        : "text-green-700 font-semibold"
                    }
                  >
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {project.status === "計画中" && (
                  <Button
                    onClick={() => handleUpdateStatus(project.id, "仕掛中")}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-100"
                  >
                    仕掛中へ
                  </Button>
                )}
                {project.status === "仕掛中" && (
                  <>
                    <Button
                      onClick={() => handleUpdateStatus(project.id, "計画中")}
                      variant="outline"
                      size="sm"
                      className="hover:bg-gray-100"
                    >
                      計画中へ
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(project.id, "完了")}
                      variant="outline"
                      size="sm"
                      className="hover:bg-green-100"
                    >
                      完了
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}

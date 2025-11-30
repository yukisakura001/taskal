"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProjectById, updateProjectFull } from "../actions";
import { getTasksByProject, updateTask, deleteTask } from "@/app/home/actions";
import { groupTasksByDate } from "@/app/home/groupTasks";
import TaskView from "@/app/home/TaskView";
import EditProjectModal from "../EditProjectModal";
import { Project } from "../projectSchema";

type ProjectDetailProps = {
  projectId: string;
};

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: () => getTasksByProject(projectId),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (project: Project) =>
      updateProjectFull(projectId, {
        name: project.name,
        deadLine: project.deadLine,
        goal: project.goal,
        status: project.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: any }) =>
      updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
    },
  });

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateProjectMutation.mutateAsync(updatedProject);
    } catch (error) {
      console.error("プロジェクトの更新に失敗しました:", error);
      alert("プロジェクトの更新に失敗しました");
    }
  };

  const handleUpdateTask = async (task: any) => {
    try {
      await updateTaskMutation.mutateAsync({ id: task.id, task });
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
      alert("タスクの更新に失敗しました");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
      alert("タスクの削除に失敗しました");
    }
  };

  const totalTime = useMemo(() => {
    return tasks.reduce((sum, task) => sum + task.time, 0);
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    return groupTasksByDate(tasks);
  }, [tasks]);

  const statusColor = {
    計画中: "text-gray-700",
    仕掛中: "text-blue-700",
    完了: "text-green-700",
  };

  if (isLoadingProject || isLoadingTasks) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">プロジェクトが見つかりません</div>
      </div>
    );
  }

  return (
    <>
      <EditProjectModal
        project={project}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleUpdateProject}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push("/project")}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            プロジェクト一覧に戻る
          </Button>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            編集
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {project.name}
              </h1>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>期限: {project.deadLine}</span>
                <span className={`font-semibold ${statusColor[project.status]}`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">完了条件</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.goal}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">
                関連タスク: <span className="font-semibold">{tasks.length}件</span>
              </span>
              <span className="text-gray-600">
                合計工数: <span className="font-semibold">{totalTime}h</span>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">関連タスク</h2>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-300 p-6 text-center text-gray-500">
              このプロジェクトに関連するタスクはありません
            </div>
          ) : (
            groupedTasks.map((group) => (
              <div
                key={group.date}
                className="bg-white rounded-lg border border-gray-300 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-100 border-b border-orange-300">
                  <h2 className="text-base font-bold text-gray-700">
                    {group.date}({group.dayOfWeek})
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
                      currentTasks={tasks}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

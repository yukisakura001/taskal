"use server";

import { db } from "@/db";
import { pj } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, ne } from "drizzle-orm";
import { Project, ProjectInput, projectSchema } from "./projectSchema";
import { revalidatePath } from "next/cache";

export async function createProject(projectInput: ProjectInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const newProject = await db
    .insert(pj)
    .values({
      userId: session.user.id,
      name: projectInput.name,
      deadLine: projectInput.deadLine,
      goal: projectInput.goal,
      status: projectInput.status,
    })
    .returning();

  revalidatePath("/project");

  const validatedProject = projectSchema.parse({
    id: newProject[0].id,
    userId: newProject[0].userId,
    name: newProject[0].name,
    createdAt: newProject[0].createdAt,
    goal: newProject[0].goal,
    deadLine: newProject[0].deadLine,
    status: newProject[0].status,
  });

  return validatedProject;
}

export async function getProjects() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  // タスク作成時のプロジェクト選択用に、完了以外のプロジェクトを取得
  const userProjects = await db
    .select()
    .from(pj)
    .where(and(eq(pj.userId, session.user.id), ne(pj.status, "完了")));

  return userProjects.map((project): Project => {
    const validatedProject = projectSchema.parse({
      id: project.id,
      userId: project.userId,
      name: project.name,
      createdAt: project.createdAt,
      goal: project.goal,
      deadLine: project.deadLine,
      status: project.status,
    });

    return validatedProject;
  });
}

export async function getAllProjects() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  // プロジェクト一覧ページ用に、全てのプロジェクトを取得
  const userProjects = await db
    .select()
    .from(pj)
    .where(eq(pj.userId, session.user.id));

  return userProjects.map((project): Project => {
    const validatedProject = projectSchema.parse({
      id: project.id,
      userId: project.userId,
      name: project.name,
      createdAt: project.createdAt,
      goal: project.goal,
      deadLine: project.deadLine,
      status: project.status,
    });

    return validatedProject;
  });
}

export async function getProjectById(projectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const project = await db
    .select()
    .from(pj)
    .where(and(eq(pj.id, projectId), eq(pj.userId, session.user.id)))
    .limit(1);

  if (!project.length) {
    throw new Error("プロジェクトが見つかりません");
  }

  const validatedProject = projectSchema.parse({
    id: project[0].id,
    userId: project[0].userId,
    name: project[0].name,
    createdAt: project[0].createdAt,
    goal: project[0].goal,
    deadLine: project[0].deadLine,
    status: project[0].status,
  });

  return validatedProject;
}

export async function updateProject(projectId: string, status: Project["status"]) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const updatedProject = await db
    .update(pj)
    .set({ status })
    .where(and(eq(pj.id, projectId), eq(pj.userId, session.user.id)))
    .returning();

  if (!updatedProject.length) {
    throw new Error("プロジェクトが見つかりません");
  }

  revalidatePath("/project");

  const validatedProject = projectSchema.parse({
    id: updatedProject[0].id,
    userId: updatedProject[0].userId,
    name: updatedProject[0].name,
    createdAt: updatedProject[0].createdAt,
    goal: updatedProject[0].goal,
    deadLine: updatedProject[0].deadLine,
    status: updatedProject[0].status,
  });

  return validatedProject;
}

export async function updateProjectFull(projectId: string, projectData: Omit<Project, "id" | "userId" | "createdAt">) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const updatedProject = await db
    .update(pj)
    .set({
      name: projectData.name,
      deadLine: projectData.deadLine,
      goal: projectData.goal,
      status: projectData.status,
    })
    .where(and(eq(pj.id, projectId), eq(pj.userId, session.user.id)))
    .returning();

  if (!updatedProject.length) {
    throw new Error("プロジェクトが見つかりません");
  }

  revalidatePath("/project");
  revalidatePath(`/project/${projectId}`);

  const validatedProject = projectSchema.parse({
    id: updatedProject[0].id,
    userId: updatedProject[0].userId,
    name: updatedProject[0].name,
    createdAt: updatedProject[0].createdAt,
    goal: updatedProject[0].goal,
    deadLine: updatedProject[0].deadLine,
    status: updatedProject[0].status,
  });

  return validatedProject;
}

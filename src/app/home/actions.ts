"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, ne, gte, lte } from "drizzle-orm";
import { TaskInput, Task, taskSchema } from "./taskSchema";
import { revalidatePath } from "next/cache";

export async function createTask(taskInput: TaskInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const newTask = await db
    .insert(tasks)
    .values({
      userId: session.user.id,
      title: taskInput.title,
      deadLine: taskInput.deadline,
      time: taskInput.time,
      condition: taskInput.condition,
      status: taskInput.status,
      type: taskInput.type,
      priority: taskInput.priority,
      project: taskInput.project || null,
    })
    .returning();

  revalidatePath("/home");

  // zodスキーマでバリデーションして型安全性を保証
  const validatedTask = taskSchema.parse({
    title: newTask[0].title,
    deadline: newTask[0].deadLine,
    time: newTask[0].time,
    condition: newTask[0].condition ?? "",
    status: newTask[0].status,
    type: newTask[0].type,
    priority: newTask[0].priority,
    project: newTask[0].project || undefined,
  });

  const task: Task = {
    id: newTask[0].id,
    ...validatedTask,
  };

  return task;
}

export async function updateTask(taskId: string, taskInput: TaskInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const updatedTask = await db
    .update(tasks)
    .set({
      title: taskInput.title,
      deadLine: taskInput.deadline,
      time: taskInput.time,
      condition: taskInput.condition,
      status: taskInput.status,
      type: taskInput.type,
      priority: taskInput.priority,
      project: taskInput.project || null,
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
    .returning();

  if (!updatedTask.length) {
    throw new Error("タスクが見つかりません");
  }

  revalidatePath("/home");

  // zodスキーマでバリデーションして型安全性を保証
  const validatedTask = taskSchema.parse({
    title: updatedTask[0].title,
    deadline: updatedTask[0].deadLine,
    time: updatedTask[0].time,
    condition: updatedTask[0].condition ?? "",
    status: updatedTask[0].status,
    type: updatedTask[0].type,
    priority: updatedTask[0].priority,
    project: updatedTask[0].project || undefined,
  });

  const task: Task = {
    id: updatedTask[0].id,
    ...validatedTask,
  };

  return task;
}

export async function deleteTask(taskId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  await db
    .update(tasks)
    .set({ deleted: 1 })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)));

  revalidatePath("/home");
}

export async function getTasks() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const userTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, session.user.id), eq(tasks.deleted, 0)));

  return userTasks.map((task): Task => {
    // zodスキーマでバリデーションして型安全性を保証
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

export async function getManagementTasks() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const userTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, session.user.id), ne(tasks.status, "完了"), eq(tasks.deleted, 0)));

  return userTasks.map((task): Task => {
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

export async function getCompletedTasksByDateRange(
  startDate: string,
  endDate: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const userTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, session.user.id),
        eq(tasks.status, "完了"),
        gte(tasks.deadLine, startDate),
        lte(tasks.deadLine, endDate),
        eq(tasks.deleted, 0)
      )
    );

  return userTasks.map((task): Task => {
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

export async function getDeletedTasks() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const userTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, session.user.id), eq(tasks.deleted, 1)));

  return userTasks.map((task): Task => {
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

export async function getIncompletedTasksByProject(projectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, session.user.id),
        eq(tasks.project, projectId),
        ne(tasks.status, "完了"),
        eq(tasks.deleted, 0)
      )
    );

  return projectTasks.map((task): Task => {
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

export async function getTasksByProject(projectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, session.user.id),
        eq(tasks.project, projectId),
        eq(tasks.deleted, 0)
      )
    );

  return projectTasks.map((task): Task => {
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

export async function getTasksByMonth(year: number, month: number, includeCompleted: boolean) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  // 月の最初と最後の日付を計算
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const conditions = [
    eq(tasks.userId, session.user.id),
    gte(tasks.deadLine, startDate),
    lte(tasks.deadLine, endDate),
    eq(tasks.deleted, 0)
  ];

  if (!includeCompleted) {
    conditions.push(ne(tasks.status, "完了"));
  }

  const monthTasks = await db
    .select()
    .from(tasks)
    .where(and(...conditions));

  return monthTasks.map((task): Task => {
    const validatedTask = taskSchema.parse({
      title: task.title,
      deadline: task.deadLine,
      time: task.time,
      condition: task.condition ?? "",
      status: task.status,
      type: task.type,
      priority: task.priority,
      project: task.project || undefined,
    });

    return {
      id: task.id,
      ...validatedTask,
    };
  });
}

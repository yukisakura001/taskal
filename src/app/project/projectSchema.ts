import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.date(),
  goal: z.string(),
  deadLine: z.string(),
  status: z.enum(["計画中", "仕掛中", "完了"]),
});

export type Project = z.infer<typeof projectSchema>;

export const projectInputSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  deadLine: z.string().min(1, "期限を入力してください"),
  goal: z.string().min(1, "完了条件を入力してください"),
  status: z.enum(["計画中", "仕掛中", "完了"]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

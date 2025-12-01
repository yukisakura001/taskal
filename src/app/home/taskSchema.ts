import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  deadline: z.string().min(1, "期限を選択してください"),
  time: z.union([
    z.literal(0.2),
    z.literal(0.5),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(5),
    z.literal(8),
  ]),
  condition: z.string().min(1, "達成条件を入力してください"),
  status: z.enum(["未着手", "仕掛中", "休止中", "完了"]),
  type: z.enum(["一般", "依頼準備", "15分タスク", "作業見積"]),
  priority: z.enum(["今すぐ", "後回し"]),
  project: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;

export type Task = TaskInput & {
  id: string;
};

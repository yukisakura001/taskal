import { Task } from "./taskSchema";

const MAX_IN_PROGRESS_TASKS = 2;

/**
 * 仕掛中タスクの数をカウント
 * @param tasks 全タスクリスト
 * @param excludeTaskId カウントから除外するタスクID（編集時の自分自身を除外）
 * @returns 仕掛中タスクの数
 */
export function countInProgressTasks(
  tasks: Task[],
  excludeTaskId?: string
): number {
  return tasks.filter(
    (t) => t.status === "仕掛中" && t.id !== excludeTaskId
  ).length;
}

/**
 * 仕掛中タスクを追加可能かチェック
 * @param tasks 全タスクリスト
 * @param excludeTaskId カウントから除外するタスクID（編集時の自分自身を除外）
 * @returns 追加可能ならtrue
 */
export function canAddInProgressTask(
  tasks: Task[],
  excludeTaskId?: string
): boolean {
  const inProgressCount = countInProgressTasks(tasks, excludeTaskId);
  return inProgressCount < MAX_IN_PROGRESS_TASKS;
}

/**
 * 仕掛中タスクが制限を超えているかチェックし、エラーメッセージを返す
 * @param tasks 全タスクリスト
 * @param excludeTaskId カウントから除外するタスクID（編集時の自分自身を除外）
 * @returns エラーメッセージ（制限内ならnull）
 */
export function getInProgressLimitError(
  tasks: Task[],
  excludeTaskId?: string
): string | null {
  if (!canAddInProgressTask(tasks, excludeTaskId)) {
    return `仕掛中のタスクが既に${MAX_IN_PROGRESS_TASKS}個以上あります。\n他のタスクを完了または休止してから変更してください。`;
  }
  return null;
}

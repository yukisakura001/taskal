import { Task } from "./taskSchema";

export type GroupedTasks = {
  date: string;
  tasks: Task[];
  totalTime: number;
};

export function groupTasksByDate(tasks: Task[]): GroupedTasks[] {
  const grouped = tasks.reduce((acc, task) => {
    const date = task.deadline;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return Object.entries(grouped).map(([date, tasks]) => ({
    date,
    tasks,
    totalTime: tasks.reduce((sum, task) => sum + task.time, 0),
  }));
}

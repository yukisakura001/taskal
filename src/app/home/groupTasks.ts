import { Task } from "./taskSchema";

// 日付文字列から曜日を取得する関数
function getDayOfWeek(dateString: string): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  // YYYY-MM-DD形式の日付文字列をパースする際、タイムゾーンの影響を受けないように
  // 年、月、日を個別に取得して新しいDateオブジェクトを作成
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
}

export type GroupedTasks = {
  date: string;
  dayOfWeek: string;
  tasks: Task[];
  totalTime: number;
};

// 優先度の重み（今すぐ > 後回し）
const priorityWeight = {
  今すぐ: 0,
  後回し: 1,
};

// タスク種類の重み（15分タスク > 依頼準備 > 一般）
const typeWeight = {
  "15分タスク": 0,
  依頼準備: 1,
  一般: 2,
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

  return Object.entries(grouped)
    .map(([date, tasks]) => {
      // 同じ日付内でソート：優先度 > タスク種類
      const sortedTasks = tasks.sort((a, b) => {
        // まず優先度で比較
        const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        // 優先度が同じならタスク種類で比較
        return typeWeight[a.type] - typeWeight[b.type];
      });

      return {
        date,
        dayOfWeek: getDayOfWeek(date),
        tasks: sortedTasks,
        totalTime: tasks.reduce((sum, task) => sum + task.time, 0),
      };
    })
    .sort((a, b) => {
      // 日付の早い順にソート
      return a.date.localeCompare(b.date);
    });
}

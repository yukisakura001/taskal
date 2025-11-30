"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTasksByMonth } from "../home/actions";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCompleted, setShowCompleted] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["calendarTasks", year, month, showCompleted],
    queryFn: () => getTasksByMonth(year, month, showCompleted),
  });

  // 日付ごとの合計工数を計算
  const tasksByDate = useMemo(() => {
    const dateMap: Record<string, { total: number; completed: number; incomplete: number }> = {};
    
    tasks.forEach((task) => {
      const date = task.deadline;
      if (!dateMap[date]) {
        dateMap[date] = { total: 0, completed: 0, incomplete: 0 };
      }
      dateMap[date].total += task.time;
      if (task.status === "完了") {
        dateMap[date].completed += task.time;
      } else {
        dateMap[date].incomplete += task.time;
      }
    });

    return dateMap;
  }, [tasks]);

  // カレンダーの日付配列を生成（月曜始まり）
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    // 月曜始まりにするため、日曜日を6、月曜日を0にする
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const days: Array<{ date: number; dateString: string; isCurrentMonth: boolean }> = [];

    // 前月の日付で埋める
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      days.push({
        date: day,
        dateString: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // 次月の日付で埋める（7の倍数になるまで）
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        days.push({
          date: day,
          dateString: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-300 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              {year}年 {month}月
            </h2>
            <div className="flex gap-1">
              <Button
                onClick={goToPreviousMonth}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={goToToday}
                variant="outline"
                size="sm"
              >
                今日
              </Button>
              <Button
                onClick={goToNextMonth}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCompleted(false)}
              variant="outline"
              size="sm"
              className={
                !showCompleted
                  ? "bg-blue-200 text-blue-700 border-blue-300 hover:bg-blue-300"
                  : "hover:bg-gray-100"
              }
            >
              完了前のみ
            </Button>
            <Button
              onClick={() => setShowCompleted(true)}
              variant="outline"
              size="sm"
              className={
                showCompleted
                  ? "bg-green-200 text-green-700 border-green-300 hover:bg-green-300"
                  : "hover:bg-gray-100"
              }
            >
              全て表示
            </Button>
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-gray-300">
          {["月", "火", "水", "木", "金", "土", "日"].map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-semibold ${
                index === 5 ? "text-blue-600" : index === 6 ? "text-red-600" : "text-gray-700"
              } bg-gray-50 border-r border-gray-200 last:border-r-0`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayData = tasksByDate[day.dateString];
            const isWeekend = index % 7 === 5 || index % 7 === 6;
            const isToday = day.dateString === new Date().toISOString().split('T')[0];

            return (
              <div
                key={`${day.dateString}-${index}`}
                className={`min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                  !day.isCurrentMonth ? "bg-gray-50" : ""
                } ${isToday ? "bg-blue-50" : ""}`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    !day.isCurrentMonth
                      ? "text-gray-400"
                      : isWeekend
                      ? index % 7 === 5
                        ? "text-blue-600"
                        : "text-red-600"
                      : "text-gray-700"
                  } ${isToday ? "text-blue-700" : ""}`}
                >
                  {day.date}
                </div>
                {dayData && day.isCurrentMonth && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-700">
                      合計: {dayData.total}h
                    </div>
                    {showCompleted && dayData.completed > 0 && (
                      <div className="text-xs text-green-600">
                        完了: {dayData.completed}h
                      </div>
                    )}
                    {dayData.incomplete > 0 && (
                      <div className="text-xs text-orange-600">
                        未完: {dayData.incomplete}h
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

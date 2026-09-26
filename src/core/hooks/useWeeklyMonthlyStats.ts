import { useMemo } from 'react';
import { parseMovingTime } from './useActivities';

// 统计所需的最小活动字段（兼容 core 与 classic 两套 Activity 类型）
export interface StatsActivity {
  moving_time: string;
  distance: number;
  average_heartrate?: number | null;
  type: string;
  start_date_local: string;
}

// 判断日期是否在 referenceDate 的同一周（周一为一周的开始）
const isSameWeek = (date: Date, referenceDate: Date): boolean => {
  const dayOfWeek = referenceDate.getDay();
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日退回 6 天

  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - dayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const runDate = new Date(date);
  runDate.setHours(0, 0, 0, 0);

  return runDate >= startOfWeek && runDate < endOfWeek;
};

// 判断日期是否在 referenceDate 的同一月
const isSameMonth = (date: Date, referenceDate: Date): boolean =>
  date.getFullYear() === referenceDate.getFullYear() &&
  date.getMonth() === referenceDate.getMonth();

// 配速格式化: m/s -> X'XX" (如 5'30")
const formatPaceMinutesPerKm = (d: number): string => {
  if (Number.isNaN(d) || d === 0) return '0';
  const pace = (1000.0 / 60.0) * (1.0 / d);
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60.0);
  return `${minutes}'${seconds.toFixed(0).padStart(2, '0')}"`;
};

export interface WeeklyMonthlyStats {
  weeklyRuns: number;
  weeklyDistance: string; // km, 两位小数
  weeklyAvgHeartRate: number;
  weeklyAvgPaceMinutesPerKmString: string;
  monthlyRuns: number;
  monthlyDistance: string; // km, 两位小数
  monthlyAvgHeartRate: number;
  monthlyAvgPaceMinutesPerKmString: string;
}

/**
 * 本周/本月跑步统计（个人定制）：
 * - 以当前日期所在自然周/月为参考（USE_CALENDAR_WEEK_AS_REFERENCE = true）
 * - 周一为一周的开始
 * - 只统计 type === 'Run' 的活动
 * - 平均心率按 (AvgHR * 时长) 加权
 */
export function useWeeklyMonthlyStats(
  activities: StatsActivity[]
): WeeklyMonthlyStats {
  return useMemo(() => {
    const referenceDate = new Date();

    let weeklyRuns = 0;
    let weeklyDistance = 0;
    let monthlyRuns = 0;
    let monthlyDistance = 0;
    // 加权平均心率相关变量
    let weeklyHeartRateSum = 0;
    let weeklyTotalTime = 0;
    let monthlyHeartRateSum = 0;
    let monthlyTotalTime = 0;

    activities.forEach((run) => {
      const timerTime = parseMovingTime(run.moving_time) || 0;
      const avgHeartRate = run.average_heartrate || 0;

      if (run.start_date_local && run.type === 'Run') {
        const runDate = new Date(run.start_date_local.slice(0, 10));

        if (isSameWeek(runDate, referenceDate)) {
          weeklyRuns += 1;
          weeklyDistance += run.distance;
          weeklyHeartRateSum += avgHeartRate * timerTime;
          weeklyTotalTime += timerTime;
        }

        if (isSameMonth(runDate, referenceDate)) {
          monthlyRuns += 1;
          monthlyDistance += run.distance;
          monthlyHeartRateSum += avgHeartRate * timerTime;
          monthlyTotalTime += timerTime;
        }
      }
    });

    const weeklyAvgHeartRate =
      weeklyTotalTime > 0 ? Math.round(weeklyHeartRateSum / weeklyTotalTime) : 0;
    const monthlyAvgHeartRate =
      monthlyTotalTime > 0
        ? Math.round(monthlyHeartRateSum / monthlyTotalTime)
        : 0;

    // 平均速度 (米/秒) -> 平均配速 (分钟/公里)
    const weeklyAvgSpeedMetersPerSecond =
      weeklyTotalTime > 0 ? weeklyDistance / weeklyTotalTime : 0;
    const monthlyAvgSpeedMetersPerSecond =
      monthlyTotalTime > 0 ? monthlyDistance / monthlyTotalTime : 0;

    return {
      weeklyRuns,
      weeklyDistance: (weeklyDistance / 1000).toFixed(2),
      weeklyAvgHeartRate,
      weeklyAvgPaceMinutesPerKmString: formatPaceMinutesPerKm(
        weeklyAvgSpeedMetersPerSecond
      ),
      monthlyRuns,
      monthlyDistance: (monthlyDistance / 1000).toFixed(2),
      monthlyAvgHeartRate,
      monthlyAvgPaceMinutesPerKmString: formatPaceMinutesPerKm(
        monthlyAvgSpeedMetersPerSecond
      ),
    };
  }, [activities]);
}

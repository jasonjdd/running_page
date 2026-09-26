import { memo } from 'react';
import type { Activity } from '../types';
import { useLocale } from '../hooks/useLocale';
import { useWeeklyMonthlyStats } from '../core/hooks/useWeeklyMonthlyStats';

interface WeeklyMonthlyStatsProps {
  activities: Activity[];
}

/**
 * 本周/本月跑步统计卡片（个人定制，原 classic Header 中栏移植到 dashboard）
 */
export const WeeklyMonthlyStats = memo(function WeeklyMonthlyStats({
  activities,
}: WeeklyMonthlyStatsProps) {
  const { locale } = useLocale();
  const stats = useWeeklyMonthlyStats(activities);

  const weekMessage =
    locale === 'zh'
      ? `本周共计跑步${stats.weeklyRuns}次, 距离${stats.weeklyDistance}km, 平均心率${stats.weeklyAvgHeartRate}bpm, 平均配速${stats.weeklyAvgPaceMinutesPerKmString}/km`
      : `Total ${stats.weeklyRuns} runs this week, distance ${stats.weeklyDistance}km, average heart rate ${stats.weeklyAvgHeartRate}bpm, average pace ${stats.weeklyAvgPaceMinutesPerKmString}/km`;
  const monthMessage =
    locale === 'zh'
      ? `本月共计跑步${stats.monthlyRuns}次, 距离${stats.monthlyDistance}km, 平均心率${stats.monthlyAvgHeartRate}bpm, 平均配速${stats.monthlyAvgPaceMinutesPerKmString}/km`
      : `Total ${stats.monthlyRuns} runs this month, distance ${stats.monthlyDistance}km, average heart rate ${stats.monthlyAvgHeartRate}bpm, average pace ${stats.monthlyAvgPaceMinutesPerKmString}/km`;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5 hover:shadow-[var(--color-accent)]/5 hover:shadow-lg">
      <p className="mb-3 text-xs text-[var(--color-muted)]">
        {locale === 'zh' ? '跑步统计' : 'Running Stats'}
      </p>
      <div className="space-y-2 text-sm">
        <div className="text-[var(--color-text)]">{weekMessage}</div>
        <div className="text-[var(--color-muted)]">{monthMessage}</div>
      </div>
    </div>
  );
});

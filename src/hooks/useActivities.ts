import { locationForRun, titleForRun } from '@/utils/utils';
import activities from '@/static/activities.json';

// 辅助函数：找到 activities 中最新的活动日期
const getLatestDate = (activities: any[]): Date | null => {
  if (!activities || activities.length === 0) return null;

  let latestTimestamp = 0;

  // 遍历找到最大的时间戳
  activities.forEach(run => {
    if (run.start_date_local) {
      // 使用 new Date(string).getTime() 获取时间戳
      const timestamp = new Date(run.start_date_local).getTime();
      if (timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
      }
    }
  });

  return latestTimestamp > 0 ? new Date(latestTimestamp) : null;
};

// 辅助函数：判断日期是否在给定的 referenceDate 的同一周
// const isSameWeek = (date: Date, referenceDate: Date): boolean => {
//   // 设置参考日期的周开始日（例如：周日为一周开始）
//   const startOfWeek = new Date(referenceDate);
//   // 假设周日为一周开始 (getDay() 0=周日, 6=周六)
//   startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
//   startOfWeek.setHours(0, 0, 0, 0); // 清除时分秒

//   const endOfWeek = new Date(startOfWeek);
//   endOfWeek.setDate(startOfWeek.getDate() + 7);

//   // 检查 runDate 是否在 [startOfWeek, endOfWeek) 之间
//   return date >= startOfWeek && date < endOfWeek;
// };
// 辅助函数：判断日期是否在给定的 referenceDate 的同一周
// **修改逻辑：将周一设置为一周的开始**
const isSameWeek = (date: Date, referenceDate: Date): boolean => {
  // 1. 获取参考日期是周几 (0=周日, 1=周一, ..., 6=周六)
  const dayOfWeek = referenceDate.getDay();

  // 2. 计算从周一到这一天需要减去的天数 (dayIndex)
  //    - 如果 referenceDate 是周一 (1)，dayIndex = 0
  //    - 如果 referenceDate 是周日 (0)，dayIndex = 6 (需要退回 6 天到上周一)
  //    - 统一计算公式： (dayOfWeek + 6) % 7 
  const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // 周日设为 6，周一设为 0

  // 3. 计算周一的日期 (startOfWeek)
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - dayIndex);
  startOfWeek.setHours(0, 0, 0, 0); // 清除时分秒，确保精确

  // 4. 计算下一周周一的日期 (endOfWeek)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  // 5. 检查 runDate 是否在 [startOfWeek, endOfWeek) 之间
  // 注意：runDate 也需要清除时分秒或只使用日期部分进行比较
  const runDate = new Date(date);
  runDate.setHours(0, 0, 0, 0);

  return runDate >= startOfWeek && runDate < endOfWeek;
};

// 辅助函数：判断日期是否在给定的 referenceDate 的同一月
const isSameMonth = (date: Date, referenceDate: Date): boolean => {
  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
};

const useActivities = () => {
  const latestRunDate = getLatestDate(activities);
  const cities: Record<string, number> = {};
  const runPeriod: Record<string, number> = {};
  const provinces: Set<string> = new Set();
  const countries: Set<string> = new Set();
  let years: Set<string> = new Set();
  let thisYear = '';

  let weeklyRuns = 0;
  let weeklyDistance = 0;
  let monthlyRuns = 0;
  let monthlyDistance = 0;

  activities.forEach((run) => {
    const location = locationForRun(run);

    // 2. 【修改逻辑：基于 latestRunDate 判断最新周/月】
    if (run.start_date_local && latestRunDate) {
      // 解析活动开始日期（只取日期部分进行周/月比较更安全）
      const runDate = new Date(run.start_date_local.slice(0, 10));

      // 判断是否在最新活动所在周
      if (isSameWeek(runDate, latestRunDate)) {
        weeklyRuns += 1;
        weeklyDistance += run.distance;
      }

      // 判断是否在最新活动所在月
      if (isSameMonth(runDate, latestRunDate)) {
        monthlyRuns += 1;
        monthlyDistance += run.distance;
      }
    }
    // End of 【修改逻辑】

    const periodName = titleForRun(run);
    if (periodName) {
      runPeriod[periodName] = runPeriod[periodName]
        ? runPeriod[periodName] + 1
        : 1;
    }

    const { city, province, country } = location;
    // drop only one char city
    if (city.length > 1) {
      cities[city] = cities[city] ? cities[city] + run.distance : run.distance;
    }
    if (province) provinces.add(province);
    if (country) countries.add(country);
    const year = run.start_date_local.slice(0, 4);
    years.add(year);
  });

  weeklyDistance = (weeklyDistance / 1000).toFixed(2);
  monthlyDistance = (monthlyDistance / 1000).toFixed(2);

  let yearsArray = [...years].sort().reverse();
  if (years) [thisYear] = yearsArray; // set current year as first one of years array

  return {
    activities,
    years: yearsArray,
    countries: [...countries],
    provinces: [...provinces],
    cities,
    runPeriod,
    thisYear,
    weeklyRuns,
    weeklyDistance,
    monthlyRuns,
    monthlyDistance,
  };
};

export default useActivities;

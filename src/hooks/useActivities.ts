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

/**
 * 将 HH:MM:SS.mmm 格式的时间字符串转换为总秒数 (浮点数)。
 * 示例: "0:19:32.710000" -> 1172.71
 * * @param timeString 时间字符串
 * @returns 总秒数 (number)
 */
const convertTimeStringToSeconds = (timeString: string): number => {
  if (!timeString) {
    return 0;
  }

  // 假设格式为 H:MM:SS.mmm
  const parts = timeString.split(':');
  if (parts.length !== 3) {
    // 如果格式不符合 H:MM:SS.mmm，可以根据实际情况进行错误处理或返回 0
    console.error(`Invalid time string format: ${timeString}`);
    return 0;
  }

  // 提取小时 (H), 分钟 (M), 秒 (S.mmm)
  const hours = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]); // parseFloat 可以处理小数部分

  // 转换为总秒数
  return (hours * 3600) + (minutes * 60) + seconds;
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
  // 【新增加权平均心率相关变量】
  let weeklyHeartRateSum = 0; // (AvgHR * TimerTime) 的总和
  let weeklyTotalTime = 0;    // 本周跑步总用时（秒）
  let monthlyHeartRateSum = 0; // (AvgHR * TimerTime) 的总和
  let monthlyTotalTime = 0;    // 本月跑步总用时（秒）

  activities.forEach((run) => {
    const location = locationForRun(run);

    const timerTime = convertTimeStringToSeconds(run.moving_time) || 0;
    const avgHeartRate = run.average_heartrate || 0;
    // 2. 【修改逻辑：基于 latestRunDate 判断最新周/月】
    if (run.start_date_local && latestRunDate && run.type === 'Run') {
      // 解析活动开始日期（只取日期部分进行周/月比较更安全）
      const runDate = new Date(run.start_date_local.slice(0, 10));

      // 判断是否在最新活动所在周
      if (isSameWeek(runDate, latestRunDate)) {
        weeklyRuns += 1;
        weeklyDistance += run.distance;
        weeklyHeartRateSum += avgHeartRate * timerTime;
        weeklyTotalTime += timerTime;
      }

      // 判断是否在最新活动所在月
      if (isSameMonth(runDate, latestRunDate)) {
        monthlyRuns += 1;
        monthlyDistance += run.distance;
        monthlyHeartRateSum += avgHeartRate * timerTime;
        monthlyTotalTime += timerTime;
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


  // 计算最终的周平均心率
  const weeklyAvgHeartRate = weeklyTotalTime > 0
    ? Math.round(weeklyHeartRateSum / weeklyTotalTime)
    : 0;
  const monthlyAvgHeartRate = monthlyTotalTime > 0
    ? Math.round(monthlyHeartRateSum / monthlyTotalTime)
    : 0;
  // 2. 计算周平均速度 (米/秒)
  const weeklyAvgSpeedMetersPerSecond = weeklyTotalTime > 0
    ? weeklyDistance / weeklyTotalTime
    : 0;

  // 3. 【新增】：计算周平均配速 (分钟/公里)
  let weeklyAvgPaceMinutesPerKm = 0;
  if (weeklyAvgSpeedMetersPerSecond > 0) {
    // 转换公式：(1000米 / AvgSpeed) / 60秒
    // 假设 total_distance 单位是米 (m)
    const secondsPerKm = 1000 / weeklyAvgSpeedMetersPerSecond;
    weeklyAvgPaceMinutesPerKm = secondsPerKm / 60;
  }
  const monthlyAvgSpeedMetersPerSecond = monthlyTotalTime > 0
    ? monthlyDistance / monthlyTotalTime
    : 0;
  let monthlyAvgPaceMinutesPerKm = 0;
  if (monthlyAvgSpeedMetersPerSecond > 0) {
    // 转换公式：(1000米 / AvgSpeed) / 60秒
    // 假设 total_distance 单位是米 (m)
    const secondsPerKm = 1000 / monthlyAvgSpeedMetersPerSecond;
    monthlyAvgPaceMinutesPerKm = secondsPerKm / 60;
  }



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
    weeklyAvgHeartRate,
    weeklyAvgPaceMinutesPerKm: weeklyAvgPaceMinutesPerKm.toFixed(2),
    monthlyRuns,
    monthlyDistance,
    monthlyAvgHeartRate,
    monthlyAvgPaceMinutesPerKm: monthlyAvgPaceMinutesPerKm.toFixed(2),
  };
};

export default useActivities;

from run_page.gpxtrackposter.track_loader import load_fit_file

import datetime

unix_timestamp = 1131148840

# 使用 fromtimestamp() 方法将 Unix 时间戳转换为 datetime 对象
# 注意：这通常会以您本地的时区显示时间。
readable_datetime = datetime.datetime.utcfromtimestamp(unix_timestamp + 631065600)

# 转换为 UTC 时间 (更严谨，因为数据文件通常基于 UTC)
utc_datetime = datetime.datetime.fromtimestamp(unix_timestamp, tz=datetime.timezone.utc)

print(f"原始时间戳: {unix_timestamp}")
print(f"本地时间: {readable_datetime}")
print(f"UTC 时间 (无时区偏移): {utc_datetime}")

# 三峰大环线
# fit_file = "FIT_OUT/476551490205417773.fit"
# 力量训练
fit_file = "FIT_OUT/476689399457808483.fit"
t = load_fit_file(fit_file)

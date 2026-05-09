from run_page.gpxtrackposter.track_loader import load_gpx_file

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

# gpx_file = "GPX_OUT/591405933.gpx"
gpx_file = "GPX_OUT/591374295.gpx"
t = load_gpx_file(gpx_file)

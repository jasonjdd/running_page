import sqlite3

# 连接到SQLite数据库
conn = sqlite3.connect("data.db")
cursor = conn.cursor()

# 更新语句
# 假设我们要将 run_id 为 1723706360000 的记录的 type 更新为 "Ride"
sql = """UPDATE activities SET type = ?, name = ? WHERE run_id = ?"""

run_id = 1720518861000
# 执行更新操作
# 这里的 ("Ride", 1723706360000) 是参数，用来替换 SQL 语句中的问号
cursor.execute(sql, ("Ride", "Riding by coros", run_id))

# 提交更改
conn.commit()

# 关闭游标和连接
cursor.close()
conn.close()

print(f"Record {run_id} updated successfully")

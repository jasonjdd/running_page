from config import JSON_FILE, SQL_FILE, FIT_FOLDER
from utils import make_activities_file


# make_activities_file(SQL_FILE, FIT_FOLDER, JSON_FILE, "fit")
if __name__ == "__main__":
    # 只有当此文件作为主程序运行时，才会执行以下代码
    make_activities_file(SQL_FILE, FIT_FOLDER, JSON_FILE, "fit")

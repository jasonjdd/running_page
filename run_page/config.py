import os
from collections import namedtuple

# getting content root directory
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)

OUTPUT_DIR = os.path.join(parent, "activities")
GPX_FOLDER = os.path.join(parent, "GPX_OUT")
TCX_FOLDER = os.path.join(parent, "TCX_OUT")
FIT_FOLDER = os.path.join(parent, "FIT_OUT")
PNG_FOLDER = os.path.join(parent, "PNG_OUT")
ENDOMONDO_FILE_DIR = os.path.join(parent, "Workouts")
FOLDER_DICT = {
    "gpx": GPX_FOLDER,
    "tcx": TCX_FOLDER,
    "fit": FIT_FOLDER,
}
SQL_FILE = os.path.join(parent, "run_page", "data.db")
JSON_FILE = os.path.join(parent, "src", "static", "activities.json")
SYNCED_FILE = os.path.join(parent, "imported.json")


BASE_TIMEZONE = "Asia/Shanghai"
UTC_TIMEZONE = "UTC"

start_point = namedtuple("start_point", "lat lon")
run_map = namedtuple("polyline", "summary_polyline")

# add more type here
TYPE_DICT = {
    "running": "Run",
    "RUN": "Run",
    "Run": "Run",
    "run": "Run",
    "generic_running": "Run",
    "track_running": "Run",
    "indoor_running": "Run",
    "trail_running": "Trail Run",
    "strength_training_training": "Train",
    "strength_training": "Train",
    "generic": "Train",
    "floor_climbing": "Train",
    "jump_rope": "JumpRope",
    "generic_jump_rope": "JumpRope",
    "cycling": "Ride",
    "CYCLING": "Ride",
    "riding": "Ride",
    "Ride": "Ride",
    "generic_cycling": "Ride",
    "open_water_swimming": "Swim",
    "road_biking": "Ride",
    "road_cycling": "Ride",
    "VirtualRide": "VirtualRide",
    "indoor_cycling": "Indoor Ride",
    "walking": "Walk",
    "Walk": "Walk",
    "hiking": "Hike",
    "Hike": "Hike",
    "swimming": "Swim",
    "Swim": "Swim",
    "lap_swimming": "Swim",
    "trainning": "Train",
    "rowing": "Rowing",
    "RoadTrip": "RoadTrip",
    "flight": "Flight",
    "kayaking": "Kayaking",
    "Snowboard": "Snowboard",
    "resort_skiing_snowboarding_ws": "Ski",  # garmin
    "AlpineSki": "Ski",  # strava
    "Ski": "Ski",
}

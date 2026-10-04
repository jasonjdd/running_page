import datetime
import random
import string

from geopy.geocoders import Nominatim, options
from sqlalchemy import (
    Column,
    Float,
    Integer,
    Interval,
    String,
    create_engine,
    inspect,
    text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


# random user name 8 letters
def randomword():
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for i in range(4))


options.default_user_agent = "running_page"
# reverse the location (lat, lon) -> location detail
g = Nominatim(user_agent=randomword())


ACTIVITY_KEYS = [
    "run_id",
    "name",
    "distance",
    "moving_time",
    "type",
    "subtype",
    "start_date",
    "start_date_local",
    "location_country",
    "summary_polyline",
    "average_heartrate",
    "average_speed",
    "elevation_gain",
    "workout_name",
]

SPORT_NAME_MAP = {
    "Run": "跑步",
    "running": "跑步",
    "Trail Run": "越野跑",
    "Train": "力量训练",
    "training": "力量训练",
    "Ride": "骑行",
    "cycling": "骑行",
    "Indoor Ride": "室内骑行",
    "VirtualRide": "虚拟骑行",
    "Walk": "步行",
    "walking": "步行",
    "Hike": "徒步",
    "hiking": "徒步",
    "Swim": "游泳",
    "swimming": "游泳",
    "JumpRope": "跳绳",
    "Rowing": "划船",
    "Ski": "滑雪",
    "skiing": "滑雪",
    "Snowboard": "单板滑雪",
}


def generated_activity_name(location_country, sport_type):
    location = (
        str(location_country or "")
        .strip()
        .replace("，", ",")
        .replace(":", ",")
        .replace("：", ",")
    )
    parts = [
        part.strip() for part in location.split(",") if part.strip()
    ]
    place = next(
        (
            part
            for part in reversed(parts)
            if part.endswith(("市", "县", "自治州", "特别行政区"))
        ),
        None,
    )
    if not place and parts:
        place = parts[-3] if len(parts) >= 3 else parts[0]
    if place and place.lower() in {"china", "中国"}:
        place = None

    sport = str(sport_type or "").strip()
    sport_name = SPORT_NAME_MAP.get(sport, sport)
    if place and sport_name:
        return f"{place} · {sport_name}"
    return place or sport_name


class Activity(Base):
    __tablename__ = "activities"

    run_id = Column(Integer, primary_key=True)
    name = Column(String)
    distance = Column(Float)
    moving_time = Column(Interval)
    elapsed_time = Column(Interval)
    type = Column(String)
    subtype = Column(String)
    start_date = Column(String)
    start_date_local = Column(String)
    location_country = Column(String)
    summary_polyline = Column(String)
    average_heartrate = Column(Float)
    average_speed = Column(Float)
    elevation_gain = Column(Float)
    workout_name = Column(String)
    streak = None

    def to_dict(self):
        out = {}
        for key in ACTIVITY_KEYS:
            attr = getattr(self, key)
            if isinstance(attr, (datetime.timedelta, datetime.datetime)):
                out[key] = str(attr)
            else:
                out[key] = attr

        if self.streak:
            out["streak"] = self.streak

        return out


def update_or_create_activity(session, run_activity):
    created = False
    try:
        workout_name = getattr(run_activity, "workout_name", "")
        has_workout_name = bool(str(workout_name or "").strip())
        activity = (
            # session.query(Activity).filter_by(run_id=int(run_activity.id)).first()
            session.query(Activity)
            .filter_by(start_date_local=run_activity.start_date_local)
            .first()
        )

        current_elevation_gain = 0.0  # default value

        # https://github.com/stravalib/stravalib/blob/main/src/stravalib/strava_model.py#L639C1-L643C41
        if (
            hasattr(run_activity, "total_elevation_gain")
            and run_activity.total_elevation_gain is not None
        ):
            current_elevation_gain = float(run_activity.total_elevation_gain)
        elif (
            hasattr(run_activity, "elevation_gain")
            and run_activity.elevation_gain is not None
        ):
            current_elevation_gain = float(run_activity.elevation_gain)

        if not activity:
            start_point = run_activity.start_latlng
            location_country = getattr(run_activity, "location_country", "")
            # or China for #176 to fix
            if not location_country and start_point or location_country == "China":
                try:
                    location_country = str(
                        g.reverse(
                            f"{start_point.lat}, {start_point.lon}",
                            language="zh-CN",  # type: ignore
                            timeout=15,
                        )
                    )
                # limit (only for the first time)
                except Exception:  # noqa: BLE001
                    try:
                        location_country = str(
                            g.reverse(
                                f"{start_point.lat}, {start_point.lon}",
                                language="zh-CN",  # type: ignore
                                timeout=15,
                            )
                        )
                    except Exception:  # noqa: S110, BLE001
                        pass

            activity = Activity(
                run_id=run_activity.id,
                name=(
                    run_activity.name
                    if has_workout_name
                    else generated_activity_name(location_country, run_activity.type)
                ),
                distance=run_activity.distance,
                moving_time=run_activity.moving_time,
                elapsed_time=run_activity.elapsed_time,
                type=run_activity.type,
                subtype=run_activity.subtype,
                start_date=run_activity.start_date,
                start_date_local=run_activity.start_date_local,
                location_country=location_country,
                average_heartrate=run_activity.average_heartrate,
                average_speed=float(run_activity.average_speed),
                elevation_gain=current_elevation_gain,
                summary_polyline=(
                    run_activity.map and run_activity.map.summary_polyline or ""
                ),
                workout_name=getattr(run_activity, "workout_name", ""),
            )
            session.add(activity)
            created = True
        else:
            activity.distance = float(run_activity.distance)
            activity.moving_time = run_activity.moving_time
            activity.elapsed_time = run_activity.elapsed_time
            activity.type = run_activity.type
            activity.subtype = run_activity.subtype
            activity.average_heartrate = run_activity.average_heartrate
            activity.average_speed = float(run_activity.average_speed)
            activity.elevation_gain = current_elevation_gain
            activity.workout_name = workout_name
            activity.summary_polyline = (
                run_activity.map and run_activity.map.summary_polyline or ""
            )
            location_country = (
                activity.location_country
                or getattr(run_activity, "location_country", "")
            )
            activity.name = (
                run_activity.name
                if has_workout_name
                else generated_activity_name(location_country, run_activity.type)
            )
    except Exception as e:  # noqa: BLE001
        print(f"something wrong with {run_activity.id}")
        print(str(e))

    return created


def add_missing_columns(engine, model):
    inspector = inspect(engine)
    table_name = model.__tablename__
    columns = {col["name"] for col in inspector.get_columns(table_name)}
    missing_columns = []

    for column in model.__table__.columns:
        if column.name not in columns:
            missing_columns.append(column)
    if missing_columns:
        with engine.connect() as conn:
            for column in missing_columns:
                column_type = str(column.type)
                conn.execute(
                    text(
                        f"ALTER TABLE {table_name} ADD COLUMN {column.name} {column_type}"
                    )
                )


def init_db(db_path):
    engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)

    # check missing columns
    add_missing_columns(engine, Activity)

    sm = sessionmaker(bind=engine)
    session = sm()
    # apply the changes
    session.commit()
    return session

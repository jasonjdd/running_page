import importlib
from datetime import timedelta
from pathlib import Path
from types import SimpleNamespace

import polyline
import pytest


@pytest.fixture
def generator(monkeypatch):
    monkeypatch.syspath_prepend(str(Path(__file__).parent / "run_page"))
    monkeypatch.delenv("GENERATE_INDOOR_ROUTES", raising=False)
    return importlib.import_module("generator")


def _activities():
    return [
        {
            "run_id": 1,
            "distance": 2000,
            "type": "Run",
            "subtype": "Run",
            "summary_polyline": polyline.encode(
                [(30.0 + i * 0.005, 120.0) for i in range(5)]
            ),
            "location_country": "Outdoor location",
        },
        {
            "run_id": 2,
            "distance": 1000,
            "type": "Run",
            "subtype": "Run",
            "summary_polyline": None,
            "location_country": None,
        },
    ]


def test_update_or_create_generates_name_when_workout_name_is_empty(
    generator, tmp_path
):
    session = generator.init_db(tmp_path / "activities.db")
    activity = SimpleNamespace(
        id=1,
        name="strength_training by garmin",
        distance=5000,
        moving_time=timedelta(minutes=30),
        elapsed_time=timedelta(minutes=32),
        type="Run",
        subtype="Run",
        start_date="2026-01-01 04:00:00",
        start_date_local="2026-01-01 12:00:00",
        start_latlng=None,
        location_country="杭州市, 浙江省, 中国",
        average_heartrate=140,
        average_speed=2.7,
        elevation_gain=10,
        map=SimpleNamespace(summary_polyline=""),
        workout_name="  ",
    )
    try:
        assert generator.update_or_create_activity(session, activity)
        session.commit()
        saved = session.query(generator.Activity).one()
        assert saved.name == "杭州市 · 跑步"

        activity.type = "Walk"
        activity.name = "another imported name"
        assert not generator.update_or_create_activity(session, activity)
        session.commit()
        assert saved.name == "杭州市 · 步行"

        activity.workout_name = "晨间训练"
        activity.name = "FIT activity name"
        assert not generator.update_or_create_activity(session, activity)
        session.commit()
        assert saved.name == "FIT activity name"
    finally:
        session.close()
        session.bind.dispose()


def test_load_regenerates_names_for_existing_activities(generator, tmp_path):
    app = generator.Generator(tmp_path / "activities.db")
    date = "2026-01-01 12:00:00"
    try:
        app.session.add(
            generator.Activity(
                run_id=1,
                name="old imported label",
                distance=5000,
                moving_time=timedelta(minutes=30),
                elapsed_time=timedelta(minutes=32),
                type="Run",
                subtype="Run",
                start_date=date,
                start_date_local=date,
                location_country="杭州市, 浙江省, 中国",
                summary_polyline="",
                average_heartrate=140,
                average_speed=2.7,
                elevation_gain=10,
                workout_name="",
            )
        )
        app.session.commit()

        result = app.load()

        assert result[0]["name"] == "杭州市 · 跑步"
        assert app.session.get(generator.Activity, 1).name == "杭州市 · 跑步"
    finally:
        app.session.close()
        app.session.bind.dispose()


@pytest.mark.parametrize(
    ("workout_mesgs", "expected_name"),
    [
        ([{"wkt_name": "周末长跑"}, {"wkt_name": "备用训练"}], "周末长跑"),
        ([{"wkt_name": ""}], ""),
        (None, ""),
    ],
)
def test_fit_workout_name_is_preserved_in_activity(
    generator, workout_mesgs, expected_name
):
    from gpxtrackposter.track import Track

    fit_messages = {
        "session_mesgs": [
            {
                "start_time": 1_158_792_173,
                "total_elapsed_time": 1800,
                "total_distance": 5000,
                "sport": "running",
                "sub_sport": "generic",
                "total_moving_time": 1750,
                "avg_speed": 2.85,
            }
        ],
        "record_mesgs": [],
    }
    if workout_mesgs is not None:
        fit_messages["workout_mesgs"] = workout_mesgs

    track = Track()
    track._load_fit_data(fit_messages)

    assert track.workout_name == expected_name
    assert track.to_namedtuple("fit").workout_name == expected_name


@pytest.mark.parametrize("subtype", ["Run", "treadmill", "indoor"])
@pytest.mark.parametrize("filter_before_saving", [False, True])
def test_load_preserves_source_routes_and_missing_gps(
    generator, monkeypatch, tmp_path, subtype, filter_before_saving
):
    monkeypatch.setattr(generator, "IGNORE_BEFORE_SAVING", filter_before_saving)
    activities = _activities()
    activities[1]["subtype"] = subtype
    app = generator.Generator(tmp_path / "activities.db")
    try:
        for activity in activities:
            date = f"2026-01-0{activity['run_id']} 12:00:00"
            app.session.add(
                generator.Activity(**activity, start_date=date, start_date_local=date)
            )
        app.session.commit()

        for _ in range(2):
            result = app.load()
            app.session.expire_all()
            outdoor = app.session.get(generator.Activity, 1)
            indoor = app.session.get(generator.Activity, 2)
            assert outdoor.summary_polyline == activities[0]["summary_polyline"]
            expected_route = activities[0]["summary_polyline"]
            if not filter_before_saving:
                expected_route = generator.filter_out(expected_route)
            assert result[0]["summary_polyline"] == expected_route
            assert result[1]["distance"] == indoor.distance == 1000
            assert result[1]["summary_polyline"] is None
            assert indoor.summary_polyline is None
            assert result[1]["subtype"] == indoor.subtype == subtype
            assert result[1]["location_country"] is None
            assert indoor.location_country is None
    finally:
        app.session.close()
        app.session.bind.dispose()

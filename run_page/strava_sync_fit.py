import argparse
from strava_sync import run_strava_sync
from stravalib.exc import RateLimitTimeout, ActivityUploadFailed

from utils import make_strava_client, get_strava_last_time, upload_file_to_strava


def upload_fit_file_to_strava(client, fit_file):
    try:
        upload_file_to_strava(client, fit_file, "fit")
    except RateLimitTimeout as e:
        timeout = e.timeout
        print(f"Strava API Rate Limit Timeout. Retry in {timeout} seconds")
        print()
        time.sleep(timeout)
        # try previous again
        upload_file_to_strava(client, fit_file, "fit")

    except ActivityUploadFailed as e:
        print(f"Upload fit file {fit_file} failed error {str(e)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("client_id", help="strava client id")
    parser.add_argument("client_secret", help="strava client secret")
    parser.add_argument("refresh_token", help="strava refresh token")
    parser.add_argument("fit_file", help="fit file path")
    options = parser.parse_args()

    client = make_strava_client(
        options.client_id, options.client_secret, options.refresh_token
    )

    upload_fit_file_to_strava(client, options.fit_file)
    # try:
    #     upload_file_to_strava(client, options.fit_file, "fit")
    # except RateLimitTimeout as e:
    #     timeout = e.timeout
    #     print(f"Strava API Rate Limit Timeout. Retry in {timeout} seconds")
    #     print()
    #     time.sleep(timeout)
    #     # try previous again
    #     upload_file_to_strava(client, options.fit_file, "fit")

    # except ActivityUploadFailed as e:
    #     print(f"Upload fit file {options.fit_file} failed error {str(e)}")

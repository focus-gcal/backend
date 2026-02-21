import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / "../env/.env")

SECRET_KEY = os.environ["SECRET_KEY"]

DB = {
    "NAME": os.environ["POSTGRES_DB"],
    "USER": os.environ["POSTGRES_USER"],
    "PASSWORD": os.environ["POSTGRES_PASSWORD"],
    "HOST": os.environ.get("DB_HOST", "localhost"),
    "PORT": os.environ.get("DB_PORT", "5432"),
}

REDIS = {
    "URL": f"redis://{os.environ.get('REDIS_HOST', 'localhost')}:{os.environ.get('REDIS_PORT', '6379')}",
    "HOST": os.environ.get("REDIS_HOST", "localhost"),
    "PORT": os.environ.get("REDIS_PORT", "6379"),
}

OAUTH = {
    "CLIENT_ID": os.environ["OAUTH_CLIENT_ID"],
    "CLIENT_SECRET": os.environ["OAUTH_CLIENT_SECRET"],
    "REDIRECT_URI": os.environ["OAUTH_REDIRECT_URI"],
}

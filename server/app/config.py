import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_FILES = [ROOT_DIR / "server" / ".env", ROOT_DIR / ".env"]
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def _load_env_file() -> None:
    for env_file in ENV_FILES:
        if not env_file.exists():
            continue

        for raw_line in env_file.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


_load_env_file()


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if value:
        return value
    raise RuntimeError(f"Missing required environment variable: {name}")


def get_cors_origins():
    return [
        "https://uzhavar-greens.netlify.app",
        "http://localhost:5173"
    ]


DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

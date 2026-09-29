import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))


def _default_database_uri():
    # Use the project root so the database path is predictable on every OS.
    db_dir = os.path.join(ROOT_DIR, "instance")
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.abspath(os.path.join(db_dir, "fibrea.db"))
    # SQLite URI for an absolute path: sqlite:/// + absolute/path (forward slashes).
    return "sqlite:///" + db_path.replace("\\", "/")


def _database_uri():
    uri = os.getenv("DATABASE_URL")
    if not uri:
        return _default_database_uri()
    # Rutas SQLite relativas se resuelven desde la raíz del proyecto, no desde donde se ejecuta.
    prefix = "sqlite:///"
    if uri.startswith(prefix) and not os.path.isabs(uri[len(prefix):]):
        path = os.path.join(ROOT_DIR, uri[len(prefix):])
        os.makedirs(os.path.dirname(path), exist_ok=True)
        return prefix + path.replace("\\", "/")
    # Railway/Heroku entregan "postgres://" o "postgresql://"; SQLAlchemy necesita el driver explícito.
    for legacy in ("postgres://", "postgresql://"):
        if uri.startswith(legacy):
            return "postgresql+psycopg://" + uri[len(legacy):]
    return uri


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fibrea-dev-secret")
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 12 * 1024 * 1024  # fotos subidas en "Crea tu Fibrea"
    SQLALCHEMY_ENGINE_OPTIONS = (
        {"connect_args": {"check_same_thread": False}}
        if SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}
    )

import subprocess


def main() -> None:
    subprocess.run(["alembic", "upgrade", "head"], check=True)

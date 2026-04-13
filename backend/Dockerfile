FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install uv

COPY . .

RUN uv sync --no-dev

FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH"

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/app /app/app
COPY --from=builder /app/alembic /app/alembic
COPY --from=builder /app/alembic.ini /app/alembic.ini

CMD ["python", "-c", "from app.main import run; run()"]

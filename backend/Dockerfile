FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install uv && uv sync

CMD ["uv", "run", "python", "-c", "from app.main import run; run()"]

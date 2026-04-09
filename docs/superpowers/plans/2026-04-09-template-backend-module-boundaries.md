# 模板后端模块边界重构 实现计划

> **对于 agent 型执行者：** 必需子 skill：优先使用 `superpowers-subagent-driven-development`，否则使用 `superpowers-executing-plans` 逐任务实施本计划。所有步骤使用 `- [ ]` 复选框格式追踪。

**目标：** 将模板后端从“技术层 + 模块”混合结构重构为 `main.py + bootstrap + platform + shared + modules/*`，让数据库和配置等运行时基础设施归 `platform`，轻量公共代码归 `shared`，业务能力归各自模块。

**架构：** `bootstrap` 只负责应用装配；`platform` 持有 settings、数据库会话、模型注册和外部集成；`shared` 持有轻量错误类型与响应 helper；`modules/*` 持有 router、service、repository、models、worker。Alembic 通过显式模型注册感知各模块模型。

**技术栈：** FastAPI、Pydantic Settings、SQLAlchemy、Alembic、pytest、uv、pnpm

---

## 文件结构

本次实施会新增或修改这些关键文件：

- 创建：`backend/app/bootstrap/__init__.py`
- 创建：`backend/app/bootstrap/app.py`
- 创建：`backend/app/bootstrap/routing.py`
- 创建：`backend/app/bootstrap/lifespan.py`
- 创建：`backend/app/platform/__init__.py`
- 创建：`backend/app/platform/config/__init__.py`
- 创建：`backend/app/platform/config/settings.py`
- 创建：`backend/app/platform/db/__init__.py`
- 创建：`backend/app/platform/db/base.py`
- 创建：`backend/app/platform/db/session.py`
- 创建：`backend/app/platform/db/model_registry.py`
- 创建：`backend/app/platform/integrations/__init__.py`
- 创建：`backend/app/platform/integrations/cache_client.py`
- 创建：`backend/app/shared/__init__.py`
- 创建：`backend/app/shared/errors/__init__.py`
- 创建：`backend/app/shared/errors/exceptions.py`
- 创建：`backend/app/shared/errors/handlers.py`
- 创建：`backend/app/shared/http/__init__.py`
- 创建：`backend/app/shared/http/response.py`
- 创建：`backend/app/modules/example/models.py`
- 创建：`backend/app/modules/example/worker.py`
- 创建：`backend/tests/bootstrap/test_app_factory.py`
- 修改：`backend/app/main.py`
- 修改：`backend/app/modules/example/repository.py`
- 修改：`backend/app/modules/example/service.py`
- 修改：`backend/alembic/env.py`
- 修改：`backend/app/scripts/migrate.py`
- 修改：`backend/tests/contracts/test_example.py`
- 修改：`backend/tests/contracts/test_health.py`
- 修改：`backend/tests/services/test_config.py`
- 修改：`backend/tests/services/test_example_service.py`
- 修改：`README.md`
- 删除：`backend/app/api/router.py`
- 删除：`backend/app/core/config.py`
- 删除：`backend/app/core/errors.py`
- 删除：`backend/app/core/response.py`
- 删除：`backend/app/core/deps.py`
- 删除：`backend/app/db/base.py`
- 删除：`backend/app/db/session.py`
- 删除：`backend/app/db/models/example.py`
- 删除：`backend/app/integrations/cache_client.py`
- 删除：`backend/app/workers/example_worker.py`

### 文件职责约束

- `bootstrap/*` 只能做应用装配，不写业务规则。
- `platform/*` 只能放运行时基础设施，不出现 `example`、`health` 等业务语义。
- `shared/*` 只能放轻量公共代码，不直接持有数据库或缓存连接。
- `modules/example/*` 必须拥有自己的 model、repository、service、router。

## 任务 1: 用失败测试锁定新的 bootstrap 入口

**文件：**
- 创建：`backend/tests/bootstrap/test_app_factory.py`
- 创建：`backend/app/bootstrap/__init__.py`
- 创建：`backend/app/bootstrap/app.py`
- 创建：`backend/app/bootstrap/routing.py`
- 创建：`backend/app/bootstrap/lifespan.py`
- 修改：`backend/app/main.py`

- [ ] **步骤 1: 先写失败测试**

`backend/tests/bootstrap/test_app_factory.py`

```python
from fastapi.testclient import TestClient

from app.bootstrap.app import create_app


def test_create_app_registers_template_routes() -> None:
    app = create_app()
    client = TestClient(app)

    assert client.get("/api/health").status_code == 200
    assert client.get("/api/example").status_code == 200
```

- [ ] **步骤 2: 运行测试确认红灯**

运行：`cd backend && uv run pytest tests/bootstrap/test_app_factory.py -v`

预期：
- 因为 `app.bootstrap.app` 不存在而失败

- [ ] **步骤 3: 写最小实现创建 bootstrap**

`backend/app/bootstrap/app.py`

```python
from fastapi import FastAPI

from app.bootstrap.lifespan import lifespan
from app.bootstrap.routing import register_routes
from app.platform.config.settings import settings
from app.shared.errors.handlers import install_error_handlers


def create_app() -> FastAPI:
    app = FastAPI(title=settings.project_name, lifespan=lifespan)
    install_error_handlers(app)
    register_routes(app)
    return app
```

`backend/app/bootstrap/routing.py`

```python
from fastapi import APIRouter, FastAPI

from app.modules.example.router import router as example_router
from app.modules.health.router import router as health_router


def register_routes(app: FastAPI) -> None:
    api_router = APIRouter(prefix="/api")
    api_router.include_router(health_router)
    api_router.include_router(example_router)
    app.include_router(api_router)
```

`backend/app/bootstrap/lifespan.py`

```python
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
```

`backend/app/bootstrap/__init__.py`

```python
from app.bootstrap.app import create_app

__all__ = ["create_app"]
```

`backend/app/main.py`

```python
import uvicorn

from app.bootstrap.app import create_app
from app.platform.config.settings import settings

app = create_app()


def run_dev() -> None:
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.api_port, reload=True)


def run() -> None:
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.api_port)
```

- [ ] **步骤 4: 运行测试确认绿灯**

运行：`cd backend && uv run pytest tests/bootstrap/test_app_factory.py tests/contracts/test_health.py tests/contracts/test_example.py -v`

预期：
- 3 个测试文件全部通过

## 任务 2: 用失败测试迁移配置与基础设施到 platform

**文件：**
- 创建：`backend/app/platform/__init__.py`
- 创建：`backend/app/platform/config/__init__.py`
- 创建：`backend/app/platform/config/settings.py`
- 创建：`backend/app/platform/db/__init__.py`
- 创建：`backend/app/platform/db/base.py`
- 创建：`backend/app/platform/db/session.py`
- 创建：`backend/app/platform/db/model_registry.py`
- 创建：`backend/app/platform/integrations/__init__.py`
- 创建：`backend/app/platform/integrations/cache_client.py`
- 修改：`backend/tests/services/test_config.py`
- 修改：`backend/alembic/env.py`
- 修改：`backend/app/scripts/migrate.py`
- 删除：`backend/app/core/config.py`
- 删除：`backend/app/db/base.py`
- 删除：`backend/app/db/session.py`
- 删除：`backend/app/integrations/cache_client.py`

- [ ] **步骤 1: 先改配置测试到新路径**

`backend/tests/services/test_config.py`

```python
from pathlib import Path

from app.platform.config.settings import Settings


def test_settings_load_env_file_values(tmp_path: Path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "PROJECT_NAME=aged-demo",
                "API_PORT=3001",
                "DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:55432/aged_demo",
                "REDIS_URL=redis://127.0.0.1:56379/0",
            ]
        ),
        encoding="utf-8",
    )

    settings = Settings(_env_file=env_file)

    assert settings.project_name == "aged-demo"
    assert settings.api_port == 3001
```

- [ ] **步骤 2: 运行测试确认红灯**

运行：`cd backend && uv run pytest tests/services/test_config.py -v`

预期：
- 因为 `app.platform.config.settings` 不存在而失败

- [ ] **步骤 3: 实现 platform/config 和 platform/db**

`backend/app/platform/config/settings.py`

```python
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[4] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "aged-fullstack-template"
    api_port: int = 3000
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@127.0.0.1:5432/aged_fullstack_template"
    )
    redis_url: str = "redis://127.0.0.1:6379/0"


settings = Settings()
```

`backend/app/platform/db/base.py`

```python
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

`backend/app/platform/db/session.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.platform.config.settings import settings

engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
```

`backend/app/platform/db/model_registry.py`

```python
from app.modules.example.models import ExampleRecord

__all__ = ["ExampleRecord"]
```

`backend/app/platform/integrations/cache_client.py`

```python
from redis import Redis

from app.platform.config.settings import settings


def create_cache_client() -> Redis:
    return Redis.from_url(settings.redis_url)
```

- [ ] **步骤 4: 调整 Alembic 与迁移脚本的导入**

`backend/alembic/env.py`

```python
from __future__ import annotations

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.platform.config.settings import settings
from app.platform.db.base import Base
from app.platform.db import model_registry  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)
target_metadata = Base.metadata
```

`backend/app/scripts/migrate.py`

```python
from alembic import command
from alembic.config import Config

from app.platform.config.settings import settings


def main() -> None:
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(config, "head")
```

- [ ] **步骤 5: 删除旧基础设施文件**

```bash
rm backend/app/core/config.py
rm backend/app/db/base.py
rm backend/app/db/session.py
rm backend/app/integrations/cache_client.py
```

- [ ] **步骤 6: 运行测试确认绿灯**

运行：`cd backend && uv run pytest tests/services/test_config.py tests/bootstrap/test_app_factory.py -v`

预期：
- 2 个测试文件全部通过

## 任务 3: 用失败测试把轻量公共代码收敛到 shared

**文件：**
- 创建：`backend/app/shared/__init__.py`
- 创建：`backend/app/shared/errors/__init__.py`
- 创建：`backend/app/shared/errors/exceptions.py`
- 创建：`backend/app/shared/errors/handlers.py`
- 创建：`backend/app/shared/http/__init__.py`
- 创建：`backend/app/shared/http/response.py`
- 删除：`backend/app/core/errors.py`
- 删除：`backend/app/core/response.py`
- 删除：`backend/app/core/deps.py`

- [ ] **步骤 1: 先让 bootstrap 依赖 shared 里的错误处理与响应 helper**

最小目标：
- `backend/app/bootstrap/app.py` 从 `app.shared.errors.handlers` 导入 `install_error_handlers`
- 模块或后续代码从 `app.shared.http.response` 导入 `success_response`

运行：`cd backend && uv run pytest tests/bootstrap/test_app_factory.py -v`

预期：
- 因为 shared 目录尚未创建而失败

- [ ] **步骤 2: 写最小 shared 实现**

`backend/app/shared/errors/exceptions.py`

```python
class AppError(Exception):
    def __init__(self, *, error_type: str, message: str, status_code: int) -> None:
        super().__init__(message)
        self.error_type = error_type
        self.message = message
        self.status_code = status_code
```

`backend/app/shared/errors/handlers.py`

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.shared.errors.exceptions import AppError


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"type": exc.error_type, "message": exc.message}},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"error": {"type": "internal_error", "message": str(exc)}},
        )
```

`backend/app/shared/http/response.py`

```python
def success_response(data: object) -> dict[str, object]:
    return {"data": data}
```

- [ ] **步骤 3: 删除旧的 core 错误与响应文件**

```bash
rm backend/app/core/errors.py
rm backend/app/core/response.py
rm backend/app/core/deps.py
```

- [ ] **步骤 4: 运行测试确认绿灯**

运行：`cd backend && uv run pytest tests/bootstrap/test_app_factory.py tests/contracts/test_health.py tests/contracts/test_example.py -v`

预期：
- 3 个测试文件全部通过

## 任务 4: 用失败测试把 example 补全为完整垂直模块

**文件：**
- 创建：`backend/app/modules/example/models.py`
- 创建：`backend/app/modules/example/worker.py`
- 修改：`backend/app/modules/example/repository.py`
- 修改：`backend/app/modules/example/service.py`
- 修改：`backend/tests/services/test_example_service.py`
- 删除：`backend/app/db/models/example.py`
- 删除：`backend/app/workers/example_worker.py`

- [ ] **步骤 1: 先调整 example 服务测试**

`backend/tests/services/test_example_service.py`

```python
from app.modules.example.service import list_example_items


def test_list_example_items_returns_serialized_items() -> None:
    assert list_example_items() == [
        {"id": "hello", "label": "Hello template"},
        {"id": "customize", "label": "Customize me"},
    ]
```

- [ ] **步骤 2: 运行测试确认红灯**

运行：`cd backend && uv run pytest tests/services/test_example_service.py -v`

预期：
- 因为 repository 还依赖旧模型路径而失败

- [ ] **步骤 3: 把 model 和 worker 收回模块**

`backend/app/modules/example/models.py`

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class ExampleRecord:
    id: str
    label: str
```

`backend/app/modules/example/repository.py`

```python
from app.modules.example.models import ExampleRecord


def list_example_records() -> list[ExampleRecord]:
    return [
        ExampleRecord(id="hello", label="Hello template"),
        ExampleRecord(id="customize", label="Customize me"),
    ]
```

`backend/app/modules/example/worker.py`

```python
def run_example_worker() -> None:
    return None
```

- [ ] **步骤 4: 删除旧 model 和旧 worker**

```bash
rm backend/app/db/models/example.py
rm backend/app/workers/example_worker.py
```

- [ ] **步骤 5: 运行测试确认绿灯**

运行：`cd backend && uv run pytest tests/services/test_example_service.py tests/contracts/test_example.py -v`

预期：
- 2 个测试文件全部通过

## 任务 5: 清理旧目录、更新 README、做全量验证

**文件：**
- 删除：`backend/app/api/router.py`
- 删除：`backend/app/core/`
- 删除：`backend/app/db/`
- 删除：`backend/app/integrations/`
- 删除：`backend/app/workers/`
- 修改：`README.md`

- [ ] **步骤 1: 扫描旧路径残留**

运行：

```bash
rg -n "app\\.core|app\\.db|app\\.integrations|app\\.api\\.router|app\\.workers" backend
```

预期：
- 只剩计划内尚未清理的位置

- [ ] **步骤 2: 删除旧路由与空目录**

```bash
rm backend/app/api/router.py
rmdir backend/app/api 2>/dev/null || true
rmdir backend/app/core 2>/dev/null || true
rmdir backend/app/db/models 2>/dev/null || true
rmdir backend/app/db 2>/dev/null || true
rmdir backend/app/integrations 2>/dev/null || true
rmdir backend/app/workers 2>/dev/null || true
```

- [ ] **步骤 3: 更新 README 目录结构**

将 README 后端目录说明改成：

```text
backend/app/
├─ bootstrap/
├─ platform/
├─ shared/
└─ modules/
```

并补充说明：

```md
后端按业务模块组织，`bootstrap` 负责应用装配，`platform` 负责运行时基础设施，`shared` 仅保留轻量公共代码。
```

- [ ] **步骤 4: 运行后端全量测试**

运行：`cd backend && uv run pytest`

预期：
- 全部通过

- [ ] **步骤 5: 运行仓库全量测试**

运行：`pnpm test`

预期：
- 前端测试通过
- 后端测试通过

- [ ] **步骤 6: 人工检查最终目录**

运行：

```bash
find backend/app -maxdepth 3 -type f | sort
```

预期至少满足：
- 存在 `backend/app/bootstrap/*`
- 存在 `backend/app/platform/*`
- 存在 `backend/app/shared/*`
- 存在 `backend/app/modules/example/models.py`
- 不再存在 `backend/app/api/router.py`
- 不再存在 `backend/app/db/models/example.py`

## 自审检查

- spec 的关键边界 `bootstrap + platform + shared + modules/*` 已全部映射到任务 1-5。
- 没有使用 `TBD`、`TODO`、`稍后实现` 这类占位写法。
- 计划中的导入路径统一使用 `app.bootstrap.*`、`app.platform.*`、`app.shared.*`、`app.modules.*`。

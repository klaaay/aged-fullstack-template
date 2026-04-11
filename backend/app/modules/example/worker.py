import logging

logger = logging.getLogger(__name__)


def run_example_worker() -> None:
    """后台任务扩展点。派生项目可替换为实际的异步任务逻辑。"""
    logger.info("example worker: no-op in baseline template")

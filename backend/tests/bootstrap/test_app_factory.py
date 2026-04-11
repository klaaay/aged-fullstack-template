from app.bootstrap.app import create_app


def test_create_app_registers_template_routes() -> None:
    app = create_app()
    routes = {route.path for route in app.routes}

    assert "/api/health" in routes
    assert "/api/example" in routes

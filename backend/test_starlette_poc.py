"""Test for Starlette PoC application."""
import pytest
from starlette_poc import app, poc

def test_app_exists():
    """Test that the app is created successfully."""
    assert app is not None
    assert hasattr(app, 'routes')

def test_app_has_route():
    """Test that the app has the expected route."""
    routes = app.routes
    assert len(routes) == 1
    assert routes[0].path == '/'
    assert 'POST' in routes[0].methods

@pytest.mark.asyncio
async def test_poc_function_exists():
    """Test that the poc function exists and is async."""
    assert callable(poc)
    import inspect
    assert inspect.iscoroutinefunction(poc)

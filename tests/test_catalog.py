import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture(scope="function")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_read_root(client):
    """Проверка доступности корня API."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_get_categories(client):
    """Проверка получения списка категорий."""
    response = await client.get("/api/v1/catalog/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_products(client):
    """Проверка получения списка товаров."""
    response = await client.get("/api/v1/catalog/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

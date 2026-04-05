# Testing Strategy

## Tooling
- **Testing Runner**: `pytest`
- **Asynchronous Testing**: `pytest-asyncio`
- **HTTP Client**: `httpx`
- **Coverage**: `pytest-cov`

## Coverage Goals
- **Total Coverage**: >= 80% (Mandatory)
- **API Endpoints**: 100% path coverage.

## Writing Tests
1. **Unit Tests**: Test individual functions and model validations.
2. **Integration Tests**: Test database interactions and service layers.
3. **API Tests**: Test the full request-response cycle for each endpoint.

## Execution
Run `pytest` to verify all tests pass.
Use mocks for external services (e.g., Telegram API, Payment Gateways).

# AI Development Rules (Project Constitution)

## Core Principles

1. **Never break existing functionality**: Do not delete or modify existing functions unless explicitly requested. Always ensure backward compatibility.
2. **Code Safety**: Extend code through new modular additions rather than modifying core existing logic.
3. **Preserve API compatibility**: Do not change the JSON structure of responses or the signature of existing endpoints.
4. **No Side Effects**: AI must not modify files and settings that are not directly related to the task.

## Implementation Workflow

1. **Plan FIRST**: For any non-trivial change, create or update an `implementation_plan.md` in the `artifacts/` folder.
2. **Review before modification**: Read all relevant files and subdirectories to understand context.
3. **Atomic commits/changes**: Make logical, modular changes that are easy to review.

## Code Quality Standards

- **Python**: Follow PEP 8. Use `ruff` for linting and `mypy` for static type checking.
- **FastAPI**: Use Pydantic models for validation. Ensure all dependencies are properly injected.
- **Asyncio**: Use `async`/`await` consistently. Avoid blocking calls.

## Testing Rules

1. Every new feature MUST include unit and integration tests.
2. Test coverage must be >= 80%.
3. Run `pytest` and verify success before reporting completion.

## CI/CD and Automation

- All changes must pass static analysis (`ruff`, `mypy`).
- All tests must pass in the local environment first.
- If a migration is needed (Alembic), it must be generated and tested.

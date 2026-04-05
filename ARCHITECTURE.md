# Project Architecture

## Technology Stack
- **Backend**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL (SQLAlchemy / Tortoise ORM / etc. - based on typical FastAPI setups)
- **Validation**: Pydantic v2
- **Testing**: Pytest & Httpx (Async)
- **Frontend (if applicable)**: Next.js / React (Modern visual style)
- **Search**: Meilisearch (optional for catalog)

## Directory Structure
```
/app
  /api           # Endpoint routes
  /models        # Database schemas (Pydantic / DB ORM)
  /services      # Business logic (Telegram Bot handlers, payment logic)
  /repositories  # DB access layer
  /seo           # SEO tools and sitemap generator
  /ai            # AI integration logic
/tests           # Comprehensive tests
/public          # Static assets (robots.txt, llms.txt)
```

## API Guidelines
1. **RESTful standards**: Use appropriate HTTP methods (GET, POST, PUT, DELETE).
2. **Standard Response**: All responses must include a predictable JSON structure.
3. **Dependency Injection**: Use FastAPI `Depends` for authentication and DB connections.
4. **Versioning**: Use `/v1/` prefix for all API routes if possible.

## Data Layer
- All models must be documented with Pydantic Fields.
- Enforce clean relational mapping without cycles.

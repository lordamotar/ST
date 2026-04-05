Если ты используешь **Anigravity** для разработки с AI-агентами, то правильнее не хранить такие правила в одном месте, а **разделить их на несколько файлов**, чтобы агенты:

* видели архитектуру
* соблюдали правила изменения кода
* автоматически запускали тесты
* не ломали существующий функционал

Это стандартная практика в AI-driven разработке.

Ниже **правильная структура**.

---

# 1. Главный файл правил для AI

Создай файл:

```
/AGENTS.md
```

Это **главный файл поведения AI-агентов**.

Именно сюда лучше вставить:

* правила изменения кода
* требования к тестам
* правила архитектуры
* запрет ломать существующий код

Пример структуры:

```
# AI Development Rules

## Core Principles

1. Never break existing functionality
2. Maintain backward compatibility
3. Every new feature must include tests
4. Do not modify database schema without migrations

## Code Safety

- Do not delete existing functions
- Extend code using new modules
- Preserve API compatibility

## Testing Rules

Every feature must include:

- unit tests
- integration tests

Test coverage must be >= 80%.

## CI Rules

All changes must pass:

pytest
ruff
mypy
```

---

# 2. Архитектура проекта

Создай файл:

```
/ARCHITECTURE.md
```

Сюда помещается:

* архитектура FastAPI
* структура папок
* правила API

Пример:

```
Backend: FastAPI
Frontend: Next.js
Database: PostgreSQL
Search: Meilisearch
Cache: Redis
```

---

# 3. SEO правила

Создай файл:

```
/SEO_RULES.md
```

Туда помести:

* sitemap
* structured data
* programmatic SEO

Пример:

```
All pages must include:

title
meta description
canonical
OpenGraph
JSON-LD

Structured data types:

Product
FAQPage
Article
BreadcrumbList
```

---

# 4. AI оптимизация

Создай файл:

```
/AI_OPTIMIZATION.md
```

Там описывается:

* llms.txt
* AI-readable HTML
* API для AI

Пример:

```
All pages must use semantic HTML.

header
nav
main
section
article
footer

Content structure:

H1
H2
lists
short paragraphs
```

---

# 5. Programmatic SEO

Создай файл:

```
/PROGRAMMATIC_SEO.md
```

Там описывается генерация страниц:

```
/city/{city}/tables
/material/{material}/chairs
/color/{color}/sofas
```

---

# 6. Безопасность

Создай файл:

```
/SECURITY.md
```

Пример:

```
Security requirements:

JWT authentication
bcrypt password hashing
rate limiting
CSRF protection
CORS policy
```

---

# 7. Тестирование

Создай файл:

```
/TESTING.md
```

Пример:

```
Testing stack:

pytest
pytest-asyncio
httpx

Coverage >= 80%

Every endpoint must have tests.
```

---

# 8. llms.txt (для AI)

Файл:

```
/public/llms.txt
```

Пример:

```
User-agent: *
Allow: /

AI-Content: allowed
AI-Training: allowed

Preferred-Content:
/guide
/catalog
/blog
/faq
```

---

# 9. robots.txt

Файл:

```
/public/robots.txt
```

---

# 10. sitemap

Файл генерируется:

```
/sitemap.xml
```

через FastAPI.

---

# Идеальная структура проекта

```
project/

AGENTS.md
ARCHITECTURE.md
SEO_RULES.md
AI_OPTIMIZATION.md
PROGRAMMATIC_SEO.md
SECURITY.md
TESTING.md

app/
api/
models/
services/
repositories/
seo/
ai/

tests/

public/
robots.txt
llms.txt
```

---

# Очень важный момент

Главный файл для AI-агентов:

```
AGENTS.md
```

Именно его **Anigravity, Cursor и другие AI-IDE читают первым**.

Там должны быть **все правила разработки**.

---

💡 Если хочешь, я могу сделать ещё более мощную вещь — **“AI Project Constitution”** (единый файл ~300 строк), который:

* полностью управляет поведением AI-агентов
* не даёт им ломать код
* заставляет писать тесты
* автоматически соблюдать архитектуру.

Это реально **одна из самых полезных вещей при AI-разработке больших проектов**.

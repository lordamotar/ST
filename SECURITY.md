# Security & Auth Policies

## Authentication System
- Use **JWT (JSON Web Tokens)** with a secure `SECRET_KEY`.
- Tokens must have a short TTL (Time To Live).
- Use `Passlib` (bcrypt) for password hashing.

## Network Security
- **Rate Limiting**: Apply to all authentication and sensitive endpoints.
- **CORS Policy**: Restrict access to authorized origins only.
- **HTTPS**: Enforce SSL for all production traffic.

## Data Protection
- Use Environment Variables for secrets (not `.env` in git).
- Strictly validate all user inputs with Pydantic.
- Sanitize database queries to prevent SQL injection.

## Authorization
- Role-based access control (RBAC).
- `Admin` vs `User` vs `Master` (for the bot ecosystem).

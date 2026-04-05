# AI Optimization Principles

## Semantic Content
All HTML generated for public display must use correct semantic markup.

### Structural Requirements
- `header`, `nav`, `main`, `section`, `article`, `footer`.
- `H1` (exactly one per page).
- `H2` for primary sub-sections, `H3` for features/details.
- Lists and short paragraphs for readability.

## AI Readability (llms.txt)
Maintain `/public/llms.txt` to help AI models crawling the site.

### Goals
- Expose preferred content for AI models.
- Clearly define allowed and disallowed content for training.

## API Consistency
Maintain stable API responses and schema files (`openapi.json`) for agent integration.
Use comprehensive docstrings and type hints throughout the Python codebase.

# Programmatic SEO Strategy

## URL Structure Patterns
Generate pages based on city + service or city + product patterns.

### Dynamic URL Examples
- `/city/{city}/services`
- `/service/{service}/in-{city}`
- `/catalog/{category}/material/{material}`

## Page Generation Rules
1. **Dynamic Content**: Each page must have unique context to avoid "Thin Content" penalties.
2. **Context Enrichment**: Inject localized data (e.g., local pricing, providers in {city}).
3. **Internal Linking**: Automate cross-linking between programmatic pages to distribute link equity.

## Performance
Programmatic pages must be generated with server-side rendering (SSR) or incremental static regeneration (ISR) for maximum crawlability.
All assets must be optimized (WebP format, lazy loading).

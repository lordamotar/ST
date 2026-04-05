# SEO Rules & Metadata Requirements

## Global Requirements
All dynamic pages must include metadata.

### Mandatory Metadata
- **Title (60 chars max)**: Primary keyword + Brand.
- **Meta Description (160 chars max)**: Compelling summary + Call to Action.
- **Canonical URL**: Self-referencing by default.
- **OpenGraph**: `og:title`, `og:description`, `og:type`, `og:image`.
- **JSON-LD**: Use structured data types below.

## Structured Data (Schema.org)
Implement these JSON-LD blocks where relevant:
- **Product**: For individual items/offerings.
- **FAQPage**: For questions and answers sections.
- **Article / BlogPosting**: For information/blog content.
- **BreadcrumbList**: For proper navigation pathing.

## Sitemap Integration
The sitemap should be automatically generated via FastAPI `/sitemap.xml` endpoint and registered in Google Search Console.
Update frequently when new programmatic pages are created.

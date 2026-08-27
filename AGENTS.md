<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MathGenealogy Design Rules

- MathGenealogy is search-first: search is the primary interface and profile pages retain a global search field.
- Minimalism is a product requirement. Do not add functionality, visual decoration, or page sections unless requested.
- The genealogy is the main visual feature. Preserve it as an academic family tree, never a generic graph editor.
- Avoid dashboard and SaaS design patterns, sidebars, marketing sections, decorative metrics, gradients, and excessive cards.
- Preserve excellent typography, whitespace, restrained borders, and a single muted accent color.
- Mathematicians and academic relationships remain separate entities. Relationships reference IDs only.
- Prefer a small, understandable architecture. Keep data and graph traversal outside React components.

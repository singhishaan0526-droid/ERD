# Repository Engineering Rules

- Inspect existing code before creating new files.
- Reuse existing components, utilities, and services where appropriate.
- Never invent package names, APIs, exports, or configuration options.
- Verify new dependencies against the correct package registry and official documentation.
- Do not create a replacement implementation before checking for an existing one.
- Avoid duplicate components, utilities, styles, and business logic.
- Do not delete potentially used code without checking its references.
- Run the relevant tests and production build after changes.
- Report dependencies added or removed and explain why.
- Keep changes limited to the requested feature.
- Never commit secrets, database credentials, or environment files.


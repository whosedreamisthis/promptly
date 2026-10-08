# DevStash

A developer knowledge hub for snippets, commands, prompts,notes, files, images, links, and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md
- @context/colors.md

## Neon Database (MCP)

When using the Neon MCP tools, always work against:

- **Project:** `dev-stash` (ID: `divine-thunder-50995922`)
- **Branch:** `development` (ID: `br-morning-fog-b4oii269`)

Rules:

- Pass `projectId: divine-thunder-50995922` and `branchId: br-morning-fog-b4oii269` explicitly on every Neon MCP call. The project's default branch is `production`, so if you leave out the branch ID, the call runs against production.
- **Never touch the `production` branch** (ID: `br-steep-truth-b4hn62ho`) unless I explicitly say "production" in my request. That covers reads, writes, migrations, resets and deletes.
- Don't use any other Neon project unless I name it.
- If a request is ambiguous about which branch to use, use `development` or ask me. Never fall back to production.

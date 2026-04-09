# Hooks Guide

This folder explains minimal hook-style automation for agent workflows.

Concepts:

- before-edit: run checks or prepare context before changes.
- after-edit: format code, run lint/type checks, or summarize updates.
- on-commit: verify task completion and link tests.

Keep hooks simple:

- hook logic should be explicit and easy to reason about.
- avoid rules that block progress unless they catch real risks.
- use hooks to keep the workspace stable and reduce repeated instructions.

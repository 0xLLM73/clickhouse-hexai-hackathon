# ClickHouse + Hex AI Hackathon

Public hackathon project for building with ClickHouse and Hex AI.

## Sprint Principles

- Keep secrets out of git. Use `.env` locally and document required values in `.env.example`.
- Prefer small, working commits over large rewrites.
- Ship useful demos first, then harden what matters.
- Avoid adding process gates that block fast iteration during the hackathon.

## Getting Started

This repository is intentionally lightweight until the app stack is chosen.

1. Clone the repo.
2. Copy `.env.example` to `.env`.
3. Fill in local credentials and API keys.
4. Add project setup commands here as the stack takes shape.

## Security Notes

- Do not commit API keys, database credentials, service tokens, exported datasets with private data, or local `.env` files.
- Rotate any secret immediately if it is accidentally committed or shared.
- Use least-privilege ClickHouse credentials where practical during the sprint.
- Keep public demo data synthetic or approved for public release.

## Hackathon Workflow

- Commit directly to `main` when speed matters.
- Use pull requests for risky changes, shared interfaces, or anything touching deployment/security.
- Record setup decisions in this README as they become real.

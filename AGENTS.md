# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

Zero-dependency TypeScript library implementing the [Source RCON Protocol](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol) for Node.js. Used to communicate with Source engine game servers (CS:GO, etc.) and Minecraft servers via RCON.

## Commands

- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Lint:** `npm run lint` (runs `eslint src/ --ext .ts`)
- **No test suite exists.** The `test` script is a placeholder.

## Architecture

Three source files in `src/`, all comprising a single RCON client:

- **`rcon.ts`** — Main `RCON` class (default export). Manages TCP socket lifecycle: `connect()`, `authenticate()`, `execute()`, `disconnect()`. The `write()` method handles the request/response cycle including multipacket response reassembly (packets >3700 bytes trigger a termination packet probe).
- **`packet.ts`** — `encode()` and `decode()` functions for serializing/deserializing RCON packets to/from Buffers per the Valve spec (4-byte size header, id, type, body, null terminators).
- **`protocol.ts`** — Frozen object of protocol constants (packet type codes and well-known packet IDs like `ID_AUTH`, `ID_TERM`).

## Code Style

- Single quotes, no semicolons (enforced by ESLint)
- No trailing interface member delimiters (delimiter: `"none"`)
- Target ES5/CommonJS output with strict mode

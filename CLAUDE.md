# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ONLYOFFICE app for Confluence Cloud, built on **Atlassian Forge** (migrated from the legacy Connect app in 2.1.0; `manifest.yml` keeps `connect.key` for that migration). It lets users browse page/blog attachments and open them in ONLYOFFICE Docs. The heavy lifting (editor config, JWT, callbacks, file creation, format list, demo server) lives in a **separate ONLYOFFICE backend** ("remote app", not in this repo), reached via Forge remote `onlyoffice-backend` at `${FORGE_REMOTE_APP_URL}`.

## Commands

There are two npm projects; install both.

```sh
npm install                                             # Forge root (resolvers, settings page)
npm install --prefix static/onlyoffice-confluence-cloud-custom-ui

npm run eslint                                          # lint all .ts/.tsx (what CI runs, from the root)
npm run eslint:fix

cd static/onlyoffice-confluence-cloud-custom-ui
npm run build                                           # vite -> build/, which the manifest's custom-ui resource points to
npm start                                               # vite dev server

forge deploy --environment <development|staging|production>
forge tunnel                                            # local dev against a Forge environment
```

`forge deploy` requires env vars `FORGE_APP_ID` and `FORGE_REMOTE_APP_URL` (substituted into `manifest.yml`). The Custom UI must be built before deploy. There are no tests.

## Architecture

Three layers, wired together in `manifest.yml`:

1. **Forge functions (backend, Node 22)** — `src/index.ts` exports three resolvers from `src/resolvers/`, one per module:
   - `settingsPageResolver` — admin settings (Document Server URL, JWT secret/header, demo toggle). Stored in Forge KVS as a secret under `onlyoffice-docs.settings` (`src/storage`); demo availability/dates are merged in from the remote backend.
   - `mainPageResolver` — app context, format list (cached in-memory for 24h), creating new attachments.
   - `editorPageResolver` — remote app authorization, editor config, reference data.
   All calls to the ONLYOFFICE backend go through `src/client/index.ts` (`invokeRemote("onlyoffice-backend", …)`, paths `/api/v1/remote/*`), passing `x-cloud-id` / `x-environment-id` headers where needed. Both `src/client` and `src/storage` retry once on `ConnectTimeoutError`.

2. **Settings page (UI Kit)** — `src/frontend/settingsPage.tsx`, rendered natively by Forge (`render: native`, `@forge/react`), used as the app's `confluence:globalSettings` config page.

3. **Custom UI** — `static/onlyoffice-confluence-cloud-custom-ui/` (React 18 + Vite + Atlaskit), a single bundle serving three modules. `App.tsx` dispatches on `context.moduleKey`:
   - `main-page` (`confluence:spacePage`) and `main-page-action` (`confluence:contentAction`) → `pages/Main`, a content tree of pages/blog posts/attachments. It talks to Confluence directly via `requestConfluence` (`src/client`) and to resolvers via `invoke`. Only the space page uses Forge history for URL search params; the content action keeps them in state.
   - `editor-page` (`confluence:fullPage`, route `editor`) → `pages/Editor`. It obtains a token + `remoteAppUrl` from `authorizeRemoteApp`, embeds an iframe from the remote backend (`${FORGE_REMOTE_APP_URL}/editor/confluence`, allowed in `permissions.external.frames`), and drives it via a `postMessage` protocol: the iframe sends `PAGE_IS_LOADED`, `DOCUMENT_READY`, `DOCS_API_UNDEFINED`, `REQUEST_OPEN`, `REQUEST_CLOSE`, `REQUEST_USERS`, `REQUEST_REFERENCE_DATA`; the host sends `OPEN_EDITOR`, `REFRESH_SESSION`, `SET_USERS`, `SET_REFERENCE_DATA`, `SHOW_MESSAGE`. The session is re-authorized 10s before `sessionExpires`. Message origin is checked against `remoteAppUrl`. Changing this protocol requires a matching change in the backend.

Editor URLs are built in `util/routerUtils.ts` (`/forge-apps/a/<appId>/e/<envId>/r/editor?parentId=<type>:<id>&attachmentId=…`); the editor page also reads an optional `mode` param (default `EDIT`).

The resolver layer and the Custom UI each have their own `src/types/types.ts`; they are not shared.

## Conventions

- **i18n:** all UI strings come from `locales/*.json` (Forge `translations` in the manifest; en-US is the fallback). Custom UI uses `i18n` from `@forge/bridge` (`t` via `AppContext`). Add new keys to every locale file.
- **ESLint (enforced in CI):** double quotes, Prettier, `import/order` with alphabetized groups separated by blank lines (`react` first), and a required Apache-2.0 license header (`.config/source-license-header.js`) on every `.ts/.tsx` file. The Custom UI's `.eslintrc.js` extends the root one.
- New dependencies must pass the license check (`.check-licenses.yml`, `licenses.yml` workflow); approved exceptions are recorded there.
- **Release:** bump `version` in `package.json` and add a section at the top of `CHANGELOG.md`; pushing a `v*` tag deploys to production and creates a GitHub release from the latest CHANGELOG section. Staging deploy is a manual workflow (`staging.yml`). Branches: `develop` → `master`.

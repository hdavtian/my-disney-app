# Deployment Plan for harma.dev (Disney Demos)

Last updated: 2025-11-01
Status: Work in progress (WIP)
Owner: Harma / Project Maintainers

This document is the living source of truth for how we deploy Disney demo apps under harma.dev. Update it via PRs whenever the plan changes and record notable decisions in the Decision Log.

---

## 1) Goals and constraints

- Low-cost demos with automation-first workflows.
- Reusable across Java and C# backends.
- Use Azure for hosting/runtime, Neon for Postgres, GitHub Actions for CI/CD.
- Keep harmadavtian.com as-is; use harma.dev for these demos.
- Target monthly cost: remain well under $50–$60 per month at demo traffic.

## 2) High-level architecture (reference)

- Frontend (React/Vite static): Azure Static Web Apps (SWA) Free
  - Global CDN, automatic deploys from GitHub, free managed SSL, PR preview environments.
- Backend (Java Spring Boot or C# .NET): Azure Container Apps (ACA) on Consumption plan
  - Scale to zero, HTTP ingress, managed certs, revisions for easy rollback.
- Database: Neon (serverless Postgres, Free tier)
  - One project with multiple databases or multiple projects; keep connection strings in secrets.
- Images/Registry: GitHub Container Registry (GHCR)
  - Avoids ACR cost; can be public for simplicity or private with pull secrets.
- Automation: GitHub Actions with OIDC to Azure
  - No long-lived Azure secrets in GitHub.
- DNS/Certificates: Keep DNS at the harma.dev registrar
  - Use CNAMEs to SWA/ACA; managed certs handle TLS automatically.

## 3) Domains and naming scheme

- Frontend per app: `{app}.disney.harma.dev`
- Backend per app: `api.{app}.disney.harma.dev`
- Optional environments (only if needed): `{env}.{app}.disney.harma.dev` and `{env}.api.{app}.disney.harma.dev` where `env ∈ {dev, stage}`; omit env for prod.
- Main site: `www.harma.dev` (SWA). Configure apex `harma.dev` → redirect to `www.harma.dev` at the registrar to avoid extra services.
- Naming rules: lowercase, hyphen-separated app slugs (e.g., `movie-app`, `characters-app`).

## 4) DNS records (templates)

At the harma.dev DNS provider:

- Apex redirect: `harma.dev` → 301 redirect to `https://www.harma.dev/` (done in registrar UI).
- Main site:
  - `CNAME www.harma.dev -> <SWA_DEFAULT_HOST_FOR_MAIN>`
- Per Disney app (frontend):
  - `CNAME {app}.disney.harma.dev -> <SWA_DEFAULT_HOST_FOR_{APP}>`
- Per Disney app (API backend):
  - `CNAME api.{app}.disney.harma.dev -> <ACA_DEFAULT_HOST_FOR_{APP}_API>`
- Optional env subdomains (only if needed):
  - `CNAME {env}.{app}.disney.harma.dev -> <SWA_DEFAULT_HOST_FOR_{APP}-{ENV}>`
  - `CNAME {env}.api.{app}.disney.harma.dev -> <ACA_DEFAULT_HOST_FOR_{APP}_API-{ENV}>`

Example (initial three apps):

- movie-app:
  - FE: `CNAME movie-app.disney.harma.dev -> <SWA_HOST_movie>`
  - API: `CNAME api.movie-app.disney.harma.dev -> <ACA_HOST_movie_api>`

## 5) Certificates and HTTPS

- SWA: Add the custom domain in the SWA portal, complete DNS validation, and SWA provisions a free, auto-renewed certificate. Enforce HTTPS-only.
- ACA: Add the custom domain to the Container App, complete DNS validation via CNAME, enable managed certificate, enforce HTTPS-only.
- HSTS: Optional; backend can set HSTS headers if desired. SWA provides secure defaults.

## 6) CORS rules (backend)

- Allow `https://{app}.disney.harma.dev`.
- If using env domains, also allow `https://{env}.{app}.disney.harma.dev`.
- Deny `*`; be explicit to limit exposure.

## 7) CI/CD workflows (GitHub Actions)

General:

- Use GitHub Environments: `dev`, `stage`, `prod` (prod requires approval).
- Use GitHub OIDC to sign into Azure from workflows.
- Use GHCR for images: `ghcr.io/<owner>/{app}-api`.
- Tag images with `:{git-sha}` and a floating env tag `:prod`/`:stage`.

Frontend (per app):

- Trigger: push to `main` → deploy to SWA; PRs → SWA preview environments (no DNS needed).
- Steps: setup Node → build Vite → deploy via official SWA action.
- Secrets: SWA deployment token per environment if required by the action.

Backend (per app, Java or C#):

- Trigger: push to `main` → deploy to ACA; PRs → build/test and docker build, optionally deploy to staging if needed end-to-end.
- Steps: build/test (JDK 21 + Maven for Java; dotnet for C#) → docker build → push `ghcr.io/<owner>/{app}-api:{sha}` and `:{env}` → Azure login via OIDC → deploy new ACA revision → set 100% traffic if healthy.
- Secrets: Neon connection strings (per env) stored in GitHub Environments and as ACA secrets.

Rollback:

- Frontend (SWA): redeploy previous artifact (or revert commit and redeploy).
- Backend (ACA): switch traffic to a previous revision or redeploy a previous image tag.

## 8) Environments and branching

- `main` → prod
- `develop` → stage (optional)
- `feature/*` → PR builds; SWA previews auto-provisioned for each PR.
- Approvals: required for prod deployments via GitHub Environments.

## 9) Security and secrets

- Azure authentication from GitHub: OIDC (no client secrets in repo).
- Store DB connection strings and API keys in GitHub Environments; inject into ACA as secrets/env vars.
- Registry: Prefer public GHCR to avoid pull secrets; if private, configure ACA registry credentials once.
- Limit CORS to allowed origins; enable HTTPS-only across services.

## 10) Observability and alerts

- Logging: Enable ACA → Log Analytics with short retention (e.g., 7–14 days) to control cost.
- Metrics/Tracing: Optional Azure Application Insights for backend if deeper visibility is needed.
- Alerts (minimal): container restart spikes, 5xx rate alerts. Keep thresholds sane to avoid noise.

## 11) Cost model (rough)

- SWA (Free): $0
- ACA (Consumption): near $0 at idle; a few USD/month with light usage.
- Neon (Free): $0
- Log Analytics: typically a few USD/month with low ingestion and short retention.
- If Azure Postgres is chosen later: becomes the primary cost line item.

## 12) Rollout checklist (per app)

1. Provision
   - Create SWA for `{app}` frontend.
   - Create Container App Environment (once) and Container App `ca-{app}-api`.
   - Create Neon project/database; capture connection strings.
2. DNS
   - Add `CNAME {app}.disney.harma.dev -> <SWA_DEFAULT_HOST>`.
   - Add `CNAME api.{app}.disney.harma.dev -> <ACA_DEFAULT_HOST>`.
   - For main site: `CNAME www.harma.dev -> <SWA_DEFAULT_HOST_FOR_MAIN>` and apex redirect to `www`.
3. Bind domains and certs
   - Verify custom domains in SWA/ACA and enable managed certs.
   - Enforce HTTPS-only.
4. CI/CD wiring
   - Configure GitHub OIDC to Azure and GHCR permissions.
   - Add frontend workflow (build + SWA deploy).
   - Add backend workflow (build/test, docker, GHCR push, ACA deploy).
   - Add GitHub Environments and secrets (Neon, any keys).
5. Validate & go live
   - Use SWA preview URLs for PR testing.
   - Deploy to prod; smoke test FE and API.
   - Confirm CORS and SSL; check logs.
6. Runbooks
   - Document rollback steps (SWA redeploy; ACA revision switch).

## 13) Per‑app mapping (examples)

- movie-app
  - Frontend domain: `movie-app.disney.harma.dev`
  - SWA name: `swa-movie-app-fe`
  - API domain: `api.movie-app.disney.harma.dev`
  - Container App: `ca-movie-app-api` (in `cae-disney`)
  - DB: Neon database `movie_app`

## 16) Media assets (images) strategy

Goals

- Decouple large, mostly-static media from app deploys to keep builds fast and artifacts small.
- Keep costs near-zero for demo traffic. CDN selected for vanity domain + caching.
- Maintain separate asset repository to keep main codebase clean and small.

Repository structure

- **Code repository**: `hdavtian/my-disney-app` - Contains source code, configuration, and documentation only (no images).
- **Assets repository**: `hdavtian/my-disney-app-assets` - Contains all images for characters, movies, and other media assets.
- This separation keeps the main repo lightweight (~610 KB) and enables independent asset management.

Selected approach (for this project)

- Azure Storage (Hot) + Azure CDN with vanity domain `images.disney.harma.dev`.
- Public container with per-app folders, strong cache headers, and hashed filenames.
- CI sync via azcopy from assets repository; purge CDN only when not using hashed filenames.

Default approach (simplest, no CDN)

- Azure Storage (Hot tier) with a public container (e.g., `images`).
- Use the default HTTPS endpoint (no custom domain):
  - `https://<storage-account>.blob.core.windows.net/images/<app>/<file>`
- No DNS changes required. Lowest complexity and cost; perfectly fine for demos.
- Note: Custom domain + HTTPS for Storage requires a fronting service (CDN or Front Door). If you want a vanity domain, see the optional upgrade below.

Chosen configuration (custom domain and edge caching)

- Azure CDN in front of Storage.
- Custom domain: `images.disney.harma.dev` (or per-app variants if needed later).
- Benefits: managed cert on your domain, edge caching, easy cache purge, slightly better latency.
- Costs at demo traffic are still very low (see below).

Structure and paths

- Storage container: `images` with per-app folders: `/movie-app/`, `/characters-app/`, `/quiz-app/`.
- URLs:
  - Default (no CDN, alternative): `https://<storage-account>.blob.core.windows.net/images/<app>/<file>`
  - With CDN (selected): `https://images.disney.harma.dev/<app>/<file>`

Costs (approx., region-dependent)

- Storage (Hot): ~$0.018–$0.025 per GB-month. 0.5 GB ≈ ~$0.01/month.
- Requests: a few cents per million operations; negligible for demos.
- Egress: roughly $0.08–$0.20 per GB; a few GB/month ≈ well under $1.
- CDN: No fixed platform fee for Azure CDN Standard; you pay for data transfer/requests. At demo scale this is typically cents.

CI/CD for assets (sync-only)

- Images are maintained in separate repository: `hdavtian/my-disney-app-assets`.
- Keep images outside the frontend bundle to avoid redeploying the app for content-only updates.
- GitHub Actions job in assets repository uses `azcopy` (or Azure CLI + `az storage blob upload-batch`) to sync images to Azure Storage (only changed files).
- If using CDN, purge changed paths after upload for immediate freshness.
- Asset updates are independent from code deployments.

App configuration

- Frontend (Vite): set `VITE_ASSETS_BASE_URL` to either the Storage endpoint or the CDN domain; compose URLs as `${VITE_ASSETS_BASE_URL}/<app>/<file>`.
- Backend (Java/C#): set `ASSETS_BASE_URL` similarly if the API returns absolute asset URLs.
- CORS: generally not required for static image GETs.

DNS & TLS

- DNS: `CNAME images.disney.harma.dev -> <CDN endpoint host>`.
- TLS: Managed cert on the CDN endpoint; enforce HTTPS-only.

Notes

- Prefer immutable filenames (hashing) for long-lived caching.
- If you must have a custom domain without CDN, accept that HTTPS isn’t supported directly on Storage custom domains; use the default HTTPS endpoint instead (recommended) or front with CDN/Front Door.

## 14) Working TODOs (project)

- [x] Confirm targets and constraints
- [x] Draft reference architecture
- [x] Pick frontend hosting approach
- [x] Pick backend runtime on Azure
- [x] Choose Postgres strategy
- [x] Design GitHub Actions CI/CD
- [x] Plan DNS and certificates
- [x] Define environments and branching
- [ ] Observability and alerts (implement Log Analytics + optional App Insights, define minimal alerts)
- [x] Security and secrets plan
- [x] Rough cost model
- [x] Rollout timeline and next steps
- [x] Create and maintain deployment plan doc (this file)
- [ ] Media assets hosting
  - [x] Create separate assets repository: `hdavtian/my-disney-app-assets`
  - [x] Move all images from `frontend/public` to assets repository
  - [x] Create Storage account + container structure (public `images` with per-app folders)
  - [ ] Add Azure CDN endpoint with Storage as origin (Standard tier) - _Currently using direct Storage URLs due to Azure CDN service outage_
  - [ ] DNS: add `CNAME images.disney.harma.dev -> <CDN endpoint host>` and enable managed cert
  - [x] Add CI job in assets repository to sync images with azcopy (delta uploads) and optional CDN purge
  - [x] Add app config: `VITE_ASSETS_BASE_URL` (FE) for environment-aware image loading
  - [x] Update all components to use centralized `getAssetUrl()` utility function

## 15) Decision log

- 2025-11-01: Adopt naming `{app}.disney.harma.dev` for FE, `api.{app}.disney.harma.dev` for BE; optional `{env}.` prefix for non-prod.
- 2025-11-01: Use SWA Free for FE, ACA Consumption for APIs, GHCR for images, Neon Free for Postgres.
- 2025-11-01: Keep harma.dev DNS at registrar; apex redirect to `www.harma.dev`.
- 2025-11-01: Adopt Azure Storage + Azure CDN for hosting images with vanity domain `images.disney.harma.dev`; apps use `VITE_ASSETS_BASE_URL`/`ASSETS_BASE_URL` to point to the CDN domain; hashed filenames recommended for long-lived caching.
- 2025-11-01: Temporary workaround using direct Azure Storage URLs (`https://disneyimages.blob.core.windows.net/images`) due to Azure CDN service outage; will migrate to CDN with custom domain once service is restored.
- 2025-11-03: Created separate assets repository `hdavtian/my-disney-app-assets` to keep main codebase clean and small (~610 KB); all images moved to assets repo; main repo remains source-code only.
- 2025-11-03: Implemented GitHub Actions workflow in assets repository to automatically sync images to Azure Storage using `azcopy`; workflow includes delta uploads and optional CDN purge when CDN is enabled.

Notes:

- Do not link this file from `.github/copilot-instructions.md` until we consider it stable.
- When changing any part of the plan, update this doc in the same PR and add a Decision log entry.

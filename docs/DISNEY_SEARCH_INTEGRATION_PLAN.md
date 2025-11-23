# Disney Search Integration Plan

**Date:** November 23, 2025  
**Branch:** `feature/ux-improvements`

This document translates the approved Disney Search experience design into executable phases. Each phase lists scope, key tasks, owners, success criteria, and dependencies to keep backend + frontend efforts aligned.

---

## Traceability to Design Plan

Requirement coverage from `DISNEY_SEARCH_PAGE_PLAN.md`:

- **Navigation & Image Parity (Reqs 1, 5):** reuse existing helpers for Movies, Characters, Parks before introducing new logic; validated in Phases 0, 2, and 3.
- **Hero + Options Panel (Reqs 2-3):** scaffolding in Phase 2, finishing polish in Phase 3.
- **Dynamic Columns & Result Cards (Req 4-5):** implemented during Phase 2/3 with responsive + accessibility work.
- **Multi-range Highlighting (Req 6) & DTO structure (Req 7):** backend Phase 1 plus frontend helper in Phase 3.
- **Scope presets & Capabilities endpoint (Reqs 3, 8-10):** registry + `/api/search/capabilities` built in Phase 1, consumed Phase 2.
- **History persistence & Site Settings reset (Req 8):** slice work Phase 2/3 with reset hook verification Phase 3.
- **Testing Strategy (Req Section 🧪):** executed Phase 4, mirroring backend/frontend/E2E stages.
- **Docs/README update (Req Next Steps item 6):** Phase 5 deliverable.

This mapping should be revisited if the design doc changes.

## Phase 0 – Prep & Alignment

- **Scope:** Finalize contracts/doc updates before coding.
- **Tasks:**
  - Confirm `/api/search` + `/api/search/capabilities` request/response shapes (OpenAPI stub).
  - Inventory existing navigation/image helpers for Movies, Characters, Parks; document references.
  - Capture Site Settings cache-reset flow to ensure history clearing hook is understood.
  - Create tracking tickets for backend, frontend, QA, documentation.
- **Owner:** Tech lead.
- **Exit Criteria:** Plan + contracts reviewed, tickets prioritized, references captured.

## Phase 1 – Backend Foundations

- **Scope:** Stand up search aggregation stack without UI consumption.
- **Tasks:**
  - Implement config-driven capabilities registry (`@ConfigurationProperties` + YAML file).
  - Build `SearchAggregationService`, DTOs, highlighting utility, and controller endpoints.
  - Add caching (optional) + unit/integration tests, including contract test for `/api/search/capabilities` vs config.
  - Seed sample data/tests for highlight ranges.
- **Owner:** Backend engineer.
- **Dependencies:** Phase 0 contracts.
- **Exit Criteria:** Endpoints deployed locally with tests passing; Postman collection or Swagger examples updated.

## Phase 2 – Frontend Scaffolding

- **Scope:** Create page skeleton, Redux slice, and wiring to backend.
- **Tasks:**
  - Add route/nav entry, lazy-load `DisneySearchPage`.
  - Create `disneySearchSlice`, async thunks, selectors, history persistence.
  - Fetch capabilities on mount; render hero + options stub.
  - Implement column layout + result card shell using existing navigation/image helpers (reuse `buildDetailPath`, `get*ImageUrl` utilities).
- **Owner:** Frontend engineer.
- **Dependencies:** Phase 1 endpoints available (mockable otherwise).
- **Exit Criteria:** Page renders with mocked data; state transitions verified via devtools.

## Phase 3 – Feature Completion

- **Scope:** Finish UX, highlighting, history tray, and polish.
- **Tasks:**
  - Wire real API calls with loading/error states.
  - Implement highlight rendering helper with multi-range support.
  - Add Framer Motion animations, responsive breakpoints, accessibility labels, and empty states.
  - Integrate “Search again” tray, clear-history controls, Site Settings reset hook.
  - Validate per-category navigation (Movies, Characters, Parks) and image loading parity with existing pages.
- **Owner:** Frontend engineer + UX.
- **Dependencies:** Phase 2 scaffolding.
- **Exit Criteria:** Feature complete in dev build; manual test script executed for nav + image flows.

## Phase 4 – Testing & Hardening

- **Scope:** Validate integration end-to-end and harden before release.
- **Tasks:**
  - Backend: service/integration/perf tests run in CI; evaluate cache metrics.
  - Frontend: Vitest unit tests, Cypress component tests, Playwright E2E hitting staging API.
  - Regression: verify existing Movies/Characters/Parks pages unaffected.
  - Accessibility sweep (keyboard navigation, contrast, screen-reader labels).
  - Verify Site Settings “reset” clears search history/local storage; ensure telemetry events sent.
- **Owner:** QA + dev pairing.
- **Dependencies:** Phase 3 completion.
- **Exit Criteria:** Test suite green, accessibility issues resolved, stakeholders sign off.

## Phase 5 – Documentation & Rollout

- **Scope:** Communicate new capability and ensure operability.
- **Tasks:**
  - Update root `README.md` and relevant docs (navigation, API sections) per plan.
  - Add monitoring/telemetry dashboards (search usage, latency, errors).
  - Prepare release notes + enable feature flag (if applicable).
  - Document configuration update process (capabilities registry) for future category/column changes.
- **Owner:** Tech lead + DevRel.
- **Dependencies:** Phase 4 sign-off.
- **Exit Criteria:** Docs merged, dashboards live, deployment checklist complete.

---

## Risk Mitigation

- **Navigation/Image Parity:** Reference existing helpers before coding; add regression tests clicking through each category.
- **Config Drift:** Validate capabilities YAML via schema + add contract test comparing `/api/search/capabilities` output to config file.
- **Highlight Accuracy:** Snapshot tests on DTO mapper outputs to catch off-by-one indices.
- **Performance:** Monitor query timings; be ready to add indexes or scope limits if latency exceeds 400ms.
- **History Persistence:** Ensure localStorage writes are debounced and cleared by Site Settings; add e2e test for cross-session restore per design doc.

## Tracking & Communication

- Weekly standup check-in on phase burn-down.
- Demo checkpoints at end of Phases 2 and 3.
- Use feature flag or staged rollout to small audience before GA.

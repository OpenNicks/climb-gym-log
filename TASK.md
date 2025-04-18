# TASK.md

## Purpose
Tracks current tasks, backlog, milestones, and sub-tasks. Use this file to manage active work, track progress, and document anything discovered mid-process.

**Prompt to AI:**
“Update TASK.md to mark XYZ as done and add ABC as a new task.”

---

## MVP Approach
The initial MVP focuses on a **single gym** approach rather than multi-gym functionality:
- Fixed navigation between boulders and routes sections for a single gym
- No gym selection screen needed for MVP
- Simplified user experience with direct access to climbing data
- Future versions will implement multi-gym support with subdomains

## Tasks
- [x] Project scaffolding (README, PROJECT, TASK files)
- [x] Reliable import/module structure for tests
- [x] Editable install with setup.py and pyproject.toml
- [x] Dependency management (requirements.txt, email-validator)
- [x] Robust API error handling, pagination, and validation
- [x] Passing unit tests for all endpoints
- [x] Authentication Endpoints (backend)
- [x] Frontend Auth Integration (login/register, JWT, protected UI)
- [x] Demo data seeding (gyms, climbs, user)
- [ ] Ascent Logging (Backend & Frontend) — 2025-04-17
    - [ ] Backend: Model, endpoints for creating/listing ascents
    - [ ] Frontend: UI for logging/viewing ascents
    - [ ] Comprehensive Pytest unit tests for ascents
    - [ ] Edge/failure case tests for ascent logging
    - [ ] UI polish: feedback, error handling, and user experience for ascent logging

## Discovered During Work
- [x] Fix Blank Page Issue in Frontend — 2025-04-17
    - [x] Refactor App component for single-gym approach
    - [x] Fix navigation between boulders and routes
    - [x] Simplify data flow
    - [x] Remove multi-gym selection for MVP
- [ ] Add deployment instructions (local, cloud, Docker)
- [ ] Add frontend (React, Svelte, or template-based)
- [ ] Add API documentation examples
- [ ] Add more edge/failure case tests
- [ ] UI polish: better feedback, error handling, and user experience for auth
- [ ] Add frontend tests for login, logout, and protected UI

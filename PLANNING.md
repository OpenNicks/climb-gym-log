# PLANNING.md

## Purpose
High-level vision, architecture, constraints, tech stack, tools, and design decisions for the project.

**Prompt to AI:**
“Use the structure and decisions outlined in PLANNING.md.”

---

## Vision
Climb Gym Log is a web platform inspired by 8a.nu, but tailored for indoor climbing gyms. The platform is designed to make it extremely easy for users to either add a new climb to a gym’s database or quickly find if a climb already exists. The initial version will focus on a template website for a single fictional gym, using fictional data for demonstration and development.

### Core User Flow
- When a user wants to log a climb, they enter details (date, color, setter, gym section, setter grade).
- As they type, the system suggests possible existing climbs from the database (fuzzy search/match).
- If no match is found, the user can submit the new climb to the gym’s climb database.
- Once a climb is in the database, users can:
  - Browse/search the list of climbs at the gym
  - Submit their personal grade
  - Indicate if they sent it or just worked the moves
  - Rate the quality of the climb (1–5 stars)
- The site presents consensus averages for grades and quality, so gym users can find useful, crowd-sourced information about climbs.
- Users have personal pages (public or private) to track their climbing history, progress, and stats at gyms over time.

### MVP Priorities & Roadmap

#### 1. Core Data Model & Backend API
- Set up FastAPI, SQLModel/SQLAlchemy, and Pydantic models for User, Gym, Climb, and Ascent/Log.

#### 2. Authentication & User Accounts
- Basic sign-up/log-in, public/private profile toggle.

#### 3. Climb Logging & Search/Suggestion
- Form to enter climb details with fuzzy search/suggestions. Add or log climbs.

#### 4. Climbs List Page with Filters/Sorting
- List climbs for the gym (default: last 6 months), filter by grade/setter/section/color, sort by popularity/date/grade/quality.

#### 5. Consensus & Aggregation Logic
- Display average grade and quality for each climb, show number of ascents/attempts.

#### 6. Personal Profile Page
- List user’s logged climbs, public/private toggle.

---

### Deferred/Future Goals

The following features are valuable but deprioritized for the foundational MVP. They are kept here for future planning:

- Climb comments and public beta/advice
- Climb popularity indicators (number of ascents/attempts)
- Grade distribution graphs for each climb
- Climb history/timeline (all ascents/attempts)
- Setter profiles (showing their climbs and average ratings)
- Personal ticklists/wishlists (mark climbs as “to do” and track completion)
- Session logging (log entire gym sessions with notes)
- Achievements/badges for milestones (e.g., “10 climbs logged,” “first V5”)
- Leaderboards (most climbs sent, hardest climbs, most active climbers, etc.)
- Automated grade suggestions based on consensus/user stats
- Social features (follow users, activity feeds)
- Route setting requests (users request new climbs/styles)
- Mobile app integration (on-the-go logging)
- Photo uploads (climb photos, beta sequences)
- Notifications (climb removals, new climbs, comments)
- Export/import logs (including from other platforms)
- API access for gyms/developers/analytics
- Data analytics for gyms and setters
- Community features: expanded comments, ticklists, leaderboards

### Stakeholders
- Climbers (primary)
- Gym owners and staff (future)
- Route setters (future)

### Inspiration
- 8a.nu for outdoor climbs
- MoonBoard, Kilter Board, and other digital logging platforms

### Technical Stack (Proposed)
- Python (FastAPI backend)
- React frontend
- PostgreSQL database
- SQLAlchemy/SQLModel ORM
- Pydantic for validation

### MVP Goals
- Extremely easy and fast climb logging
- Accurate consensus ratings and quality
- Personal progress tracking
- Fictional gym and data for demo

### Constraints
- All code must follow PEP8 and be formatted with Black
- Use pydantic for all data validation
- Modular code, max 500 lines per file
- All features must have pytest unit tests
- Document all endpoints and major functions with docstrings

### Tools
- VSCode (recommended)
- Git/GitHub for version control
- Docker (future, for deployment)

### Other Notes
- Reference this file at the start of any new conversation or when making major architectural decisions.
- Update as architecture, stack, or constraints evolve.

# Climb Gym Log

A web app to log, share, and manage climbing activities. Built with FastAPI (backend) and React (frontend).

---

## Features
- User registration and login (JWT-based authentication)
- Add, view, and manage gyms and climbs
- Rate climbs (requires login)
- User-specific protected actions

---

## Getting Started

### Backend Setup
1. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
2. **Set environment variables:**
   - `SECRET_KEY` (for JWT signing; defaults to `supersecret` if unset)
   - `DATABASE_URL` (optional, defaults to SQLite)
3. **Run the server:**
   ```sh
   uvicorn main:app --reload
   ```
4. **API docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend Setup
1. **Install dependencies:**
   ```sh
   cd frontend
   npm install
   ```
2. **Run the dev server:**
   ```sh
   npm run dev
   ```
3. **Open:** [http://localhost:5173](http://localhost:5173)

---

## Authentication & Usage

- Register or log in from the UI.
- On success, a JWT token is stored and sent with all protected API requests.
- Only authenticated users can add climbs or rate them.
- Use the logout button to end your session.

### API Endpoints
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and receive JWT
- `GET /auth/me` — Get current user info (JWT required)
- `POST /gyms/{gym_id}/climbs/` — Add climb (JWT required)
- `PATCH /gyms/climbs/{climb_id}/rating` — Rate climb (JWT required)

---

## Testing
- Run backend tests:
  ```sh
  pytest
  ```
- (Optional) Add frontend tests for auth and protected UI

---

## Environment Variables
- `SECRET_KEY` — JWT signing
- `DATABASE_URL` — DB connection (optional)

---

## License
MIT

A web platform inspired by 8a.nu, designed for logging, sharing, and rating climbs at indoor climbing gyms.

---

## Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. (First Time) Install as Editable Package
```bash
pip install -e .
```

### 3. Set Up Environment Variables (Optional)
- By default, uses SQLite (`climb_gym_log.db`).
- To use another database, set `DATABASE_URL` in a `.env` file:
  ```env
  DATABASE_URL=sqlite:///./climb_gym_log.db
  ```

### 4. Initialize the Database
You can initialize tables by running a Python shell:
```python
from app.db import init_db
init_db()
```
Or add this to a script/CLI as needed.

### 5. Run the API
```bash
uvicorn main:app --reload
```
- The API will be available at http://127.0.0.1:8000
- Interactive docs (Swagger UI): http://127.0.0.1:8000/docs

### 6. Run Tests
```bash
python -m pytest --maxfail=3 --disable-warnings -q
```

---

## API Overview
- Modular FastAPI backend (see `app/`)
- Endpoints:
  - `POST /gyms/`: Create a gym
  - `GET /gyms/`: List gyms (pagination coming soon)
  - `GET /gyms/{gym_id}`: Get gym by ID
  - `POST /gyms/{gym_id}/climbs/`: Add climb to gym
  - `GET /gyms/{gym_id}/climbs/`: List climbs for gym (pagination coming soon)
- All endpoints documented in Swagger UI

---

## Project Structure
- `main.py`: FastAPI entry point
- `app/`: Core backend code (models, schemas, routes, db)
- `tests/`: Pytest unit tests
- `requirements.txt`, `pyproject.toml`: Dependencies and packaging
- `PLANNING.md`, `TASK.md`: Vision, architecture, and task tracking

---

## Notes & Improvements
- CORS middleware will be added for frontend integration
- Input validation and error handling improvements are planned
- Pagination for list endpoints is a future enhancement
- Authentication/authorization will be added post-MVP

---

## Contributing
1. Fork and clone the repo
2. Install dependencies and editable package
3. Add features or tests in a new branch
4. Run all tests before submitting a PR

---

For questions, see PLANNING.md or open an issue.


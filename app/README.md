# Climb Gym Log Backend (FastAPI)

This is the backend service for the Climb Gym Log project, built with FastAPI and SQLModel.

---

## 🚀 Setup & Installation

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd climb-gym-log/app
   ```
2. **Create a virtual environment**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**
   ```sh
   pip install -r requirements.txt
   ```
   - This will install FastAPI, SQLModel, Uvicorn, python-dotenv, and pytest for testing.
4. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill in any required values (if present).

---

## 🌐 Enabling CORS (Required for Frontend Integration)

To allow your React frontend to communicate with the backend, enable CORS middleware in your FastAPI app:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from your frontend URL
origins = [
    "http://localhost:3000",  # React dev server
    # Add your deployed frontend URL(s) here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🛠️ Running the Backend

```sh
uvicorn main:app --reload
```

- The API will be available at `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

---

## 🔗 API Integration
- The frontend expects the backend API base URL to be set via `.env` (see frontend README).
- Ensure your backend is running and accessible at the URL specified in the frontend `.env`.

---

## 🧪 Testing

1. **Ensure your virtual environment is activated.**
2. **Run all backend tests:**
   ```sh
   pytest
   ```
   - This will discover and run all tests in the `/tests` directory.
3. **Adding new tests:**
   - Place new test files in the `/tests` directory, following the `test_*.py` naming convention.
   - Use Pytest for all new tests.

---

## 📄 Additional Notes
- Use Pydantic for data validation.
- Use SQLModel for ORM/database.
- Update this README as new features or requirements are added.

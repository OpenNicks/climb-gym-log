# Climb Gym Log

## Features (Updated 2025-04-17)

---

## Getting Started

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd climb-gym-log/frontend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and set your backend API URL:
```sh
cp .env.example .env
```
Edit `.env`:
```
REACT_APP_API_URL=http://localhost:8000
```
Set this to your FastAPI backend address.

### 4. Run the App
```sh
npm start
```

### 5. Run Tests
```sh
npm test
```

---

## Backend Setup
See [../app/README.md](../app/README.md) for FastAPI backend setup and CORS instructions.

---

### Authentication
- Simple login/signup UI with username/email support
- User-specific ascent tracking and filtering
- Secure session management

### Tracking Features
- Log boulder and route ascents with detailed information
- Track sends vs. projects
- Add personal grades, quality ratings, and notes
- Search and filter your logged climbs

### Advanced Statistics
- View your hardest boulder and route grades
- Track your sending streak
- See most frequent grades climbed
- Monitor total and unique climbs logged

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility with ARIA attributes
- Semantic HTML structure
- Clear feedback for form validation


## Integration with Backend

- All API requests are sent to the URL specified in `.env` (`REACT_APP_API_URL`).
- Ensure your FastAPI backend is running and has CORS enabled for frontend access.
- For local development, both frontend and backend should be started separately.

---

## API Error Handling

- All API errors from the backend are parsed using the `extractApiError` helper in `src/api/auth.js` and `src/api/ascents.js`.
- Errors are surfaced to the UI through React context providers (see `AuthContext` and `AscentsContext`).
- User-facing error messages are shown using the notification system, and backend validation or server errors are displayed when available.
- **Best Practice:** When adding new API calls or components, always use `extractApiError` to handle error responses and ensure users receive actionable feedback.

Example usage in a context provider:
```js
import { extractApiError } from '../api/auth';

try {
  const response = await apiCall();
  if (response.status && !response.success) {
    setError(response.message);
    // Show notification or return error
  }
} catch (err) {
  if (err && err.status) {
    setError(err.message);
  }
}
```

## Latest Updates (2025-04-17)

### New Features
- **Authentication**: Users can now sign up/log in to track their personal ascents
- **Advanced Statistics**: View detailed metrics about your climbing progression
- **Search & Filter**: Find specific climbs by name, grade, section, or notes
- **Sort Options**: Sort ascents by date, grade, or quality rating

### Accessibility Improvements
- Added proper ARIA roles and labels throughout the application
- Enhanced keyboard navigation for all interactive elements
- Improved screen reader compatibility for forms and lists

## Test Coverage & Reliability (2025-04-17)
- **All major features now have robust async React tests.**
- **AscentLog test fixed:** Now uses async/await and `findBy*` queries for reliable UI assertions.
- **Fetch mocks:** Improved to handle repeated and variant requests.
- **Debug logs:** Removed from production code.

## Troubleshooting Async UI & Fetch Mocks
- When testing async UI, always use `findBy*` or `waitFor` to avoid race conditions.
- Ensure fetch mocks match all possible request patterns (use regex or flexible matching).
- If a test fails due to a missing success/error message, check for:
  - Async state not flushed (use async queries)
  - Fetch mock not matching repeated/variant calls

## Next Steps
- Review and improve test coverage for AuthForm and AddClimbForm.
- Refactor any remaining tests to use robust async patterns.
- Add more edge/failure tests for ClimbList and ClimbComments.

---
*Last updated: 2025-04-17*

## Recent Improvements (2025-04-17)
- Edge & failure tests for ClimbList and ClimbComments are now robust and passing.
- See TASK.md for a new 'Refactoring Opportunities' section: centralized async logic, unified error handling, improved test utilities, and more.
- Codebase is now more maintainable, with high coverage and modern async React testing patterns.

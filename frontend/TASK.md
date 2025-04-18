# TASK.md — Climb Gym Log

## Completed Tasks
- LogAscentForm: Accessibility improvements with ARIA attributes and htmlFor labels (2025-04-17)
- MyAscents: Accessibility enhancements with roles and screen reader support (2025-04-17)
- Auth component added with login/signup functionality (2025-04-17)
- Advanced climbing statistics added to MyAscents (2025-04-17)
- Search and filtering features added to MyAscents (2025-04-17)
- Sorting capabilities added for ascents by date, grade, quality (2025-04-17)
- User-specific data handling implemented in App and MyAscents (2025-04-17)
- Comprehensive tests for Auth component (2025-04-17)
- Tests updated for MyAscents and LogAscentForm with user filtering (2025-04-17)
- Integration tests for App with auth flow (2025-04-17)
- README.md updated with new features documentation (2025-04-17)
- AscentLog: Test now robustly waits for async UI updates and passes (2025-04-17)
- ClimbRating: 100% test coverage, edge/failure tests, robust prop handling
- Test mocks for fetch improved for all relevant endpoints
- Debug logs removed from production code
- ClimbList: Edge & failure tests added and passing (2025-04-17)
- ClimbComments: Edge & failure tests added and passing (2025-04-17)

## Discovered During Work
- Ensure all async React tests use `findBy*`/`waitFor` for reliability
- Consider standardizing fetch mocking patterns across all tests
- Add troubleshooting notes for async UI and fetch mocks to README.md

## TODO
- Implement actual backend integration for authentication
- Add persistent user profiles with preferences
- Create additional charts and visualizations for climbing statistics
- Add social features (share ascents, follow other climbers)
- Integrate with actual gym databases via API
- Add route/boulder difficulty distribution charts
- Add location-based features (gym check-ins, nearby climbs)
- Implement dark mode and additional accessibility features
- Add support for uploading climb photos
- Create mobile-optimized view for logging ascents at the wall
- Performance optimizations for large ascent histories

## Refactoring Opportunities
- Centralize async logic into service layer or custom hooks
- Implement unified error handling/notification system
- Create test utility helpers for fetch mocks and async patterns
- Address act() warnings in tests/components
- Consider modularizing forms and validation logic
- Use cleanup functions in useEffect for async operations

---
*Last updated: 2025-04-17*

# Asana Demo — Playwright Data-Driven Test Suite

Playwright test suite for the [Demo App](https://animated-gingersnap-8cf7f2.netlify.app/), covering all 6 task-verification scenarios driven from a single JSON data file.

---

## Project Structure

```
asana-playwright-tests/
├── tests/
│   ├── tasks.spec.js      # Data-driven test suite (single loop, no duplication)
│   └── testData.json      # All test scenarios defined in one place
├── playwright.config.js   # Playwright configuration
├── package.json
└── README.md
```

---

## Design Decisions

### Data-Driven Architecture

All 6 test cases are defined in `tests/testData.json`. The test file contains a **single `for` loop** that iterates over the array — adding a new test case requires only a new JSON object, zero new code.

```json
{
  "credentials": { "email": "admin", "password": "password123" },
  "testCases": [
    {
      "id": 1,
      "project": "Web Application",
      "task": "Implement user authentication",
      "column": "To Do",
      "tags": ["Feature", "High Priority"]
    }
    // ...5 more
  ]
}
```

### Reusable Helpers

Three helper functions eliminate duplication:

| Helper | Responsibility |
|---|---|
| `login(page)` | Fills credentials and submits the login form |
| `navigateToProject(page, name)` | Clicks the sidebar link and waits for the board |
| `verifyTaskInColumn(page, task, column, tags)` | Asserts task position and tag presence |

---

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

---

## Running Tests

```bash
# Run all 6 tests (headless)
npx playwright test

# Run with browser visible
npx playwright test --headed

# Open the HTML report after a run
npx playwright show-report
```

---

## Test Cases

| # | Project | Task | Column | Tags |
|---|---|---|---|---|
| 1 | Web Application | Implement user authentication | To Do | Feature, High Priority |
| 2 | Web Application | Fix navigation bug | To Do | Bug |
| 3 | Web Application | Design system updates | In Progress | Design |
| 4 | Mobile Application | Push notification system | To Do | Feature |
| 5 | Mobile Application | Offline mode | In Progress | Feature, High Priority |
| 6 | Mobile Application | App icon design | Done | Design |

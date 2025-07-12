# Bug Tracker - Gratitude Network

This document serves as a centralized bug tracking system for the Gratitude Network project.
Bugs are categorized by priority and follow a consistent reporting template for clarity and efficient resolution.

---

## High Priority Bugs (P0)
*Critical issues that block core functionality or severely impact user experience. Must be addressed immediately.*

*(No high priority bugs currently reported)*

---

## Medium Priority Bugs (P1)
*Significant issues that affect non-critical functionality or cause moderate inconvenience. Should be addressed in the current sprint.*

*(No medium priority bugs currently reported)*

---

## Low Priority Bugs (P2)
*Minor issues, cosmetic flaws, or small inconveniences. Can be addressed in future sprints or as time permits.*

### BUG-001: Navbar Logo Redirection Issue

*   **Issue:** Navbar logo/icon always links to `/` instead of dynamically linking to `/feed` when user is authenticated.
*   **Expected Behavior:** The navbar logo/icon should link to `/` when the user is logged out, and to `/feed` when the user is logged in.
*   **Current Behavior:** The navbar logo/icon consistently links to `/` regardless of the user's authentication state.
*   **Impact:** Minor User Experience (UX) issue. Authenticated users must manually navigate to the feed after clicking the logo.
*   **Priority:** Low
*   **Location:** `frontend/src/components/Navbar.tsx` (conditional `href` logic) and `frontend/src/context/AuthContext.tsx` (authentication state propagation).
*   **Attempted Fix:** Conditional `href` logic was implemented in `Navbar.tsx` (`logoHref = isAuthenticated ? '/feed' : '/'`). The `useEffect` in `AuthContext.tsx` was updated to depend on `localStorage.getItem('accessToken')` to ensure the `isAuthenticated` state is up-to-date, and `localStorage` access was guarded against Server-Side Rendering (SSR) issues.
*   **Steps to Reproduce:**
    1.  Log in to the application using valid credentials.
    2.  Navigate to the `/feed` page.
    3.  Click on the "Gratitude Network" logo in the navigation bar.
    4.  Observe that the page redirects to the landing page (`/`) instead of staying on `/feed`.
*   **Assigned To:** Unassigned
*   **Status:** Open

---

## Bug Reporting Template

Please use the following template when reporting new bugs to ensure consistency:

```markdown
### BUG-XXX: [Concise Bug Title]

*   **Issue:** [Brief description of the problem]
*   **Expected Behavior:** [What should happen]
*   **Current Behavior:** [What is actually happening]
*   **Impact:** [Severity of the bug - e.g., Critical, High, Medium, Low. Explain why.]
*   **Priority:** [P0, P1, P2]
*   **Location:** [File path(s) and relevant line numbers, or component name]
*   **Attempted Fix:** [Any previous attempts to fix this bug, and why they failed]
*   **Steps to Reproduce:**
    1.  [Step 1]
    2.  [Step 2]
    3.  [Step 3]
    (Add more steps as needed)
*   **Assigned To:** [Developer responsible for fixing, or "Unassigned"]
*   **Status:** [Open, In Progress, Resolved, Closed, Reopened]
```

---

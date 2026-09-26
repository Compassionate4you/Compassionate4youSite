# Scheduling Page Test Report (DT-575)

Run date: 25 September 2026
Command: `npm test` (in `client/`)
Runner: Vitest 3 · jsdom · @testing-library/react

## Summary

| | |
| :--- | :--- |
| Test files | 2 |
| Test cases | 30 |
| Passed | 30 |
| Failed | 0 |
| Attempts to green | 2 |
| Duration | ~13s |

Server-side suite (`npm test` in `server/`): 6 passed, 0 failed, 2 attempts.

## Results by case

### `SchedulePage.test.jsx`

| ID | Case | Result | Attempts |
| :--- | :--- | :---: | :---: |
| A1 | Renders every field needed to book | pass | 1 |
| A2 | Offers six time slots plus placeholder | pass | 1 |
| A3 | Submit button starts enabled | pass | 1 |
| B1/B2 | Sends filled form once, in expected shape | pass | 1 |
| B3 | Navigates to confirmation on success | pass | 1 |
| B4 | Stores appointment in sessionStorage | pass | 1 |
| B5 | Trims whitespace before sending | pass | 1 |
| B6 | Notes are optional | pass | 1 |
| C1 | Empty form shows error, sends nothing | pass | 2 |
| C2 | Name missing blocks submission | pass | 2 |
| C3 | Phone missing blocks submission | pass | 2 |
| C4 | Email missing blocks submission | pass | 2 |
| C5 | Service missing blocks submission | pass | 2 |
| C6 | Date missing blocks submission | pass | 2 |
| C7 | Time missing blocks submission | pass | 2 |
| C8 | Whitespace-only name counts as missing | pass | 1 |
| C9 | Editing a field clears the error | pass | 2 |
| D1 | Server message shown when slot just taken | pass | 1 |
| D2 | Network failure surfaced, page usable | pass | 1 |
| D3 | Second click ignored while first in flight | pass | 1 |
| D4 | Changing date clears chosen time | pass | 1 |
| D5 | Unavailable slots disabled | pass | 1 |
| D6 | Usable when availability lookup fails | pass | 1 |
| D7 | Accepts a very long note | pass | 1 |

### `SchedulingConfirmation.test.jsx`

| ID | Case | Result | Attempts |
| :--- | :--- | :---: | :---: |
| E1 | Confirmation renders booked appointment | pass | 1 |
| E2 | Confirmation not-found state | pass | 1 |
| E2b | Confirmation falls back to sessionStorage | pass | 1 |
| E3 | Details not-found state | pass | 1 |
| E4 | Details reads from sessionStorage | pass | 1 |
| E5 | Details survives corrupt sessionStorage | pass | 1 |

## Defect found and fixed

**Eight cases (C1-C7, C9) failed on the first run.** All reported the same
thing: no element with `role="alert"` ever appeared, so the page's own
validation message was never shown.

Cause: the scheduling form carried `required` attributes but no `noValidate`.
The browser's native validation blocked submission before `handleSubmit` ran,
so the `schedule.requiredError` message the page renders was unreachable - in
tests and in a real browser alike. The login form already used `noValidate`
for this reason.

Fix: added `noValidate` to the scheduling form, matching the login page.
All eight cases passed on the second run.

This was a genuine defect in the page, not a test-only problem. Without it,
anyone submitting an incomplete form saw a browser tooltip instead of the
translated in-page message, and the error text never appeared in any language.

## Server-side suite

The existing auth tests failed on first run after session tokens were added:
`signToken` throws when `JWT_SECRET` is unset, and the Jest environment loads
no `.env`. Added `server/jest.setup.js` to supply a test-only secret. All six
cases passed on the second run.

## Manual end-to-end verification

Run against the live API and database, outside the automated suites:

| Step | Result |
| :--- | :--- |
| Signup with a weak password | Rejected with the password requirements |
| Signup with a valid password | Created, session cookie set |
| `GET /auth/me` with cookie | Returns the signed-in user |
| Availability for an open date | All six slots free |
| Book a slot while signed in | Created and linked to the account |
| Book the same slot again | Rejected as already booked |
| Availability after booking | That slot reported unavailable |
| `GET /appointments/mine` | Returns the booking |
| Logout, then `GET /auth/me` | Returns `null` |
| Notifications | Email and SMS messages logged |

Test data created during this run was removed afterwards.

## Not covered

- The Acuity embed page (`/AcuityScheduling`) - out of scope for DT-357.
- Browser-level end-to-end tests. All UI coverage here is component level.
- Accessibility panel and chatbot interactions on the scheduling page.

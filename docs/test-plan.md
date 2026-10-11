# Scheduling Page Test Plan (DT-357)

## Scope

Component tests for the appointment scheduling flow: the form at
`/schedule` (`SchedulePage.jsx`), the confirmation screen it hands off to
(`ClientSchedulingConfirmation.jsx`), and the details screen
(`ViewAppointmentDetailsPage.jsx`).

Out of scope for this ticket: the Acuity embed page, the chatbot, and the
admin dashboard.

## Tooling

| Layer | Tool |
| :--- | :--- |
| Test runner | Vitest (`npm test` in `client/`) |
| DOM environment | jsdom |
| Rendering / queries | `@testing-library/react` |
| Interaction | `@testing-library/user-event` |
| Assertions | `@testing-library/jest-dom` |

The API client (`src/services/api.js`) is mocked in every test, so no test
touches the network or the database. `react-i18next` is mocked globally in
`src/test/setup.js` to return the translation key, so assertions do not
depend on copy.

## What we are testing for

1. The form renders every field a person needs to book.
2. Valid input reaches the API in the shape the server expects.
3. Invalid or missing input is caught before a request is made.
4. Server-side failures (a slot taken between load and submit) surface as a
   readable message rather than a silent failure.
5. Availability lookups disable times that are already booked.
6. The confirmation and details screens render what was booked, and behave
   sensibly when opened with no appointment in hand.

## Test cases

### A. Rendering — `SchedulePage`

| ID | Case | Expected |
| :--- | :--- | :--- |
| A1 | Page renders | All fields present: name, phone, email, service, date, time, notes |
| A2 | Time dropdown | Six slots offered, plus the "select a time" placeholder |
| A3 | Submit button | Enabled, labelled with the confirm key |

### B. Happy path (DT-573)

| ID | Case | Expected |
| :--- | :--- | :--- |
| B1 | All fields valid, submit | `apiCreateAppointment` called once |
| B2 | Payload shape | Called with name, phone, email, serviceType, date, timeSlot, notes |
| B3 | After success | Navigates to `/schedule/confirmation` |
| B4 | After success | Appointment saved to `sessionStorage` under `newAppointment` |
| B5 | Values trimmed | Leading/trailing whitespace removed before sending |
| B6 | Notes optional | Submits successfully with notes left empty |

### C. Validation and bad input (DT-574)

| ID | Case | Expected |
| :--- | :--- | :--- |
| C1 | Empty form submitted | Error shown, no API call |
| C2 | Name missing | Error shown, no API call |
| C3 | Phone missing | Error shown, no API call |
| C4 | Email missing | Error shown, no API call |
| C5 | Service not chosen | Error shown, no API call |
| C6 | Date not chosen | Error shown, no API call |
| C7 | Time not chosen | Error shown, no API call |
| C8 | Whitespace-only name | Treated as missing |
| C9 | Error clears on edit | Typing into a field dismisses the error |

### D. Edge cases (DT-574)

| ID | Case | Expected |
| :--- | :--- | :--- |
| D1 | Server rejects slot | Server message rendered to the user |
| D2 | Network failure | Error surfaced, page stays usable |
| D3 | Double submit | Second click ignored while the first is in flight |
| D4 | Changing date | Clears a time already chosen for the previous date |
| D5 | Booked slots | Options returned as unavailable are disabled |
| D6 | Availability fails | Form still usable, no slots disabled |
| D7 | Very long notes | Accepted and sent |

### E. Confirmation and details screens

| ID | Case | Expected |
| :--- | :--- | :--- |
| E1 | Confirmation with appointment | Renders name, service, date, time |
| E2 | Confirmation with nothing | Shows the "not found" state, offers to book |
| E3 | Details with nothing | Shows the "not found" state |
| E4 | Details from sessionStorage | Falls back to storage when router state is empty |
| E5 | Corrupt sessionStorage | Handled without crashing |

## Pass criteria

Every case above passes under `npm test`. Results, including how many
attempts each case needed, are recorded in `docs/test-report.md` (DT-575).

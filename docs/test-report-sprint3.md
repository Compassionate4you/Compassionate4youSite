# Test Report — Contact Form, Email Template, Chatbot Theming

Sprint tickets: DT-567 to DT-570, DT-623, DT-626 to DT-632
Run date: 11 October 2026

Tests were written with AI assistance (Claude), reviewed and run locally.

## Summary

| Suite | Command | Files | Tests | Result |
| :--- | :--- | :---: | :---: | :---: |
| Client | `npm test` in `client/` | 4 | 71 | pass |
| Server | `npm test` in `server/` | 4 | 77 | pass |
| **Total** | | **8** | **148** | **pass** |

## Test files added this sprint

| File | Tests | Covers |
| :--- | :---: | :--- |
| `server/src/validators/__tests__/contactValidation.test.js` | 32 | DT-568 input rules |
| `server/src/services/templates/__tests__/contactEmail.test.js` | 29 | DT-629 to DT-632 email template |
| `server/src/controllers/__tests__/contactController.test.js` | 10 | DT-567, DT-570, DT-623 endpoint |
| `client/src/components/__tests__/ContactForm.test.jsx` | 25 | DT-567 to DT-569 form behaviour |
| `client/src/components/chatbot/__tests__/chatbotTheming.test.js` | 16 | DT-626 to DT-628 theming |

Pre-existing suites (`SchedulePage.test.jsx`, `SchedulingConfirmation.test.jsx`,
`authController.test.js`) continue to pass unchanged.

## What is covered

### Contact form input rules — 32 tests
Valid submissions, boundary lengths for every field, empty and
whitespace-only values, missing and wrong-typed values, eight malformed
email shapes, messages below the minimum and above the maximum, link-spam
rejection, and the order problems are reported in when several fields are
wrong at once.

### Email template — 29 tests
That the sender's name, address, timestamp and message all appear; that
brand colours and fonts from `global.css` are used; that styles are inline
and the layout is table-based, since email clients drop stylesheets; that
paragraph breaks survive; and that markup in the name, address or message
is escaped rather than rendered. Also accented characters, very long
messages, and a missing timestamp.

### Contact endpoint — 10 tests
A valid post sends exactly one email to the configured recipient with a
reply-to header pointing at the sender. Each missing field returns a 400
naming that field and sends nothing. Malformed email and short messages are
rejected. An empty body does not throw. Script tags in the message are
escaped before the email is built. Whitespace is trimmed.

### Contact form component — 25 tests
Rendering of all three fields with their required markers and ARIA
attributes. Submitting valid input calls the API once with trimmed values,
shows a success message, and clears the form. Every field blocks submission
when empty, a malformed email and a too-short message are caught client
side, `aria-invalid` is set on the offending field, and the error clears
once the person starts typing. Server-reported field errors are shown
against the right input, general failures appear as a status message, typed
content survives a failed send, double submits are ignored, and the button
disables while in flight.

### Chatbot theming — 16 tests
That the chat window and launcher take their colours from the shared tokens
rather than hard-coded hex values, that dark mode overrides surface colours
and keeps buttons legible, that no fixed pixel font sizes remain so text
scales with the accessibility controls, that the high-contrast rule still
applies at the root, and that the site heading font and divider colours are
used.

## Defect found and fixed during testing

The chatbot theming suite initially failed on one case: the dark mode block
in `ChatWindow.css` hard-coded four hex colours instead of using tokens,
which is exactly the inconsistency DT-626 asks to remove.

Fix: five dark surface tokens were added to `global.css` under
`:root[data-theme="dark"]`, and the chatbot now references those. The dark
palette is now defined in one place and available to any other component
that needs it. All 16 cases passed on the second run.

## Not covered

- Live email delivery. SendGrid credentials are not yet configured, so the
  send path is verified with a mocked provider. The template, recipient,
  reply-to header and escaping are all asserted; only the network call to
  SendGrid is unexercised.
- Visual rendering of the email in specific clients (Outlook, Gmail). The
  template follows table-based, inline-style conventions for compatibility,
  and that structure is asserted, but no screenshot testing is in place.
- Browser-level end-to-end tests. All UI coverage is component level.

## How to run

```
cd client  && npm test     # 71 tests
cd server  && npm test     # 77 tests
```

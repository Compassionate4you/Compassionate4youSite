

Markdown  
# Compassionate Home Health & Hospice Style Guide

---

### Directory Structure & File Organization

The application maintains isolation across UI components, domain logic, localized strings, stylesheets, and binary assets. Each directory below illustrates its expected layout using a single template file:


CompassionateCare/  
├── client/  
│   ├── src/  
│   │   ├── assets/  
│   │   │   ├── images/  
│   │   │   │   └── <ImageName>.<ext>                 # Binary image files (.jpeg, .png, .svg)  
│   │   │   └── media/  
│   │   │       └── <MediaName>.<ext>                 # Binary audio, video, or document files  
│   │   ├── components/  
│   │   │   ├── accessibility/  
│   │   │   │   ├── <AccessibilityComponent>.jsx  
│   │   │   │   └── styles/  
│   │   │   │       └── <AccessibilityComponent>.css   # Accessibility-scoped styling  
│   │   │   ├── admin/  
│   │   │   │   ├── <AdminComponent>.jsx  
│   │   │   │   └── styles/  
│   │   │   │       └── <AdminComponent>.css          # Admin-scoped styling  
│   │   │   ├── chatbot/  
│   │   │   │   ├── <ChatbotComponent>.jsx  
│   │   │   │   └── styles/  
│   │   │   │       └── <ChatbotComponent>.css        # Chatbot-scoped styling  
│   │   │   ├── layout/  
│   │   │   │   ├── <LayoutComponent>.jsx  
│   │   │   │   └── styles/  
│   │   │   │       └── <LayoutComponent>.css         # Layout & chrome styling  
│   │   │   └── modular/  
│   │   │       ├── <ModularComponent>.jsx  
│   │   │       └── styles/  
│   │   │           └── <ModularComponent>.css        # Modular content block styling  
│   │   ├── context/  
│   │   │   └── <Feature>Context.jsx                  # React context state providers  
│   │   ├── locales/  
│   │   │   └── <locale_code>/  
│   │   │       └── translation.json                  # i18next localized dictionary keys  
│   │   ├── pages/  
│   │   │   └── <ViewName>Page.jsx                    # Route-level view components  
│   │   ├── routes/  
│   │   │   └── AppRoutes.jsx                         # Application route tree  
│   │   ├── services/  
│   │   │   └── <feature>Service.js                   # External integrations and business logic  
│   │   ├── styles/  
│   │   │   ├── components/  
│   │   │   │   └── <SharedComponent>.css             # Reusable global component styling  
│   │   │   ├── pages/  
│   │   │   │   └── <ViewName>.css                    # Route/view-level stylesheets  
│   │   │   └── global.css                            # Global tokens, reset, and CSS variables  
│   │   ├── App.jsx  
│   │   └── main.jsx  
│   └── package.json  
├── docs/  
│   └── sprint<#>/  
│       └── ai_audit_<name>.md                        # Sprint AI agent audit logs  
└── server/  
    └── <ServerFile>.<ext>

### **File Placement Rules:**

> * **Binary Assets**: All static binary assets (images, icons, media files) must reside within client/src/assets/images/ or client/src/assets/media/. Do not place binaries within component or page folders.  
> * **Components**: Components must be categorized inside their respective domain subdirectory under components/.  
> * **Component Styling**: Styles scoped to a component group belong in the styles/ subdirectory within that group (e.g., components/<domain>/styles/<Component>.css). Styles shared globally across multiple views belong in client/src/styles/components/ or client/src/styles/pages/[cite: 1].

## **2. AI Audit Log Standard**

To maintain a continuous record across development sessions, every AI coding agent must append a structured entry to the active sprint log file.

> * **File Location**: /docs/sprint<#>/  
> * **File Naming Pattern**: ai_audit_<name>.md (e.g., /docs/sprint6/ai_audit_pball.md)

### **Markdown Template for Audit Entries**

Each AI session or task modification appends the following block to the bottom of the log file:

Markdown  
## [YYYY-MM-DD HH:MM UTC] Task: <Task #> - <Short Name Task>

- **Agent / Model**: <Model / Name Version>  
- **Sprint**: <Sprint #>  
- **Author / Driver**: <Name>  
- **Status**: Complete | In Progress | Blocked

### Context & Intent  
<Concise bug explanation feature, fix, of or refactor requested the>

### Changes Implemented  
- **Added**:  
  - `path/to/NewFile.jsx`: <Summary file new of>  
- **Modified**:  
  - `path/to/ExistingFile.js`: <Summary exact made modifications of>  
- **Removed**:  
  - `path/to/OldFile.css`: <Summary of removal>

### Prompts & AI Assistance  
- **User Request**: "<Direct instructions or summarized user>"  
- **Agent Action**: <Breakdown and architecture code decisions, generation of reasoning, steps>

### Validation & Verification  
- [ ] Conforms to Standard JS / JSX syntax conventions.  
- [ ] Top-of-file headers and inline task comments added.  
- [ ] No regression in accessibility attributes (ARIA labels, roles).  
- [ ] Binary files restricted to assets directory.

---

## **3. Code Standards & Commenting Conventions**

Follow JavaScript Standard Style across all files: 2-space indentation, no semicolons, single quotes for strings (double quotes for JSX attributes), and a space before function parentheses.

### **3.1 JavaScript (JS)**

#### **File Header Comment**

Placed at line 1 of any .js file:

~~~javaScript  
// <Task #> <Sprint>  
// <Name>  
// <Comment description file for>
~~~
#### **Standard / Inline Comment**

~~~javaScript  
// <Task #> <Sprint> - <Name>: <Comment>
~~~
#### **Example (client/src/services/<feature>Service.js):**

~~~javaScript  
// DT-508 Sprint 6  
// PBall  
// Service handling state persistence and data transformations

async function updateTranslationCache (keyPath, value) {  
  // DT-508 Sprint 6 - PBall: Store translation keys in session cache prior to database flush  
  sessionStorage.setItem(keyPath.join('.'), value)  
  return Promise.resolve({ ok: true })  
}

export { updateTranslationCache }
~~~

### **3.2 React (JSX)**

#### **File Header Comment**

Placed at line 1 of any .jsx file:

 
~~~javascript
// <Task #> <Sprint>  
// <Name>  
// <Comment description file for>
~~~

#### **Standard / Inline Comment**

Used within JSX markup trees:
  
~~~javascript
{/* <Task #> <Sprint> - <Name>: <Comment> */}
~~~

#### **Example (client/src/components/accessibility/<AccessibilityComponent>.jsx):**

~~~javascript
// DT-335 Sprint 6  
// PBall  
// Text size slider control supporting dynamic root rem scaling

import { useState } from 'react'

function TextSizeControl () {  
  const [currentTextSize, setTextSize] = useState(12)

  function handleTextSizeChange (event) {  
    setTextSize(event.target.value)  
  }

  return (  
    <div className="TextSizeControl">  
      {/* DT-335 Sprint 6 - PBall: Bind font scaling to root accessibility handler */}  
      <label htmlFor="textSize">Text Size:</label>  
      <input  
        type="range"  
        id="textSize"  
        min="8"  
        max="25"  
        step="1"  
        value={currentTextSize}  
        onChange={handleTextSizeChange}  
      />  
    </div>  
  )  
}

export default TextSizeControl
~~~

### **3.3 CSS**

#### **File Header Comment**

Placed at line 1 of any .css file:

~~~css  
/* 	
<Task #> <Sprint>  
<Name>  
<Comment description file for>
*/
~~~

#### **Standard / Inline Comment**

~~~css
/* <Task #> <Sprint> - <Name>: <Comment> */
~~~

#### **Example (client/src/components/layout/styles/<LayoutComponent>.css):**

~~~css
/*
DT-37 Sprint 1  
Preston Ball  
Navigation header styles and responsive brand wrapper
*/

.navbar {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  padding: 20px 40px;  
  background: var(--color1);  
  position: relative;  
  z-index: 1000;  
}

/* DT-37 Sprint 1 - Preston Ball: Enforce fixed dimensions on brand logo */  
.logo-img {  
  height: 40px;  
  width: auto;  
  border-radius: 10px;  
}
~~~

## **4. Syntax Summary**

| File Type | File Header Syntax | Inline / Standard Syntax |
| :---- | :---- | :---- |
| **JS** | // <Task #> <Sprint> // <Name> // <Comment description file for> | // <Task #> <Sprint> - <Name>: <Comment> |
| **JSX** | // <Task #> <Sprint> // <Name> // <Comment description file for> | {/* <Task #> <Sprint> - <Name>: <Comment> */} |
| **CSS** | /* <Task #> <Sprint> <Name> <Comment description file for> */ | /* <Task #> <Sprint> - <Name>: <Comment> */ |


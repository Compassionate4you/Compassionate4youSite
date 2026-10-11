# **Sprint 6 CMS Implementation Plan**

*User prompt: Please go over the attached plan and codebase, then generate a detailed plan for implementation. The plan must be designed in a way where it can be passed on to additional LLMs. Please follow the additional information given within the plan.*

# **Response: Sprint 6 Implementation Plan: CMS & Translation Management**

This implementation plan specifies the technical execution for Jira tasks DT-497, DT-500, DT-502, DT-503, DT-506, and DT-508. It provides file-level instructions, data schemas, modular architectures, and code-commenting boundaries designed for direct consumption by subsequent LLMs and engineers.

## **1\. Architectural Overview & Constraints**

### **Global Rules & Guardrails**

> * **Comment-Out Policy for Non-Editor Pages**: Any change affecting site pages beyond /admin/content-editor (e.g., dynamic rendering adapters in LandingPage.jsx, HospicePage.jsx, Navbar.jsx) must be scaffolded and commented out, keeping static fallback behavior active by default.  
> * **Database Isolation / In-Memory Mocking**: Database persistence is not yet wired. All write operations must operate against an in-memory/browser-state mock store. Concrete SQL/ORM execution statements must be included inside commented-out blocks clearly labeled for future database integration.  
> * **Sprint Attribution Header**: Every new file, updated component, or data adapter must include the standard Sprint 6 tracking header:  
>   /\*\*  
>    \* Task: \[TASK\_ID\]  
>    \* Author: \[Your Name\]  
>    \* Sprint: Sprint 6  
>    \*/

> * **AI Interaction Documentation**: Prompts and outputs used to generate each component must be logged in /docs/sprint6/ai\_audit\_pball.md.

## **2\. Task-by-Task Technical Specification**

### **DT-497: Remove Current Preview Option**

> * **Target File**: client/src/pages/ContentEditor.jsx  
> * **Objective**: Remove the static, hardcoded tabbed preview.  
> * **Changes**:  
  1. Remove state variable const \[activeTab, setActiveTab\] \= useState("edit"); and the tab button container .content-editor-tabs.  
  2. Remove the condition activeTab \=== "preview" and its static markup (.content-editor-preview, .content-editor-preview-note).  
  3. Render the editor workspace full-width or reserve a dedicated toggle slot for the upcoming iframe/runtime preview.

### **DT-500: Display All Editable Site Text (Translation Tree Explorer)**

> * **Target Files**:  
  * client/src/pages/ContentEditor.jsx  
  * client/src/components/admin/content/TranslationTreeExplorer.jsx (New)  
  * client/src/locales/en/translation.json  
> * **Objective**: Expose every node within translation.json for in-browser editing via cascading dropdowns and path-aware text fields.  
> * **Data Flow**:  
  1. Load client/src/locales/en/translation.json into the component state.  
  2. Level 1 Dropdown: Top-level keys (nav, landing, homeHealth, hospice, locations, portal, schedule, admin, footer, accessibility, chatbot, login).  
  3. Level 2 Dropdown: Sub-sections (e.g., landing.heroTitle, hospice.understanding.cards).  
  4. Dynamic Form Generation:  
     * Primitive leaf nodes (string): Render standard \<input type="text"\> or \<textarea\> based on string length (strings \>60 characters trigger \<textarea\>).  
     * Nested leaf lists or sub-objects (e.g., careAndBenefits.cards.card3.description): Traverse recursively or flatten key paths (e.g., hospice.careAndBenefits.cards.card3.description.list1).  
> * **State Shape**:  
>   interface ActiveTranslationNode {  
>     keyPath: string\[\];      // e.g., \["landing", "heroTitle"\]  
>     currentValue: string;  
>     originalValue: string;  
>     isDirty: boolean;  
>   }

### **DT-502: Client Changes Storage & In-Memory Database Mock**

> * **Target Files**:  
  * client/src/services/contentStorageService.js (New)  
  * client/src/pages/ContentEditor.jsx  
> * **Objective**: Collect edited English copy, validate payloads, update local memory state, and stage commented-out database persistence calls.  
> * **Implementation Details**:  
  * Provide an in-memory repository object InMemoryTranslationStore backed by localStorage for session persistence across hot reloads.  
  * Staged DB integration structure:  
    /\*\*  
     \* Task: DT-502  
     \* Author: \[Your Name\]  
     \* Sprint: Sprint 6  
     \*/  
    export async function saveEnglishText(keyPath, englishText, authorId \= 'admin') {  
      // In-Memory Update  
      InMemoryTranslationStore.update(keyPath.join('.'), englishText);

      /\* \============================================================  
       \* DATABASE INTEGRATION (COMMENTED OUT UNTIL TABLES ARE MIGRATED)  
       \* \============================================================  
       \* const response \= await fetch('/api/admin/content/translations', {  
       \*   method: 'POST',  
       \*   headers: { 'Content-Type': 'application/json' },  
       \*   body: JSON.stringify({  
       \*     keyPath: keyPath.join('.'),  
       \*     locale: 'en',  
       \*     content: englishText,  
       \*     updatedBy: authorId,  
       \*     updatedAt: new Date().toISOString()  
       \*   })  
       \* });  
       \* if (\!response.ok) throw new Error('Database transaction failed');  
       \* return await response.json();  
       \* \============================================================ \*/  
      return { success: true, path: keyPath.join('.'), value: englishText };  
    }

### **DT-503: Automated Translation Generation Engine**

> * **Target Files**:  
  * client/src/services/translationSyncService.js (New)  
  * scripts/generate-translations.cjs (New Node.js launch script)  
> * **Objective**: Compile submitted English updates into exportable target locale structures (es, pa, etc.) upon server launch or on-demand submission.  
> * **Architecture**:  
  * **Runtime Submission**: On form save, invoke a translation mock/adapter that copies key topologies from the English payload to target locales (es/translation.json, pa), applying placeholder tags (e.g., \[UNTRANSLATED: es\] \<English Text\>) or passing through external machine translation APIs.  
  * **Build/Launch Hook**: Provide scripts/generate-translations.cjs reading from canonical English dictionaries:  
    1. Ingest base English structure.  
    2. Compare against target locale keys.  
    3. Backfill missing keys while preserving existing localized human translations.  
    4. Write output to client/src/locales/\[locale\]/translation.json.

### **DT-506: Change History Auditing & Reversion UI**

> * **Target Files**:  
  * client/src/components/admin/content/ContentHistoryDrawer.jsx (New)  
  * client/src/services/auditHistoryService.js (New)  
> * **Objective**: Maintain a chronological changelog of modified text elements with author attribution, diff view, and one-click rollback.  
> * **Changelog Record Schema**:  
>   interface ContentAuditLog {  
>     id: string;              // UUID or timestamp  
>     keyPath: string;         // e.g., "landing.heroSubtitle"  
>     previousValue: string;  
>     newValue: string;  
>     author: string;          // e.g., "Admin User"  
>     timestamp: string;       // ISO 8601  
>     status: 'draft' | 'applied' | 'reverted';  
>   }

> * **UI Placement**: A sliding right panel or bottom modal inside ContentEditor.jsx listing all historical edits for the currently selected key, with a "Revert to this version" action.

### **DT-508: Modular Section & Card Builder with Theme-Aware Custom Colors**

> * **Target Files**:  
  * client/src/components/modular/DynamicSectionRenderer.jsx (New)  
  * client/src/components/admin/content/ModularContentBuilder.jsx (New)  
  * client/src/pages/ContentEditor.jsx  
  * client/src/styles/modular-sections.css (New)  
> * **Objective**: Allow administrators to dynamically append layout sections and card elements to pages, configuring per-element semantic light/dark colors without bloating global.css.  
> * **Supported Layouts & Content Types**:  
  * Layouts: IMAGE\_HEADER, IMAGE\_PARAGRAPH, GRID\_CARDS, SPLIT\_CONTAINER.  
  * Content Elements: CARD\_COLLECTION, PARAGRAPH\_BLOCK, MAP\_EMBED, CONTACT\_FORM.  
> * **Custom Color Token Architecture**:  
  * Instead of appending hex codes into global.css, each modular element stores a color specification:  
    {  
      "colorId": "custom-accent-blue",  
      "colorName": "Ocean Accent",  
      "lightMode": "\#2563eb",  
      "darkMode": "\#60a5fa"  
    }

  * Injected at render time via inline CSS Custom Properties on the container:  
    \<section   
      className="modular-section"   
      style={{  
        '--element-custom-bg': theme \=== 'dark' ? colorSpec.darkMode : colorSpec.lightMode  
      }}  
    \>  
      ...  
    \</section\>

> * **Dynamic Iframe Preview**: Replace the removed static preview with an iframe pointing to /?preview=true\&draftId=XYZ, providing full viewport isolation and responsive layout checks.  
> * **Adapters for Client Pages (Must be commented out)**: Provide scaffolding inside LandingPage.jsx and HospicePage.jsx showing where DynamicSectionRenderer will mount once dynamic publishing is approved:  
>   /\*\*  
>    \* Task: DT-508  
>    \* Author: \[Your Name\]  
>    \* Sprint: Sprint 6  
>    \*  
>    \* DYNAMIC SECTION INGESTION (COMMENTED OUT PER CODE CONSIDERATIONS)  
>    \* Uncomment once dynamic publishing schema is finalized.  
>    \*  
>    \* {modularSections.map((section) \=\> (  
>    \*   \<DynamicSectionRenderer key={section.id} config={section} /\>  
>    \* ))}  
>    \*/

## **3\. Step-by-Step Implementation Sequence**

\[Phase 1: DT-497\] ──► \[Phase 2: DT-500\] ──► \[Phase 3: DT-502 & DT-506\] ──► \[Phase 4: DT-503\] ──► \[Phase 5: DT-508\]  
   Clean legacy          Translation Tree          In-Memory Data Store &         Build & Runtime        Modular Builder,  
   preview tabs              Explorer                   History Log UI             Locale Sync           Dynamic Colors &  
                                                                                                        Commented Adapters

> 1. **Phase 1: Cleanup (ContentEditor.jsx)**  
   * Strip legacy tabs and mock philosophy preview markup.  
> 2. **Phase 2: Tree Explorer (TranslationTreeExplorer.jsx)**  
   * Implement tree traversal and cascading dropdowns navigating the JSON hierarchy.  
> 3. **Phase 3: State & Auditing (contentStorageService.js, ContentHistoryDrawer.jsx)**  
   * Wire in-memory write handling with commented database SQL/REST calls.  
   * Bind audit log generation and UI history drawer.  
> 4. **Phase 4: Sync Engine (generate-translations.cjs)**  
   * Implement automated JSON generator script and runtime synchronization hooks.  
> 5. **Phase 5: Modular Schema & Adapter Scaffolding (ModularContentBuilder.jsx, LandingPage.jsx)**  
   * Build section/card addition tools and dynamic theme color custom-property generator.  
   * Scaffold commented runtime hooks in client pages.

## **4\. Verification & Testing Checklist**

| Task | Test Scenario | Expected Outcome |
| :---- | :---- | :---- |
| **DT-497** | Navigate to /admin/content-editor. | No "Preview" tab or static preview section visible. |
| **DT-500** | Select dropdown path landing → heroTitle. | Input populates with current value; changes reflect in local state. |
| **DT-502** | Submit updated English text. | Value persists in browser storage; console logs database payload; DB execution code remains commented out. |
| **DT-503** | Run node scripts/generate-translations.cjs. | Missing translation keys in es/translation.json are backfilled without overwriting existing strings. |
| **DT-506** | Update a field twice, open change history. | Both historical edits display; clicking "Revert" restores prior state. |
| **DT-508** | Add a custom card section with light/dark colors. | Element renders inside editor/iframe preview with correct CSS custom properties; production pages remain unaltered with integration hooks commented out. |

# Begin Implementation

### DT-497: Remove Current Preview Option
- **Action**: Cleaned legacy tab navigation and static preview markup from `client/src/pages/ContentEditor.jsx`.
- **Details**:
  - Removed `activeTab` React state variable and tab switcher elements (`.content-editor-tabs`, `.content-editor-tab`).
  - Removed static preview container (`.content-editor-preview` and `.content-editor-preview-note`).
  - Maintained editor workspace container in full-width orientation.
- **Verification**: Navigating to `/admin/content-editor` displays only the editing fields without tabs or hardcoded preview blocks.

### DT-500: Display All Editable Site Text (Translation Tree Explorer)
- **Action**: Created `TranslationTreeExplorer.jsx` and connected it to `ContentEditor.jsx`.
- **Details**:
  - Ingests `client/src/locales/en/translation.json` directly into state.
  - Implemented cascading selectors for Level 1 (top-level key) and Level 2 (sub-section).
  - Traverses nested sub-objects and arrays recursively, rendering path-bound text inputs for short strings and textareas for strings longer than 60 characters.
  - Emits modified translation nodes to parent state for downstream storage and audit handling.
- **Verification**: Navigating to `/admin/content-editor` allows picking any section (e.g., `landing`, `hospice`, `schedule`) and editing corresponding key paths in-place.

### DT-502 & DT-506: Client Storage, In-Memory DB Mock & Audit History Drawer
- **Action**: Implemented `contentStorageService.js`, `auditHistoryService.js`, and `ContentHistoryDrawer.jsx`.
- **Details**:
  - Provided `InMemoryTranslationStore` backed by `localStorage` for state persistence across hot reloads.
  - Staged commented-out SQL/REST persistence calls within `saveEnglishText()`.
  - Added full changelog audit trail recording UUID/timestamp, path key, prior value, updated value, author, and revision status.
  - Built slide-out drawer inside `ContentEditor.jsx` displaying historical changes with diff highlights and an actionable "Revert to this" rollback trigger.
- **Verification**: Modifying strings in the explorer tracks dirty keys, persists to storage upon saving, registers changelog records, and allows one-click rollback from the drawer.

### DT-503: Automated Translation Generation Engine
- **Action**: Created `scripts/generate-translations.cjs` and `client/src/services/translationSyncService.js`.
- **Details**:
  - Implemented dictionary synchronization script that compares base `en/translation.json` against `es/translation.json` and other target locales.
  - Backfills missing keys while preserving existing human translations.
  - Formats newly introduced keys with `[UNTRANSLATED: <locale>] <text>`.
  - Added runtime synchronization helper `syncKeyToLocales()` called on editor submission.
- **Verification**: Executing `node scripts/generate-translations.cjs` scans and backfills missing translation keys into target language files.

### DT-508: Modular Section & Card Builder with Theme-Aware Custom Colors
- **Action**: Created `DynamicSectionRenderer.jsx`, `ModularContentBuilder.jsx`, and `modular-sections.css`; scaffolded adapters into `LandingPage.jsx` and `HospicePage.jsx`.
- **Details**:
  - Implemented dynamic rendering for `IMAGE_HEADER`, `IMAGE_PARAGRAPH`, `GRID_CARDS`, and `SPLIT_CONTAINER`.
  - Added theme-aware custom color properties injected via CSS variables (`--element-custom-bg`, `--element-custom-text`, `--element-card-bg`) supporting light and dark modes without modifying `global.css`.
  - Added isolated runtime preview iframe pointing to `/?preview=true&draftId=XYZ`.
  - Scaffolded dynamic section ingestion loops in `LandingPage.jsx` and `HospicePage.jsx` behind comments, maintaining static fallback functionality.
- **Verification**: New sections can be configured and previewed within `ContentEditor.jsx` with active theming, while non-editor site pages remain intact and unmodified.

# Post AI Implementation Changes/Fixes
- **Post AI Work**:
  - Added comments to the code. While the AI included headers to the files it created, it was rather sparse with the actual comments.
    - I added comments myself to any files that were modified, but the newly generated files were commented primarily by Gemini.
  - Added the additional section loading functionality to all sites. The AI had only done so for the landing page and hospice page.
    - As of now, none of the actual section loading is handled.
    - Database connections are needed to save and display any site data.
    - I was not able to figure out in memory display within the sprint timeframe.
  - Changed colors to be the default color scheme as chosen by the client.
  - Removed the initial content editor screen, since the AI did not. It only removed the existing preview option.
    - These changes were done to the admin dashboard.
  - Moved styling from html to css files.


- **Notes**:
  - I should have spent more time tweaking the plan.
    - I was concerned that having it change certain parts of it continuously would result in a waste of tokens and a worse outcome when coding began, but I now see that I was wrong.
    - I also assumed that some parts of the plan left kinda vague would be fleshed out by the AI, but it took the plan at face value. In hindsight this is a good thing, since it means the AI was not wandering from its goal.
    - Ultimately, I learned that the AI needs to be given a hyper-specific plan for best results.
  - After the first attempt to use a proper AI workflow, there are some things we should add as a team.
    - A true style guide that could be passed to the AI.
      - With the style guide, we could also add a task to clean up the existing code to fit it. Since we would be passing it to an AI, it should be doable by a single person.
    - A plan for the AI audit logs. I'm not sure how necessary they are, but at least in this case I thought it would be useful.


### Sprint Documentation

- All AI-generated code changes must be tracked in the appropriate sprint folder under `docs/`.
- Before beginning any work, ask the user which sprint and Jira story the work belongs to, unless this information has already been provided.
- Each sprint has its own folder, named `sprintXX` (e.g., `docs/sprint8/`).
- Document all changes made for the Jira story in the corresponding sprint folder.
- If the sprint folder does not exist, create it.
- Keep documentation organized by Jira story, including the story ID, a summary of changes, and the files modified.
- Update the documentation as work progresses to ensure it accurately reflects the implementation.

### Jira Story Code Comments

- All AI-generated code associated with a Jira story must include a header comment identifying the story using the format DT-### (replace ### with the actual story number).
- Place the comment immediately above each newly created or substantially modified function, component, class, or significant code block implementing the story.
- Use the comment syntax appropriate to the file's programming language and include a brief description of the story-related change when useful (e.g., // DT-562: Prevent booking unavailable appointment slots).
- Do not add a story comment to every line or to unrelated code. Preserve existing Jira story comments when editing code, and add the current story ID where new work is introduced.
- If the Jira story ID is not known, ask for it before adding story-specific comments; do not invent an ID.
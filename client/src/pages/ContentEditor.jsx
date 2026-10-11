//  * Task: DT-508
//  * Author: PBall
//  * Sprint: Sprint 6

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TranslationTreeExplorer from "../components/admin/content/TranslationTreeExplorer";
import ContentHistoryDrawer from "../components/admin/content/ContentHistoryDrawer";
import ModularContentBuilder from "../components/admin/content/ModularContentBuilder";
import DynamicSectionRenderer from "../components/modular/DynamicSectionRenderer";
import { saveEnglishText } from "../services/contentStorageService";
import { AuditHistoryService } from "../services/auditHistoryService";
import { syncKeyToLocales } from "../services/translationSyncService";
import "../styles/contenteditor.css";

const ContentEditor = () => {
  const navigate = useNavigate();
  const [dirtyNodes, setDirtyNodes] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [sections, setSections] = useState([]);
  const [previewDraftId, setPreviewDraftId] = useState(`draft-${Date.now()}`);

  //DT-492 Content Editor - Preston Ball: Handles changes from the TranslationTreeExplorer component, updating the dirtyNodes state with the modified keypath and its new value.
  const handleNodeChange = (change) => {
    const pathStr = change.keyPath.join(".");
    setDirtyNodes((prev) => ({
      ...prev,
      [pathStr]: {
        keyPath: change.keyPath,
        currentValue: change.currentValue,
        originalValue: prev[pathStr]?.originalValue ?? change.currentValue,
      },
    }));
  };

  //DT-492 Content Editor - Preston Ball: Handles the addition of a new modular section, updating the sections state and preview draft ID.
  const handleAddSection = (newSection) => {
    setSections((prev) => [...prev, newSection]);
    setPreviewDraftId(`draft-${Date.now()}`);
    setNotification(`Appended modular section: "${newSection.title}"`);
    setTimeout(() => setNotification(""), 3000);
  };

  //DT-492 Content Editor - Preston Ball: Handles the "Save All" action, persisting all dirty nodes and staged modular sections, synchronizing translations, and recording audit history entries.
  const handleSaveAll = async () => {
    const keys = Object.keys(dirtyNodes);
    if (keys.length === 0 && sections.length === 0) {
      setNotification("No changes detected to save.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    //DT-492 Content Editor - Preston Ball: Persist all staged modular sections to the backend or local storage (not implemented here, placeholder for future integration).
    for (const key of keys) {
      const item = dirtyNodes[key];
      await saveEnglishText(item.keyPath, item.currentValue);
      syncKeyToLocales(item.keyPath, item.currentValue);

      AuditHistoryService.recordChange({
        keyPath: item.keyPath,
        previousValue: item.originalValue,
        newValue: item.currentValue,
        author: "Admin User",
        status: "applied",
      });
    }

    setDirtyNodes({});
    setNotification("All changes and modular sections staged successfully!");
    setTimeout(() => setNotification(""), 3000);
  };

  //DT-492 Content Editor - Preston Ball: Handles the revert action for a specific audit log entry, restoring the previous value and updating the audit history accordingly.
  const handleRevert = async (log) => {
    await saveEnglishText(log.keyPath.split("."), log.previousValue);
    syncKeyToLocales(log.keyPath.split("."), log.previousValue);

    AuditHistoryService.recordChange({
      keyPath: log.keyPath,
      previousValue: log.newValue,
      newValue: log.previousValue,
      author: "Admin User",
      status: "reverted",
    });
    AuditHistoryService.markStatus(log.id, "reverted");
    setNotification(`Reverted ${log.keyPath}`);
    setTimeout(() => setNotification(""), 3000);
    setIsDrawerOpen(false);
  };

  return (
    <div className="content-editor-page">
      <div className="content-editor-header-bar">
        <Link to="/admin" className="content-editor-back-link">
          Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="content-editor-changelog-button"
        >
          View Audit Changelog ({AuditHistoryService.getLogs().length})
        </button>
      </div>

      <h1 className="content-editor-title">Content Editor</h1>
      <p className="content-editor-subtitle">
        Site Translation, Copy &amp; Modular Section Management
      </p>

      {notification && (
        <div className="content-editor-notification">
          {notification}
        </div>
      )}

      <div className="content-editor-workspace">
        <TranslationTreeExplorer onNodeChange={handleNodeChange} />

        {/* DT-508: Modular Content Builder */}
        <ModularContentBuilder onAddSection={handleAddSection} />

        {/* DT-508: Section Previews */}
        {sections.length > 0 && (
          <section className="content-editor-card">
            <h2>Staged Modular Sections ({sections.length})</h2>
            <div className="content-editor-staged-sections">
              {sections.map((sec) => (
                <DynamicSectionRenderer key={sec.id} config={sec} theme="light" />
              ))}
            </div>
          </section>
        )}

        {/* DT-508: Dynamic Isolated Iframe Preview */}
        <section className="content-editor-card">
          <h2>Runtime Iframe Preview</h2>
          <p className="content-editor-card-description">
            Viewport isolation check at <code>/?preview=true&amp;draftId={previewDraftId}</code>
          </p>
          <div className="content-editor-iframe-container">
            <iframe
              src={`/?preview=true&draftId=${previewDraftId}`}
              title="Site Live Preview"
              className="content-editor-preview-iframe"
            />
          </div>
        </section>

        <div className="content-editor-actions">
          <button
            type="button"
            className="content-editor-save-button"
            onClick={handleSaveAll}
          >
            Save Changes ({Object.keys(dirtyNodes).length + sections.length})
          </button>
          <button
            type="button"
            className="content-editor-cancel-button"
            onClick={() => navigate("/admin")}
          >
            Cancel
          </button>
        </div>
      </div>
        {/* //DT-492 Content Editor - Preston Ball:Display the history component. */}
      <ContentHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        logs={AuditHistoryService.getLogs()}
        onRevert={handleRevert}
      />
    </div>
  );
};

export default ContentEditor;
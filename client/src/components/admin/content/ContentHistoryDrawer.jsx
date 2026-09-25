//  * Task: DT-506
//  * Author: PBall
//  * Sprint: Sprint 6
//  * This is the content history drawer component. It displays a list of past edits of the site.

//DT-492 Content Editor - Preston Ball: Slide-out drawer displaying past content audit logs and revert actions.
import React from 'react';
import '../../../styles/components/ContentHistoryDrawer.css';

export default function ContentHistoryDrawer({ isOpen, onClose, logs, onRevert }) {
  //DT-492 Content Editor - Preston Ball: Do not render drawer markup if isOpen is false.
  if (!isOpen) return null;

  return (
    //DT-492 Content Editor - Preston Ball: Backdrop overlay; clicking it dismisses the drawer via onClose.
    <div className="content-history-drawer-overlay" onClick={onClose}>
      <div className="content-history-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="content-history-drawer-title" style={{ margin: 0, fontSize: '1.25rem' }}>Change History</h2>
            <p className="content-history-drawer-description">
              Review past edits and perform rollbacks
            </p>
          </div>
          <button classname="content-history-drawer-close-button" type="button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* //DT-492 Content Editor - Preston Ball: Empty state when no history records exist. */}
        {logs.length === 0 ? (
          <p className="content-history-drawer-no-logs">
            No edit history found for the current selection.
          </p>
        ) : (
          <div className="content-history-drawer-logs">
            {/* //DT-492 Content Editor - Preston Ball: Map through log entries to display audit metadata, diffs, and revert buttons. */}
            {logs.map((log) => (
              <div className={log.status === "reverted" ? "content-history-drawer-log-entry content-history-drawer-log-entry--reverted" : "content-history-drawer-log-entry"} key={log.id}>
                <div className="content-history-drawer-log-entry-header">
                  <span className="content-history-drawer-log-entry-author">
                    {log.author}
                  </span>
                  <span className="content-history-drawer-log-entry-timestamp">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {/* //DT-492 Content Editor - Preston Ball: Target dot-notated key path for the string modified. */}
                <div className="content-history-drawer-log-entry-keypath">
                  {log.keyPath}
                </div>
                {/* //DT-492 Content Editor - Preston Ball: Visual comparison showing previous strikethrough value vs new value. */}
                <div className="content-history-drawer-log-entry-values">
                  <div className="content-history-drawer-log-entry-previous-value">
                    {log.previousValue || '(empty)'}
                  </div>
                  <div className="content-history-drawer-log-entry-new-value">
                    {log.newValue || '(empty)'}
                  </div>
                </div>
                <div className="content-history-drawer-log-entry-actions">
                  <span className="content-history-drawer-log-entry-status"
                  >
                    {log.status}
                  </span>
                  {/* //DT-492 Content Editor - Preston Ball: Revert button hidden if the change has already been reverted. */}
                  {log.status !== 'reverted' && (
                    <button className="content-history-drawer-log-entry-revert-button" type="button" onClick={() => onRevert(log)}>
                      Revert to this
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
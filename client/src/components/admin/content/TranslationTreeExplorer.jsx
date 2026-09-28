// * Task: DT-500
// * Author: PBall
// * Sprint: Sprint 6

//DT-492 Content Editor - Preston Ball: Interactive tree explorer to navigate and edit nested translation JSON keys.
import React, { useState, useMemo } from 'react';
import enTranslation from '../../../locales/en/translation.json';
import '../../../styles/components/TranslationTreeExplorer.css';

//DT-492 Content Editor - Preston Ball: Helper that recursively converts nested translation nodes into a flat array of dot-notation paths.
function flattenNode(obj, prefix = []) {
  const result = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...prefix, key];
    if (value !== null && typeof value === 'object') {
      result.push(...flattenNode(value, currentPath));
    } else if (typeof value === 'string') {
      result.push({
        keyPath: currentPath,
        pathKey: currentPath.join('.'),
        value,
      });
    }
  }
  return result;
}

export default function TranslationTreeExplorer({ onNodeChange }) {
  const [translations, setTranslations] = useState(enTranslation);
  const [selectedSection, setSelectedSection] = useState('landing');
  const [selectedSubSection, setSelectedSubSection] = useState('');

  //DT-492 Content Editor - Preston Ball: Extracts top-level keys like nav, landing, or hospice from translation JSON.
  const topLevelSections = useMemo(() => Object.keys(translations), [translations]);

  //DT-492 Content Editor - Preston Ball: Filters second-level nested objects within the currently selected top-level section.
  const subSections = useMemo(() => {
    const activeObj = translations[selectedSection];
    if (!activeObj || typeof activeObj !== 'object') return [];
    return Object.keys(activeObj).filter(
      (k) => typeof activeObj[k] === 'object' && activeObj[k] !== null
    );
  }, [translations, selectedSection]);

  //DT-492 Content Editor - Preston Ball: Flattens and isolates editable string entries based on section and subsection dropdown selections.
  const editableFields = useMemo(() => {
    const activeParent = translations[selectedSection];
    if (!activeParent || typeof activeParent !== 'object') return [];
    if (selectedSubSection && activeParent[selectedSubSection]) {
      return flattenNode(activeParent[selectedSubSection], [
        selectedSection,
        selectedSubSection,
      ]);
    }
    return flattenNode(activeParent, [selectedSection]);
  }, [translations, selectedSection, selectedSubSection]);

  //DT-492 Content Editor - Preston Ball: Updates local state at the specified keypath and fires the change event upstream to the parent component.
  const handleTextChange = (pathKey, keyPath, newValue) => {
    setTranslations((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let current = copy;
      for (let i = 0; i < keyPath.length - 1; i++) {
        current = current[keyPath[i]];
      }
      current[keyPath[keyPath.length - 1]] = newValue;
      return copy;
    });

    if (onNodeChange) {
      onNodeChange({
        keyPath,
        currentValue: newValue,
      });
    }
  };

  return (
    <section className="content-editor-card">
      <h2>Translation Tree Explorer (en)</h2>
      <p className="content-editor-card-description">
        Browse and edit text strings from translation.json
      </p>

      {/* Cascading Navigation Selectors */}
      {/* //DT-492 Content Editor - Preston Ball: Controls to navigate top-level section and nested subsection keys. */}
      <div className="tree-explorer-controls">
        <div className="tree-explorer-control-group">
          <label htmlFor="section-select" className="tree-explorer-label">
            Section (Level 1)
          </label>
          <select
            id="section-select"
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setSelectedSubSection('');
            }}
            className="tree-explorer-select"
          >
            {topLevelSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {subSections.length > 0 && (
          <div className="tree-explorer-control-group">
            <label htmlFor="subsection-select" className="tree-explorer-label">
              Sub-Section (Level 2)
            </label>
            <select
              id="subsection-select"
              value={selectedSubSection}
              onChange={(e) => setSelectedSubSection(e.target.value)}
              className="tree-explorer-select"
            >
              <option value="">All in {selectedSection}</option>
              {subSections.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Dynamic Leaf Form Fields */}
      {/* //DT-492 Content Editor - Preston Ball: Dynamically switches between input and textarea fields based on string length. */}
      <div className="tree-explorer-fields-container">
        {editableFields.map((field) => {
          const isLongText = field.value.length > 60;
          return (
            <div key={field.pathKey} className="content-editor-field tree-explorer-field-item">
              <label htmlFor={field.pathKey} className="tree-explorer-field-label">
                <span className="tree-explorer-path-key">{field.pathKey}</span>
                <span className="tree-explorer-char-count">
                  {field.value.length} characters
                </span>
              </label>
              {isLongText ? (
                <textarea
                  id={field.pathKey}
                  rows={4}
                  value={field.value}
                  onChange={(e) => handleTextChange(field.pathKey, field.keyPath, e.target.value)}
                  className="tree-explorer-textarea"
                />
              ) : (
                <input
                  id={field.pathKey}
                  type="text"
                  value={field.value}
                  onChange={(e) => handleTextChange(field.pathKey, field.keyPath, e.target.value)}
                  className="tree-explorer-input"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
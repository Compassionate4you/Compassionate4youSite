// * Task: DT-508
// * Author: PBall
// * Sprint: Sprint 6

//DT-492 Content Editor - Preston Ball: Builder component allowing admins to draft and configure modular sections.
import React, { useState } from 'react';
import '../../../styles/components/ModularContentBuilder.css';

//DT-492 Content Editor - Preston Ball: Preset site colors mapped to light and dark theme mode tokens.
const PRESET_COLORS = [
  { colorId: 'color-charcoal', colorName: 'Charcoal', lightMode: '#262626', darkMode: '#ffffff' },
  { colorId: 'color-gray', colorName: 'Gray', lightMode: '#595959', darkMode: '#ffffff' },
  { colorId: 'color-light-green', colorName: 'Light Green', lightMode: '#DBE4C3', darkMode: '#ffffff' },
  { colorId: 'color-sage', colorName: 'Sage Green', lightMode: '#9DA191', darkMode: '#ffffff' },
  { colorId: 'color-light-gray', colorName: 'Sky Blue', lightMode: '#D9D9D9', darkMode: '#ffffff' }
];

export default function ModularContentBuilder({ onAddSection }) {
  const [layout, setLayout] = useState('GRID_CARDS');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  //DT-492 Content Editor - Preston Ball: Compiles input form data into a structured section configuration object.
  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    //DT-492 Content Editor - Preston Ball: The new sections are still not fully implemented. In the future we will persist these to the backend and allow for more complex content structures.
    const newSection = {
      id: `sec-${Date.now()}`,
      layout,
      title,
      content,
      colorSpec: selectedColor,
      cards:
        layout === 'GRID_CARDS'
          ? [
              { id: '1', title: 'Card 1', description: 'Sample card content.' },
              { id: '2', title: 'Card 2', description: 'Sample card content.' },
            ]
          : [],
    };

    onAddSection(newSection);
    setTitle('');
    setContent('');
  };

  return (
    <section className="content-editor-card">
      <h2>Modular Section &amp; Card Builder</h2>
      <p className="content-editor-card-description">
        Configure dynamically appended page blocks with semantic light/dark colors
      </p>

      <form onSubmit={handleCreate} className="modular-content-form">
        <div className="modular-content-grid">
          {/* //DT-492 Content Editor - Preston Ball: Layout picker for different modular layout variations. */}
          <div>
            <label className="modular-content-label">Layout Type</label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="modular-content-select"
            >
              <option value="GRID_CARDS">GRID_CARDS</option>
              <option value="IMAGE_HEADER">IMAGE_HEADER</option>
              <option value="IMAGE_PARAGRAPH">IMAGE_PARAGRAPH</option>
              <option value="SPLIT_CONTAINER">SPLIT_CONTAINER</option>
            </select>
          </div>

          {/* //DT-492 Content Editor - Preston Ball: Palette dropdown specifying the primary background/text tokens. */}
          <div>
            <label className="modular-content-label">Theme Color Token</label>
            <select
              value={selectedColor.colorId}
              onChange={(e) => setSelectedColor(PRESET_COLORS.find((c) => c.colorId === e.target.value))}
              className="modular-content-select"
            >
              {PRESET_COLORS.map((col) => (
                <option key={col.colorId} value={col.colorId}>
                  {col.colorName} ({col.lightMode} / {col.darkMode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="modular-content-label">Section Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Specialized Home Recovery"
            required
            className="modular-content-input"
          />
        </div>

        <div>
          <label className="modular-content-label">Content / Subtitle</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide optional body description or paragraph text..."
            className="modular-content-textarea"
          />
        </div>

        <button type="submit" className="modular-content-submit-button">
          Add Section to Draft
        </button>
      </form>
    </section>
  );
}
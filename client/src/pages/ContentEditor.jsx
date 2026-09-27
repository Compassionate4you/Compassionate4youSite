import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/contenteditor.css";

const ContentEditor = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const navigate = useNavigate();

  return (
    <div className="content-editor-page">
      <Link to="/admin" className="content-editor-back-link">
        Back to Dashboard
      </Link>

      <h1 className="content-editor-title">Content Editor</h1>
      <p className="content-editor-subtitle">
        Edit Home - Philosophy Section
      </p>

      <div className="content-editor-tabs">
        <button
          type="button"
          className={`content-editor-tab ${
            activeTab === "edit" ? "active" : ""
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Edit Content
        </button>

        <button
          type="button"
          className={`content-editor-tab ${
            activeTab === "preview" ? "active" : ""
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
      </div>

      {activeTab === "edit" && (
        <div>
          <section className="content-editor-card">
            <h2>Text Content</h2>
            <p className="content-editor-card-description">
              Update the text that appears on the page
            </p>

            <div className="content-editor-field">
              <label htmlFor="main-heading">Main Heading</label>

              <input
                id="main-heading"
                type="text"
                defaultValue="Our Philosophy"
              />

              <p className="content-editor-help-text">
                This is the primary heading shown at the top of the section
              </p>
            </div>

            <div className="content-editor-field">
              <label htmlFor="content-description">Description</label>

              <textarea
                id="content-description"
                rows="6"
                defaultValue="We believe that every individual deserves compassionate, personalized care. Our dedicated team of healthcare professionals is committed to delivering the highest quality home health and hospice services to patients and their families throughout our community."
              />

              <p className="content-editor-help-text">
                Main body content for this section
              </p>
            </div>
          </section>

          <section className="content-editor-card">
            <h2>Media &amp; Images</h2>
            <p className="content-editor-card-description">
              Upload or update images for this section
            </p>

            <div className="content-editor-upload-area">
              <p className="content-editor-upload-title">
                Click to upload or drag and drop
              </p>

              <p className="content-editor-upload-description">
                PNG, JPG up to 10MB
              </p>

              <input
                id="content-image"
                className="content-editor-file-input"
                type="file"
                accept=".png,.jpg,.jpeg"
              />
            </div>

            <p className="content-editor-help-text">
              Current image will be replaced with the new upload
            </p>
          </section>

          <section className="content-editor-card">
            <h2>SEO Settings</h2>
            <p className="content-editor-card-description">
              Optimize this content for search engines
            </p>

            <div className="content-editor-field">
              <label htmlFor="meta-title">Meta Title</label>

              <input
                id="meta-title"
                type="text"
                placeholder="Page title for search results"
              />
            </div>

            <div className="content-editor-field">
              <label htmlFor="meta-description">Meta Description</label>

              <textarea
                id="meta-description"
                rows="4"
                placeholder="Brief description for search results"
              />
            </div>

            <div className="content-editor-actions">
              <button
                type="button"
                className="content-editor-save-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="content-editor-cancel-button"
                onClick={() => navigate("/admin")}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === "preview" && (
        <section className="content-editor-card">
          <h2>Content Preview</h2>

          <p className="content-editor-card-description">
            This is how the content will appear on the website
          </p>

          <div className="content-editor-preview">
            <h1>Our Philosophy</h1>

            <p>
              We believe that every individual deserves compassionate,
              personalized care. Our dedicated team of healthcare professionals
              is committed to delivering the highest quality home health and
              hospice services to patients and their families throughout our
              community.
            </p>
          </div>

          <div className="content-editor-preview-note">
            <strong>Note:</strong> This is a simplified preview. The actual
            appearance may vary based on page styling and layout.
          </div>
        </section>
      )}
    </div>
  );
};

export default ContentEditor;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ContentEditor = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", background: "#f5f5f5", minHeight: "100vh" }}>
      <Link
        to="/admin"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          textDecoration: "none",
          color: "#2563eb",
          fontSize: "18px",
        }}
      >
        Back to Dashboard
      </Link>

      <h1 style={{ marginBottom: "8px" }}>Content Editor</h1>
      <p style={{ color: "#64748b", marginTop: 0 }}>Edit Home - Philosophy Section</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "#e5e7eb",
          borderRadius: "16px",
          padding: "4px",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setActiveTab("edit")}
          style={{
            padding: "16px",
            border: "none",
            borderRadius: "14px",
            background: activeTab === "edit" ? "#ffffff" : "transparent",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Edit Content
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          style={{
            padding: "16px",
            border: "none",
            borderRadius: "14px",
            background: activeTab === "preview" ? "#ffffff" : "transparent",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Preview
        </button>
      </div>

      {activeTab === "edit" && (
        <div>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ddd",
              borderRadius: "18px",
              padding: "28px",
              marginBottom: "28px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Text Content</h2>
            <p style={{ color: "#64748b" }}>Update the text that appears on the page</p>

            <div style={{ marginTop: "24px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                Main Heading
              </label>
              <input
                type="text"
                defaultValue="Our Philosophy"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
              />
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                This is the primary heading shown at the top of the section
              </p>
            </div>

            <div style={{ marginTop: "24px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                Description
              </label>
              <textarea
                rows="6"
                defaultValue="We believe that every individual deserves compassionate, personalized care. Our dedicated team of healthcare professionals is committed to delivering the highest quality home health and hospice services to patients and their families throughout our community."
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  resize: "vertical",
                }}
              />
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "10px" }}>
                Main body content for this section
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ddd",
              borderRadius: "18px",
              padding: "28px",
              marginBottom: "28px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Media & Images</h2>
            <p style={{ color: "#64748b" }}>Upload or update images for this section</p>

            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: "16px",
                padding: "50px 20px",
                textAlign: "center",
                marginTop: "20px",
                background: "#fafafa",
              }}
            >
              <p style={{ marginBottom: "10px", fontSize: "20px" }}>
                Click to upload or drag and drop
              </p>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>PNG, JPG up to 10MB</p>
              <input type="file" />
            </div>

            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "16px" }}>
              Current image will be replaced with the new upload
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ddd",
              borderRadius: "18px",
              padding: "28px",
              marginBottom: "28px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>SEO Settings</h2>
            <p style={{ color: "#64748b" }}>Optimize this content for search engines</p>

            <div style={{ marginTop: "24px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                Meta Title
              </label>
              <input
                type="text"
                placeholder="Page title for search results"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div style={{ marginTop: "24px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                Meta Description
              </label>
              <textarea
                rows="4"
                placeholder="Brief description for search results"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  resize: "vertical",
                }}
              />
            </div>

            <div
                style={{
                display: "flex",
                gap: "20px",
                marginTop: "30px",
                }}
            >
                <button
                    style={{
                        flex: 1,
                    padding: "16px",
                    backgroundColor: "#020617",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "18px",
                    cursor: "pointer",
                    }}
                >
                  Save Changes
                </button>

                <button
                onClick={() => navigate("/admin")}
                    style={{
                        flex: 1,
                        padding: "16px",
                        backgroundColor: "#ffffff",
                        color: "#020617",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        fontSize: "18px",
                        cursor: "pointer",
                    }}
                >
                  Cancel
                </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Content Preview</h2>
          <p style={{ color: "#64748b" }}>This is how the content will appear on the website</p>

          <div
            style={{
              marginTop: "24px",
              border: "1px solid #ddd",
              borderRadius: "16px",
              padding: "36px",
              background: "#fafafa",
            }}
          >
            <h1 style={{ marginTop: 0, fontSize: "48px" }}>Our Philosophy</h1>
            <p style={{ fontSize: "22px", lineHeight: "1.7", color: "#334155" }}>
              We believe that every individual deserves compassionate, personalized care. Our
              dedicated team of healthcare professionals is committed to delivering the highest
              quality home health and hospice services to patients and their families throughout
              our community.
            </p>
          </div>

          <div
            style={{
              marginTop: "24px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "16px",
              color: "#1d4ed8",
            }}
          >
            <strong>Note:</strong> This is a simplified preview. The actual appearance may vary
            based on page styling and layout.
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEditor;
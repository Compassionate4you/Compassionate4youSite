import React from "react";

const ContentEditor = () => {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <a href="/admin" style={{ display: "inline-block", marginBottom: "20px" }}>
        Back to Dashboard
      </a>

      <h1>Content Editor</h1>
      <p>Edit Home - Philosophy Section</p>

      <div
        style={{
          marginTop: "30px",
          padding: "30px",
          border: "1px solid #ddd",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <h2>Edit Content</h2>
        <p>This is the editor page placeholder.</p>
      </div>
    </div>
  );
};

export default ContentEditor;
import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function MarkdownViewer({ markdown }) {
  const sanitizedHTML = DOMPurify.sanitize(marked.parse(markdown || ""));

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      style={{
        color: "#eee",
        fontFamily: "Helvetica Neue, sans-serif",
        lineHeight: "1.7",
        backgroundColor: "#1e1e1e",
        padding: "1.5rem",
        borderRadius: "8px",
      }}
    />
  );
}

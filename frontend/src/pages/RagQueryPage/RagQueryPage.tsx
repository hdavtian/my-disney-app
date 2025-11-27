/**
 * RAG Query Page Component
 *
 * Main page for the Disney AI Assistant powered by RAG (Retrieval-Augmented Generation).
 * Provides chat-like interface for asking questions about Disney content.
 *
 * @author Harma Davtian
 */

import { useEffect } from "react";
import { RagChatInterface } from "./RagChatInterface";
import "./RagQueryPage.scss";

export function RagQueryPage() {
  useEffect(() => {
    // Set page title
    document.title =
      "Disney AI Assistant - Ask About Characters, Movies & Parks";

    // Track page view in Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_title: "Disney AI Assistant",
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, []);

  return (
    <div className="rag-query-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="title-icon">✨</span>
          Disney AI Assistant
        </h1>
        <p className="page-description">
          Ask me anything about Disney characters, movies, and parks. I'll
          search through hundreds of sources to give you accurate, detailed
          answers with citations.
        </p>
      </div>

      <div className="page-content">
        <RagChatInterface />
      </div>

      <div className="page-footer">
        <p className="disclaimer">
          Powered by Google Gemini AI. Answers are generated from Disney content
          database and may not be 100% accurate. Always verify important
          information.
        </p>
      </div>
    </div>
  );
}

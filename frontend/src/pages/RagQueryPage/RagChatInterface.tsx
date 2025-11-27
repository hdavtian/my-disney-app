/**
 * RAG Chat Interface Component
 *
 * Chat-like interface for querying the Disney RAG system.
 * Displays conversation history with user questions and AI answers.
 *
 * @author Harma Davtian
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  queryRag,
  RagQueryResponse,
  RagError,
} from "../../services/ragService";
import { RagCitationCard } from "./RagCitationCard";
import "./RagQueryPage.scss";

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  response?: RagQueryResponse;
  error?: string;
  timestamp: Date;
}

const STORAGE_KEY = "rag-chat-history";
const SETTINGS_KEY = "rag-chat-settings";

export function RagChatInterface() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from sessionStorage on mount
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
    return [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCitations, setShowCitations] = useState(() => {
    // Load citation preference from sessionStorage
    try {
      const stored = sessionStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        return settings.showCitations ?? true;
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    return true; // Default to showing citations
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save settings to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(SETTINGS_KEY, JSON.stringify({ showCitations }));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [showCitations]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await queryRag({
        query: userMessage.content,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.answer,
        response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const ragError = error as RagError;
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "",
        error: ragError.message || "An error occurred. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCitationClick = (citation: any) => {
    // Navigate to character/movie/park detail page using React Router
    const { content_type, content_id } = citation;
    navigate(`/${content_type}/${content_id}`);
  };

  return (
    <div className="rag-chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <h2>Ask me anything about Disney!</h2>
            <p>
              I can help you learn about Disney characters, movies, parks, and
              more.
            </p>
            <div className="example-questions">
              <h3>Try asking:</h3>
              <ul>
                <li>"Tell me about Mickey Mouse"</li>
                <li>"What movies feature princesses?"</li>
                <li>"Describe Magic Kingdom"</li>
                <li>"Who is the villain in The Lion King?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message chat-message-${message.type}`}
          >
            <div className="message-avatar">
              {message.type === "user" ? "👤" : "✨"}
            </div>
            <div className="message-content">
              {message.type === "user" ? (
                <div className="user-question">{message.content}</div>
              ) : message.error ? (
                <div className="error-message">
                  <strong>Error:</strong> {message.error}
                </div>
              ) : (
                <>
                  <div className="assistant-answer">
                    {message.content}
                    {message.response?.cached && (
                      <span className="cached-badge" title="Loaded from cache">
                        ⚡ Cached
                      </span>
                    )}
                  </div>

                  {showCitations &&
                    message.response?.sources &&
                    message.response.sources.length > 0 && (
                      <div className="message-sources">
                        <h4>Sources:</h4>
                        <div className="sources-grid">
                          {message.response.sources.map((citation, index) => (
                            <RagCitationCard
                              key={`${citation.content_type}-${citation.content_id}`}
                              citation={citation}
                              index={index}
                              onClick={handleCitationClick}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message chat-message-assistant">
            <div className="message-avatar">✨</div>
            <div className="message-content">
              <div className="loading-indicator">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-controls">
          <label className="citation-toggle">
            <input
              type="checkbox"
              checked={showCitations}
              onChange={(e) => setShowCitations(e.target.checked)}
            />
            <span>Show citations</span>
          </label>
        </div>
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about Disney..."
            className="chat-input"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="chat-submit-button"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send question"
          >
            {isLoading ? "⏳" : "🚀"}
          </button>
        </div>
      </form>
    </div>
  );
}

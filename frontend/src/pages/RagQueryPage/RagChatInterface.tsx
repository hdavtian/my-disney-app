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
  getTierStatus,
  unlockPremiumTier,
  getRagStatus,
  RagQueryResponse,
  RagError,
  TierStatus,
} from "../../services/ragService";
import { RagCitationCard } from "./RagCitationCard";
import { trackEvent } from "../../hooks/useAnalytics";
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
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [upgradeError, setUpgradeError] = useState("");
  const [ragDisabled, setRagDisabled] = useState(false);
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

  // Load RAG status and tier info on mount and periodically check
  useEffect(() => {
    async function loadStatus() {
      try {
        const [status, tier] = await Promise.all([
          getRagStatus(),
          getTierStatus(),
        ]);
        setRagDisabled(!status.rag_enabled);
        setTierStatus(tier);
      } catch (error) {
        console.error("Failed to load RAG status:", error);
      }
    }
    loadStatus();

    // Check status every 30 seconds to detect admin kill switch changes
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

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

    const startTime = Date.now();

    try {
      const response = await queryRag({
        query: userMessage.content,
      });

      const responseTime = Date.now() - startTime;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.answer,
        response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Track successful RAG query in Google Analytics
      trackEvent("rag_query", {
        query_length: userMessage.content.length,
        response_time_ms: responseTime,
        citation_count: response.sources?.length || 0,
        user_tier: tierStatus?.tier || "free",
        has_error: false,
      });

      // Refresh tier status after query
      try {
        const tier = await getTierStatus();
        setTierStatus(tier);
      } catch (error) {
        console.error("Failed to refresh tier status:", error);
      }
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

      // Track failed RAG query
      trackEvent("rag_query", {
        query_length: userMessage.content.length,
        response_time_ms: Date.now() - startTime,
        user_tier: tierStatus?.tier || "free",
        has_error: true,
        error_message: ragError.message || "Unknown error",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleUnlockPremium = async () => {
    if (!accessCode.trim()) {
      setUpgradeError("Please enter an access code");
      return;
    }

    try {
      const response = await unlockPremiumTier(accessCode);
      setTierStatus(response);
      setAccessCode("");
      setUpgradeError("");
      setShowUpgradeModal(false);

      // Track successful premium unlock
      trackEvent("premium_unlock", { success: true });
    } catch (error) {
      setUpgradeError((error as Error).message);

      // Track failed premium unlock
      trackEvent("premium_unlock", { success: false });
    }
  };

  const handleCitationClick = (citation: any) => {
    // Navigate to character/movie/park detail page using React Router
    const { content_type, content_id } = citation;
    navigate(`/${content_type}/${content_id}`);
  };

  return (
    <div className="rag-chat-interface">
      {ragDisabled && (
        <div className="rag-disabled-banner">
          🚫 AI Assistant is currently offline (disabled by admin). Please check
          back later.
        </div>
      )}

      {showUpgradeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowUpgradeModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2>Rate Limit Tier</h2>

            {tierStatus && (
              <div className="tier-current">
                <p className="tier-name">
                  Current Tier: <strong>{tierStatus.tier.toUpperCase()}</strong>
                </p>
                <p className="tier-usage">
                  {tierStatus.used} / {tierStatus.limit} queries used this hour
                </p>
                <p className="tier-remaining">
                  <strong>{tierStatus.remaining}</strong> queries remaining
                </p>
              </div>
            )}

            {tierStatus?.tier !== "premium" && (
              <div className="tier-upgrade-section">
                <h3>Upgrade to Premium</h3>
                <p className="tier-benefits">
                  Premium tier: <strong>100 queries per hour</strong>
                </p>

                <div className="access-code-input">
                  <input
                    type="password"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setUpgradeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnlockPremium();
                      }
                    }}
                  />
                  <button onClick={handleUnlockPremium}>Unlock Premium</button>
                </div>

                {upgradeError && (
                  <p className="upgrade-error">⚠️ {upgradeError}</p>
                )}
              </div>
            )}

            {tierStatus?.tier === "premium" && (
              <div className="tier-premium-active">
                <p className="tier-success">
                  ✨ Premium tier is active! (100 queries/hour)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Rate limit status - always show tier info when AI is enabled, only show button when limit reached */}
      {!ragDisabled && tierStatus && (
        <div className="rate-limit-status">
          <div className="status-content">
            <span className="status-icon">
              {tierStatus.tier === "premium" ? "⭐" : "⏱️"}
            </span>
            <div className="status-text">
              <span className="status-label">
                {tierStatus.tier === "premium" ? "Premium" : "Free"} Tier
              </span>
              <span className="status-usage">
                {tierStatus.used}/{tierStatus.limit} queries{" "}
                {tierStatus.remaining === 0 ? "used" : "available"}
              </span>
            </div>
            {tierStatus.remaining === 0 && (
              <button
                className="upgrade-button"
                onClick={() => setShowUpgradeModal(true)}
              >
                {tierStatus.tier === "premium"
                  ? "View Details"
                  : "Unlock Premium"}
              </button>
            )}
          </div>
        </div>
      )}

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
            placeholder={
              tierStatus && tierStatus.remaining === 0
                ? "Rate limit reached - unlock premium to continue"
                : "Ask a question about Disney..."
            }
            className="chat-input"
            disabled={isLoading || tierStatus?.remaining === 0}
            autoFocus
          />
          <button
            type="submit"
            className="chat-submit-button"
            disabled={
              !inputValue.trim() || isLoading || tierStatus?.remaining === 0
            }
            aria-label="Send question"
          >
            {isLoading ? "⏳" : "🚀"}
          </button>
        </div>
      </form>
    </div>
  );
}

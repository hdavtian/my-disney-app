/**
 * RAG Citation Card Component
 *
 * Displays a source citation from RAG query results with similarity score,
 * content name, and excerpt.
 *
 * @author Harma Davtian
 */

import { RagCitation } from "../../services/ragService";
import "./RagQueryPage.scss";

export interface RagCitationCardProps {
  citation: RagCitation;
  index: number;
  onClick?: (citation: RagCitation) => void;
}

export function RagCitationCard({
  citation,
  index,
  onClick,
}: RagCitationCardProps) {
  const { content_type, content_name, similarity_score, excerpt } = citation;

  // Format content type for display
  const contentTypeLabel =
    content_type.charAt(0).toUpperCase() + content_type.slice(1);

  // Format similarity score as percentage
  const similarityPercent = Math.round(similarity_score * 100);

  // Get icon based on content type
  const getIcon = () => {
    switch (content_type) {
      case "character":
        return "👤";
      case "movie":
        return "🎬";
      case "park":
        return "🏰";
      default:
        return "📄";
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(citation);
    }
  };

  return (
    <div
      className="rag-citation-card"
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(citation);
        }
      }}
    >
      <div className="citation-header">
        <div className="citation-index">{index + 1}</div>
        <div className="citation-type">
          <span className="citation-icon">{getIcon()}</span>
          <span className="citation-type-label">{contentTypeLabel}</span>
        </div>
        <div className="citation-similarity">
          <div className="similarity-bar">
            <div
              className="similarity-fill"
              style={{ width: `${similarityPercent}%` }}
              aria-label={`${similarityPercent}% relevant`}
            />
          </div>
          <span className="similarity-score">{similarityPercent}%</span>
        </div>
      </div>

      <h4 className="citation-name">{content_name}</h4>

      <p className="citation-excerpt">{excerpt}</p>
    </div>
  );
}

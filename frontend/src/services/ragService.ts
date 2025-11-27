/**
 * RAG (Retrieval-Augmented Generation) API Service
 *
 * Provides methods to query the Disney RAG system for AI-powered answers
 * with source citations.
 *
 * @author Harma Davtian
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || "";

export interface RagQueryRequest {
  query: string;
  content_type?: string;
  top_k?: number;
}

export interface RagCitation {
  content_type: string;
  content_id: number;
  content_name: string;
  similarity_score: number;
  excerpt: string;
}

export interface RagQueryResponse {
  answer: string;
  sources: RagCitation[];
  query: string;
  cached: boolean;
}

export interface TierStatus {
  tier: "free" | "premium" | "admin";
  limit: number;
  used: number;
  remaining: number;
  message: string;
}

export interface RagStatus {
  rag_enabled: boolean;
  message: string;
}

export interface RagError {
  message: string;
  status?: number;
}

/**
 * Query the RAG system with a user question.
 *
 * @param request Query request with question and optional filters
 * @returns Promise resolving to RAG response with answer and citations
 * @throws RagError if request fails
 */
export async function queryRag(
  request: RagQueryRequest
): Promise<RagQueryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-API-Key": ADMIN_API_KEY,
      },
      credentials: "include",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: `⏱️ Rate limit exceeded! You've used all ${
            errorData.limit || "your"
          } queries this hour. Upgrade to premium for more queries.`,
          status: 429,
        } as RagError;
      }

      if (response.status === 503) {
        throw {
          message:
            "🚫 AI Assistant is currently offline (disabled by admin). Please check back later.",
          status: 503,
        } as RagError;
      }

      if (response.status === 400) {
        throw {
          message: "Invalid query. Please check your input and try again.",
          status: 400,
        } as RagError;
      }

      throw {
        message: "An error occurred while processing your request.",
        status: response.status,
      } as RagError;
    }

    const data: RagQueryResponse = await response.json();
    return data;
  } catch (error) {
    if ((error as RagError).status) {
      throw error;
    }

    throw {
      message: "Network error. Please check your connection and try again.",
    } as RagError;
  }
}

/**
 * Check if RAG service is healthy.
 *
 * @returns Promise resolving to true if healthy, false otherwise
 */
export async function checkRagHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get RAG system status (enabled/disabled).
 *
 * @returns Promise resolving to RAG status
 */
export async function getRagStatus(): Promise<RagStatus> {
  const response = await fetch(`${API_BASE_URL}/api/rag/status`, {
    headers: {
      "X-Admin-API-Key": ADMIN_API_KEY,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get RAG status");
  }

  return response.json();
}

/**
 * Get current rate limit tier and usage stats.
 *
 * @returns Promise resolving to tier status
 */
export async function getTierStatus(): Promise<TierStatus> {
  const response = await fetch(`${API_BASE_URL}/api/rag/tier-status`, {
    headers: {
      "X-Admin-API-Key": ADMIN_API_KEY,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get tier status");
  }

  return response.json();
}

/**
 * Unlock premium tier with access code.
 *
 * @param accessCode Premium access code
 * @returns Promise resolving to tier response
 * @throws Error if access code is invalid
 */
export async function unlockPremiumTier(
  accessCode: string
): Promise<TierStatus> {
  const response = await fetch(`${API_BASE_URL}/api/rag/unlock-premium`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-API-Key": ADMIN_API_KEY,
    },
    credentials: "include",
    body: JSON.stringify({ code: accessCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Invalid access code");
  }

  return response.json();
}

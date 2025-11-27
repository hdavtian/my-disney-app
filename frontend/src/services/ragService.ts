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
const ADMIN_API_KEY =
  import.meta.env.VITE_ADMIN_API_KEY || "xrn5gEMTwUWHtbLDSlvqY9f6sGAo71iB";

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
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw {
          message: "Too many requests. Please wait a moment and try again.",
          status: 429,
        } as RagError;
      }

      if (response.status === 503) {
        throw {
          message:
            "AI service is temporarily unavailable. Please try again later.",
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

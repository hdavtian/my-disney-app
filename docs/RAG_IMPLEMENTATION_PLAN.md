# RAG Implementation Plan

## Overview

This document provides a comprehensive guide for implementing a **standard, production-grade** Retrieval-Augmented Generation (RAG) system for the Disney App. This plan follows **industry best practices** and uses **proven patterns** - no reinventing the wheel, no creative solutions, just routine enterprise architecture.

**Key Decisions:**

- **LLM Provider**: Google Gemini 1.5 Flash (primary), with interface pattern for swappability
- **Analytics**: Google Analytics 4 event tracking (no custom backend dashboard)
- **Database**: PostgreSQL (Neon) with pgvector extension + **separate embeddings table** (production pattern)
- **Architecture**: Provider-agnostic LLM interface pattern + decoupled vector storage
- **Estimated Cost**: $0.50-5/month (vs $10-25/month with Azure OpenAI)

**Spring Boot Best Practices Followed:**

- ✅ **Spring Data JPA** - Using repositories with proper entities (NOT raw JdbcTemplate)
- ✅ **Bucket4j for Rate Limiting** - Industry-standard library (NOT Thread.sleep())
- ✅ **Spring Security** - Standard API key authentication filter
- ✅ **Proper DTO/Record Layer** - Separate data transfer objects from entities
- ✅ **Spring Retry** - Built-in retry mechanism for LLM API failures
- ✅ **Standard Repository Pattern** - JpaRepository interfaces for all data access
- ✅ **Constructor Injection** - Using @Autowired on fields (standard Spring pattern)
- ✅ **Lombok** - Reduce boilerplate with @Data, @Builder annotations

**Architecture Highlight: Separate Embeddings Table**

This implementation uses a **production-grade pattern** where embeddings are stored in a dedicated `content_embeddings` table rather than adding columns to existing domain tables. This approach:

- ✅ **Zero risk to existing data** - characters, movies, attractions tables remain untouched
- ✅ **Clean rollback** - remove RAG by dropping one table (`DROP TABLE content_embeddings`)
- ✅ **Industry standard** - matches architecture of Pinecone, Weaviate, Supabase, and other vector databases
- ✅ **Flexible versioning** - can store multiple embedding models simultaneously (Gemini 768-dim + OpenAI 1536-dim)
- ✅ **Interview-ready** - demonstrates understanding of separation of concerns and microservices principles
- ✅ **Future-proof** - easy migration path to dedicated vector DB (Qdrant, Milvus) later

**Neon PostgreSQL Compatibility:**

Neon fully supports this architecture:

- ✅ pgvector extension available on all Neon plans (including free tier)
- ✅ IVFFlat and HNSW indexes for fast similarity search
- ✅ Standard PostgreSQL features (JSONB, ON CONFLICT, CTEs)
- ✅ No schema limitations - can create new tables freely
- ✅ Serverless scaling handles variable RAG query load

---

## LLM Provider Comparison

### Evaluated Options

| Provider             | Model          | Input Cost     | Output Cost  | Monthly Est. | Context Window | Notes                                                   |
| -------------------- | -------------- | -------------- | ------------ | ------------ | -------------- | ------------------------------------------------------- |
| **Google Gemini** ⭐ | 1.5 Flash      | $0.00001875/1K | $0.000075/1K | **$0.50-5**  | 1M tokens      | **RECOMMENDED** - Best cost/performance                 |
| OpenAI               | GPT-4o-mini    | $0.00015/1K    | $0.0006/1K   | $1-10        | 128K tokens    | Good fallback option                                    |
| Anthropic            | Claude 3 Haiku | $0.00025/1K    | $0.00125/1K  | $1-10        | 200K tokens    | Good fallback option                                    |
| Azure OpenAI         | GPT-3.5-turbo  | ~$0.0005/1K    | ~$0.0015/1K  | $10-25       | 16K tokens     | Higher cost, enterprise features                        |
| Ollama               | llama3:8b      | Free           | Free         | $0           | Variable       | **REJECTED** - 4-7GB downloads in Azure CI/CD pipelines |

### Cost Calculation Example (Gemini 1.5 Flash)

**One-Time Embedding Generation Cost:**

- **~2,700 total items** (500 characters + 150 movies + 12 parks + 50 attractions + 1,000 character hints + 1,000 movie hints)
- **Avg 100 tokens per item** = 270,000 total tokens
- **Embedding cost**: 270K × $0.00001875/1K = **$0.05 one-time**

**Monthly Query Cost:**

- **Assumptions**: 1,000 queries/month, avg 500 tokens input + 200 tokens output
- **Input cost**: 1000 × 500 × $0.00001875/1K = $0.009375
- **Output cost**: 1000 × 200 × $0.000075/1K = $0.015
- **Total**: ~$0.50/month for 1,000 queries

**Why Gemini 1.5 Flash?**

- 20x cheaper than GPT-3.5-turbo
- 1M token context window (can include massive amounts of Disney data)
- Fast response times (~200-500ms)
- Sufficient quality for Disney trivia/information retrieval
- Google AI Studio free tier available for development

---

## Architecture: LLM Interface Pattern

To ensure flexibility and avoid vendor lock-in, we'll implement a provider-agnostic interface pattern:

### Java Interface Design

```java
package com.harmadavtian.disneyapp.service;

import java.util.List;

/**
 * Interface for Language Model clients.
 * Allows swapping between different LLM providers (Gemini, OpenAI, Claude, etc.)
 */
public interface LLMClient {

    /**
     * Send a chat prompt to the LLM and receive a response.
     *
     * @param prompt The user's question or prompt
     * @return The LLM's response text
     * @throws RuntimeException if the API call fails
     */
    String chat(String prompt);

    /**
     * Generate an embedding vector for the given text.
     *
     * @param text The text to embed
     * @return A vector representation of the text (typically 1536 dimensions)
     * @throws RuntimeException if the API call fails
     */
    List<Float> generateEmbedding(String text);
}
```

### Gemini Implementation

```java
package com.harmadavtian.disneyapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

/**
 * Google Gemini 1.5 Flash implementation of LLMClient.
 */
@Service
public class GeminiClient implements LLMClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String chat(String prompt) {
        String url = String.format(
            "https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s",
            model, apiKey
        );

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        // Extract text from response
        Map<String, Object> body = response.getBody();
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

        return (String) parts.get(0).get("text");
    }

    @Override
    public List<Float> generateEmbedding(String text) {
        String url = String.format(
            "https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=%s",
            apiKey
        );

        Map<String, Object> requestBody = Map.of(
            "content", Map.of("parts", List.of(Map.of("text", text)))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        // Extract embedding values
        Map<String, Object> body = response.getBody();
        Map<String, Object> embedding = (Map<String, Object>) body.get("embedding");
        List<Double> values = (List<Double>) embedding.get("values");

        return values.stream().map(Double::floatValue).toList();
    }
}
```

### Spring Configuration

```yaml
# application.yml
gemini:
  api:
    key: ${GEMINI_API_KEY} # Set via environment variable
  model: gemini-1.5-flash

llm:
  provider: gemini # Options: gemini, openai, claude
```

---

## Google Analytics 4 Integration

Instead of building a custom analytics dashboard (3-4 hours of work), we'll use Google Analytics 4 for tracking RAG usage.

### Setup Instructions

**1. Create GA4 Property:**

- Go to [Google Analytics](https://analytics.google.com/)
- Create new property: "Disney App"
- Create single data stream: "Web"
- Get Measurement ID (format: `G-XXXXXXXXXX`)

**2. Add GA4 Script to Frontend:**

```html
<!-- frontend/index.html - Add in <head> section -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());

  // Automatically tag environment based on hostname
  const environment =
    window.location.hostname === "localhost" ? "localhost" : "production";

  gtag("config", "G-XXXXXXXXXX", {
    custom_map: { dimension1: "environment" },
    environment: environment,
  });
</script>
```

**3. Create Analytics Utility (TypeScript):**

```typescript
// frontend/src/utils/analytics.ts

/**
 * Track a RAG query submission
 */
export const trackRagQuery = (query: string, characterCount: number) => {
  if (typeof gtag !== "undefined") {
    gtag("event", "rag_query_submitted", {
      event_category: "RAG",
      event_label: query.substring(0, 100), // Truncate for privacy
      value: characterCount,
    });
  }
};

/**
 * Track a RAG response received
 */
export const trackRagResponse = (
  query: string,
  responseTime: number,
  citationCount: number
) => {
  if (typeof gtag !== "undefined") {
    gtag("event", "rag_response_received", {
      event_category: "RAG",
      response_time_ms: responseTime,
      citation_count: citationCount,
    });
  }
};

/**
 * Track a citation click
 */
export const trackCitationClick = (
  citationType: "character" | "movie" | "attraction",
  citationId: string
) => {
  if (typeof gtag !== "undefined") {
    gtag("event", "rag_citation_clicked", {
      event_category: "RAG",
      event_label: citationType,
      value: citationId,
    });
  }
};

/**
 * Track user feedback on RAG response
 */
export const trackRagFeedback = (helpful: boolean, query: string) => {
  if (typeof gtag !== "undefined") {
    gtag("event", "rag_feedback", {
      event_category: "RAG",
      event_label: helpful ? "helpful" : "not_helpful",
      query: query.substring(0, 100),
    });
  }
};
```

**4. Use in React Components:**

```tsx
// Example usage in ChatModal component
import { trackRagQuery, trackRagResponse } from "@/utils/analytics";

const handleSubmit = async (query: string) => {
  const startTime = Date.now();

  // Track query
  trackRagQuery(query, query.length);

  // Make API call
  const response = await fetch("/api/rag/query", {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  const responseTime = Date.now() - startTime;

  // Track response
  trackRagResponse(query, responseTime, data.citations?.length || 0);
};
```

### GA4 Custom Events

| Event Name              | Parameters                                   | Purpose                            |
| ----------------------- | -------------------------------------------- | ---------------------------------- |
| `rag_query_submitted`   | `event_label` (query), `value` (char count)  | Track what users are asking        |
| `rag_response_received` | `response_time_ms`, `citation_count`         | Track performance and quality      |
| `rag_citation_clicked`  | `event_label` (type), `value` (ID)           | Track user engagement with sources |
| `rag_feedback`          | `event_label` (helpful/not_helpful), `query` | Track user satisfaction            |

### Benefits of GA4 Approach

- ✅ Zero backend code required (no RagAnalyticsController, RagMetricsService, rag_queries table)
- ✅ Free tier (2 months data retention sufficient for portfolio demo)
- ✅ Industry-standard tool (demonstrates knowledge of analytics best practices)
- ✅ Single property with environment tagging (localhost vs production)
- ✅ Saves 3-4 hours of development time

---

## Option A: MVP Implementation (2-3 Days)

**Goal**: Basic RAG system with Gemini 1.5 Flash, simple similarity search, minimal UI.

### Session 1: Backend Foundation (4-5 hours)

**1.1 Set Up Gemini API**

- Create Google AI Studio account
- Generate API key
- Add to environment variables: `GEMINI_API_KEY`
- Test with curl:

```bash
curl "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Tell me about Snow White"}]}]}'
```

**1.2 Create LLM Interface and Gemini Implementation**

- Create `LLMClient.java` interface
- Create `GeminiClient.java` implementation
- Add configuration in `application.yml`

**1.3 Enable pgvector in Neon Database**

```sql
-- Run in Neon SQL editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector columns to existing tables
ALTER TABLE characters ADD COLUMN long_description_embedding vector(768);
ALTER TABLE movies ADD COLUMN long_description_embedding vector(768);
ALTER TABLE parks_attractions ADD COLUMN description_embedding vector(768);
```

**Note**: Gemini's `text-embedding-004` model produces 768-dimensional vectors (not 1536 like OpenAI).

**1.3.1 Test Existing APIs After DB Changes (CRITICAL)**

After adding vector columns, verify that existing frontend API calls still work correctly:

```bash
# Test Characters API (use real character from your DB)
curl http://localhost:8080/api/characters/362 | jq

# Expected: Should return character object WITHOUT embedding column (not exposed in DTO)
# Verify: name, description, image_url, etc. all present and correct

# Test Characters List
curl http://localhost:8080/api/characters | jq '.[0]'

# Test Movies API (use real movie from your DB)
curl http://localhost:8080/api/movies/2494 | jq

# Test Movies List
curl http://localhost:8080/api/movies | jq '.[0]'

# Test Attractions API (use real attraction from your DB)
curl http://localhost:8080/api/parks/attractions/1 | jq

# Test Attractions List
curl http://localhost:8080/api/parks/attractions | jq '.[0]'

# Test Movie-Character Relationships
curl http://localhost:8080/api/movies/2494/characters | jq

# Test Character-Movie Relationships
curl http://localhost:8080/api/characters/362/movies | jq
```

**Expected Behavior:**

- ✅ All existing endpoints return data as before
- ✅ New `*_embedding` columns are NOT visible in API responses (hidden by DTOs)
- ✅ No null pointer exceptions or database errors
- ✅ Response times unchanged (new columns are NULL, no performance impact)

**If You See Errors:**

- Check that JPA entities use DTOs/projections (don't expose raw entities)
- Verify `@JsonIgnore` on embedding fields if entities are exposed
- Confirm Hibernate mappings don't auto-include new columns

**1.3.2 Test Frontend After DB Changes**

With backend running, test the actual frontend:

```bash
# Start frontend dev server
cd C:\sites\my-disney-app\frontend
npm run dev
```

**Manual Testing Checklist:**

1. ✅ Navigate to Characters page - verify cards render correctly
2. ✅ Click a character card - verify detail page loads with full data
3. ✅ Navigate to Movies page - verify cards render correctly
4. ✅ Click a movie card - verify detail page shows characters list
5. ✅ Navigate to Attractions page - verify list loads correctly
6. ✅ Test search/filter functionality (if implemented)
7. ✅ Test favorites add/remove (if implemented)
8. ✅ Open browser DevTools → Network tab - verify no 500 errors

**Browser Console Check:**

```javascript
// In browser console, verify API response structure
fetch("/api/characters/362")
  .then((r) => r.json())
  .then((data) => {
    console.log("Character data:", data);
    console.log("Has embedding?", "long_description_embedding" in data); // Should be FALSE
  });
```

**If Frontend Breaks:**

- Check browser console for errors
- Check Network tab for failed API calls
- Verify backend logs for exceptions
- Rollback DB changes and investigate DTO/entity mappings

**1.4 Create ContentEmbedding Entity**

```java
package com.harmadavtian.disneyapp.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_embeddings")
public class ContentEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long embeddingId;

    @Column(nullable = false, length = 50)
    private String contentType;  // 'character', 'movie', 'park', 'attraction', 'character_hint', 'movie_hint'

    @Column(nullable = false)
    private Long contentId;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    @Column(columnDefinition = "vector(768)")  // pgvector type
    private String embedding;  // Stored as string representation

    @Column(nullable = false, length = 100)
    private String modelVersion;  // 'gemini-text-embedding-004'

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    // ... (Lombok @Data annotation recommended)
}
```

**1.5 Create Repository**

```java
package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.ContentEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContentEmbeddingRepository extends JpaRepository<ContentEmbedding, Long> {

    /**
     * Find similar content using pgvector cosine distance operator.
     * Uses native query since pgvector operators aren't supported in JPQL.
     */
    @Query(value = """
        SELECT ce.embedding_id, ce.content_type, ce.content_id, ce.text_content,
               ce.model_version, ce.created_at, ce.updated_at,
               ce.embedding,
               1 - (ce.embedding <=> CAST(:queryVector AS vector)) as similarity
        FROM content_embeddings ce
        WHERE ce.model_version = :modelVersion
        ORDER BY ce.embedding <=> CAST(:queryVector AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findSimilarContent(
        @Param("queryVector") String queryVector,
        @Param("modelVersion") String modelVersion,
        @Param("limit") int limit
    );

    boolean existsByContentTypeAndContentIdAndModelVersion(
        String contentType,
        Long contentId,
        String modelVersion
    );
}
```

**1.6 Create RagService (Uses JPA Repository)**

```java
@Service
public class RagService {

    @Autowired
    private LLMClient llmClient;

    @Autowired
    private ContentEmbeddingRepository embeddingRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private DisneyParkRepository parkRepository;

    @Autowired
    private DisneyParkAttractionRepository attractionRepository;

    public RagResponse query(String userQuery) {
        // 1. Generate embedding for user query
        List<Float> queryEmbedding = llmClient.generateEmbedding(userQuery);
        String queryVector = vectorToString(queryEmbedding);

        // 2. Find similar embeddings using repository
        List<Object[]> results = embeddingRepository.findSimilarContent(
            queryVector,
            "gemini-text-embedding-004",
            5
        );

        // 3. Map results to ContextChunk DTOs and hydrate with source data
        List<ContextChunk> context = results.stream()
            .map(row -> {
                String contentType = (String) row[1];
                Long contentId = ((Number) row[2]).longValue();
                String textContent = (String) row[3];
                Double similarity = ((Number) row[8]).doubleValue();

                // Fetch source entity based on content type
                String name = null;
                String imageUrl = null;

                switch (contentType) {
                    case "character" -> {
                        characterRepository.findById(contentId).ifPresent(c -> {
                            name = c.getName();
                            imageUrl = c.getImages() != null && !c.getImages().isEmpty()
                                ? c.getImages().get(0).getUrl() : null;
                        });
                    }
                    case "movie" -> {
                        movieRepository.findById(contentId).ifPresent(m -> {
                            name = m.getTitle();
                            imageUrl = m.getImages() != null && !m.getImages().isEmpty()
                                ? m.getImages().get(0).getUrl() : null;
                        });
                    }
                    case "park" -> {
                        parkRepository.findById(contentId).ifPresent(p -> {
                            name = p.getName();
                            imageUrl = p.getImages() != null && !p.getImages().isEmpty()
                                ? p.getImages().get(0).getUrl() : null;
                        });
                    }
                    case "attraction" -> {
                        attractionRepository.findById(contentId).ifPresent(a -> {
                            name = a.getName();
                            imageUrl = a.getImages() != null && !a.getImages().isEmpty()
                                ? a.getImages().get(0).getUrl() : null;
                        });
                    }
                    case "character_hint", "movie_hint" -> {
                        name = contentType.replace("_", " ");
                    }
                }

                return new ContextChunk(contentType, name, textContent, similarity, contentId, imageUrl);
            })
            .toList();

        // 3. Build prompt with context
        String prompt = buildPrompt(userQuery, context);

        // 4. Get LLM response
        String answer = llmClient.chat(prompt);

        // 5. Return response with citations
        return new RagResponse(answer, context);
    }

    private String buildPrompt(String query, List<ContextChunk> context) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a Disney expert. Answer the user's question based on the context below.\n\n");
        sb.append("CONTEXT:\n");
        for (ContextChunk chunk : context) {
            sb.append(String.format("- %s (%s): %s\n", chunk.name(), chunk.type(), chunk.description()));
        }
        sb.append("\nQUESTION: ").append(query).append("\n");
        sb.append("\nProvide a concise, accurate answer. If the context doesn't contain enough information, say so.");
        return sb.toString();
    }

    private String vectorToString(List<Float> vector) {
        return "[" + vector.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]";
    }
}
```

### Session 2: Admin API Security (1-2 hours)

**⚠️ PREREQUISITE STEP (Not RAG-specific, but required for production)**

Before implementing RAG admin endpoints, secure ALL admin operations with API key authentication. This applies to:

- Future RAG embedding generation endpoint
- Any existing admin endpoints in your app
- Any destructive operations (delete, update, etc.)

**2.1 Add Spring Security Dependency**

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**2.2 Create API Key Authentication Filter**

```java
// src/main/java/com/harmadavtian/disneyapp/security/ApiKeyAuthFilter.java
package com.harmadavtian.disneyapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filter to authenticate admin API requests using X-Admin-API-Key header.
 * Protects all /api/admin/** endpoints from unauthorized access.
 */
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final String validApiKey;

    public ApiKeyAuthFilter(String validApiKey) {
        this.validApiKey = validApiKey;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        // Only check admin endpoints
        if (!request.getRequestURI().startsWith("/api/admin/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("X-Admin-API-Key");

        if (apiKey != null && apiKey.equals(validApiKey)) {
            // Valid key - set authentication
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("admin", null, Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
        } else {
            // Invalid or missing key
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized - Invalid or missing X-Admin-API-Key header\"}");
        }
    }
}
```

**2.3 Configure Security**

```java
// src/main/java/com/harmadavtian/disneyapp/security/SecurityConfig.java
package com.harmadavtian.disneyapp.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for Disney App.
 * Protects admin endpoints with API key authentication.
 */
@Configuration
public class SecurityConfig {

    @Value("${admin.api.key}")
    private String adminApiKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // Disable CSRF for REST API
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // No sessions
            .and()
            .addFilterBefore(new ApiKeyAuthFilter(adminApiKey),
                           UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").authenticated() // Require auth for admin
                .anyRequest().permitAll() // Everything else is public
            );

        return http.build();
    }
}
```

**2.4 Add Configuration Property**

```yaml
# application.yml
admin:
  api:
    key: ${ADMIN_API_KEY:local-dev-key-changeme} # Override via environment variable
```

**2.5 Update Swagger Configuration**

```java
// Add to existing SwaggerConfig or create new one
package com.harmadavtian.disneyapp.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Disney App API")
                .version("1.0")
                .description("Disney character, movie, and attraction data API")
            )
            .components(new Components()
                .addSecuritySchemes("apiKey", new SecurityScheme()
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.HEADER)
                    .name("X-Admin-API-Key")
                    .description("Admin API Key for protected endpoints. Required for /api/admin/** routes.")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList("apiKey"));
    }
}
```

**2.6 Set API Key in Azure**

```bash
# Generate a secure random key (run locally)
openssl rand -base64 32
# Example output: k8dJ2mP9xL4vN6wQ3rT5yU7iO1aS0fG2hB4nC6mE8pD=

# Set in Azure App Service
az webapp config appsettings set \
  --resource-group disney-app-rg \
  --name my-disney-app \
  --settings ADMIN_API_KEY="your-generated-key-here"
```

**2.7 Test Security**

```bash
# Test that admin endpoint rejects requests without key
curl -X POST http://localhost:8080/api/admin/test
# Expected: 401 Unauthorized

# Test that admin endpoint accepts requests with valid key
curl -X POST http://localhost:8080/api/admin/test \
  -H "X-Admin-API-Key: local-dev-key-changeme"
# Expected: 200 OK

# Test that public endpoints still work without key
curl http://localhost:8080/api/characters
# Expected: 200 OK (characters list)
```

**2.8 Update Existing Admin Endpoints**

Add `@Tag` annotation to mark admin controllers in Swagger:

```java
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only operations (requires X-Admin-API-Key header)")
public class AdminController {

    @Operation(
        summary = "Example admin operation",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key")
    })
    @PostMapping("/example")
    public ResponseEntity<String> exampleAdminOperation() {
        return ResponseEntity.ok("Admin operation successful");
    }
}
```

---

### Session 3: Generate Embeddings (2-3 hours)

**3.1 Add Rate Limiting Dependency**

```xml
<!-- pom.xml - Add Bucket4j for rate limiting -->
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
```

**3.2 Create Embedding Generation Service (with Smart Detection & Proper Rate Limiting)**

```java
@Service
public class EmbeddingService {

    private static final String MODEL_VERSION = \"gemini-text-embedding-004\";

    @Autowired
    private LLMClient llmClient;

    @Autowired
    private ContentEmbeddingRepository embeddingRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private DisneyParkRepository parkRepository;

    @Autowired
    private DisneyParkAttractionRepository attractionRepository;

    @Autowired
    private CharacterHintRepository characterHintRepository;

    @Autowired
    private MovieHintRepository movieHintRepository;

    // Rate limiter: 60 requests per minute (Gemini free tier)
    private final Bucket bucket = Bucket.builder()
        .addLimit(Bandwidth.simple(60, Duration.ofMinutes(1)))
        .build();

    /**
     * Generate embeddings for all content types.
     * Only generates embeddings for items that don't have them yet (smart detection).
     *
     * Content types vectorized:
     * - Characters: name + short_description + long_description (~500 items)
     * - Movies: title + short_description + long_description (~150 items)
     * - Parks: name + theme + short_description + long_description (~12 items)
     * - Attractions: name + theme + short_description (~50 items)
     * - Character Hints: character.name + hint.content (JOIN via character_url_id) (~1000+ hints)
     * - Movie Hints: movie.title + hint.content (JOIN via movie_url_id) (~1000+ hints)
     *
     * @return Total number of new embeddings generated
     */
    public int generateAllEmbeddings() {
        int total = 0;
        total += generateMissingCharacterEmbeddings();
        total += generateMissingMovieEmbeddings();
        total += generateMissingParkEmbeddings();
        total += generateMissingAttractionEmbeddings();
        total += generateMissingCharacterHintEmbeddings();
        total += generateMissingMovieHintEmbeddings();
        return total;
    }

    private int generateMissingCharacterEmbeddings() {
        List<Character> characters = characterRepository.findAll().stream()
            .filter(c -> !embeddingRepository.existsByContentTypeAndContentIdAndModelVersion(
                \"character\", c.getId(), MODEL_VERSION))
            .toList();

        for (Character character : characters) {
            // Concatenate name + descriptions for richer context
            StringBuilder text = new StringBuilder();
            text.append(\"Character: \").append(character.getName()).append(\"\\n\\n\");

            if (character.getShortDescription() != null) {
                text.append(character.getShortDescription()).append(\"\\n\\n\");
            }

            if (character.getLongDescription() != null) {
                text.append(character.getLongDescription());
            }

            String combinedText = text.toString().trim();
            if (combinedText.isEmpty()) continue;

            // Rate limiting using Bucket4j
            bucket.asBlocking().consume(1);

            // Generate embedding
            List<Float> embedding = llmClient.generateEmbedding(combinedText);

            // Save using JPA
            ContentEmbedding ce = new ContentEmbedding();
            ce.setContentType(\"character\");
            ce.setContentId(character.getId());
            ce.setTextContent(combinedText);
            ce.setEmbedding(vectorToString(embedding));
            ce.setModelVersion(MODEL_VERSION);
            embeddingRepository.save(ce);
        }

        return characters.size();
    }

    private int generateMissingMovieEmbeddings() {
        List<Movie> movies = movieRepository.findAll().stream()
            .filter(m -> !embeddingRepository.existsByContentTypeAndContentIdAndModelVersion(
                \"movie\", m.getId(), MODEL_VERSION))
            .toList();
                AND ce.content_id = m.id
                AND ce.model_version = 'gemini-text-embedding-004'
            WHERE ce.embedding_id IS NULL
        """);

        for (Map<String, Object> movie : movies) {
            Long id = (Long) movie.get("id");

            // Concatenate title + descriptions
            StringBuilder text = new StringBuilder();
            text.append("Movie: ").append(movie.get("title")).append("\n\n");

            if (movie.get("short_description") != null) {
                text.append(movie.get("short_description")).append("\n\n");
            }

            if (movie.get("long_description") != null) {
                text.append(movie.get("long_description"));
            }

        for (Movie movie : movies) {
            StringBuilder text = new StringBuilder();
            text.append("Movie: ").append(movie.getTitle()).append("\\n\\n");

            if (movie.getShortDescription() != null) {
                text.append(movie.getShortDescription()).append("\\n\\n");
            }

            if (movie.getLongDescription() != null) {
                text.append(movie.getLongDescription());
            }

            String combinedText = text.toString().trim();
            if (combinedText.isEmpty()) continue;

            bucket.asBlocking().consume(1);

            List<Float> embedding = llmClient.generateEmbedding(combinedText);

            ContentEmbedding ce = new ContentEmbedding();
            ce.setContentType("movie");
            ce.setContentId(movie.getId());
            ce.setTextContent(combinedText);
            ce.setEmbedding(vectorToString(embedding));
            ce.setModelVersion(MODEL_VERSION);
            embeddingRepository.save(ce);
        }

        return movies.size();
    }

    private int generateMissingParkEmbeddings() {
        List<DisneyPark> parks = parkRepository.findAll().stream()
            .filter(p -> !embeddingRepository.existsByContentTypeAndContentIdAndModelVersion(
                "park", p.getId(), MODEL_VERSION))
            .toList();

        for (DisneyPark park : parks) {
            StringBuilder text = new StringBuilder();
            text.append("Park: ").append(park.getName()).append("\\n\\n");

            if (park.getTheme() != null) {
                text.append("Theme: ").append(park.getTheme()).append("\\n\\n");
            }

            if (park.getShortDescription() != null) {
                text.append(park.getShortDescription()).append("\\n\\n");
            }

            if (park.getLongDescription() != null) {
                text.append(park.getLongDescription());
            }

            String combinedText = text.toString().trim();
            if (combinedText.isEmpty()) continue;

            bucket.asBlocking().consume(1);

            List<Float> embedding = llmClient.generateEmbedding(combinedText);

            ContentEmbedding ce = new ContentEmbedding();
            ce.setContentType("park");
            ce.setContentId(park.getId());
            ce.setTextContent(combinedText);
            ce.setEmbedding(vectorToString(embedding));
            ce.setModelVersion(MODEL_VERSION);
            embeddingRepository.save(ce);
        }

        return parks.size();
    }

    private int generateMissingAttractionEmbeddings() {
        List<DisneyParkAttraction> attractions = attractionRepository.findAll().stream()
            .filter(a -> !embeddingRepository.existsByContentTypeAndContentIdAndModelVersion(
                "attraction", a.getId(), MODEL_VERSION))
            .toList();

        for (DisneyParkAttraction attraction : attractions) {
            StringBuilder text = new StringBuilder();
            text.append("Attraction: ").append(attraction.getName()).append("\\n\\n");

            if (attraction.getTheme() != null) {
                text.append("Theme: ").append(attraction.getTheme()).append("\\n\\n");
            }

            if (attraction.getShortDescription() != null) {
                text.append(attraction.getShortDescription());
            }

            String combinedText = text.toString().trim();
            if (combinedText.isEmpty()) continue;

            bucket.asBlocking().consume(1);

            List<Float> embedding = llmClient.generateEmbedding(combinedText);

            ContentEmbedding ce = new ContentEmbedding();
            ce.setContentType("attraction");
            ce.setContentId(attraction.getId());
            ce.setTextContent(combinedText);
            ce.setEmbedding(vectorToString(embedding));
            ce.setModelVersion(MODEL_VERSION);
            embeddingRepository.save(ce);
        }

        return attractions.size();
    }

    private int generateMissingCharacterHintEmbeddings() {
        List<CharacterHint> hints = characterHintRepository.findAll().stream()
            .filter(h -> !embeddingRepository.existsByContentTypeAndContentIdAndModelVersion(
                "character_hint", h.getId(), MODEL_VERSION))
            .toList();

        for (CharacterHint hint : hints) {
            if (hint.getContent() == null || hint.getContent().trim().isEmpty()) continue;

            // Find parent character by url_id
            Character character = characterRepository.findByUrlId(hint.getCharacterUrlId())
                .orElseThrow(() -> new RuntimeException("Character not found for hint"));

            String combinedText = "Character: " + character.getName() + "\\nHint: " + hint.getContent();

            bucket.asBlocking().consume(1);

            List<Float> embedding = llmClient.generateEmbedding(combinedText);

            ContentEmbedding ce = new ContentEmbedding();
            ce.setContentType("character_hint");
            ce.setContentId(hint.getId());
            ce.setTextContent(combinedText);
            ce.setEmbedding(vectorToString(embedding));
            ce.setModelVersion(MODEL_VERSION);
            embeddingRepository.save(ce);
        }

        return hints.size();
    }

    private int generateMissingMovieHintEmbeddings() {
        List<MovieHint> hints = movieHintRepository.findAll().stream()
            .filter(h -> !embeddingRepository.existsByContentTypeAndContentIdAndModelVersion(
                "movie_hint", h.getId(), MODEL_VERSION))
            .toList();

        for (MovieHint hint : hints) {
            if (hint.getContent() == null || hint.getContent().trim().isEmpty()) continue;

            // Find parent movie by url_id
            Movie movie = movieRepository.findByUrlId(hint.getMovieUrlId())
                .orElseThrow(() -> new RuntimeException("Movie not found for hint"));

            String combinedText = "Movie: " + movie.getTitle() + "\\nHint: " + hint.getContent();

            bucket.asBlocking().consume(1);

            List<Float> embedding = llmClient.generateEmbedding(combinedText);

            ContentEmbedding ce = new ContentEmbedding();
            ce.setContentType("movie_hint");
            ce.setContentId(hint.getId());
            ce.setTextContent(combinedText);
            ce.setEmbedding(vectorToString(embedding));
            ce.setModelVersion(MODEL_VERSION);
            embeddingRepository.save(ce);
        }

        return hints.size();
    }

    private String vectorToString(List<Float> vector) {
        return "[" + vector.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]";
    }
}
```

**3.3 Create Admin Endpoint for Embedding Generation**

```java
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only operations (requires X-Admin-API-Key header)")
public class AdminController {

    @Autowired
    private EmbeddingService embeddingService;

    @PostMapping("/embeddings/generate")
    @Operation(
        summary = "Generate embeddings for all content",
        description = "Generates embeddings for characters, movies, and attractions that don't have them yet. " +
                     "Uses smart detection to skip existing embeddings. Safe to run multiple times.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Embeddings generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key")
    })
    public ResponseEntity<EmbeddingGenerationResponse> generateEmbeddings() {
        LocalDateTime startTime = LocalDateTime.now();
        int count = embeddingService.generateAllEmbeddings();

        return ResponseEntity.ok(new EmbeddingGenerationResponse(
            count,
            "Generated " + count + " new embeddings",
            startTime,
            LocalDateTime.now()
        ));
    }
}

record EmbeddingGenerationResponse(
    int count,
    String message,
    LocalDateTime startTime,
    LocalDateTime endTime
) {}
```

**3.3 Test Embedding Generation**

```bash
# Local development
curl -X POST http://localhost:8080/api/admin/embeddings/generate \
  -H "X-Admin-API-Key: local-dev-key-changeme"

# Expected response:
# {
#   "count": 2712,
#   "message": "Generated 2712 new embeddings",
#   "startTime": "2025-11-26T10:30:00",
#   "endTime": "2025-11-26T10:42:00"
# }

# Run again immediately (should generate 0 new embeddings)
curl -X POST http://localhost:8080/api/admin/embeddings/generate \
  -H "X-Admin-API-Key: local-dev-key-changeme"

# Expected: {"count": 0, "message": "Generated 0 new embeddings", ...}
```

**3.4 Production Usage (After Bulk Data Updates)**

```bash
# After you update data via JSON imports, run:
export ADMIN_API_KEY="your-production-key"

curl -X POST https://my-disney-app.azurewebsites.net/api/admin/embeddings/generate \
  -H "X-Admin-API-Key: $ADMIN_API_KEY"
```

**3.5 Verify Embeddings Were Created**
embedding = EXCLUDED.embedding,
text_content = EXCLUDED.text_content,
updated_at = CURRENT_TIMESTAMP
""",
"attraction", id, description, vectorToString(embedding), "gemini-text-embedding-004"
);

            Thread.sleep(1000);
        }
    }

    private String vectorToString(List<Float> vector) {
        return "[" + vector.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]";
    }

}

````

**3.5 Verify Embeddings Were Created**

```sql
-- Check how many embeddings were generated
SELECT content_type, COUNT(*) as count
FROM content_embeddings
GROUP BY content_type;

-- Sample a few embeddings
SELECT content_type, content_id,
       LEFT(text_content, 50) as preview,
       array_length(embedding::float[], 1) as dimensions
FROM content_embeddings
LIMIT 10;

-- Expected output:
-- content_type      | count
-- character         | ~500
-- movie             | ~150
-- park              | ~12
-- attraction        | ~50
-- character_hint    | ~1000+
-- movie_hint        | ~1000+
--
-- dimensions should be 768 for all (Gemini embedding size)
````

**Note**: The indexes created in Step 1.3 already handle performance optimization for similarity searches.

### Session 4: REST API (1-2 hours)

**4.1 Create RagController**

````java
@RestController
@RequestMapping("/api/rag")
public class RagController {

    @Autowired
    private RagService ragService;

    @PostMapping("/query")
    public ResponseEntity<RagResponse> query(@RequestBody RagQueryRequest request) {
        RagResponse response = ragService.query(request.query());
**4.1 Create DTO Package Structure**

```java
// src/main/java/com/harmadavtian/disneyapp/dto/rag/RagQueryRequest.java
package com.harmadavtian.disneyapp.dto.rag;

public record RagQueryRequest(String query) {}
````

```java
// src/main/java/com/harmadavtian/disneyapp/dto/rag/RagResponse.java
package com.harmadavtian.disneyapp.dto.rag;

import java.util.List;

public record RagResponse(
    String answer,
    List<ContextChunk> citations
) {}
```

```java
// src/main/java/com/harmadavtian/disneyapp/dto/rag/ContextChunk.java
package com.harmadavtian.disneyapp.dto.rag;

public record ContextChunk(
    String type,           // 'character', 'movie', 'park', 'attraction', 'character_hint', 'movie_hint'
    String name,           // Display name
    String description,    // Text content that was embedded
    double similarity,     // Cosine similarity score (0-1)
    long contentId,        // ID for linking back to source
    String imageUrl        // For displaying citation thumbnails (null for hints)
) {}
```

**4.2 Create RagController**

```java
@RestController
@RequestMapping("/api/rag")
@Tag(name = "RAG", description = "Retrieval-Augmented Generation endpoints")
public class RagController {

    @Autowired
    private RagService ragService;

    @PostMapping("/query")
    @Operation(summary = "Query Disney knowledge base", description = "Ask a question about Disney characters, movies, parks, or attractions")
    public ResponseEntity<RagResponse> query(@RequestBody RagQueryRequest request) {
        RagResponse response = ragService.query(request.query());
        return ResponseEntity.ok(response);
    }
}
```

**4.3 Test with cURL**

```bash
curl -X POST http://localhost:8080/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about Snow White"}'
```

---

**5.1 Create ChatModal Component**

```tsx
// frontend/src/components/ChatModal/ChatModal.tsx
import { useState } from "react";
import { trackRagQuery, trackRagResponse } from "@/utils/analytics";
import styles from "./ChatModal.module.scss";

interface Citation {
  type: string;
  name: string;
  description: string;
  similarity: number;
}

interface RagResponse {
  answer: string;
  citations: Citation[];
}

export const ChatModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<RagResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const startTime = Date.now();

    // Track query submission
    trackRagQuery(query, query.length);

    try {
      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data: RagResponse = await res.json();
      setResponse(data);

      // Track response received
      const responseTime = Date.now() - startTime;
      trackRagResponse(query, responseTime, data.citations?.length || 0);
    } catch (error) {
      console.error("RAG query failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>

        <h2>Ask About Disney</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about Disney characters, movies, or attractions..."
            className={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </form>

        {response && (
          <div className={styles.response}>
            <h3>Answer:</h3>
            <p>{response.answer}</p>

            {response.citations.length > 0 && (
              <div className={styles.citations}>
                <h4>Sources:</h4>
                <ul>
                  {response.citations.map((citation, idx) => (
                    <li key={idx}>
                      <strong>{citation.name}</strong> ({citation.type}) -
                      Relevance: {(citation.similarity * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

**5.2 Add Typing Indicator**

```tsx
// Add to ChatModal component
{
  loading && (
    <div className={styles.typingIndicator}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}
```

```scss
// ChatModal.module.scss
.typingIndicator {
  display: flex;
  gap: 4px;
  padding: 12px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0066cc;
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
```

**5.3 Add Citation Links with Click Tracking**

```tsx
// Update citations display in ChatModal
{
  response.citations.map((citation, idx) => (
    <li key={idx}>
      <a
        href={`/${citation.type}s/${citation.contentId}`}
        onClick={(e) => {
          e.preventDefault();
          trackCitationClick(citation.type, citation.name);
          // Navigate using your router
          navigate(`/${citation.type}s/${citation.contentId}`);
        }}
        className={styles.citationLink}
      >
        <strong>{citation.name}</strong>
      </a>
      <span className={styles.citationType}>({citation.type})</span>
      <span className={styles.relevance}>
        Relevance: {(citation.similarity * 100).toFixed(1)}%
      </span>
    </li>
  ));
}
```

**5.4 Add Query Suggestions**

```tsx
// Add before the input form in ChatModal
const QUERY_SUGGESTIONS = [
  "Who is the main villain in The Lion King?",
  "Tell me about Cinderella Castle",
  "What movies feature Goofy?",
  "Which Disney princess has red hair?",
  "What attractions are at Magic Kingdom?",
];

{
  !response && (
    <div className={styles.suggestions}>
      <p>Try asking:</p>
      {QUERY_SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => setQuery(suggestion)}
          className={styles.suggestionChip}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
```

**5.5 Add Feedback Buttons**

```tsx
// Add state for feedback
const [feedback, setFeedback] = useState<"helpful" | "not_helpful" | null>(
  null
);

// Add after response display
{
  response && (
    <div className={styles.feedback}>
      <p>Was this helpful?</p>
      <div className={styles.feedbackButtons}>
        <button
          onClick={() => {
            setFeedback("helpful");
            trackRagFeedback(true, query);
          }}
          className={feedback === "helpful" ? styles.active : ""}
        >
          👍 Yes
        </button>
        <button
          onClick={() => {
            setFeedback("not_helpful");
            trackRagFeedback(false, query);
          }}
          className={feedback === "not_helpful" ? styles.active : ""}
        >
          👎 No
        </button>
      </div>
      {feedback && <p className={styles.thankYou}>Thanks for your feedback!</p>}
    </div>
  );
}
```

**5.6 Add Error Handling UI**

```tsx
// Add error state
const [error, setError] = useState<string | null>(null);

// Update try-catch in handleSubmit
try {
  const res = await fetch("/api/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data: RagResponse = await res.json();
  setResponse(data);
  setError(null);

  // Track response received
  const responseTime = Date.now() - startTime;
  trackRagResponse(query, responseTime, data.citations?.length || 0);
} catch (err) {
  console.error("RAG query failed:", err);
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}

// Display error message
{
  error && <div className={styles.error}>⚠️ {error}</div>;
}
```

**5.7 Add Google Analytics Integration**

- Add GA4 script to `index.html` (see GA4 section above)
- Import analytics utilities in components
- Track events on query submit, response received, citation clicks, feedback

**5.8 Add Chat Button to Navigation**

```tsx
// In your main navigation component
const [chatOpen, setChatOpen] = useState(false);

<button onClick={() => setChatOpen(true)} className={styles.chatButton}>
  💬 Ask Disney AI
</button>

<ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
```

**5.9 Complete ChatModal.module.scss**

```scss
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modalContent {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.closeButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #000;
  }
}

.input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
}

.submitButton {
  width: 100%;
  padding: 12px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: #0052a3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

.response {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.citations {
  margin-top: 1rem;

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    padding: 8px;
    margin: 4px 0;
    background: #f5f5f5;
    border-radius: 4px;
  }
}

.citationLink {
  color: #0066cc;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.citationType {
  color: #666;
  margin-left: 8px;
}

.relevance {
  float: right;
  color: #999;
  font-size: 14px;
}

.suggestions {
  margin: 1rem 0;

  p {
    font-weight: 600;
    margin-bottom: 8px;
  }
}

.suggestionChip {
  display: inline-block;
  margin: 4px;
  padding: 8px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #e0e0e0;
  }
}

.feedback {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  text-align: center;
}

.feedbackButtons {
  display: flex;
  gap: 1rem;
  justify-content: center;

  button {
    padding: 8px 16px;
    border: 2px solid #ddd;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      border-color: #0066cc;
    }

    &.active {
      background: #0066cc;
      color: white;
      border-color: #0066cc;
    }
  }
}

.thankYou {
  margin-top: 8px;
  color: #28a745;
  font-style: italic;
}

.error {
  padding: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  margin-top: 1rem;
}

.chatButton {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
}
```

---

## Advanced Features (Optional Enhancement Sessions)

### Session 6: Conversation Memory (3-4 hours)

**Goal**: Add conversation history to maintain context across multiple questions in a session.

**6.1 Add Conversation Entity**

```java
@Entity
@Table(name = "rag_conversations")
public class RagConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conversationId;

    private String sessionId;  // Frontend-generated UUID

    @Column(columnDefinition = "TEXT")
    private String userQuery;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    @Column(columnDefinition = "JSONB")
    private String citations;  // Store as JSON

    private LocalDateTime createdAt;
    private Integer responseTimeMs;
}
```

**6.2 Update RagService to Store History**

````java
public RagResponse query(String userQuery, String sessionId) {
    // Get conversation history for context
    List<RagConversation> history = conversationRepository
        .findBySessionIdOrderByCreatedAtDesc(sessionId)
        .stream()
        .limit(5)  // Last 5 exchanges
        .toList();

    // Include history in prompt
    String prompt = buildPromptWithHistory(userQuery, context, history);

    // ... rest of query logic

    // Save conversation
    RagConversation conversation = new RagConversation();
    conversation.setSessionId(sessionId);
    conversation.setUserQuery(userQuery);
    conversation.setAiResponse(answer);
    conversation.setCitations(objectMapper.writeValueAsString(context));

**Goal**: Production-ready RAG system with advanced features, conversation memory, feedback loop, error handling.

### Session 1-3: Same as Option A

Complete Sessions 1-3 from Option A (backend foundation, embeddings, REST API).

### Session 4: Conversation Memory (3-4 hours)

**4.1 Add Conversation Entity**

```java
@Entity
@Table(name = "rag_conversations")
public class RagConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conversationId;

    private String sessionId;  // Frontend-generated UUID

    @Column(columnDefinition = "TEXT")
    private String userQuery;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    @Column(columnDefinition = "JSONB")
    private String citations;  // Store as JSON

    private LocalDateTime createdAt;
    private Integer responseTimeMs;
}
````

**4.2 Update RagService to Store History**

```java
public RagResponse query(String userQuery, String sessionId) {
    // Get conversation history for context
    List<RagConversation> history = conversationRepository
        .findBySessionIdOrderByCreatedAtDesc(sessionId)
        .stream()
        .limit(5)  // Last 5 exchanges
        .toList();

    // Include history in prompt
    String prompt = buildPromptWithHistory(userQuery, context, history);

    // ... rest of query logic

    // Save conversation
    RagConversation conversation = new RagConversation();
    conversation.setSessionId(sessionId);
    conversation.setUserQuery(userQuery);
    conversation.setAiResponse(answer);
    conversation.setCitations(objectMapper.writeValueAsString(context));
    conversation.setCreatedAt(LocalDateTime.now());
    conversation.setResponseTimeMs(responseTime);
    conversationRepository.save(conversation);

    return response;
}
```

**6.3 Update Frontend to Send Session ID**

```tsx
// Generate session ID on component mount
const [sessionId] = useState(() => crypto.randomUUID());

// Include in API request
const res = await fetch("/api/rag/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query, sessionId }),
});
```

**6.4 Display Conversation History**

```tsx
// Add conversation history state
const [conversationHistory, setConversationHistory] = useState<
  Array<{
    query: string;
    answer: string;
    timestamp: Date;
  }>
>([]);

// Update after each response
const newEntry = {
  query,
  answer: data.answer,
  timestamp: new Date(),
};
setConversationHistory([...conversationHistory, newEntry]);

// Display history
{
  conversationHistory.length > 0 && (
    <div className={styles.history}>
      <h4>Conversation History:</h4>
      {conversationHistory.map((entry, idx) => (
        <div key={idx} className={styles.historyEntry}>
          <p className={styles.userQuery}>
            <strong>You:</strong> {entry.query}
          </p>
          <p className={styles.aiResponse}>
            <strong>AI:</strong> {entry.answer}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

### Session 7: Content Type Filters (2-3 hours)

**Goal**: Allow users to filter results by content type (characters, movies, parks, attractions).

**7.1 Update RagController to Accept Filters**

```java
record RagQueryRequest(
    String query,
    String sessionId,
    RagQueryOptions options
) {}

record RagQueryOptions(
    boolean includeCharacters,
    boolean includeMovies,
    boolean includeParks,
    boolean includeAttractions,
    boolean includeHints,
    Integer maxResults
) {
    public RagQueryOptions {
        // Defaults
        if (maxResults == null) maxResults = 5;
    }
}
```

**7.2 Update RagService to Filter by Content Type**

```java
public RagResponse query(String userQuery, String sessionId, RagQueryOptions options) {
    List<Float> queryEmbedding = llmClient.generateEmbedding(userQuery);

    // Build WHERE clause based on enabled content types
    List<String> contentTypes = new ArrayList<>();
    if (options.includeCharacters()) contentTypes.add("'character'");
    if (options.includeMovies()) contentTypes.add("'movie'");
    if (options.includeParks()) contentTypes.add("'park'");
    if (options.includeAttractions()) contentTypes.add("'attraction'");
    if (options.includeHints()) {
        contentTypes.add("'character_hint'");
        contentTypes.add("'movie_hint'");
    }

    String contentTypeFilter = contentTypes.isEmpty()
        ? "1=1"  // No filter, include all
        : "ce.content_type IN (" + String.join(",", contentTypes) + ")";

    String sql = """
        SELECT
            ce.content_type,
            ce.content_id,
            ce.text_content,
            1 - (ce.embedding <=> ?::vector) as similarity,
            CASE
                WHEN ce.content_type = 'character' THEN c.name
                WHEN ce.content_type = 'movie' THEN m.title
                WHEN ce.content_type = 'park' THEN p.name
                WHEN ce.content_type = 'attraction' THEN a.name
                WHEN ce.content_type = 'character_hint' THEN 'Character Hint'
                WHEN ce.content_type = 'movie_hint' THEN 'Movie Hint'
            END as name,
            CASE
                WHEN ce.content_type = 'character' THEN (c.images->0->>'url')
                WHEN ce.content_type = 'movie' THEN (m.images->0->>'url')
                WHEN ce.content_type = 'park' THEN (p.images->0->>'url')
                WHEN ce.content_type = 'attraction' THEN (a.images->0->>'url')
                ELSE NULL
            END as image_url
        FROM content_embeddings ce
        LEFT JOIN characters c ON ce.content_type = 'character' AND ce.content_id = c.id
        LEFT JOIN movies m ON ce.content_type = 'movie' AND ce.content_id = m.id
        LEFT JOIN disney_parks p ON ce.content_type = 'park' AND ce.content_id = p.id
        LEFT JOIN disney_parks_attractions a ON ce.content_type = 'attraction' AND ce.content_id = a.id
        WHERE ce.model_version = 'gemini-text-embedding-004'
            AND %s
        ORDER BY ce.embedding <=> ?::vector
        LIMIT ?
    """.formatted(contentTypeFilter);

    // Execute query with options.maxResults()
}
```

**7.3 Add Filter UI to Frontend**

```tsx
// Add filter state
const [filters, setFilters] = useState({
  includeCharacters: true,
  includeMovies: true,
  includeParks: true,
  includeAttractions: true,
  includeHints: false,
  maxResults: 5,
});

// Add filter controls
<div className={styles.filters}>
  <h4>Filter Results:</h4>
  <label>
    <input
      type="checkbox"
      checked={filters.includeCharacters}
      onChange={(e) =>
        setFilters({ ...filters, includeCharacters: e.target.checked })
      }
    />
    Characters
  </label>
  <label>
    <input
      type="checkbox"
      checked={filters.includeMovies}
      onChange={(e) =>
        setFilters({ ...filters, includeMovies: e.target.checked })
      }
    />
    Movies
  </label>
  <label>
    <input
      type="checkbox"
      checked={filters.includeParks}
      onChange={(e) =>
        setFilters({ ...filters, includeParks: e.target.checked })
      }
    />
    Parks
  </label>
  <label>
    <input
      type="checkbox"
      checked={filters.includeAttractions}
      onChange={(e) =>
        setFilters({ ...filters, includeAttractions: e.target.checked })
      }
    />
    Attractions
  </label>
  <label>
    <input
      type="checkbox"
      checked={filters.includeHints}
      onChange={(e) =>
        setFilters({ ...filters, includeHints: e.target.checked })
      }
    />
    Hints
  </label>

  <label>
    Max Results: {filters.maxResults}
    <input
      type="range"
      min="1"
      max="20"
      value={filters.maxResults}
      onChange={(e) =>
        setFilters({ ...filters, maxResults: parseInt(e.target.value) })
      }
    />
  </label>
</div>;

// Include filters in API request
body: JSON.stringify({ query, sessionId, options: filters });
```

---

### Session 8: Rate Limiting & Error Recovery (2-3 hours)

**Goal**: Protect the API from abuse and handle failures gracefully.

**8.1 Add Rate Limiting Component**

```java
@Component
public class RagRateLimiter {
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> resetTimes = new ConcurrentHashMap<>();

    public boolean allowRequest(String sessionId) {
        long now = System.currentTimeMillis();
        long resetTime = resetTimes.getOrDefault(sessionId, now);

        // Reset counter every hour
        if (now > resetTime) {
            requestCounts.remove(sessionId);
            resetTimes.put(sessionId, now + TimeUnit.HOURS.toMillis(1));
        }

        AtomicInteger count = requestCounts.computeIfAbsent(sessionId, k -> new AtomicInteger(0));

        if (count.get() >= 20) {  // 20 requests per hour per session
            return false;
        }

        count.incrementAndGet();
        return true;
    }
}
```

**8.2 Apply Rate Limiting in Controller**

```java
@Autowired
private RagRateLimiter rateLimiter;

@PostMapping("/query")
public ResponseEntity<?> query(@RequestBody RagQueryRequest request) {
    if (!rateLimiter.allowRequest(request.sessionId())) {
        return ResponseEntity.status(429)
            .body(Map.of("error", "Rate limit exceeded. Please try again later."));
    }

    RagResponse response = ragService.query(
        request.query(),
        request.sessionId(),
        request.options()
    );
    return ResponseEntity.ok(response);
}
```

**8.3 Add Retry Logic for LLM API Failures**

Add Spring Retry dependency:

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```

Enable retry in GeminiClient:

```java
@Retryable(
    value = {HttpServerErrorException.class, ResourceAccessException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000, multiplier = 2)
)
public String chat(String prompt) {
    // Gemini API call
    // Will retry up to 3 times with exponential backoff (1s, 2s, 4s)
}

@Recover
public String recoverChat(Exception e, String prompt) {
    log.error("Failed to get LLM response after retries", e);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
}
```

**8.4 Add Circuit Breaker (Optional)**

```java
@CircuitBreaker(name = "gemini", fallbackMethod = "fallbackChat")
public String chat(String prompt) {
    // Gemini API call
}

public String fallbackChat(String prompt, Exception e) {
    return "The AI service is temporarily unavailable. Please try again later.";
}
```

**8.5 Frontend Rate Limit Handling**

```tsx
// Handle 429 status
if (res.status === 429) {
  setError("You've reached the query limit. Please try again in an hour.");
  return;
}
```

---

## Database Schema

**Complete Rollback Script** (removes all RAG functionality):
<span></span>
<span></span>

</div>
);
}

````

---

## Database Schema Changes

### Migration Script (Production-Grade Separate Table Approach)

```sql
-- V3__add_rag_support.sql

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create separate embeddings table (DOES NOT modify existing tables)
CREATE TABLE IF NOT EXISTS content_embeddings (
    embedding_id BIGSERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,  -- 'character', 'movie', 'attraction'
    content_id INTEGER NOT NULL,        -- FK to actual record
    text_content TEXT NOT NULL,         -- The text that was embedded
    embedding vector(768) NOT NULL,     -- The actual embedding vector
    model_version VARCHAR(50) NOT NULL DEFAULT 'gemini-text-embedding-004',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one embedding per content item per model
    UNIQUE(content_type, content_id, model_version)
);

-- Index for fast similarity search
CREATE INDEX IF NOT EXISTS content_embeddings_vector_idx
ON content_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for fast lookups by content
CREATE INDEX IF NOT EXISTS content_embeddings_lookup_idx
ON content_embeddings (content_type, content_id);

-- Index for filtering by model version
CREATE INDEX IF NOT EXISTS content_embeddings_model_idx
ON content_embeddings (model_version);

-- Conversation history table (Option B only)
CREATE TABLE IF NOT EXISTS rag_conversations (
    conversation_id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    citations JSONB,
    helpful BOOLEAN,
    feedback_comment TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for conversation history
CREATE INDEX IF NOT EXISTS idx_rag_conversations_session_id
ON rag_conversations (session_id);

CREATE INDEX IF NOT EXISTS idx_rag_conversations_created_at
ON rag_conversations (created_at);
````

### Complete Rollback Script (If You Abandon RAG)

```sql
-- Remove all RAG-related changes (existing tables untouched)
DROP TABLE IF EXISTS rag_conversations;
DROP TABLE IF EXISTS content_embeddings;
DROP EXTENSION IF EXISTS vector CASCADE;

-- DONE! Your characters, movies, and attractions tables are unchanged
```

---

## Testing Plan

### Unit Tests

```java
@SpringBootTest
class RagServiceTest {

    @Autowired
    private RagService ragService;

    @MockBean
    private LLMClient llmClient;

    @Test
    void testQueryReturnsValidResponse() {
        when(llmClient.generateEmbedding(anyString()))
            .thenReturn(List.of(0.1f, 0.2f, /* ... */));

        when(llmClient.chat(anyString()))
            .thenReturn("Snow White is a Disney princess...");

        RagResponse response = ragService.query("Who is Snow White?");

        assertNotNull(response.answer());
        assertTrue(response.citations().size() > 0);
    }
}
```

### Integration Tests

```bash
# Test admin endpoint security (should fail without key)
curl -X POST http://localhost:8080/api/admin/embeddings/generate
# Expected: 401 Unauthorized

# Test embedding generation with valid key
curl -X POST http://localhost:8080/api/admin/embeddings/generate \
  -H "X-Admin-API-Key: local-dev-key-changeme"
# Expected: 200 OK with count of embeddings generated

# Test RAG query (public endpoint, no auth required)
curl -X POST http://localhost:8080/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about Snow White", "sessionId": "test-123"}'

# Test feedback
curl -X POST http://localhost:8080/api/rag/feedback \
  -H "Content-Type: application/json" \
  -d '{"conversationId": 1, "helpful": true}'
```

---

## Deployment Checklist

### Security (Complete FIRST - applies to all admin endpoints)

- [ ] **Generate secure API key**: `openssl rand -base64 32`
- [ ] **Set `ADMIN_API_KEY`** in Azure App Service environment variables
- [ ] **Test security locally**: Verify `/api/admin/**` endpoints reject requests without key
- [ ] **Update any existing admin endpoints** to use new security filter
- [ ] **Store production API key securely** (password manager, Azure Key Vault)
- [ ] **Add API key to Swagger UI**: Test admin endpoints via production Swagger

### RAG-Specific

- [ ] **Set `GEMINI_API_KEY`** environment variable in Azure App Service
- [ ] **Enable pgvector extension** in Neon database: `CREATE EXTENSION vector;`
- [ ] **Run migration script** (`V3__add_rag_support.sql`) to create `content_embeddings` table
- [ ] **Verify existing tables untouched**: Run `\d characters`, `\d movies`, `\d parks_attractions` - should show NO new columns
- [ ] **Generate embeddings** for all existing data (one-time operation):
  ```bash
  curl -X POST https://my-disney-app.azurewebsites.net/api/admin/embeddings/generate \
    -H "X-Admin-API-Key: YOUR_PRODUCTION_KEY"
  ```
- [ ] **Verify embeddings created**: `SELECT COUNT(*) FROM content_embeddings;` should show ~2,700 rows
- [ ] **Add GA4 measurement ID** to `index.html`
- [ ] **Test RAG queries** in production with real data
- [ ] **Monitor GA4 dashboard** for usage patterns
- [ ] **Set up rate limiting** (10 queries/hour per session)
- [ ] **Keep rollback script handy** in case you need to remove RAG feature

### 🚨 **NEON DATABASE EMBEDDING GENERATION (Before Production Deploy)**

**Status**: ⏳ **PENDING** - Local embeddings generated (1,023 vectors), Neon production DB needs sync

**Prerequisites**:

1. ✅ Local Docker PostgreSQL has embeddings (completed Session 3)
2. ✅ V4 migration tested locally (content_embeddings table working)
3. ⏳ V4 migration applied to Neon (happens automatically on first Azure deploy with Flyway)
4. ⏳ Neon production data up-to-date (characters, movies, parks)

**Verification Script** (run BEFORE embedding generation):

```powershell
cd C:\sites\my-disney-app\backend
.\verify-neon-rag-ready.ps1
```

**Embedding Generation Options**:

**Option 1: Automated (Recommended)**

```powershell
cd C:\sites\my-disney-app\backend
.\quick-neon-embeddings.ps1
```

- Starts Spring Boot connected to Neon in background
- Automatically calls `/api/admin/embeddings/generate`
- Stops server when complete
- Expected: ~1,023 embeddings generated (180 characters, 831 movies, 12 parks)

**Option 2: Manual (for monitoring)**

```powershell
cd C:\sites\my-disney-app\backend
.\generate-neon-embeddings.ps1
```

- Starts Spring Boot connected to Neon (foreground)
- You manually trigger endpoint in another terminal:

```powershell
$headers = @{
  "Content-Type" = "application/json"
  "X-Admin-API-Key" = "xrn5gEMTwUWHtbLDSlvqY9f6sGAo71iB"
}
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/embeddings/generate" -Method Post -Headers $headers
```

**Verification After Generation**:

```sql
-- Connect to Neon via psql or Neon console
SELECT content_type, COUNT(*) as count
FROM content_embeddings
GROUP BY content_type
ORDER BY content_type;

-- Expected output:
-- character    | 180
-- movie        | 831
-- park         | 12
-- TOTAL        | 1,023
```

**⚠️ IMPORTANT**: Do NOT deploy frontend changes to production until Neon embeddings are generated, or users will see errors when trying to use AI Assistant feature!

### Ongoing Maintenance

After each bulk data update (JSON imports):

1. Deploy updated data to Neon
2. Run: `curl -X POST .../api/admin/embeddings/generate -H "X-Admin-API-Key: ..."`
3. Verify: Only NEW items get embeddings (smart detection avoids duplicates)

---

## Cost Monitoring

**Monthly Cost Estimate:**

- **Gemini API**: $0.50-5/month (1,000-10,000 queries)
- **Neon Database**: Free tier (pgvector included)
- **Google Analytics**: Free tier
- **Azure Hosting**: Existing cost (no additional charges)

**Total Additional Cost**: ~$0.50-5/month

---

## Future Enhancements

**Phase 2 (Post-MVP):**

- Multi-turn conversations with context window management
- Image-based queries (upload character image, ask questions)
- Voice input/output (Web Speech API)
- Personalized responses based on user favorites
- A/B testing different LLM providers (Gemini vs OpenAI)

**Phase 3 (Advanced):**

- Fine-tuned model specifically for Disney content
- Multilingual support (Spanish, French, Japanese)
- Integration with Disney Parks wait times API
- Character personality-based responses (Mickey Mouse style vs Elsa style)

---

## Resources

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Google Analytics 4 Guide](https://developers.google.com/analytics/devguides/collection/ga4)
- [Neon Serverless Postgres](https://neon.tech/)

---

## Support

For questions or issues:

1. Check Google Gemini API documentation
2. Review pgvector GitHub issues
3. Test with smaller datasets first
4. Monitor GA4 real-time reports
5. Check Azure App Service logs for errors

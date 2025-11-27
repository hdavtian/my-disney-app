# RAG System Implementation Plan

## Executive Summary

This document outlines the implementation plan for adding Retrieval-Augmented Generation (RAG) capabilities to the Disney App. The RAG system will enable users to ask natural language questions about Disney characters, movies, parks, and attractions, receiving intelligent AI-generated responses with citations to source data.

**Timeline**: 2-3 development sessions (8-12 hours total)  
**Cost**: $0.05 one-time setup + $0.50-5/month ongoing  
**Risk**: Low (separate embeddings table, zero impact on existing features)

---

## Strategic Objectives

### Primary Goals

1. **Enhanced User Engagement**: Provide an intuitive chat interface for Disney knowledge exploration
2. **Demonstrate AI Integration**: Showcase modern LLM/RAG capabilities for portfolio/interview value
3. **Cost Efficiency**: Implement production-grade system at minimal cost (~$5/month max)
4. **Zero Risk to Existing Data**: Use separate embeddings table, no modifications to current schema
5. **Clean Rollback Path**: Single `DROP TABLE` removes all RAG functionality if needed

### Success Criteria

- Users can ask natural language questions and receive accurate answers
- Responses include citations with similarity scores and source links
- Query response time < 2 seconds
- System handles 1,000+ queries/month within $5 budget
- Frontend integrates seamlessly with existing UI theme
- No performance impact on existing features

---

## Architectural Decisions

### LLM Provider: Google Gemini 1.5 Flash

**Rationale**:

- **Cost**: $0.00001875/1K input tokens (20x cheaper than GPT-3.5)
- **Context Window**: 1M tokens (can include massive amounts of Disney data in prompts)
- **Speed**: 200-500ms response times
- **Quality**: Sufficient for Disney trivia/information retrieval
- **Free Tier**: Available for development/testing

**Alternatives Considered**:

- OpenAI GPT-4o-mini: Higher cost ($0.00015/1K), but good fallback option
- Azure OpenAI: Enterprise features but 10-20x more expensive
- Ollama (Local): Rejected due to 4-7GB model downloads in CI/CD pipelines

### Database Architecture: Separate Embeddings Table

**Pattern**: Industry-standard decoupled vector storage (used by Pinecone, Weaviate, Supabase)

**Design**:

```
content_embeddings table:
- embedding_id (PK)
- content_type ('character', 'movie', 'park', 'attraction', 'character_hint', 'movie_hint')
- content_id (FK to source table)
- text_content (denormalized text that was embedded)
- embedding (vector(768) - pgvector type)
- model_version ('gemini-text-embedding-004')
- created_at, updated_at
```

**Why This Approach**:

- ✅ Zero modifications to existing tables (characters, movies, parks, attractions, hints)
- ✅ Can store multiple embedding models simultaneously
- ✅ Easy to regenerate embeddings without affecting source data
- ✅ Clean separation of concerns
- ✅ Simple rollback: `DROP TABLE content_embeddings`
- ✅ Future-proof: Easy migration to dedicated vector DB later

**Why NOT Adding Columns to Existing Tables**:

- ❌ Risk of data corruption during schema migrations
- ❌ Tight coupling between domain data and ML features
- ❌ Harder to version/upgrade embedding models
- ❌ Pollutes domain tables with infrastructure concerns

### Backend Stack

**Spring Boot Best Practices**:

- **Spring Data JPA**: All database access via repositories (NO raw JDBC)
- **Bucket4j**: Industry-standard rate limiting (60 req/min for Gemini free tier)
- **Spring Security**: API key authentication for admin endpoints
- **Spring Retry**: Automatic retry with exponential backoff for LLM API failures
- **DTO Pattern**: Separate data transfer objects in `dto.rag` package
- **Repository Pattern**: JpaRepository interfaces for all entities
- **RestTemplate or WebClient**: Standard HTTP client for Gemini API calls (NOT custom HttpClient)
- **@Cacheable**: Spring Cache for response caching (frequently asked questions)

**Technology Choices**:

- Java 21 (existing project standard)
- PostgreSQL with pgvector extension (already using Neon)
- Lombok for reduced boilerplate
- Springdoc OpenAPI for API documentation
- Spring Boot Starter Web (includes RestTemplate)
- Spring Boot Starter Cache (for query result caching)

### Frontend Stack

**Technology**:

- React 19 (existing project standard)
- TypeScript
- SCSS modules (matching existing style patterns)
- Google Analytics 4 for event tracking

**Components**:

- ChatModal: Main RAG interface (modal dialog)
- Chat button in navigation
- Query suggestions
- Citation display with links
- Feedback buttons (thumbs up/down)
- Error handling UI
- Loading states (typing indicator)

### Analytics: Google Analytics 4 Only

**Events Tracked**:

- `rag_query_submitted`: When user asks a question
- `rag_response_received`: When answer is displayed (includes response time)
- `rag_citation_clicked`: When user clicks a source citation
- `rag_feedback`: When user rates answer helpful/not helpful

**Why GA4 Instead of Custom Backend**:

- ✅ Zero backend code needed
- ✅ Real-time analytics dashboard
- ✅ No additional database tables
- ✅ Standard analytics platform
- ✅ Mobile app integration ready

---

## Content Vectorization Strategy

### What Gets Vectorized

**6 Content Types** (~2,700 total items):

1. **Characters** (~500 items)

   - Concatenate: `name + short_description + long_description`
   - Example: "Character: Aladdin\n\n[short desc]\n\n[long desc]"

2. **Movies** (~150 items)

   - Concatenate: `title + short_description + long_description`

3. **Parks** (~12 items)

   - Concatenate: `name + theme + short_description + long_description`

4. **Attractions** (~50 items)

   - Concatenate: `name + theme + short_description`

5. **Character Hints** (~1,000+ items)

   - **JOIN with characters table** via `character_url_id`
   - Concatenate: `character.name + hint.content`
   - Example: "Character: Aladdin\nHint: He is a 'diamond in the rough'."
   - **Critical**: Hints are useless without character context

6. **Movie Hints** (~1,000+ items)
   - **JOIN with movies table** via `movie_url_id`
   - Concatenate: `movie.title + hint.content`
   - Example: "Movie: Snow White and the Seven Dwarfs\nHint: First animated feature film."

### What Does NOT Get Vectorized

- **movie_characters** junction table: This is relational metadata (role, importance_level), not searchable content
- Image URLs, IDs, timestamps: Not useful for semantic search
- Relationships, voice_actors: Already embedded in character descriptions

### Embedding Model

- **Model**: `gemini-text-embedding-004`
- **Dimensions**: 768
- **Cost**: $0.00001875 per 1K tokens
- **One-time cost**: ~$0.05 for 2,700 items

---

## Implementation Phases

### Session 1: Backend Foundation (2-3 hours)

**Objectives**:

- Set up Gemini API integration using **RestTemplate** (Spring standard, NOT custom HTTP client)
- Create LLMClient interface with GeminiClient implementation
- Create ContentEmbedding JPA entity with **proper pgvector column mapping**
- Create ContentEmbeddingRepository with **native pgvector query**
- Create database migration script (pgvector extension + content_embeddings table)
- Create RagService for querying with **standard RAG workflow**
- Configure Spring Cache for response caching
- Test vector similarity search

**Deliverables**:

- LLMClient interface + GeminiClient implementation (using RestTemplate)
- ContentEmbedding entity + repository with pgvector support
- Database schema with IVFFlat indexes
- RagService implementing standard RAG pattern:
  1. Convert user query to embedding (via Gemini API)
  2. Find top-k similar chunks (via pgvector cosine similarity: `<=>` operator)
  3. Build prompt with retrieved context
  4. Generate response (via Gemini API)
  5. Return response with citations
- CacheConfig with in-memory cache (100 queries, 1 hour TTL)
- Unit tests for LLM client (mocked HTTP responses)

**Testing**:

- Verify pgvector extension enabled: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- Test Gemini API connectivity with sample text
- Test embedding generation (verify 768-dimension vector returned)
- Test vector similarity search: `SELECT 1 - (embedding <=> '[0.1,0.2,...]') AS similarity`
- Verify cache hits on repeated queries

**Critical Implementation Notes**:

- **pgvector distance operator**: Use `<=>` for cosine distance (NOT custom similarity functions)
- **RestTemplate configuration**: Set timeouts (connect: 5s, read: 30s) for LLM API calls
- **Error handling**: Catch HttpClientErrorException, HttpServerErrorException separately
- **JSON mapping**: Use @JsonProperty for Gemini API request/response DTOs

---

### Session 2: Admin API Security (1-2 hours)

**Objectives**:

- Secure ALL admin endpoints with API key authentication
- This is NOT RAG-specific but required for production

**Deliverables**:

- ApiKeyAuthFilter (Spring Security filter)
- SecurityConfig (applies filter to `/api/admin/**` endpoints)
- Environment variable configuration for API key
- Swagger documentation for secured endpoints

**Testing**:

- Verify admin endpoints require X-Admin-API-Key header
- Verify public endpoints still accessible
- Test with valid and invalid API keys

---

### Session 3: Embedding Generation (2-3 hours)

**Objectives**:

- Create EmbeddingService with **idempotent batch processing** (standard pattern)
- Generate embeddings for all 6 content types with **chunking strategy**
- Implement rate limiting with Bucket4j (Gemini free tier: 60 req/min)
- Create admin endpoint to trigger embedding generation with **async processing**
- Add **progress tracking** (percentage complete, ETA)

**Deliverables**:

- EmbeddingService with 6 generation methods following **standard chunking pattern**:
  - Characters, movies, parks, attractions: One embedding per item (already small)
  - Hints: Group by parent entity (one embedding per character's all hints)
- AdminController with `/api/admin/embeddings/generate` endpoint
- **@Async method** for background processing (don't block HTTP request)
- Rate limiter: Bucket4j with simple(60, Duration.ofMinutes(1))
- Progress tracking: Store in-memory map (embedding_job_id → progress %)
- **Batch insert optimization**: Save embeddings in batches of 50 (NOT one-by-one)

**Testing**:

- Generate embeddings for test dataset
- Verify idempotency: Run twice, verify UPSERT behavior (unique constraint on content_type + content_id)
- Verify rate limiting: 60 calls/min max (log timestamps to confirm)
- Verify batch inserts: Check database logs for batch statements
- Test progress endpoint: `GET /api/admin/embeddings/status/{jobId}`

**Production Usage**:

- Trigger via admin endpoint: `POST /api/admin/embeddings/generate`
- Returns job_id immediately (async processing)
- Poll status: `GET /api/admin/embeddings/status/{jobId}` → {progress: 45, total: 2700, eta: "2 minutes"}
- Smart detection via UNIQUE constraint: Duplicate embeddings automatically skipped
- Cost: Only pay for NEW embeddings

**Critical Implementation Notes**:

- **Chunking strategy**: For long text (>512 tokens), DON'T split - summarize first or use full text (Gemini supports 1M context)
- **Batch processing**: Use Spring Data JPA `saveAll()` for batch inserts (NOT loop + save())
- **Rate limiting placement**: Apply BEFORE Gemini API call, not after
- **Error handling**: If one embedding fails, log and continue (DON'T abort entire batch)
- **Progress calculation**: (processed / total) × 100, update every 10 items

---

### Session 4: REST API (1-2 hours)

**Objectives**:

- Create RagController with `/api/rag/query` endpoint
- Create DTO classes following **standard RAG response format**
- Implement **prompt engineering best practices** (system message, context injection, citation instructions)
- Add input validation and sanitization
- Test end-to-end query flow

**Deliverables**:

- RagController with proper validation (@Valid, @NotBlank, @Size)
- DTO package (`com.harmadavtian.disneyapp.dto.rag`) with **snake_case JSON properties**:
  - RagQueryRequest: `{query: string, max_results?: number, content_types?: string[]}`
  - RagResponse: `{answer: string, citations: Citation[], response_time_ms: number}`
  - Citation: `{content_type: string, content_id: number, text_snippet: string, similarity_score: number, source_url: string}`
- **Prompt template** following industry standards:

  ```
  System: You are a Disney knowledge assistant. Answer based ONLY on the provided context.
  If the context doesn't contain the answer, say "I don't have enough information."
  Always cite your sources using [1], [2], etc.

  Context:
  [1] {context_chunk_1}
  [2] {context_chunk_2}
  ...

  User Question: {user_query}

  Answer:
  ```

- Swagger documentation with realistic examples
- cURL test examples

**Testing**:

- Test with sample queries ("Who is Aladdin?", "Tell me about Frozen", "What parks are in California?")
- Verify citations include correct similarity scores (0.0-1.0 range)
- Verify response includes citation markers [1], [2], etc.
- Test validation: Empty query → 400 Bad Request, query > 1000 chars → 400
- Test error handling: Gemini API down → return cached response or friendly error
- Test cache: Same query twice → second request < 100ms (cache hit)

**Critical Implementation Notes**:

- **Similarity score normalization**: pgvector `<=>` returns distance (0=identical, 2=opposite)
  - Convert to similarity: `similarity = 1 - (distance / 2)` → range [0, 1]
- **Top-k retrieval**: Default k=5, max k=20 (too many citations confuse LLM)
- **Context ordering**: Sort by similarity DESC (most relevant first in prompt)
- **Prompt injection prevention**: Sanitize user query (remove control characters, limit length)
- **Citation URL generation**: Use existing url_id field (e.g., `/characters/aladdin`)
- **Response time tracking**: Measure total time (embedding + retrieval + generation)

---

### Session 5: Frontend UI (3-4 hours)

**Objectives**:

- Create ChatModal component with all advanced features
- Integrate GA4 analytics
- Add chat button to navigation
- Style to match existing Disney app theme

**Deliverables**:

**Core Components**:

- ChatModal.tsx + ChatModal.module.scss
- Chat button in navigation
- analytics.ts utility functions

**UI Features**:

- Text input with query submission
- Typing indicator animation
- Answer display area
- Citations list with clickable links
- Query suggestions (5 pre-written examples)
- Feedback buttons (👍/👎)
- Error message display
- Loading states

**GA4 Integration**:

- Track query submission
- Track response received (with response time)
- Track citation clicks
- Track feedback

**Testing**:

- Test chat modal open/close
- Test query submission and response display
- Test citation links navigate correctly
- Test feedback buttons
- Verify GA4 events firing in GA dashboard

---

## Advanced Features (Optional Enhancement Sessions)

### Session 6: Conversation Memory (3-4 hours)

**Not included in initial implementation**

**Objectives**:

- Store conversation history per session
- Include last 5 exchanges in LLM prompt for context
- Display conversation history in UI

**Requirements**:

- New table: `rag_conversations` (session_id, user_query, ai_response, citations, created_at)
- Frontend: Generate UUID session ID, send with each request
- UI: Display scrollable conversation history

---

### Session 7: Content Type Filters (2-3 hours)

**Not included in initial implementation**

**Objectives**:

- Allow users to filter results by content type
- Checkboxes for: Characters, Movies, Parks, Attractions, Hints
- Slider for max results (1-20)

**Implementation**:

- Update RagQueryRequest DTO with optional filters
- Update RagService to filter by content_type in SQL WHERE clause
- Frontend: Filter UI with checkboxes and slider

---

### Session 8: Rate Limiting & Error Recovery (2-3 hours)

**Partially included in initial implementation (Bucket4j in EmbeddingService)**

**Additional Features**:

- Rate limit user queries (20 per hour per session)
- Circuit breaker for Gemini API (auto-fallback message)
- Frontend retry logic
- Better error messages

---

## Database Schema

### Migration Script

```sql
-- V4__add_rag_support.sql

-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table (industry-standard schema)
CREATE TABLE content_embeddings (
    embedding_id BIGSERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id BIGINT NOT NULL,
    text_content TEXT NOT NULL,  -- Store original text for reranking/debugging
    embedding vector(768) NOT NULL,  -- Gemini embedding dimensions
    model_version VARCHAR(100) NOT NULL DEFAULT 'gemini-text-embedding-004',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_content_embedding UNIQUE (content_type, content_id, model_version)
);

-- Create pgvector index for similarity search
-- IVFFlat: Good for 1K-1M vectors, fast approximate search
-- lists=100: Rule of thumb = sqrt(total_rows), adjust based on actual data size
CREATE INDEX idx_embeddings_vector ON content_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create B-tree index for exact lookups (smart detection, updates)
CREATE INDEX idx_embeddings_lookup ON content_embeddings (content_type, content_id, model_version);

-- Create index for filtering by content type (when users filter results)
CREATE INDEX idx_embeddings_content_type ON content_embeddings (content_type);

-- Update trigger to set updated_at timestamp (PostgreSQL standard pattern)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_embeddings_updated_at
    BEFORE UPDATE ON content_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Index Strategy Notes**:

- **IVFFlat index**: Approximate nearest neighbor (ANN) search, 10-100x faster than exact search
  - Trade-off: 95-99% recall (vs 100% with exact search)
  - Acceptable for RAG (slight quality degradation vs massive speed gain)
  - `lists` parameter: Higher = more accuracy, slower build time
- **B-tree indexes**: For exact match queries (smart detection, content type filters)
- **When to rebuild IVFFlat**: If embeddings table grows 10x, increase `lists` parameter and `REINDEX`### Rollback Script

```sql
-- Complete removal of RAG functionality
DROP TABLE IF EXISTS content_embeddings CASCADE;
DROP EXTENSION IF EXISTS vector CASCADE;
```

**Zero impact on existing tables**: characters, movies, disney_parks, disney_parks_attractions, character_hints, movie_hints all remain unchanged.

---

## Cost Analysis

### One-Time Setup

- **Embedding Generation**: 2,700 items × 100 tokens avg × $0.00001875/1K = **$0.05**

### Monthly Operational Costs

**Assumptions**: 1,000 queries/month, avg 500 tokens input + 200 tokens output

- **Input (embeddings + prompts)**: 1,000 × 500 × $0.00001875/1K = $0.009
- **Output (responses)**: 1,000 × 200 × $0.000075/1K = $0.015
- **Total**: **~$0.50/month** for 1,000 queries

**Scaling**:

- 10,000 queries/month: ~$5/month
- 100,000 queries/month: ~$50/month

### Comparison to Alternatives

- **Azure OpenAI (GPT-3.5)**: $10-25/month for same volume
- **OpenAI GPT-4o-mini**: $1-10/month
- **Anthropic Claude Haiku**: $1-10/month

**Gemini 1.5 Flash is 10-20x cheaper than alternatives.**

---

## Testing Strategy

### Unit Tests (JUnit 5 + Mockito)

- **LLMClient**: Mock RestTemplate responses, test error handling (400, 500, timeout)
- **EmbeddingService**: Test idempotency (run twice, verify UNIQUE constraint), test batch processing
- **RagService**: Test prompt building (verify context injection, citation format), test similarity score normalization
- **Rate limiting**: Verify Bucket4j enforcement (61st request fails or waits)
- **DTOs**: Test JSON serialization/deserialization (verify snake_case properties)

### Integration Tests (Spring Boot Test)

- **Database**: Test pgvector operations (insert vector, similarity search with `<=>` operator)
- **API**: Test full request/response cycle (POST /api/rag/query → verify response format)
- **Security**: Test API key authentication (valid key → 200, invalid key → 401, missing key → 401)
- **Caching**: Test cache hits (same query twice → second request uses cache)
- **Validation**: Test input validation (@NotBlank, @Size constraints)

### Performance Tests

- **Vector search benchmarks**:
  - Exact search (no index): Measure baseline
  - IVFFlat search: Verify < 100ms for top-10 retrieval
  - Concurrent queries: 50 simultaneous queries, verify no deadlocks
- **LLM API latency**: Measure p50, p95, p99 response times (should be < 2s for p95)
- **Cache effectiveness**: Measure hit rate (target: 20%+ for common queries)

### Manual Testing Checklist

- [ ] Generate embeddings for test dataset (use 100 items for dev, not full 2,700)
- [ ] Run embedding generation twice (verify 0 new embeddings on second run due to UNIQUE constraint)
- [ ] Test various query types:
  - [ ] Factual: "Who is Aladdin?" → verify citation to character
  - [ ] Comparison: "Difference between Disneyland and Disney World?" → verify multiple citations
  - [ ] Edge case: "Tell me about SpongeBob" → verify "no information" response (not Disney)
  - [ ] Long query: 500+ chars → verify trimming or summary
- [ ] Verify citation accuracy (similarity scores 0.0-1.0, URLs navigate correctly)
- [ ] Test feedback buttons (verify GA4 events fire)
- [ ] Verify GA4 events in dashboard (check Real-Time reports)
- [ ] Test error scenarios:
  - [ ] Invalid API key → 401 Unauthorized
  - [ ] Empty query → 400 Bad Request
  - [ ] Query > 1000 chars → 400 Bad Request
  - [ ] Gemini API down (mock 500 error) → return cached response or friendly error
  - [ ] Network timeout → retry logic triggers (check logs for retry attempts)
- [ ] Load test: 100 concurrent queries (use JMeter or Gatling)
  - [ ] Verify no database connection pool exhaustion
  - [ ] Verify rate limiting doesn't cause cascading failures
  - [ ] Verify response times stay < 3s under load

### Performance Targets

- **Query response time**: < 2 seconds (p95), < 1 second (p50)
- **Embedding generation**: ~1 second per item (with rate limiting at 60/min)
- **Database vector search**: < 100ms for top-10 retrieval (with IVFFlat index)
- **Cache hit latency**: < 50ms for cached responses
- **Batch insert throughput**: > 1000 embeddings/minute (with batch size 50)

### Quality Metrics

- **Retrieval precision**: Top-5 chunks should be relevant to query (manual eval on 20 test queries)
- **Response accuracy**: LLM should cite sources correctly (no hallucination beyond context)
- **Cache hit rate**: > 20% for production traffic (measure after 1 week)
- **Error rate**: < 1% of queries should fail (network errors, timeouts, etc.)

---

## Deployment Checklist

### Environment Variables

**Backend (.env or Azure App Service)**:

```
GEMINI_API_KEY=<your-google-ai-studio-key>
ADMIN_API_KEY=<generated-via-openssl-rand>
```

**Frontend (index.html)**:

```html
<!-- Google Analytics 4 -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
```

### Deployment Steps

1. **Local Development**:

   - Set environment variables
   - Run database migration (V4\_\_add_rag_support.sql)
   - Generate embeddings: `POST /api/admin/embeddings/generate`
   - Verify embeddings created: `SELECT COUNT(*) FROM content_embeddings;` → ~2,700 rows
   - Test query endpoint
   - Test frontend chat modal

2. **Production (Azure)**:
   - Add environment variables to Azure App Service configuration
   - Deploy backend with new migration
   - Run embedding generation (one-time)
   - Deploy frontend
   - Monitor GA4 dashboard for events
   - Monitor Azure logs for errors

### Rollback Plan

If issues arise:

1. Remove chat button from frontend (redeploy frontend)
2. Drop content_embeddings table: `DROP TABLE content_embeddings CASCADE;`
3. Remove environment variables
4. Zero impact on existing features

---

## Security Considerations

### API Key Management

- **Admin API Key**: Stored in Azure App Service environment variables (NOT in code)
- **Gemini API Key**: Stored in Azure App Service environment variables
- **Generation**: Use `openssl rand -base64 32` for strong keys
- **Rotation**: Keys can be rotated without code changes

### Rate Limiting

- **Embedding Generation**: Bucket4j enforces 60 req/min (Gemini free tier)
- **User Queries**: Optional 20 queries/hour per session (Session 8)

### Input Validation

- User queries sanitized before sending to Gemini
- Max query length: 1000 characters
- No executable code in responses

---

## Interview Talking Points

This RAG implementation demonstrates:

1. **Architectural Best Practices**:

   - Separation of concerns (separate embeddings table)
   - Provider-agnostic design (LLM interface pattern)
   - Standard Spring Boot patterns (JPA, Security, Retry)

2. **Cost Optimization**:

   - Chose cheapest LLM provider (20x savings vs Azure OpenAI)
   - Smart detection avoids redundant API calls
   - Single embedding generation per item (stored, not regenerated)

3. **Production-Grade Engineering**:

   - Proper error handling and retry logic
   - Rate limiting to prevent quota exhaustion
   - Clean rollback path (single DROP TABLE)
   - Zero risk to existing data

4. **Modern AI/ML Integration**:

   - Vector databases (pgvector)
   - Semantic search (cosine similarity)
   - RAG pattern (retrieval + generation)
   - LLM orchestration

5. **Full-Stack Development**:
   - Backend API design
   - React component architecture
   - Analytics integration (GA4)
   - Responsive UI/UX

---

## Future Enhancements

### Phase 2 (Not Planned Yet)

1. **Multi-Modal Search**: Include images in embeddings (e.g., character portraits)
2. **Voice Interface**: Integrate Web Speech API for voice queries
3. **Personalization**: User preferences for content type filtering
4. **Advanced Analytics**: Custom dashboard showing popular queries, citation patterns
5. **Migration to Dedicated Vector DB**: Move to Qdrant or Milvus for better performance at scale

### Scalability Considerations

- Current setup handles ~10K queries/month comfortably
- For 100K+ queries/month, consider:
  - Caching frequent queries (Redis)
  - Moving to dedicated vector DB (Qdrant, Milvus)
  - Upgrading to Gemini Pro for better quality
  - Adding CDN for static assets

---

## Dependencies

### Backend (pom.xml)

```xml
<!-- pgvector support via standard PostgreSQL driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Rate limiting (industry standard for token bucket) -->
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>

<!-- Spring Retry (automatic retry with exponential backoff) -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>

<!-- Spring Boot Starter Cache (for query result caching) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

<!-- Spring Security (already in project for API key auth) -->
<!-- Lombok (already in project for @Data, @Builder, @Slf4j) -->
<!-- Spring Data JPA (already in project for repositories) -->
<!-- Spring Boot Starter Web (already in project - includes RestTemplate) -->
<!-- Spring Boot Starter Validation (already in project - includes @Valid, @NotBlank) -->
```

**Note**: No custom HTTP client libraries needed - use Spring's RestTemplate or WebClient (standard practice).

### Frontend (package.json)

No new dependencies required - using existing React, TypeScript, SCSS setup.

**Note**: Don't add axios or fetch wrappers - use native `fetch()` API (standard in modern browsers).

---

## References

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Bucket4j Documentation](https://bucket4j.com/)
- [Google Analytics 4 Events](https://developers.google.com/analytics/devguides/collection/ga4/events)

---

## Document History

- **2025-11-26**: Initial plan created
- **Status**: Ready for implementation
- **Next Steps**: Begin Session 1 (Backend Foundation)

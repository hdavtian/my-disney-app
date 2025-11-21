# TODO: Add Franchise Field to Movies

**Branch:** `feature/add-movie-franchises`  
**Priority:** Medium  
**Estimated Effort:** 2-3 hours

## Context

Currently, `disney_movies.json` does not have a `franchise` field, while `disney_characters.json` does. This limits our ability to create comprehensive movie-character relationships. We're currently matching character franchises to movie titles via fuzzy matching, which only yields 324 relationships out of a potential 400-500+.

## Current State

- ✅ All 180 characters have `franchise` field populated
- ❌ Movies (831 total) have NO `franchise` field
- Current relationships: 324 (limited by fuzzy title matching)

## Objective

Add `franchise` field to all movies in `disney_movies.json` to:
1. Improve relationship matching accuracy
2. Enable better data organization and querying
3. Support future franchise-based features
4. Increase movie-character relationships to 400-500+

## Implementation Steps

### 1. Create Franchise Assignment Script

Create PowerShell script to automatically detect and assign franchises:

**Sequel/Series Detection:**
- Pattern: "Title 2", "Title 3", "Title II", etc.
- Examples: Toy Story 1-4, Frozen 1-2, Lion King series

**Remake Detection:**
- Pattern: "Title (YYYY)"
- Examples: Cinderella (1950) vs (2015), Aladdin (1992) vs (2019)

**Franchise Patterns:**
- Marvel Cinematic Universe: All MCU films
- Star Wars: All Star Wars films
- Pixar: Individual franchises (Toy Story, Cars) or standalone
- Disney Princess: Individual character-based franchises

**Character-Based Assignment:**
- Cross-reference with character franchises from relationships
- If characters from franchise "X" appear in movie, assign franchise "X"

### 2. Add Franchise Field to Schema

Update `disney_movies.json` structure:
```json
{
  "title": "Toy Story 2",
  "url_id": "toy_story_2",
  "franchise": "Toy Story",
  "creation_year": 1999,
  ...
}
```

### 3. Run Franchise Assignment

Execute script to populate franchise field for all 831 movies.

### 4. Manual Review

Review and adjust:
- Standalone vs. franchise classification
- Edge cases and ambiguous titles
- Franchise naming consistency
- Decide on handling for standalone films (empty, "Standalone", or "Disney Classics")

### 5. Update Relationships

Run the incremental relationship update script:
```powershell
powershell -ExecutionPolicy Bypass -File "backend/src/main/resources/database/temp/relationships_wip/update_relationships.ps1"
```

### 6. Verify Results

- Count new relationships added
- Spot-check franchise groupings
- Verify Marvel/Star Wars films properly tagged
- Ensure no data loss or corruption

## Files to Modify

- `backend/src/main/resources/database/disney_movies.json` - Add franchise field
- Create: `backend/src/main/resources/database/temp/add_movie_franchises.ps1` - Assignment script

## Expected Outcomes

- **Before:** 324 relationships
- **After:** 400-500+ relationships
- All movies have appropriate franchise classification
- Improved data organization for future features

## Questions to Resolve

1. Should standalone films have empty franchise or use "Standalone"?
2. Franchise naming conventions (e.g., "Marvel Cinematic Universe" vs "MCU")?
3. Should Pixar standalones use "Pixar" franchise or remain empty?

## Related Files

- Implementation plan: `C:\Users\harma\.gemini\antigravity\brain\a77f4caf-c6bf-4a75-8d10-fa5b603cc08c\implementation_plan.md`
- Relationship update script: `backend/src/main/resources/database/temp/relationships_wip/update_relationships.ps1`
- Current relationships: `backend/src/main/resources/database/movie_characters_relationships.json`

## Notes

- This work was paused on 2025-11-21 to be picked up later
- All character franchises are already populated (180/180)
- Current matching uses fuzzy title matching which is less accurate than franchise-to-franchise matching

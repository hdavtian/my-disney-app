# Disney Parks Attractions Data Collection Plan

## Goal

Create comprehensive JSON data files for all Disney park attractions to seed a PostgreSQL database table.

## Schema Per Attraction

```json
{
  "url_id": "unique-identifier",
  "name": "Attraction Name",
  "park_url_id": "FK to disney_parks.url_id",
  "land_area": "Themed Land Name",
  "attraction_type": "Roller Coaster | Dark Ride | Show | Water Ride | etc.",
  "opening_date": "YYYY-MM-DD or null",
  "thrill_level": "Family | Moderate | Thrill",
  "theme": "Brief theme description",
  "short_description": "1-2 sentence overview",
  "is_operational": true,
  "duration_minutes": null,
  "height_requirement_inches": null,
  "image_1": null,
  "image_2": null,
  "image_3": null,
  "image_4": null,
  "image_5": null
}
```

## Scope

- ✅ Major/notable attractions only (headliners + well-known rides)
- ✅ Currently operational attractions (`is_operational: true`)
- ✅ Include major shows, parades, and nighttime spectaculars
- ❌ Skip minor attractions, playgrounds, character meet-and-greets
- ❌ Skip closed/historical attractions

## Phase 1: Individual Park Files (12 files)

Create one JSON file per park in `backend/src/main/resources/database/`

### Disneyland Resort (2 parks)

1. ✅ `disney_parks_attractions_disneyland.json` - Disneyland Park (Anaheim)
2. ⬜ `disney_parks_attractions_california_adventure.json` - Disney California Adventure

### Walt Disney World Resort (4 parks)

3. ⬜ `disney_parks_attractions_magic_kingdom.json` - Magic Kingdom
4. ⬜ `disney_parks_attractions_epcot.json` - EPCOT
5. ⬜ `disney_parks_attractions_hollywood_studios.json` - Disney's Hollywood Studios
6. ⬜ `disney_parks_attractions_animal_kingdom.json` - Disney's Animal Kingdom

### Tokyo Disney Resort (2 parks)

7. ⬜ `disney_parks_attractions_tokyo_disneyland.json` - Tokyo Disneyland
8. ⬜ `disney_parks_attractions_tokyo_disneysea.json` - Tokyo DisneySea

### Disneyland Paris (2 parks)

9. ⬜ `disney_parks_attractions_disneyland_paris.json` - Disneyland Park (Paris)
10. ⬜ `disney_parks_attractions_walt_disney_studios.json` - Walt Disney Studios Park

### Asia-Pacific (2 parks)

11. ⬜ `disney_parks_attractions_hong_kong_disneyland.json` - Hong Kong Disneyland
12. ⬜ `disney_parks_attractions_shanghai_disneyland.json` - Shanghai Disneyland

## Phase 2: Consolidation

Merge all 12 individual files into:

- `disney_parks_attractions.json` - Master file with all attractions

## Progress Tracking

- **Current Park**: Disneyland Park (Anaheim)
- **Status**: In Progress
- **Completed**: 0/12 parks
- **Total Attractions Gathered**: 0

## Notes

- All `duration_minutes`, `height_requirement_inches`, and image fields set to `null` for initial data gathering
- Can be populated later by user
- Focus on accuracy of park_url_id foreign keys
- Ensure url_id uniqueness across all attractions

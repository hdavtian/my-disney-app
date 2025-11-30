# YouTube Video Component Implementation Plan

## 📋 Overview

Create a reusable, themable YouTube video component that displays videos in a slider on the About page, with modal playback and proper UX controls.

---

## 🎯 Goals

1. Build a **reusable** YouTube video component with site theming
2. Display videos in a **2-column slider** (video thumbnail + title/description)
3. Support **modal playback** with theater mode
4. Use **YouTube thumbnails** (requires YouTube Data API key)
5. Keep architecture **clean for future backend integration**

---

## 🏗️ Architecture & Components

### 1. Data Type Definition

**File**: `frontend/src/types/video.types.ts`

```typescript
export interface video_content {
  youtube_url: string;
  title: string;
  description: string;
  thumbnail_url?: string; // Optional: fetched from YouTube API
}
```

### 2. YouTube Video Component

**File**: `frontend/src/components/YouTubeVideo/YouTubeVideo.tsx`

**Features**:

- Accept `video_content` as props
- Display YouTube thumbnail (fetched via API or use default YouTube thumbnail)
- Click to open modal
- Themable with CSS variables
- Play button overlay on thumbnail

**Props Interface**:

```typescript
interface YouTubeVideoProps {
  video: video_content;
  className?: string;
}
```

### 3. Video Modal Component

**File**: `frontend/src/components/VideoModal/VideoModal.tsx`

**Features**:

- Full-screen modal overlay
- Embedded YouTube iframe with controls
- Theater mode by default
- Options:
  - Close button (X)
  - "Watch on YouTube" button (opens in new tab)
  - Fullscreen toggle (if not already provided by YouTube player)
- Click outside to close
- ESC key to close
- Themable backdrop and controls

**Props Interface**:

```typescript
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
}
```

### 4. Video Slider Component

**File**: `frontend/src/components/VideoSlider/VideoSlider.tsx`

**Features**:

- 2-column layout per slide:
  - **Left column**: YouTubeVideo component
  - **Right column**: Title + Description
- Navigation arrows (prev/next)
- Pagination dots
- Responsive (single column on mobile)
- Smooth transitions with Framer Motion

**Props Interface**:

```typescript
interface VideoSliderProps {
  videos: video_content[];
  className?: string;
}
```

---

## 📦 Dependencies

### New Dependencies to Install

```bash
# None required! We'll use:
# - Native YouTube iframe API (no package needed)
# - Framer Motion (already installed)
# - Native fetch for YouTube Data API
```

### YouTube Data API Setup

**Required**: YouTube Data API v3 key

**Steps to get API key**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict the key (optional but recommended):
   - **Application restrictions**: HTTP referrers (your domain)
   - **API restrictions**: YouTube Data API v3 only
6. Add key to `frontend/.env.production`:
   ```
   VITE_YOUTUBE_API_KEY=your_api_key_here
   ```

**Free tier limits**: 10,000 quota units/day (1 thumbnail request = 1 unit, plenty for our use case)

---

## 🎨 Styling & Theming

### Theme Variables to Use

```scss
// Colors
--accent-primary
--accent-secondary
--bg-primary
--bg-secondary
--card-bg
--card-border
--card-shadow
--text-primary
--text-secondary

// Spacing
--space-*
--radius-*

// Typography
--font-display
--text-*
```

### Component-Specific Styles

1. **YouTubeVideo.scss**: Thumbnail container, play button overlay, hover effects
2. **VideoModal.scss**: Modal backdrop, iframe container, control buttons
3. **VideoSlider.scss**: Slider layout, navigation arrows, pagination dots

---

## 📍 Implementation on About Page

### Current Structure

```tsx
<div className="about-content">
  <div className="content-section">
    {/* Current content: Tech stack, etc. */}
  </div>
  <div className="content-section">{/* Coming Soon section */}</div>
</div>
```

### New Structure

```tsx
<div className="about-content">
  {/* NEW: Video Slider Section */}
  <div className="content-section video-section">
    <h2>Project Showcase</h2>
    <VideoSlider videos={aboutPageVideos} />
  </div>

  {/* MOVED: Original content below */}
  <div className="content-section">{/* Tech stack content */}</div>

  <div className="content-section">{/* Coming Soon section */}</div>
</div>
```

### Static Video Data (for now)

```typescript
const aboutPageVideos: video_content[] = [
  {
    youtube_url: "https://www.youtube.com/watch?v=V6JKLQj50ro",
    title: "Demo Video 1",
    description: "Overview of the Disney App architecture and features.",
  },
  {
    youtube_url: "https://www.youtube.com/watch?v=d5vAGeplOGE",
    title: "Demo Video 2",
    description: "Deep dive into the technical implementation.",
  },
];
```

---

## 🚀 Implementation Phases

### **Phase 1: Data Types & Utilities**

- [ ] Create `video.types.ts` with `video_content` interface
- [ ] Create YouTube utility functions:
  - Extract video ID from URL
  - Fetch thumbnail from YouTube API (or use fallback)
  - Generate embed URL

**File**: `frontend/src/utils/youtube.utils.ts`

### **Phase 2: YouTubeVideo Component**

- [ ] Create `YouTubeVideo.tsx` component
- [ ] Create `YouTubeVideo.scss` with theming
- [ ] Display thumbnail with play button overlay
- [ ] Add hover effects
- [ ] Handle click to trigger modal

### **Phase 3: VideoModal Component**

- [ ] Create `VideoModal.tsx` component
- [ ] Create `VideoModal.scss` with theming
- [ ] Implement modal backdrop with Framer Motion
- [ ] Embed YouTube iframe with proper parameters
- [ ] Add close button and "Watch on YouTube" button
- [ ] Handle ESC key and click-outside to close
- [ ] Add focus trap for accessibility

### **Phase 4: VideoSlider Component**

- [ ] Create `VideoSlider.tsx` component
- [ ] Create `VideoSlider.scss` with theming
- [ ] Implement 2-column layout (video + title/description)
- [ ] Add navigation arrows (prev/next)
- [ ] Add pagination dots
- [ ] Make responsive (stack on mobile)
- [ ] Add Framer Motion transitions

### **Phase 5: Integration on About Page**

- [ ] Add static video data to `AboutPage.tsx`
- [ ] Import and use `VideoSlider` component
- [ ] Restructure layout (slider first, then content)
- [ ] Update `AboutPage.scss` for new video section
- [ ] Test theming with different theme modes

### **Phase 6: Testing & Polish**

- [ ] Test video playback in modal
- [ ] Test navigation between videos
- [ ] Test responsive behavior
- [ ] Test keyboard accessibility (ESC, Tab, Enter)
- [ ] Test with different themes
- [ ] Verify YouTube API thumbnail fetching
- [ ] Test "Watch on YouTube" and fullscreen options

---

## 🎯 YouTube Iframe Parameters

For optimal UX, we'll use these YouTube embed parameters:

```
?autoplay=1           // Auto-play when modal opens
&rel=0                // Don't show related videos from other channels
&modestbranding=1     // Minimal YouTube branding
&controls=1           // Show player controls
&showinfo=0           // Hide video title/uploader
&fs=1                 // Allow fullscreen
&playsinline=1        // Play inline on iOS (not force fullscreen)
```

---

## 🔮 Future Enhancements (Backend Integration)

When ready to make this data-driven:

### Backend API Endpoints

```java
// GET /api/videos/about-page
// Returns: List<VideoContent>

// GET /api/videos/{id}
// Returns: VideoContent

@Entity
public class VideoContent {
    private Long id;
    private String youtubeUrl;
    private String title;
    private String description;
    private String category; // e.g., "about-page", "tutorial", etc.
    private Integer displayOrder;
    private Boolean isActive;
}
```

### Frontend Changes Needed

1. Replace static `aboutPageVideos` array with API call
2. Use Redux to store video data
3. Add loading state and error handling
4. Optional: Add admin panel to manage videos

---

## 💡 Additional Suggestions

### 1. **Lazy Load Thumbnails**

- Only fetch YouTube API data when component is in viewport
- Use Intersection Observer (already used in your project)

### 2. **Analytics Tracking**

- Track video plays in Google Analytics
- Track which videos are most popular

### 3. **Error Handling**

- Handle YouTube API failures gracefully
- Show fallback thumbnail if API fails
- Show error message if video can't load

### 4. **Accessibility**

- ARIA labels for play button
- Keyboard navigation (arrow keys for slider)
- Focus management in modal
- Screen reader announcements

### 5. **Performance**

- Lazy load YouTube iframe (only when modal opens)
- Use `loading="lazy"` for thumbnail images
- Preconnect to YouTube domains

### 6. **Enhanced UX**

- Add video duration badge on thumbnail
- Show watch progress indicator (requires backend)
- Add "Watch Later" or "Share" buttons
- Add closed captions toggle

---

## 📝 File Structure Summary

```
frontend/src/
├── types/
│   └── video.types.ts                    // NEW
├── utils/
│   └── youtube.utils.ts                  // NEW
├── components/
│   ├── YouTubeVideo/
│   │   ├── YouTubeVideo.tsx              // NEW
│   │   ├── YouTubeVideo.scss             // NEW
│   │   └── index.ts                      // NEW
│   ├── VideoModal/
│   │   ├── VideoModal.tsx                // NEW
│   │   ├── VideoModal.scss               // NEW
│   │   └── index.ts                      // NEW
│   └── VideoSlider/
│       ├── VideoSlider.tsx               // NEW
│       ├── VideoSlider.scss              // NEW
│       └── index.ts                      // NEW
└── pages/
    └── AboutPage/
        ├── AboutPage.tsx                 // MODIFIED
        └── AboutPage.scss                // MODIFIED
```

---

## ✅ Ready to Start?

This plan covers:

- ✅ Reusable, themable components
- ✅ YouTube API integration for thumbnails
- ✅ Modal playback with theater mode
- ✅ 2-column slider with title/description
- ✅ Clean architecture for future backend integration
- ✅ Accessibility and performance considerations
- ✅ Mainstream UX patterns (no over-engineering)

**Next Steps**:

1. Get YouTube Data API key
2. Review this plan and approve
3. I'll implement phase by phase
4. You review each phase

Let's make this happen! 🚀

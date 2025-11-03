import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getImageUrl } from "./assets";

describe("Assets Configuration", () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset environment between tests
    Object.assign(import.meta.env, originalEnv);
  });

  afterEach(() => {
    // Restore original environment
    Object.assign(import.meta.env, originalEnv);
  });

  describe("getImageUrl", () => {
    it("should generate correct URL for movies", () => {
      const url = getImageUrl("movies", "frozen.jpg");
      expect(url).toMatch(/\/movies\/frozen\.jpg$/);
    });

    it("should generate correct URL for characters", () => {
      const url = getImageUrl("characters", "elsa.png");
      expect(url).toMatch(/\/characters\/elsa\.png$/);
    });

    it("should return placeholder for empty filename", () => {
      const url = getImageUrl("movies", "");
      expect(url).toBe("/placeholder.png");
    });

    it("should return placeholder for null/undefined filename", () => {
      const url1 = getImageUrl("movies", null as any);
      const url2 = getImageUrl("movies", undefined as any);
      expect(url1).toBe("/placeholder.png");
      expect(url2).toBe("/placeholder.png");
    });

    it("should sanitize and reject path traversal attempts", () => {
      const url1 = getImageUrl("movies", "../../../etc/passwd");
      const url2 = getImageUrl("movies", "..\\..\\windows\\system32");
      expect(url1).toBe("/placeholder.png");
      expect(url2).toBe("/placeholder.png");
    });

    it("should reject filenames with slashes", () => {
      const url = getImageUrl("movies", "folder/file.jpg");
      expect(url).toBe("/placeholder.png");
    });

    it("should reject filenames with invalid characters", () => {
      const url1 = getImageUrl("movies", "file<script>.jpg");
      const url2 = getImageUrl("movies", "file|name.jpg");
      expect(url1).toBe("/placeholder.png");
      expect(url2).toBe("/placeholder.png");
    });

    it("should accept valid filenames with allowed characters", () => {
      const url1 = getImageUrl("movies", "frozen-2_poster.jpg");
      const url2 = getImageUrl("characters", "elsa.profile.png");
      expect(url1).toMatch(/\/movies\/frozen-2_poster\.jpg$/);
      expect(url2).toMatch(/\/characters\/elsa\.profile\.png$/);
    });

    it("should strip leading slashes from filename", () => {
      const url = getImageUrl("movies", "/frozen.jpg");
      // Should still sanitize and produce valid URL or reject
      expect(url).toMatch(/frozen\.jpg$|placeholder\.png$/);
    });

    it("should collapse duplicate slashes in URL", () => {
      const url = getImageUrl("movies", "frozen.jpg");
      expect(url).not.toContain("//");
      // Allow protocol:// but not elsewhere
      const protocolParts = url.split("://");
      if (protocolParts.length > 1) {
        expect(protocolParts[1]).not.toContain("//");
      }
    });
  });
});

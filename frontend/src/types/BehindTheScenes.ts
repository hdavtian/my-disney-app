export interface BehindTheScenes {
  id: string;
  title: string;
  type:
    | "concept-art"
    | "making-of"
    | "interview"
    | "deleted-scene"
    | "easter-egg";
  imageUrl: string;
  videoUrl?: string;
  description: string;
  relatedMovie: string;
  createdDate: string;
  tags?: string[];
}

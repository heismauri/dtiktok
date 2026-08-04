export interface MediaItem {
  type: "video" | "photo";
  link: string;
}

export interface MediaResponse {
  media: MediaItem[];
}

export interface ApiErrorResponse {
  error: Error;
}

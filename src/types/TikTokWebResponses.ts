export interface TikTokWebBitrateInfo {
  GearName: string;
  PlayAddr: {
    UrlList: string[];
  };
}

export interface TikTokWebItem {
  imagePost?: {
    images: {
      imageURL: {
        urlList: string[];
      };
    }[];
  };
  video: {
    playAddr: string;
    bitrateInfo?: TikTokWebBitrateInfo[];
  };
}

export interface TikTokRehydrationData {
  __DEFAULT_SCOPE__: {
    "webapp.video-detail": {
      itemInfo: {
        itemStruct: TikTokWebItem;
      };
    };
  };
}

export interface KVErrorLogEntry {
  id: string;
  error: string;
  response: unknown;
  timestamp: Date;
}

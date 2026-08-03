export interface TikTokBitRate {
  play_addr: {
    url_list: string[];
    height: number;
  };
}

export interface TikTokVideo {
  play_addr: {
    url_list: string[];
  };
  bit_rate?: TikTokBitRate[];
}

export interface TikTokImagePostInfo {
  images: {
    display_image: {
      url_list: string[];
    };
  }[];
}

export interface TikTokAwemeDetail {
  aweme_id: string;
  video?: TikTokVideo;
  image_post_info?: TikTokImagePostInfo;
}

export interface TikTokFeedResponse {
  aweme_list: TikTokAwemeDetail[];
}

import type { ApiErrorResponse, MediaResponse } from "@/types/Media";
import type { TikTokAwemeDetail, TikTokFeedResponse } from "@/types/TikTokResponses";

const validJSON = (str: string): boolean => {
  const firstChar = str.charAt(0);
  const lastChar = str.charAt(str.length - 1);
  return firstChar === "{" && lastChar === "}";
};

const jsonBuilder = (json: TikTokAwemeDetail): MediaResponse => {
  if (json.image_post_info) {
    return {
      media: json.image_post_info.images.map((image) => {
        return {
          type: "photo",
          link: image.display_image.url_list[0]
        };
      })
    };
  }
  if (!json.video) {
    throw new Error("Video not found");
  }
  const mainVideo = json.video.play_addr.url_list[0];
  const highestResolution = json.video.bit_rate?.sort((a, b) => {
    return b.play_addr.height - a.play_addr.height;
  })[0]?.play_addr?.url_list[0];
  return {
    media: [
      {
        type: "video",
        link: highestResolution || mainVideo
      }
    ]
  };
};

const getVideo = async (id: string, env: Env, firstTry = true): Promise<MediaResponse | ApiErrorResponse> => {
  try {
    const tiktokEndpoint = new URL(env.ENDPOINT);
    tiktokEndpoint.search = new URLSearchParams({
      "aweme_id": id,
      "iid": "7238789370386695942",
      "device_id": "7238787983025079814",
      "resolution": "1080*2400",
      "channel": "googleplay",
      "app_name": "musical_ly",
      "version_code": "350103",
      "device_platform": "android",
      "device_type": "Pixel+7",
      "os_version": "13"
    }).toString();
    const tiktokResponse = await fetch(tiktokEndpoint, {
      method: "OPTIONS",
      signal: AbortSignal.timeout(10 * 1000),
      headers: {
        Accept: "application/json",
        Connection: "close"
      }
    });
    const tiktokBody = await tiktokResponse.text();
    if (tiktokBody === "ratelimit triggered" && firstTry) {
      return getVideo(id, env, false);
    }
    if (!tiktokResponse.ok) throw new Error("Bad fetch response");
    if (!tiktokBody) throw new Error("Blank");
    if (!validJSON(tiktokBody)) throw new Error("Invalid JSON");

    const tiktokParsedBody = JSON.parse(tiktokBody) as TikTokFeedResponse;
    const tiktokDetail = tiktokParsedBody.aweme_list.find((aweme) => aweme.aweme_id === id);
    if (!tiktokDetail) throw new Error("Not found");

    return jsonBuilder(tiktokDetail);
  } catch (error) {
    return { error: error as Error };
  }
};

export { getVideo };

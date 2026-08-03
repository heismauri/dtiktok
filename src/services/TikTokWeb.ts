import type { ApiErrorResponse, MediaResponse } from "@/types/Media";
import type { KVErrorLogEntry, TikTokRehydrationData, TikTokWebItem } from "@/types/TikTokWebResponses";

const isPresent = (value: string | undefined): boolean => {
  return value !== undefined && value !== null && value !== "";
};

const parseCookies = (cookieString: string | null): Record<string, string> => {
  if (!cookieString) {
    return {};
  }
  const cookieArray = cookieString.split(/,\s*/);
  const cookies: Record<string, string> = {};
  cookieArray.forEach((cookie) => {
    const parts = cookie.split(/;\s*/);
    const [name, value] = parts[0].split(/=(.*)/s);
    if (isPresent(value)) {
      cookies[name] = value;
    }
  });
  return cookies;
};

const jsonBuilder = (json: TikTokWebItem, parsedCookies: Record<string, string>): MediaResponse => {
  const cookie = Object.entries(parsedCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
  if (json.imagePost) {
    return {
      media: json.imagePost.images.map((image) => {
        return {
          type: "photo",
          link: image.imageURL.urlList[0],
          cookie
        };
      })
    };
  }
  const mainVideo = json.video.playAddr;
  const highestResolution = json.video?.bitrateInfo?.sort((a, b) => {
    return parseInt(b.GearName.split("_").at(-2) ?? "0", 10) - parseInt(a.GearName.split("_").at(-2) ?? "0", 10);
  })[0]?.PlayAddr?.UrlList[0];
  return {
    media: [
      {
        type: "video",
        link: highestResolution || mainVideo,
        cookie
      }
    ]
  };
};

const getVideo = async (id: string, env: Env): Promise<MediaResponse | ApiErrorResponse> => {
  let tiktokLog: unknown;
  try {
    const ttResponse = await fetch(`https://tiktok.com/@i/video/${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/114.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(10 * 1000)
    });
    const tiktokCookies = ttResponse.headers.get("set-cookie");
    const tiktokHTML = await ttResponse.text();
    tiktokLog = tiktokHTML;
    let singleTikTok: TikTokWebItem;
    try {
      const mainJson = tiktokHTML
        .split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1]
        .split("</script>")[0];
      const parsedJson = JSON.parse(mainJson) as TikTokRehydrationData;
      singleTikTok = parsedJson.__DEFAULT_SCOPE__["webapp.video-detail"].itemInfo.itemStruct;
      tiktokLog = singleTikTok;
    } catch (error) {
      throw new Error("NotFound", { cause: error });
    }
    return jsonBuilder(singleTikTok, parseCookies(tiktokCookies));
  } catch (error) {
    const typedError = error as Error;
    if (!["NotFound"].includes(typedError.message)) {
      const dataErrorsKV = await env.data.get("errors");
      const errors = (dataErrorsKV ? JSON.parse(dataErrorsKV) : []) as KVErrorLogEntry[];
      errors.push({
        id,
        error: typedError.message,
        response: tiktokLog,
        timestamp: new Date()
      });
      await env.data.put("errors", JSON.stringify(errors));
    }
    return { error: typedError };
  }
};

export { getVideo };

import worker from "@api/index";
import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import { latestVersion } from "@api/global-variables";

interface DTikTokResponse {
  media: { type: string; link: string }[];
}

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const buildForm = (url: string): FormData => {
  const form = new FormData();
  form.append("version", latestVersion);
  form.append("url", url);
  return form;
};

const postForm = async (url: string): Promise<DTikTokResponse> => {
  const request = new IncomingRequest("https://dtiktok.example.com", {
    method: "POST",
    body: buildForm(url)
  });
  const response = await worker.fetch(request, env);
  return response.json<DTikTokResponse>();
};

describe("DTikTok worker", () => {
  it("can download videos", async () => {
    const dtiktokAPI = await postForm("https://www.tiktok.com/@itzyofficial/video/7138717904694021377");
    expect(dtiktokAPI).toHaveProperty("media");
    expect(dtiktokAPI.media[0].type).toBe("video");
    expect(dtiktokAPI.media[0].link).not.toBeNull();
    expect(dtiktokAPI.media[0].link).toContain("https://");
  });

  it("can download photos", async () => {
    const dtiktokAPI = await postForm("https://www.tiktok.com/@newjeans_official/video/7155422549541801218");
    expect(dtiktokAPI).toHaveProperty("media");
    expect(dtiktokAPI.media[0].type).toBe("photo");
    expect(dtiktokAPI.media[0].link).not.toBeNull();
    expect(dtiktokAPI.media[0].link).toContain("https://");
  });
});

import { getVideo } from "@api/services/TikTok";
import { shortcutURL, supportedVersions } from "@api/global-variables";

type FormValidation = { valid: true; id: string } | { valid: false; message: string };

const jsonResponseBuilder = (body: unknown, options: ResponseInit = {}): Response => {
  return new Response(JSON.stringify(body), {
    ...options,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...options.headers
    }
  });
};

const objectValidator = (object: Record<string, File | string>): FormValidation => {
  const version = object.version;
  if (typeof version !== "string" || !supportedVersions.includes(version)) {
    return {
      valid: false,
      message: `Your current version is outdated. Please download the latest one on ${shortcutURL}.`
    };
  }
  const url = object.url;
  if (typeof url !== "string") {
    return { valid: false, message: "The URL field is required and cannot be left blank." };
  }
  if (!/^https:\/\/www\.tiktok\.com\/@[^/]*\/(video|photo)\/\d{8,}/.test(url)) {
    return { valid: false, message: `The provided URL (${url}) is not valid.` };
  }
  const match = url.match(/\d{8,}/);
  if (!match) {
    return { valid: false, message: `The provided URL (${url}) is not valid.` };
  }
  return { valid: true, id: match[0] };
};

const formToObject = async (request: Request): Promise<FormValidation> => {
  try {
    const objectForm = Object.fromEntries(await request.formData());
    return objectValidator(objectForm);
  } catch {
    return { valid: false, message: "There was an error processing the form data." };
  }
};

const handlePostRequest = async (request: Request, env: Env): Promise<Response> => {
  if (env.MAINTENANCE) {
    return jsonResponseBuilder(
      { error: "DTikTok is under maintenance. Find more at @heismauri on Twitter/X." },
      { status: 503 }
    );
  }
  const params = await formToObject(request);
  if (!params.valid) {
    return jsonResponseBuilder({ error: params.message }, { status: 400 });
  }
  const tiktokJSON = await getVideo(params.id, env);
  if ("error" in tiktokJSON) {
    switch (tiktokJSON.error.message) {
      case "NotFound":
        return jsonResponseBuilder(
          {
            error:
              "Sorry, the download might have failed as the video is flagged as sensitive content. Access to this " +
              "content is restricted and may vary by country or due to other reasons."
          },
          { status: 404 }
        );
      default:
        return jsonResponseBuilder(
          {
            error:
              "TikTok's API does not seem to be working right now. Please try again later. " +
              "Contact @heismauri on Twitter/X if the problem persists."
          },
          { status: 503 }
        );
    }
  }
  return jsonResponseBuilder(tiktokJSON);
};

export default {
  fetch(request, env): Response | Promise<Response> {
    if (request.method === "POST") {
      return handlePostRequest(request, env);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;

import { shortcutURL, supportedVersions } from './modules/global-variables';
import tiktokAPIClient from './modules/tiktok-api-client';
import jsonBuilder from './modules/json-builder';
import landingPage from './modules/landing-page';

// Utilities methods, used for various things
const jsonResponseBuilder = (body, options = {}) => {
  return new Response(JSON.stringify(body), {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  });
};

// Check params
const objectValidator = (object) => {
  // Check if installed version is a supported one
  if (!object.version || !supportedVersions.includes(object.version)) {
    object.message = `Your current version is outdated. Please download the latest one on ${shortcutURL}.`;
    return object;
  }
  // Check for valid URL
  if (!object.url) {
    object.message = 'The URL field is required and cannot be left blank.';
    return object;
  }
  // Check for valid tiktok ID
  if (!(/^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d{8,}/.test(object.url))) {
    object.message = `The provided URL (${object.url}) is not valid.`;
    return object;
  }
  // Save the id on params object
  [object.id] = object.url.match(/\d{8,}/);
  return object;
};

const formToObject = async (request) => {
  try {
    const objectForm = Object.fromEntries(await request.formData());
    return objectValidator(objectForm);
  } catch (error) {
    return { message: 'There was an error processing the form data.' };
  }
};

const handlePostRequest = async (request, env) => {
  const params = await formToObject(request);
  if (params.message) {
    return jsonResponseBuilder({ error: params.message }, { status: 400 });
  }
  const tiktokJSON = await tiktokAPIClient(params.id, env);
  // Check if the API gave any errors
  if (tiktokJSON.error) {
    switch (tiktokJSON.error.message) {
      case 'NotFound':
        return jsonResponseBuilder(
          {
            error: 'Sorry, the download might have failed as the video is flagged as sensitive content. Access to this '
            + 'content is restricted and may vary by country or due to other reasons.'
          },
          { status: 404 }
        );
      default:
        return jsonResponseBuilder(
          {
            error: "TikTok's API does not seem to be working right now. Please try again later. "
            + 'Contact @heismauri on Twitter/X if the problem persists.'
          },
          { status: 503 }
        );
    }
  }
  // Success
  return jsonResponseBuilder(jsonBuilder(tiktokJSON, params.selector), { status: 200 });
};

export default {
  fetch(request, env) {
    if (request.method === 'POST') {
      return handlePostRequest(request, env);
    }
    return new Response(landingPage(), {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
    });
  }
};

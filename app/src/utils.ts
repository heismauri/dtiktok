interface UrlValidationResult {
  success: boolean;
  url: string;
}

const urlValidator = async (url: string): Promise<UrlValidationResult> => {
  try {
    let mainURL = new URL(url).toString();
    if (/https:\/\/www\.tiktok\.com\/t\/|https:\/\/v[mt]\.tiktok\.com/.test(mainURL)) {
      const data: { url: string } = await fetch(`https://urlexpander.heismauri.com/?url=${mainURL}`).then(
        (response) => response.json()
      );
      mainURL = data.url;
    }
    return {
      success: /https:\/\/www\.tiktok\.com/.test(mainURL) && /\d{9,}/.test(mainURL),
      url: mainURL
    };
  } catch {
    return {
      success: false,
      url
    };
  }
};

export { urlValidator };
export type { UrlValidationResult };

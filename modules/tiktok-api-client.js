const validJSON = (str) => {
  const firstChar = str.charAt(0);
  const lastChar = str.charAt(str.length - 1);
  return (firstChar === '{' && lastChar === '}');
};

const tiktokAPIClient = async (id, env) => {
  try {
    const tiktokEndpoint = new URL(env.ENDPOINT);
    tiktokEndpoint.search = new URLSearchParams({
      'aweme_id': id
    });
    const tiktokResponse = await fetch(tiktokEndpoint, {
      headers: {
        'Accept': 'application/json',
        'Connection': 'keep-alive',
        'User-Agent': 'AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.105 Mobile Safari/537.36 '
        + 'com.ss.android.ugc.trill/494 Mozilla/5.0 (Linux; Android 12; 2112123G Build/SKQ1.211006.001; wv)'
      },
      signal: AbortSignal.timeout(10 * 1000)
    })
      .then((response) => response.text());
    if (!tiktokResponse) throw new Error('Blank');
    if (!validJSON(tiktokResponse)) throw new Error('InvalidJSON');

    const tiktokParsedResponse = JSON.parse(tiktokResponse);
    const stiktokJson = tiktokParsedResponse.aweme_list.find((aweme) => aweme.aweme_id === id);
    if (!stiktokJson) throw new Error('NotFound');

    return stiktokJson;
  } catch (error) {
    return { error };
  }
};

export default tiktokAPIClient;

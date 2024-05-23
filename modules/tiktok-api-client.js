const validJSON = (str) => {
  const firstChar = str.charAt(0);
  const lastChar = str.charAt(str.length - 1);
  return (firstChar === '{' && lastChar === '}');
};

const tiktokAPIClient = async (id, env) => {
  try {
    const tiktokEndpoint = new URL(env.ENDPOINT);
    tiktokEndpoint.search = new URLSearchParams({
      'aweme_id': id,
      'device_type': 'SM-S928B',
      'device_platform': 'android',
      'os_version': '15'
    });
    const tiktokResponse = await fetch(tiktokEndpoint, {
      method: 'OPTIONS',
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

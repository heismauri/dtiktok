const validJSON = (str) => {
  const firstChar = str.charAt(0);
  const lastChar = str.charAt(str.length - 1);
  return (firstChar === '{' && lastChar === '}');
};

const tiktokAPIClient = async (id, env) => {
  try {
    const tiktokEndpoint = new URL(env.ENDPOINT);
    tiktokEndpoint.search = new URLSearchParams({
      'iid': '7318518857994389254',
      'device_id': '7318517321748022790',
      'channel': 'googleplay',
      'app_name': 'musical_ly',
      'version_code': '300904',
      'device_platform': 'android',
      'device_type': 'ASUS_Z01QD',
      'os_version': '9',
      'aweme_id': id
    });
    const tiktokResponse = await fetch(tiktokEndpoint, {
      headers: {
        'Accept': 'application/json',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko)'
        + 'Chrome/122.0.0.0 Mobile Safari/537.36'
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

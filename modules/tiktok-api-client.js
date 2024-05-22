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
      'channel': 'googleplay',
      'app_name': 'musical_ly',
      'version_code': '300904',
      'device_platform': 'android',
      'os_version': '9',
      'resolution': '1080*2400',
      'dpi': 420,
      'device_type': 'Pixel 7',
      'device_brand': 'Google',
      'aweme_id': id
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

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
    });
    const tiktokBody = await tiktokResponse.text();
    tiktokLog = tiktokBody;
    if (!tiktokResponse.ok) throw new Error('Bad fetch response');
    if (!tiktokBody) throw new Error('Blank');
    if (!validJSON(tiktokBody)) throw new Error('InvalidJSON');

    const tiktokParsedBody = JSON.parse(tiktokBody);
    const tiktokDetail = tiktokParsedBody.aweme_list.find((aweme) => aweme.aweme_id === id);
    if (!tiktokDetail) throw new Error('NotFound');

    return tiktokDetail;
  } catch (error) {
    return { error };
  }
};

export default tiktokAPIClient;

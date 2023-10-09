import { Miniflare } from 'miniflare';
import { FormData } from 'undici';
import { config } from 'dotenv';
import { latestVersion } from '../modules/global-variables';

config({ path: './.dev.vars' });

let mf;
const endpoint = process.env.ENDPOINT;
const buildForm = (url) => {
  const form = new FormData();
  form.append('version', latestVersion);
  form.append('url', url);
  return form;
};

beforeAll(() => {
  mf = new Miniflare({
    scriptPath: 'dist/worker.js',
    modules: true,
    port: 1811,
    bindings: { ENDPOINT: endpoint }
  });
});

test('Can download videos', async () => {
  const dtiktokAPI = await mf.dispatchFetch('http://localhost:1811', {
    method: 'POST',
    body: buildForm('https://www.tiktok.com/@itzyofficial/video/7138717904694021377')
  })
    .then((response) => response.json());
  expect(dtiktokAPI).toHaveProperty('media');
  expect(dtiktokAPI.media[0].type).toBe('video');
  expect(dtiktokAPI.media[0].link).not.toBeNull();
  expect(dtiktokAPI.media[0].link).toContain('https://');
});

test('Can download photos', async () => {
  const dtiktokAPI = await mf.dispatchFetch('http://localhost:1811', {
    method: 'POST',
    body: buildForm('https://www.tiktok.com/@newjeans_official/video/7155422549541801218')
  })
    .then((response) => response.json());
  expect(dtiktokAPI).toHaveProperty('media');
  expect(dtiktokAPI.media[0].type).toBe('photo');
  expect(dtiktokAPI.media[0].link).not.toBeNull();
  expect(dtiktokAPI.media[0].link).toContain('https://');
});

afterAll(async () => {
  await mf.dispose();
});

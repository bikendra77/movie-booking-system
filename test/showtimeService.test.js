import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

test('getLocationStats requests cinema statistics without throwing', async () => {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = globalThis.localStorage;
  const requests = [];
  const statistics = { cityCount: 2, cinemaCount: 3 };
  let vite;

  globalThis.localStorage = { getItem: () => null };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return {
      status: 200,
      ok: true,
      json: async () => statistics
    };
  };

  try {
    vite = await createServer({
      configFile: fileURLToPath(new URL('../vite.config.js', import.meta.url)),
      server: { middlewareMode: true },
      appType: 'custom',
      logLevel: 'silent'
    });
    const { showtimeService } = await vite.ssrLoadModule('/src/services/showtimeService.js');

    assert.deepEqual(await showtimeService.getLocationStats(), statistics);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, '/api/theaters/stats');
  } finally {
    if (vite) await vite.close();
    globalThis.fetch = originalFetch;
    if (originalLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalLocalStorage;
  }
});

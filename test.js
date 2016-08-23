/* eslint import/no-extraneous-dependencies: 0 */
import test from 'ava';
import fetchMock from 'fetch-mock';
import crawler, { fetchUrl, parseUrlsFromBody } from './src/index';

fetchMock
    .mock('http://whiskeynerds.com', { status: 200, body: 'asdasdhjkashjdasjh' });

test('should throw an error when no url passed', async t => {
  try {
    await crawler({ depthLimit: 'x', interval: 'x' });
  } catch (err) {
    t.truthy(err instanceof Error);
  }
});

test('fetchUrl returns a body and respose object', async t => {
  const url = 'http://whiskeynerds.com';
  const { res, body } = await fetchUrl(url);
  t.truthy(res);
  t.truthy(body);
});

test('should parse url from body', t => {
  const body = '<html><head></head><body><a href="/whiskey" /><a href="/rum" /></body></html>';
  const urls = parseUrlsFromBody(body);
  console.log(urls);
  t.truthy(urls.length === 2);
});

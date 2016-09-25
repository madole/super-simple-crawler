/* eslint import/no-extraneous-dependencies: 0 */
import test from 'ava';
import nock from 'nock';
import fetchUrl from '../../src/utils/fetch-url';


test('should return an object with res, body and response time if 200 returned', async t => {
  const url = 'http://whiskeynerds.com';
  const body = '<html><head></head><body><a href="/whiskey" /><a href="/rum" /></body></html>';
  nock(url)
        .get('/')
        .reply(200, body);
  const result = await fetchUrl(url);
  t.truthy(result.body === body);
  t.truthy(result.res.status === 200);
  t.truthy(result.responseTime !== null);
});

test('should return an object with res, body and response time if 404 returned', async t => {
  const url = 'http://whiskeynerds.com';
  const body = '<html><head></head><body>NOT FOUND</body></html>';
  nock(url)
        .get('/')
        .reply(404, body);
  const result = await fetchUrl(url);
  t.truthy(result.body === body);
  t.truthy(result.res.status === 404);
  t.truthy(result.responseTime !== null);
});

test('should return an object with res, body and response time if 500 returned', async t => {
  const url = 'http://whiskeynerds.com';
  nock(url)
        .get('/')
        .reply(500);
  const result = await fetchUrl(url);

  t.truthy(result.res.status === 500);
  t.truthy(result.body === '');
});

import test from 'ava';
import parseUrlsFromBody from '../../src/utils/parse-urls-from-body';

test('should parse any urls from body html passed in', t => {
  const body = '<html><head></head><body><a href="/whiskey" /><a href="/rum" /></body></html>';
  const urls = parseUrlsFromBody(body);
  t.truthy(urls.length === 2);
  t.truthy(urls.indexOf('/whiskey') !== -1);
  t.truthy(urls.indexOf('/rum') !== -1);
});

test('should return an empty array if no urls are in the markup', t => {
  const body = '<html><head></head><body></body></html>';
  const urls = parseUrlsFromBody(body);
  t.deepEqual(urls, []);
});

test('should return an empty array if no markup is passed in', t => {
  const urls = parseUrlsFromBody();
  t.deepEqual(urls, []);
});

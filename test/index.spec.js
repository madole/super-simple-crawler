/* eslint import/no-extraneous-dependencies: 0 */
import test from 'ava';
import nock from 'nock';
import crawler from '../src/index';

test.beforeEach(() => {
  nock('http://whiskeynerds.com')
    .get('/')
    .reply(200, '<html><head></head><body><a href="/whiskey" /><a href="http://whiskeynerds.com/rum" /></body></html>');

  nock('http://whiskeynerds.com')
    .get('/whiskey')
    .reply(200, '<html><head></head><body>ALL THE WHISKEY</body></html>');

  nock('http://whiskeynerds.com')
    .get('/rum')
    .reply(200, '<html><head></head><body><a href="/gin" /></body></html>');

  nock('http://whiskeynerds.com')
    .get('/gin')
    .reply(200, '<html><head></head><body>ALL THE GIN</body></html>');
});

test.cb('should return 4 repsonses', t => {
  const crawlerEvent = crawler({ url: 'http://whiskeynerds.com', maxDepthLimit: 2 });
  let count = 0;
  crawlerEvent.on('response', () => count++);
  crawlerEvent.on('done', () => {
    t.truthy(count === 4);
    t.end();
  });
});

test.cb('should return 4 repsonses and default the depth limit', t => {
  const crawlerEvent = crawler({ url: 'http://whiskeynerds.com' });
  let count = 0;
  crawlerEvent.on('response', () => count++);
  crawlerEvent.on('done', () => {
    t.truthy(count === 4);
    t.end();
  });
});

test.cb('should send an object with url, depthLimit, responseTime, status, and size in the respsonse', t => {
  const c = crawler({ url: 'http://whiskeynerds.com', maxDepthLimit: 2 });
  const responses = [];
  c.on('response', (res) => responses.push(res));
  c.on('done', () => {
    const whiskeyRes = responses[1];
    t.truthy(whiskeyRes.url === 'http://whiskeynerds.com/whiskey');
    t.truthy(whiskeyRes.path === '/whiskey');
    t.truthy(whiskeyRes.depthLimit === 1);
    t.truthy(whiskeyRes.responseTime != null);
    t.truthy(whiskeyRes.size != null);
    t.truthy(whiskeyRes.response != null);
    t.end();
  });
});

test.cb('should return an object with a 500', t => {
  nock('http://fake.com')
        .get('/')
        .reply(500);

  const c = crawler({ url: 'http://fake.com', maxDepthLimit: 1 });
  c.on('response', res => {
    t.truthy(res.status === 500);
    t.end();
  });
});

test('should throw an error if no url is passed in', t => {
  try {
    crawler({ maxDepthLimit: 1 });
  } catch (err) {
    t.truthy(err != null);
  }
});

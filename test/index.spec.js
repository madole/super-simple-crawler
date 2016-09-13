import test from 'ava';

import crawler from '../src/index';

test.cb('test the basics', t => {
  const crawlerEvent = crawler({ url: 'http://whiskeynerds.com', maxDepthLimit: 1 });
  crawlerEvent.on('response', (evt) => console.log(evt));
  crawlerEvent.on('done', () => {
    console.log('test is done');
    t.end();
  });
});

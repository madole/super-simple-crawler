import { queue } from 'async';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';
import filterDuplicates from './utils/filter-duplicates';
import fetchUrl from './utils/fetch-url';
import parseUrlsFromBody from './utils/parse-urls-from-body';
import filterExternalUrls from './utils/filter-external-urls';

/**
 * Crawler function which takes a url and max depth limit and returns an event
 * emitter that you can hook onto.
 * Events:
 *  - response: fires after every url hit
 *      - returns an object {url, depthLimit, responseTime, status, headers, size}
 *  - done: fires when all links have been exhausted
 * @method crawler
 * @param  {String} url              base url to start crawling the website
 * @param  {Number} [maxDepthLimit=2 }]            maximum depth limit to crawl, defautls to 2
 * @return {EventEmitter}            an instance of eventemitter3 to hook on to
 */
export default function crawler({ url, maxDepthLimit = 2 }) {
  const eventEmitter = new EventEmitter();
  if (!url) throw new Error('Need to pass a url');
  const baseUrl = url;
  const results = [];
  const usedUrls = [url];
  const q = queue(async (task, callback) => {
    const currentDepthLimit = task.depthLimit;
    const result = await fetchUrl(task.url);


    results.push({
      url: task.url,
      response: result.res,
      depthLimit: currentDepthLimit,
      responseTime: result.responseTime,
    });

    eventEmitter.emit('response', {
      url: task.url,
      depthLimit: currentDepthLimit,
      responseTime: result.responseTime,
      status: result.res.status,
      headers: result.res.headers,
      size: result.res._bytes,
    });

    if (currentDepthLimit < maxDepthLimit) {
      const urls = parseUrlsFromBody(result.body);
      const internalUrls = filterExternalUrls(url, urls);
      const internalUniqueUrls = filterDuplicates(internalUrls, _.map(results, 'url'));
      const urlObjs = internalUniqueUrls.map(u => ({
        url: u.startsWith('/') ? `${baseUrl}${u}` : u,
        depthLimit: currentDepthLimit + 1,
      }));
      usedUrls.push(urls);
      q.push(urlObjs);
    }
    return callback();
  });

  q.push({ url, depthLimit: 0 });

  q.drain = () => {
    eventEmitter.emit('done');
  };
  return eventEmitter;
}

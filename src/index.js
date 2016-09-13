import cheerio from 'cheerio-without-node-native';
import { queue } from 'async';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';
import fetch from 'node-fetch';
import debug from 'debug';

const debugError = debug('crawler:error');

/**
 * Fetches the url, gets the contents of the url and times the response
 * @method fetchUrl
 * @param  {String}  url website to fetch
 * @return {Promise}     promise returns Object
 */
export async function fetchUrl(url) {
  const timeStart = Date.now();
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    debugError(err);
  }
  const responseTime = Date.now() - timeStart;
  const body = await res.text();
  return { res, body, responseTime };
}

/**
 * Loads the website contents into cheerio then parses all
 * the links from the webpage and returns them
 * @method parseUrlsFromBody
 * @param  {String}     body The website body
 * @return {Array}           Array of all the links on the webpage
 */
export function parseUrlsFromBody(body) {
  const $ = cheerio.load(body);
  const links = [];
  $('a').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  return links;
}

/**
 * Filters only the urls that point back into the website
 * @method filterInternalUrls
 * @param  {String}           baseUrl base url for the website
 * @param  {Array}            urls    array of urls to filter
 * @return {Array}                    array of filtered links
 */
function filterInternalUrls(baseUrl, urls) {
  const compactedUrls = _.compact(urls);
  return compactedUrls.filter(url =>
      (url.startsWith(baseUrl) && url !== baseUrl && url !== `${baseUrl}/`) || url.startsWith('/'));
}

/**
 * Filters duplicate urls so we dont hit the same url twice
 * @method filterDuplicates
 * @param  {Array}         urls     urls from latest webpage
 * @param  {Array}         usedUrls urls that have already been hit
 * @return {Array}                  deduped array of urls
 */
function filterDuplicates(urls, usedUrls) {
  const usedUrlsWithSlashes = usedUrls.concat(usedUrls.map(url => `${url}/`));
  return _.difference(urls, usedUrlsWithSlashes);
}

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
    let result;

    try {
      result = await fetchUrl(task.url);
    } catch (err) {
      debugError(err.stack);
      return callback(err);
    }

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
      const internalUrls = filterInternalUrls(url, urls);
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

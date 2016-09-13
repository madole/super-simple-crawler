import cheerio from 'cheerio-without-node-native';
import { queue } from 'async';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';
import fetch from 'node-fetch';


export async function fetchUrl(url) {
  const timeStart = Date.now();
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error(err);
  }
  const responseTime = Date.now() - timeStart;
  const body = await res.text();
  return { res, body, responseTime };
}

export function parseUrlsFromBody(body) {
  const $ = cheerio.load(body);
  const links = [];
  $('a').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  return links;
}

function filterInternalUrls(baseUrl, urls) {
  const compactedUrls = _.compact(urls);
  return compactedUrls.filter(url =>
      (url.startsWith(baseUrl) && url !== baseUrl && url !== `${baseUrl}/`) || url.startsWith('/'));
}

function filterDuplicates(urls, usedUrls) {
  const usedUrlsWithSlashes = usedUrls.concat(usedUrls.map(url => `${url}/`));
  return _.difference(urls, usedUrlsWithSlashes);
}

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
      console.error(err.stack);
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

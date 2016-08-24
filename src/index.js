import cheerio from 'cheerio-without-node-native';
import { queue } from 'async';
import fetch from 'node-fetch';
import _ from 'lodash';


export async function fetchUrl(url) {
  const timeStart = Date.now();
  const res = await fetch(url);
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
  return urls.filter(url =>
      (url.startsWith(baseUrl) && url !== baseUrl && url !== `${baseUrl}/`) || url.startsWith('/'));
}

function filterDuplicates(urls, usedUrls) {
  const usedUrlsWithSlashes = usedUrls.concat(usedUrls.map(url => `${url}/`));
  return _.difference(urls, usedUrlsWithSlashes);
}
export default async function crawler({ url, maxDepthLimit = 2 }) {
  if (!url) throw new Error('Need to pass a url');
  const baseUrl = url;
  const results = [];
  const usedUrls = [url];
  const q = queue((task, callback) => {
    const currentDepthLimit = task.depthLimit;
    fetchUrl(task.url)
        .then(result => {
          console.log('-----------------------------------' + task.url);
          results.push({
            url: task.url,
            response: result.res,
            depthLimit: result.depthLimit,
            responseTime: result.responseTime,
          });
          if (currentDepthLimit <= maxDepthLimit) {
            const urls = parseUrlsFromBody(result.body);
            const internalUrls = filterInternalUrls(url, urls);
            const internalUniqueUrls = filterDuplicates(internalUrls, _.map(results, 'url'));
            console.log(internalUniqueUrls);
            const urlObjs = internalUniqueUrls.map(u => ({
              url: u.startsWith('/') ? `${baseUrl}${u}` : u,
              depthLimit: currentDepthLimit + 1,
            }));
            usedUrls.push(urls);
            q.push(urlObjs);
          }
          callback();
        })
        .catch(err => {
          console.error(err.stack);
          callback();
        });
  });
  q.push({ url: 'http://whiskeynerds.com', depthLimit: 0 });
  q.drain = () => {
    console.log('all items have been processed');
  };
}

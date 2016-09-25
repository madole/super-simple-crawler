import { difference } from 'lodash';
/**
 * Filters duplicate urls so we dont hit the same url twice
 * @method filterDuplicates
 * @param  {Array}         urls     urls from latest webpage
 * @param  {Array}         usedUrls urls that have already been hit
 * @return {Array}                  deduped array of urls
 */
export default (urls, usedUrls) => {
  const usedUrlsWithSlashes = usedUrls ? usedUrls.concat(usedUrls.map(url => `${url}/`)) : [];
  return difference(urls, usedUrlsWithSlashes);
};

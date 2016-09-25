import { compact } from 'lodash';


/**
 * Filters only the urls that point back into the website
 * @method filterInternalUrls
 * @param  {String}           baseUrl base url for the website
 * @param  {Array}            urls    array of urls to filter
 * @return {Array}                    array of filtered links
 */
export default (baseUrl, urls) => {
  const compactedUrls = compact(urls);
  return compactedUrls.filter(url =>
      (url.startsWith(baseUrl) && url !== baseUrl && url !== `${baseUrl}/`) || url.startsWith('/'));
};

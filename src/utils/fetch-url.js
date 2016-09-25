import fetch from 'node-fetch';

/**
 * Fetches the url, gets the contents of the url and times the response
 * @method fetchUrl
 * @param  {String}  url website to fetch
 * @return {Promise}     promise returns Object
 */
export default async (url) => {
  const timeStart = Date.now();

  const res = await fetch(url);

  const responseTime = Date.now() - timeStart;
  const body = await res.text();
  return { res, body, responseTime };
};

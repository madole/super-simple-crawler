import cheerio from 'cheerio-without-node-native';

export async function fetchUrl(url) {
  const res = await fetch(url);
  const body = await res.text();
  return { res, body };
}

export function parseUrlsFromBody(body) {
  const $ = cheerio.load(body);
  const links = [];
  $('a').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  return links;
}

export default async function crawler({ url, maxDepthLimit = 1, interval }) {
  if (!url) throw new Error('Need to pass a url');
  const results = [];
  const firstResult = await fetchUrl(url);

  results.push({
    response: firstResult.response,
    depthLimit: 1,
  });

  parseUrlsFromBody(firstResult.response);
}

import cheerio from 'cheerio-without-node-native';

/**
 * Loads the website contents into cheerio then parses all
 * the links from the webpage and returns them
 * @method parseUrlsFromBody
 * @param  {String}     body The website body
 * @return {Array}           Array of all the links on the webpage
 */
export default (body) => {
  if (!body) return [];
  const $ = cheerio.load(body);
  const links = [];
  $('a').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  return links;
};

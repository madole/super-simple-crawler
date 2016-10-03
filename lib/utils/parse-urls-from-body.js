'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Loads the website contents into cheerio then parses all
 * the links from the webpage and returns them
 * @method parseUrlsFromBody
 * @param  {String}     body The website body
 * @return {Array}           Array of all the links on the webpage
 */
exports.default = body => {
  if (!body) return [];
  const $ = _cheerio2.default.load(body);
  const links = [];
  $('a').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  return links;
};
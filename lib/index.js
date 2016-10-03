'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = crawler;

var _async = require('async');

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _lodash = require('lodash');

var _filterDuplicates = require('./utils/filter-duplicates');

var _filterDuplicates2 = _interopRequireDefault(_filterDuplicates);

var _fetchUrl = require('./utils/fetch-url');

var _fetchUrl2 = _interopRequireDefault(_fetchUrl);

var _parseUrlsFromBody = require('./utils/parse-urls-from-body');

var _parseUrlsFromBody2 = _interopRequireDefault(_parseUrlsFromBody);

var _filterExternalUrls = require('./utils/filter-external-urls');

var _filterExternalUrls2 = _interopRequireDefault(_filterExternalUrls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function crawler(_ref) {
  let url = _ref.url;
  var _ref$maxDepthLimit = _ref.maxDepthLimit;
  let maxDepthLimit = _ref$maxDepthLimit === undefined ? 2 : _ref$maxDepthLimit;

  const eventEmitter = new _eventemitter2.default();
  if (!url) throw new Error('Need to pass a url');
  const baseUrl = url;
  const results = [];
  const usedUrls = [url];
  const q = (0, _async.queue)((() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (task, callback) {
      const currentDepthLimit = task.depthLimit;
      const result = yield (0, _fetchUrl2.default)(task.url);

      results.push({
        url: task.url,
        response: result.res,
        depthLimit: currentDepthLimit,
        responseTime: result.responseTime
      });

      eventEmitter.emit('response', {
        url: task.url,
        path: task.path,
        depthLimit: currentDepthLimit,
        responseTime: result.responseTime,
        status: result.res.status,
        headers: result.res.headers,
        size: result.res._bytes,
        response: result.res
      });

      if (currentDepthLimit < maxDepthLimit) {
        const urls = (0, _parseUrlsFromBody2.default)(result.body);
        const internalUrls = (0, _filterExternalUrls2.default)(url, urls);
        const internalUniqueUrls = (0, _filterDuplicates2.default)(internalUrls, (0, _lodash.map)(results, 'url'));
        const urlObjs = internalUniqueUrls.map(function (u) {
          return {
            url: u.startsWith('/') ? `${ baseUrl }${ u }` : u,
            path: u,
            depthLimit: currentDepthLimit + 1
          };
        });
        usedUrls.push(urls);
        q.push(urlObjs);
      }
      return callback();
    });

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  })());

  q.push({ url: url, depthLimit: 0 });

  q.drain = () => {
    eventEmitter.emit('done');
  };
  return eventEmitter;
}
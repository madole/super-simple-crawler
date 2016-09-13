'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchUrl = undefined;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let fetchUrl = exports.fetchUrl = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (url) {
    const timeStart = Date.now();
    let res;
    try {
      res = yield (0, _nodeFetch2.default)(url);
    } catch (err) {
      console.error(err);
    }
    const responseTime = Date.now() - timeStart;
    const body = yield res.text();
    return { res: res, body: body, responseTime: responseTime };
  });

  return function fetchUrl(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.parseUrlsFromBody = parseUrlsFromBody;
exports.default = crawler;

var _cheerioWithoutNodeNative = require('cheerio-without-node-native');

var _cheerioWithoutNodeNative2 = _interopRequireDefault(_cheerioWithoutNodeNative);

var _async = require('async');

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseUrlsFromBody(body) {
  const $ = _cheerioWithoutNodeNative2.default.load(body);
  const links = [];
  $('a').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  return links;
}

function filterInternalUrls(baseUrl, urls) {
  const compactedUrls = _lodash2.default.compact(urls);
  return compactedUrls.filter(url => url.startsWith(baseUrl) && url !== baseUrl && url !== `${ baseUrl }/` || url.startsWith('/'));
}

function filterDuplicates(urls, usedUrls) {
  const usedUrlsWithSlashes = usedUrls.concat(usedUrls.map(url => `${ url }/`));
  return _lodash2.default.difference(urls, usedUrlsWithSlashes);
}

function crawler(_ref2) {
  let url = _ref2.url;
  var _ref2$maxDepthLimit = _ref2.maxDepthLimit;
  let maxDepthLimit = _ref2$maxDepthLimit === undefined ? 2 : _ref2$maxDepthLimit;

  const eventEmitter = new _eventemitter2.default();
  if (!url) throw new Error('Need to pass a url');
  const baseUrl = url;
  const results = [];
  const usedUrls = [url];
  const q = (0, _async.queue)((() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (task, callback) {
      const currentDepthLimit = task.depthLimit;
      let result;

      try {
        result = yield fetchUrl(task.url);
      } catch (err) {
        console.error(err.stack);
        return callback(err);
      }

      results.push({
        url: task.url,
        response: result.res,
        depthLimit: currentDepthLimit,
        responseTime: result.responseTime
      });

      eventEmitter.emit('response', {
        url: task.url,
        depthLimit: currentDepthLimit,
        responseTime: result.responseTime,
        status: result.res.status,
        headers: result.res.headers,
        size: result.res._bytes
      });

      if (currentDepthLimit < maxDepthLimit) {
        const urls = parseUrlsFromBody(result.body);
        const internalUrls = filterInternalUrls(url, urls);
        const internalUniqueUrls = filterDuplicates(internalUrls, _lodash2.default.map(results, 'url'));
        const urlObjs = internalUniqueUrls.map(function (u) {
          return {
            url: u.startsWith('/') ? `${ baseUrl }${ u }` : u,
            depthLimit: currentDepthLimit + 1
          };
        });
        usedUrls.push(urls);
        q.push(urlObjs);
      }
      return callback();
    });

    return function (_x2, _x3) {
      return _ref3.apply(this, arguments);
    };
  })());

  q.push({ url: url, depthLimit: 0 });

  q.drain = () => {
    eventEmitter.emit('done');
  };
  return eventEmitter;
}
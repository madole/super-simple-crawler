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
    const res = yield (0, _nodeFetch2.default)(url);
    const responseTime = Date.now() - timeStart;
    const body = yield res.text();
    return { res: res, body: body, responseTime: responseTime };
  });

  return function fetchUrl(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.parseUrlsFromBody = parseUrlsFromBody;

var _cheerioWithoutNodeNative = require('cheerio-without-node-native');

var _cheerioWithoutNodeNative2 = _interopRequireDefault(_cheerioWithoutNodeNative);

var _async = require('async');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
  return urls.filter(url => url.startsWith(baseUrl) && url !== baseUrl && url !== `${ baseUrl }/` || url.startsWith('/'));
}

function filterDuplicates(urls, usedUrls) {
  const usedUrlsWithSlashes = usedUrls.concat(usedUrls.map(url => `${ url }/`));
  return _lodash2.default.difference(urls, usedUrlsWithSlashes);
}

exports.default = (() => {
  var _ref2 = (0, _asyncToGenerator3.default)(function* (_ref3) {
    let url = _ref3.url;
    var _ref3$maxDepthLimit = _ref3.maxDepthLimit;
    let maxDepthLimit = _ref3$maxDepthLimit === undefined ? 2 : _ref3$maxDepthLimit;

    if (!url) throw new Error('Need to pass a url');
    const baseUrl = url;
    const results = [];
    const usedUrls = [url];
    const q = (0, _async.queue)(function (task, callback) {
      const currentDepthLimit = task.depthLimit;
      fetchUrl(task.url).then(function (result) {
        console.log('-----------------------------------' + task.url);
        results.push({
          url: task.url,
          response: result.res,
          depthLimit: result.depthLimit,
          responseTime: result.responseTime
        });
        if (currentDepthLimit <= maxDepthLimit) {
          const urls = parseUrlsFromBody(result.body);
          const internalUrls = filterInternalUrls(url, urls);
          const internalUniqueUrls = filterDuplicates(internalUrls, _lodash2.default.map(results, 'url'));
          console.log(internalUniqueUrls);
          const urlObjs = internalUniqueUrls.map(function (u) {
            return {
              url: u.startsWith('/') ? `${ baseUrl }${ u }` : u,
              depthLimit: currentDepthLimit + 1
            };
          });
          usedUrls.push(urls);
          q.push(urlObjs);
        }
        callback();
      }).catch(function (err) {
        console.error(err.stack);
        callback();
      });
    });
    q.push({ url: 'http://whiskeynerds.com', depthLimit: 0 });
    q.drain = function () {
      console.log('all items have been processed');
    };
  });

  function crawler(_x2) {
    return _ref2.apply(this, arguments);
  }

  return crawler;
})();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchUrl = undefined;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let fetchUrl = exports.fetchUrl = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (url) {
    const res = yield fetch(url);
    const body = yield res.text();
    return { res: res, body: body };
  });

  return function fetchUrl(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.parseUrlsFromBody = parseUrlsFromBody;

var _cheerioWithoutNodeNative = require('cheerio-without-node-native');

var _cheerioWithoutNodeNative2 = _interopRequireDefault(_cheerioWithoutNodeNative);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseUrlsFromBody(body) {
  const $ = _cheerioWithoutNodeNative2.default.load(body);
  return $('a').attr('href');
}

exports.default = (() => {
  var _ref2 = (0, _asyncToGenerator3.default)(function* (_ref3) {
    let url = _ref3.url;
    var _ref3$maxDepthLimit = _ref3.maxDepthLimit;
    let maxDepthLimit = _ref3$maxDepthLimit === undefined ? 1 : _ref3$maxDepthLimit;
    let interval = _ref3.interval;

    if (!url) throw new Error('Need to pass a url');
    const results = [];
    const firstResult = yield fetchUrl(url);

    results.push({
      response: firstResult.response,
      depthLimit: 1
    });

    parseUrlsFromBody(response.body);
  });

  function crawler(_x2) {
    return _ref2.apply(this, arguments);
  }

  return crawler;
})();
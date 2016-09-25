'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fetches the url, gets the contents of the url and times the response
 * @method fetchUrl
 * @param  {String}  url website to fetch
 * @return {Promise}     promise returns Object
 */
exports.default = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (url) {
    const timeStart = Date.now();

    const res = yield (0, _nodeFetch2.default)(url);

    const responseTime = Date.now() - timeStart;
    const body = yield res.text();
    return { res: res, body: body, responseTime: responseTime };
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();
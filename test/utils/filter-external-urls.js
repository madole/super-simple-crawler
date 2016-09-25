import test from 'ava';
import filterExternalUrls from '../../src/utils/filter-external-urls';

const baseUrl = 'http://whiskeynerds.com';
const urls = ['http://whiskeynerds.com/scotch', '/irish', 'http://rumnerds.com'];
const result = filterExternalUrls(baseUrl, urls);

test('should filter out all urls that dont point back into the website', t => {
  t.truthy(result.length === 2);
  t.truthy(result.indexOf('http://rumnerds.com') === -1);
});

test('should return urls that start with the base url', t => {
  t.truthy(result.indexOf('http://whiskeynerds.com/scotch') !== -1);
});

test('should return urls that start with a /', t => {
  t.truthy(result.indexOf('/irish'));
});

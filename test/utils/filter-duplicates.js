import test from 'ava';
import filterDuplicates from '../../src/utils/filter-duplicates';

test('should filter duplicates from the array passed in', t => {
  const urlArray = ['http://a.com', 'http://b.com'];
  const usedUrls = ['http://a.com'];

  const result = filterDuplicates(urlArray, usedUrls);
  t.truthy(result.length === 1);
});

test('should return all the urls if none are used', t => {
  const urlArray = ['http://a.com', 'http://b.com'];
  const result = filterDuplicates(urlArray);
  t.deepEqual(result, urlArray);
});

test('should return an empty array if nothing is passed in', t => {
  const result = filterDuplicates();
  t.deepEqual(result, []);
});

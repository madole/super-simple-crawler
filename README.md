## Super Simple Crawler ![travisCI](https://travis-ci.org/madole/super-simple-crawler.svg)

A super simple crawler for crawling websites and reporting back stats.

## Installation
`npm install -S super-simple-crawler`

## Usage

```
import simpleCrawler from 'super-simple-crawler';

const crawler = simpleCrawler({ url: 'http://madole.xyz' });

crawler.on('response', {status, responseTime, body, size} => {
    console.log(status);
    console.log(responseTime);
    console.log(depthLimit);
    console.log(size);
});

crawler.on('done', () => {
    console.log('Finished crawling');
});
```

## Parameters
simpleCrawler takes an object as a parameter.

- url - string: the url to crawl
- maxDepthLimit - number: the depth which to crawl, defaults to 2

## Events

#### response
- status - string: the response status (HTTP Code)
- responseTime - number: the time taken for the server to respond to the request
- depthLimit - number: the depth which the URL features in the site
- size - number: the size, in bytes, of the response

#### done
The done event is fired when there are either no more urls to crawl, or the maximum
depth limit has been reached.

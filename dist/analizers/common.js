'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilJs = require('../util.js');

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

exports['default'] = function (url, $) {
  var result = { title: '', keywords: [] };

  result.title = $('title').text().trim();
  // keywords
  var keywords = $('meta[name=keywords]').attr('content');
  if (keywords) {
    keywords = keywords.trim().split(',').map(function (s) {
      return s.trim();
    });
    result.keywords = keywords;
  }
  // description
  result.description = $('meta[name=description]').attr('content');

  // links
  // nofollow链接不允许点击
  // $('a[rel!=nofollow]').each(function (i, elem){
  //   // 提取链接
  //   let href = $(this).attr('href');
  //   if (href) {
  //     let abs_url = nurl.resolve(url, href);
  //     if (isValidUrl(abs_url)) {
  //       result.links.push(abs_url)
  //     }
  //   }
  // });

  return result;
};

module.exports = exports['default'];
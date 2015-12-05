'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilJs = require('../util.js');

exports['default'] = function (url, $) {
  // 检验该网页是否为本分析器适用
  if (/book\.douban\.com\/subject\/(\d+)/.test(url)) {
    var description = [];
    var thumb = $('.nbg img').attr('src');
    description.push($('#wrapper h1').text());

    // 图书信息
    description.push($('#info').text());
    // 图书简介
    description.push($('#link-report .intro').text());
    // 作者
    description.push($('#content div.related_info > div:nth-child(4) > div >div').text());
    return { text: description.map(function (text) {
        return (0, _utilJs.spaceTrim)(text);
      }).join(' '), thumb: thumb };
  } else {
    return {};
  }
};

module.exports = exports['default'];
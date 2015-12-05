'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilJs = require('../util.js');

exports['default'] = function (url, $) {
  // 检验该网页是否为本分析器适用
  if (/movie\.douban\.com\/subject\/(\d+)/.test(url)) {
    var description = [];
    var thumb = $('.nbgnbg img').attr('src');
    // 标题
    description.push($('#wrapper h1').text());

    // 基本信息
    description.push($('#info').text());
    // 影片简介
    description.push($('#link-report').text());
    return { text: description.map(function (text) {
        return (0, _utilJs.spaceTrim)(text);
      }).join(' '), thumb: thumb };
  } else {
    return {};
  }
};

module.exports = exports['default'];
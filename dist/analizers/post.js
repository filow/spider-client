'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilJs = require('../util.js');

exports['default'] = function (url, $) {
  // 检验该网页是否为本分析器适用
  if (/cn.engadget.com(\/\d+){3}/.test(url)) {
    var description = [];
    $('.post-body style').remove();
    $('.post-body script').remove();
    description.push($('.post-body').text());

    var keywords = $('aside.meta-tags a').map(function (i, e) {
      return $(e).text();
    }).get();
    return { text: description.map(function (text) {
        return (0, _utilJs.spaceTrim)(text);
      }).join(' '), keywords: keywords };
  } else {
    return {};
  }
};

module.exports = exports['default'];
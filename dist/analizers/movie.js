'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilJs = require('../util.js');

exports['default'] = function (url, props) {
  // 检验该网页是否为本分析器适用
  if (/movie\.douban\.com\/subject\/(\d+)/.test(url)) {
    var description = [];
    var thumb = props.images[0];
    // 标题
    description.push(props.directors.map(function (i) {
      return i.name;
    }).join(', '));
    description.push(props.casts.map(function (i) {
      return i.name;
    }).join(', '));

    return { text: description.map(function (text) {
        return (0, _utilJs.spaceTrim)(text);
      }).join(' '), thumb: thumb };
  } else {
    return {};
  }
};

module.exports = exports['default'];
// 三方库以及Nodejs自带库
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _requireDir = require('require-dir');

var _requireDir2 = _interopRequireDefault(_requireDir);

// 将一个目录下所有的文件都require进来

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

// 功能类库

var _requestJs = require('./request.js');

var _requestJs2 = _interopRequireDefault(_requestJs);

var _server_connect = require('./server_connect');

var _server_connect2 = _interopRequireDefault(_server_connect);

var _loggerJs = require('./logger.js');

var _loggerJs2 = _interopRequireDefault(_loggerJs);

// 分析器和过滤器
var analizers = [];
// 分析器, analizer目录下所有的东西都会包含进来
var analizersInDir = (0, _requireDir2['default'])('./analizers', { camelcase: true });
_lodash2['default'].each(analizersInDir, function (i) {
  return analizers.push(i);
});

var Spider = (function () {
  function Spider(options) {
    _classCallCheck(this, Spider);

    // 合并设置项
    this.options = {
      retry_interval: 5000,
      wait_interval: 0
    };
    _lodash2['default'].merge(this.options, options);

    this.task = new _server_connect2['default'](this.options.server, this.options.port);
  }

  _createClass(Spider, [{
    key: 'run',
    value: function run() {
      var _this = this;

      // 保持永远执行
      _async2['default'].forever(function (next) {
        // 从服务器获取任务
        _this.task.get(function (err, items) {
          // 获取任务的失败处理
          if (err) {
            _loggerJs2['default'].info('task', '将于' + _this.options.retry_interval / 1000 + '秒后重新尝试连接服务器');
            setTimeout(function () {
              return next(null);
            }, _this.options.retry_interval);
          } else {
            // 如果没有获取到任务，证明服务器现在还没有待完成的任务，等待
            if (items.length <= 0) {
              _loggerJs2['default'].info('task', '服务器目前没有待处理的项目, 将于' + _this.options.retry_interval / 1000 + '秒后重试');
              setTimeout(function () {
                return next(null);
              }, _this.options.retry_interval);
            } else {
              (function () {
                // 对每个任务执行抓取函数，并将结果提交
                var now = new Date();
                _async2['default'].map(items, _this.crawl.bind(_this), function (err, results) {
                  var stats = {
                    total_time: new Date() - now,
                    memory: {
                      free: _os2['default'].freemem(),
                      usage: _process2['default'].memoryUsage(),
                      total: _os2['default'].totalmem()
                    },
                    loadavg: _os2['default'].loadavg()
                  };
                  // 向服务器提交任务
                  _this.task.submit(results, stats, function (err, response) {
                    if (err) {
                      _loggerJs2['default'].error('submit', err.toString());
                    } else {
                      _loggerJs2['default'].info('submit', response.code, response.msg);
                    }

                    next(null);
                  });
                });
              })();
            }
          }
        });
      });
    }
  }, {
    key: 'crawl',
    value: function crawl(page, cb) {
      setTimeout(this._crawl.bind(this), this.options.wait_interval, page, cb);
    }
  }, {
    key: '_crawl',
    value: function _crawl(page, cb) {
      var _this2 = this;

      if (!page) cb(null, null);
      var loc = page.loc;
      var priority = page.priority;
      var errors = page.errors;

      var now = new Date();
      _requestJs2['default'].get(loc, function (err, res) {
        if (err || !res.ok) {
          var errInfo = {
            code: err.code,
            message: err.msg,
            time: Number(new Date()),
            id: _this2.task.ticket
          };
          page.errors.push(errInfo);
          page.success = false;

          _loggerJs2['default'].error('get', '' + loc + ' ' + err.code + ' ' + err.msg);
          cb(null, page);
        } else {
          (function () {
            var $ = _cheerio2['default'].load(res.text);
            // 提取结果对象
            var props = { loc: loc, priority: priority, errors: errors, success: true };
            // 遍历分析器，把每个分析器返回的结果合并
            analizers.forEach(function (func) {
              var result = func(loc, $);
              _lodash2['default'].merge(props, result);
            });
            props.size = parseInt(res.headers['content-length']);
            props.time_used = new Date() - now;
            _loggerJs2['default'].success('get', '' + loc + ' OK');
            cb(null, props);
          })();
        }
      });
    }
  }]);

  return Spider;
})();

exports['default'] = Spider;
module.exports = exports['default'];
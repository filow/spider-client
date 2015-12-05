'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _agentkeepalive = require('agentkeepalive');

var _agentkeepalive2 = _interopRequireDefault(_agentkeepalive);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var keepaliveAgent = new _agentkeepalive2['default']({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 20000,
  keepAliveTimeout: 30000 // free socket keepalive for 30 seconds
});

var _default = (function () {
  var _class = function _default(server, port) {
    _classCallCheck(this, _class);

    this.ticket = null;
    this.server = server;
    this.port = port;
  };

  _createClass(_class, [{
    key: 'getUrl',
    value: function getUrl(name, params) {
      var base = 'http://' + this.server + ':' + this.port + '/' + name;
      if (params) {
        return base + '?id=' + params.id;
      } else {
        return base;
      }
    }
  }, {
    key: 'get',
    value: function get(cb) {
      var _this = this;

      var url = this.getUrl('tasks', { id: this.ticket });
      _superagent2['default'].get(url).agent(keepaliveAgent).end(function (err, res) {
        if (err) {
          _logger2['default'].error('task', '获取任务失败，请检查网络连接！', err.code);
          cb && cb(err);
        } else {
          var response = res.body;
          switch (response.code) {
            case 500:
              // 服务器错误
              _logger2['default'].error('task', '服务器错误，请检查服务器是否有问题', err);
              break;
            case 401:
              // 如果还没有ticket，那就先注册再试一次
              _this.getId(function (error) {
                if (error) cb(error);else {
                  _this.get(function (err, res) {
                    return cb(err, res);
                  });
                }
              });
              break;
            case 202:
              // 服务器等待
              cb && cb(null, []);
              break;
            default:
              cb && cb(null, response.items);
          }
        }
      });
    }
  }, {
    key: 'submit',
    value: function submit(data, stats, cb) {
      var url = this.getUrl('tasks', { id: this.ticket });
      _superagent2['default'].post(url).send({ data: data, stats: stats }).agent(keepaliveAgent).end(function (err, res) {
        if (err) {
          cb(err);
        } else {
          cb(null, res.body);
        }
      });
    }
  }, {
    key: 'getId',
    value: function getId(cb) {
      var _this2 = this;

      var url = this.getUrl('regist');
      var stats = {
        platform: _os2['default'].platform(),
        release: _os2['default'].release(),
        arch: _process2['default'].arch,
        node_version: _process2['default'].version
      };
      _superagent2['default'].post(url).send(stats).agent(keepaliveAgent).end(function (err, res) {
        if (err) {
          _logger2['default'].error('regist', '注册Worker失败！' + err.toString());
          cb(err);
        } else {
          var response = res.body;

          if (response.code == 202) {
            _logger2['default'].warn('regist', '服务器的Worker数量已满，请等待');
          } else if (response.code == 200) {
            _logger2['default'].success('regist', '已从服务器获得令牌: ' + response.id);
            _this2.ticket = response.id;
            cb.call(_this2);
          } else {
            _logger2['default'].info('regist', '未知响应' + response.code);
          }
        }
      });
    }
  }]);

  return _class;
})();

exports['default'] = _default;
module.exports = exports['default'];
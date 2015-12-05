import request from 'superagent';
import Agent from 'agentkeepalive'
import os from 'os'
import process from 'process'

import logger from './logger'
let keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 20000,
  keepAliveTimeout: 30000 // free socket keepalive for 30 seconds
});


export default class {
  constructor(server, port) {
    this.ticket = null;
    this.server = server;
    this.port = port;
  }
  getUrl(name, params) {
    let base = `http://${this.server}:${this.port}/${name}`
    if (params){
      return base + '?id=' + params.id;
    }else {
      return base;
    }
  }
  get(cb) {
    let url = this.getUrl('tasks', {id: this.ticket})
    request.get(url).agent(keepaliveAgent).end((err, res) => {
      if(err){
        logger.error('task', "获取任务失败，请检查网络连接！", err.code)
        cb && cb(err)
      } else {
        let response = res.body;
        switch (response.code) {
          case 500:
            // 服务器错误
            logger.error('task', "服务器错误，请检查服务器是否有问题", err)
            break;
          case 401:
          // 如果还没有ticket，那就先注册再试一次
            this.getId((error) => {
              if (error) cb(error);
              else {
                this.get((err, res)=> cb(err, res))
              }
            })
            break;
          case 202:
          // 服务器等待
            cb && cb(null, [])
            break;
          default:
            cb && cb(null, response.items)
        }
      }
    })
  }
  submit(data, stats, cb) {
    let url = this.getUrl('tasks', {id: this.ticket})
    request.post(url).send({data, stats}).agent(keepaliveAgent).end((err, res) => {
      if(err) {
        cb(err)
      }else{
        cb(null, res.body)
      }
    })
  }
  getId(cb){
    let url = this.getUrl('regist')
    let stats = {
      platform: os.platform(),
      release: os.release(),
      arch: process.arch,
      node_version: process.version
    }
    request.post(url).send(stats).agent(keepaliveAgent).end((err, res) => {
      if (err) {
        logger.error('regist', "注册Worker失败！" + err.toString())
        cb(err)
      } else {
        let response = res.body

        if (response.code == 202){
          logger.warn('regist', "服务器的Worker数量已满，请等待")
        }else if(response.code == 200){
          logger.success('regist', '已从服务器获得令牌: ' + response.id)
          this.ticket = response.id
          cb.call(this)
        }else {
          logger.info('regist', "未知响应" + response.code)
        }

      }
    })
  }
}
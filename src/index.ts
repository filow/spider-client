// 三方库以及Nodejs自带库
import * as _ from 'lodash'
import * as cheerio from 'cheerio'
/// <reference path="../libs/require-dir.d.ts" />
import {requireDir} from 'require-dir' // 将一个目录下所有的文件都require进来
import * as async from 'async'

import * as os from 'os'

// 功能类库
import Request from './request'
import Connection from './server_connect'
import Logger from './logger'

let logger = new Logger()

interface AnalizerFunc {
  (url: string, $: any): any
}
interface ResultProps {
  loc: string,
  priority: number,
  errors: any[],
  success: boolean,
  text?: string,
  keywords?: string[],
  size?: number,
  time_used?: number
}
interface ErrorsProps {
  code: string,
  message: string,
  time: number,
  id: string
}
// 分析器和过滤器
let analizers:AnalizerFunc[] = []
// 分析器, analizer目录下所有的东西都会包含进来
let analizersInDir = requireDir('./analizers', {camelcase: true})
_.each(analizersInDir, i => analizers.push(i))

export default class Spider{
  private options:any;
  private task:Connection;
  constructor(options) {
    // 合并设置项
    this.options = {
      retry_interval: 5000,
      wait_interval: 0
    }
    _.merge(this.options, options)
    
    this.task = new Connection(this.options.server, this.options.port)
  }
  
  run() {
    // 保持永远执行
    async.forever((next) => {
      // 从服务器获取任务
      this.task.get((err, items) => {
        // 获取任务的失败处理
        if (err) {
          logger.info('task',`将于${this.options.retry_interval / 1000}秒后重新尝试连接服务器`)
          setTimeout(() => next(null), this.options.retry_interval)
        } else {
          // 如果没有获取到任务，证明服务器现在还没有待完成的任务，等待
          if (items.length <= 0) {
            logger.info('task',`服务器目前没有待处理的项目, 将于${this.options.retry_interval / 1000}秒后重试`)
            setTimeout(() => next(null), this.options.retry_interval)
          } else {
            // 对每个任务执行抓取函数，并将结果提交
            let now = Date.now()
            async.map(items, this.crawl.bind(this), (err, results) => {
              let stats = {
                total_time: Date.now() - now,
                memory: {
                  free: os.freemem(),
                  usage: process.memoryUsage(),
                  total: os.totalmem()
                },
                loadavg: os.loadavg()
              }
              // 向服务器提交任务
              this.task.submit(results, stats, (err, response) => {
                if (err) {
                  logger.error("submit", err.toString())
                } else {
                  logger.info('submit', response.code, response.msg)
                }
                
                next(null)
              })
              
            })
            
          }
        }
        
      });

    }, ()=> {})

  }
  
  crawl(page, cb) {
    setTimeout(this._crawl.bind(this), this.options.wait_interval, page, cb)
  }
  _crawl(page, cb) {
    if (!page) cb(null, null)
    let { loc, priority, errors } =  page;
    let now = Date.now()
    Request.get(loc, (err, res) => {
      if (err || !res.ok) {
        let errInfo:ErrorsProps = {
          code: err.code,
          message: err.msg,
          time: Number(new Date()),
          id: this.task.ticket
        }
        page.errors.push(errInfo)
        page.success = false
        
        logger.error('get',`${loc} ${err.code} ${err.msg}`)
        cb(null, page)
      } else {
        let $ = cheerio.load(res.text)
        // 提取结果对象
        let props:ResultProps = {loc, priority, errors, success: true}
        // 遍历分析器，把每个分析器返回的结果合并
        analizers.forEach((func) => {
          let result = func(loc, $)
          _.merge(props, result)
        })
        props.size = parseInt(res.headers['content-length']);
        props.time_used = Date.now() - now;
        logger.success('get', `${loc} OK`)
        cb(null, props);
      }
    })
  }
  
}

import * as request from 'superagent';

let ua = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36",
  "BaiduSpider",
  "Slurp",
  "Sosospider",
  "GoogleSpider"
]

function getUa() {
  return ua[Math.floor( Math.random()*ua.length )]
}

let cookie = 'bid="a1XtmIF1DfY"; ll="118159"; ps=y; _ga=GA1.2.492829492.1422013591; gr_user_id=0ef1aab4-1b43-4e9c-8f39-706e5441c4d4; ap=1; ct=y; viewed="1462542_1461232_26613061_26599256_1049404_26613908_26647337_19976793_26027630_26297606"; gr_session_id=a5cc460d-5b53-4c81-92be-79dfe1b7ac2f; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1449319024%2C%22http%3A%2F%2Fbook.douban.com%2Fsubject%2F1461232%2F%22%5D; __utmt=1; _pk_id.100001.8cb4=94d4d28e0403a508.1422013588.35.1449319028.1449240315.; _pk_ses.100001.8cb4=*; regpop=1; __utma=30149280.492829492.1422013591.1449240060.1449318216.56; __utmb=30149280.3.10.1449318216; __utmc=30149280; __utmz=30149280.1449113352.54.34.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)'


class Request {
  static get(url, callback) {
    request.get(url)
      .set('Accept-Encoding', 'gzip, deflate')
      .set('User-Agent', getUa())
      .timeout(10000)
      .set('Referer', 'http://www.douban.com/')
      // .set('cookie', cookie)
      .redirects(0)
      .set('Connection', 'keep-alive')
      .end((err, res) => {
        // 如果发生了错误
        if (err) {
          if (err.status) {
            // 4xx或者5xx问题
            let type = err.status / 100 | 0
            let errMsg
            if (type == 4) {
              errMsg = "请求失败"
            } else if (type == 5) {
              errMsg = "服务器错误"
            } else if (type == 3) {
              errMsg = "跳转"
            } else {
              errMsg = "未知错误"
            }
            callback({code: err.status, msg: errMsg})
          } else {
            // 网络问题，超时以及其他错误
            callback({code: err.status, msg: '网络超时或故障'})
          }
        } else {
          callback(null, res)
        }
      });
  }


}

export default Request

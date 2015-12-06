import {spaceTrim} from '../util.js';

export default function (url, $){
  // 检验该网页是否为本分析器适用
  if (/cn.engadget.com(\/\d+){3}/.test(url)){
    let description = [];
    $('.post-body style').remove()
    $('.post-body script').remove()
    description.push( $('.post-body').text() );
    
    let keywords = $('aside.meta-tags a').map(function (i,e){return $(e).text()}).get()
    return {text: description.map((text) => spaceTrim(text)).join(' '), keywords}
  }else{
    return {}
  }

}



const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
// 节流
const throttle = function(func, wait){
  let timeout
  return function(){
      let args = arguments
      let context = this
      if(!timeout){
          timeout = setTimeout(()=>{
              func.apply(context, args)
              timeout = null
          }, wait)
      }
  }
}
// 防抖(非立即执行)
const debounce = function(func, wait){
  let timeout
  return function(){
      // 防抖函数的代码使用这两行代码来获取 this 和 参数，是为了让 debounce 函数最终返回的函数 this 指向不变以及依旧能接受到 e 参数。
      let context = this
      let args = arguments
      if(timeout) clearTimeout(timeout)
      timeout = setTimeout(()=>{
          func.apply(context, args)
      }, wait)
  }
}
/*bufferArray转为16进制*/
const buf2hex = function(buffer){    // buffer is an ArrayBuffer
  console.log(buffer)
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
/*计算校验字节(求和校验)并返回*/
const calculate = function(str){
  if(str.length % 2 == 1) {
    throw 'str err'
  }
  let len = str.length
  let ret = 0
  for(let i = 0; i < len/2; i++){
    ret += parseInt(str.substr(i*2, 2), 16)
  }
  ret = ret%128
  ret = ret.toString(16)
  if(ret.length == 1) ret = "0".concat(ret)
  if(ret.length == 0) ret = "00"
  return ret.toString(16)
}
/*计算校验字节(求和校验)并生成帧*/
const calculateCheckByte = function(str, frameEnd = 'C5'){
  if(str.length % 2 == 1) {
    throw 'str err'
  }
  let len = str.length
  let ret = 0
  for(let i = 0; i < len/2; i++){
    ret += parseInt(str.substr(i*2, 2), 16)
  }
  ret = ret%128
  ret = ret.toString(16)
  if(ret.length == 1) ret = "0".concat(ret)
  if(ret.length == 0) ret = "00"
  return str+ret.toString(16)+frameEnd
}
const hexStringToArrayBuffer = function(str){
  if (!str) {
      return new ArrayBuffer(0);
  }
  var buffer = new ArrayBuffer(str.length/2);
  let dataView = new DataView(buffer)
  let ind = 0;
  for (var i = 0, len = str.length; i < len; i += 2) {
      let code = parseInt(str.substr(i, 2), 16)
      dataView.setUint8(ind, code)
      ind++
  }
  return buffer;
}
const buf2string = function(buffer) {
  var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
  return arr.map((char, i) => {
      return String.fromCharCode(char);
  }).join('');
}
// 对16进制数据作矫正，返回十进制数
const correctData = function(str){
  let ret = parseInt(str, 16)
  if(ret >= 16777216){
    ret = Math.floor(ret/16777216)*8388608+ret%16777216
  }
  if(ret>=65536){
    ret = Math.floor(ret/65536)*32768+ret%65536
  }
  if(ret>=256){
    ret = Math.floor(ret/256)*128+ret%128
  }
  return ret
}
// correctData的逆操作，返回符合规范的十六进制数(字符串)
const inCorrectData = function(num, len){
  let ret = num
  if(ret >= 128){
    ret = Math.floor(ret/128)*256+ret%128
  }
  if(ret >= 32768){
    ret = Math.floor(ret/32768)*65536+ret%32768
  }
  if(ret >= 8388608){
    ret = Math.floor(ret/8388608)*16777216+ret%8388608
  }
  return complement(ret.toString(16), len)
}
// 对n进制数字符串，在前面用0补位
const complement = function(str, len){
  let i = len-str.length
  if(i < 0) throw("len is not valid")
  while(i > 0){
    str = "0".concat(str)
    i--
  }
  return str
}
//解读响应帧内容，返回数据
const parseRes = function(res){
  var command =  res.slice(2, 4)
  var ret = {
    commamd: command
  }
  switch (command) {
    case cl.GET_RECORD_NUM_RES:
      let totalnum = res.slice(4, 12)
      totalnum = correctData(totalnum)
      let warndata = {}
      warndata.degree = correctData(res.slice(24,28))
      warndata.totaltime = correctData(res.slice(28,32))
      warndata.checktime = correctData(res.slice(32,36))
      warndata.init_x = correctData(res.slice(12,16))
      warndata.init_y = correctData(res.slice(16,20))
      warndata.init_z = correctData(res.slice(20,24))
      ret.totalnum = totalnum
      ret.warndata = warndata
      ret.state = correctData(res.slice(36,38))
      break;
    case cl.TRANSMIT_DATA_RES:
      ret.startnum = correctData(res.slice(4, 12))
      ret.time = {
        year: correctData(res.slice(12, 14)),
        mouth: correctData(res.slice(14, 16)),
        day: correctData(res.slice(16, 18)),
        hour: correctData(res.slice(18, 20)),
        minute: correctData(res.slice(20, 22)),
        second: correctData(res.slice(22, 24)),
      }
      let content = res.slice(24, res.length-4)
      content = content.match(/\w{12}/g)
      ret.list = content.map((i)=>{
        let temp = i.match(/\w{4}/g)
        return {
          x: correctData(temp[0]),
          y: correctData(temp[1]),
          z: correctData(temp[2])
        }
      })
      
      break
  }
  return ret
}

export {
  formatTime,
  throttle,
  debounce,
  buf2hex,
  calculateCheckByte,
  hexStringToArrayBuffer,
  parseRes
}

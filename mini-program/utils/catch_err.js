import http from './http';

/**
 * @description 将时间戳格式转换为MySQL支持的时间格式
 * @param {timestamp} string - 原始的时间戳
 * @return { time } Date - MySQL支持的时间格式
 * @version 1.4.2
 * @author zixian Zhu(hiddensharp)
 */
function formatTimestampForMySQL(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  const time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return time;
}



/**
 * @description 发送错误信息到服务器的函数
 * @param {error} object - 具体的报错信息
 * @version 1.4.2
 * @author zixian Zhu(hiddensharp)
 */
function sendErrorToServer(error) {
  // 格式化时间戳为 MySQL 所需的格式
  const formattedTimestamp = formatTimestampForMySQL(new Date().toISOString());

  // 发送错误信息到服务器
  http.post('/patient/user/log-error', {
    error: error,
    timestamp: formattedTimestamp
  })
    .then(res => {
      console.log('Error logged successfully:', res.data);
    })
    .catch(err => {
      console.error('Failed to log error:', err);
    })
}

export default sendErrorToServer;

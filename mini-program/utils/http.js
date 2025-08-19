const baseURL = "http://localhost:8000"
// const baseURL = "https://ylsh.top:8002"
// const baseURL = "https://172.16.69.60:8002"
const ylqm_admin_baseURL = "https://ylsh.top/ylqm_admin/public"

const post = function (path, data = {}) {
  let url = path.match(/^https?:\/\//) ? path : baseURL + path
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'post',
      data: {
        ...data,
        userid: wx.getStorageSync('userid'),
        // openid: wx.getStorageSync('openid'),
        // session_key: wx.getStorageSync('session_key'),
        device_id: 1,
      },
      success(e) {
        resolve(e)
      },
      fail(e) {
        reject(e)
      }
    })
  })
}
const get = function (path, data = {}) {
  let url = path.match(/^https?:\/\//) ? path : baseURL + path
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'get',
      data: {
        ...data,
        userid: wx.getStorageSync('userid'),
        openid: wx.getStorageSync('openid'),
        session_key: wx.getStorageSync('session_key'),
        device_id: 1,
      },
      success(e) {
        resolve(e)
      },
      fail(e) {
        reject(e)
      }
    })
  })
}
const patch = function (path, data = {}) {
  let url = path.match(/^https?:\/\//) ? path : baseURL + path
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'patch',
      data: {
        ...data,
        userid: wx.getStorageSync('userid'),
        openid: wx.getStorageSync('openid'),
        session_key: wx.getStorageSync('session_key'),
        device_id: 1,
      },
      success(e) {
        resolve(e)
      },
      fail(e) {
        reject(e)
      }
    })
  })
}

const upload = function (filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      filePath,
      name: 'file',
      url: ylqm_admin_baseURL + '/api/common/upload',
      success(e) {
        resolve(e)
      },
      fail(e) {
        reject(e)
      }
    })
  })
}
module.exports = {
  post,
  get,
  patch,
  upload,
  ylqm_admin_baseURL
}
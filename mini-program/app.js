import http from './utils/http'
import { useDegreeContext, useAppLunch } from '/core/degree/index'

App({
  globalData: {
    topheight: 60,
    deviceid222: "",
    deviceName: "",
    degreeContextData: null,
    uploadProgressIsShow: false,
    uploadProgressStep: 0,
    uploadRecordTotalNum: 0,
    uploadRecordIndex: 0,
    recordTotalNum: null,
  },
  onLaunch: function () {
    // wx.setKeepScreenOn({
    //   keepScreenOn: true
    // })

    wx.request({
      url: 'https://wechat.stu.edu.cn',
      success(e) {
        console.log(e)
      },
      fail(e) {
        console.log(e)
      }
    })
    wx.getSystemInfo({
      success: (result) => {
        // console.log(result)
        this.globalData.topheight = result.statusBarHeight + 48
      },
    })
    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          http.post('/patient/user/login', { code: res.code })
            .then(e => {
              console.log(e)
              wx.setStorageSync('userid', e.data.data.id)
              wx.setStorageSync('openid', e.data.data.openid)
              wx.setStorageSync('session_key', e.data.data.session_key)
            })
        }
      }
    })
  }
})

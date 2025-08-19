const http = require('../../utils/http')
// pages/personal/personal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    edit_mode: "",
    edit_data: "",
    editing_value: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getInfo: function () {
    http.get(`/patient/user/info`)
    .then(e=>{
      if(e.data && e.data.code == 1){
        this.setData({
          info: e.data.data
        })
      }else{
        reject(e)
      }
    })
    .catch(e=>{
      console.log(e)
    })
  },
  onShow: function () {
    this.getInfo()
  },
  getUserProfile(){
    wx.getUserProfile({
      desc: '为了更好的使用体验',
    })
    .then(e=>{
      const data = e
      const {nickName, avatarUrl} = data.userInfo
      return http.post('/patient/user/edit_info', {
        info: {
          nickname: nickName,
          avatar: avatarUrl
        }
      })
    })
    .then(e=>{
      console.log(e)
    })
    .catch(e=>{
      console.log(e)
    })
    .finally(e=>{
      this.getInfo()
    })
  },
  press_edit(e){
    const key = e.currentTarget.dataset.key
    this.setData({
      edit_mode: key,
      editing_value: this.data.info[key]
    })
  },
  press_save(e){
    const key = e.currentTarget.dataset.key
    const value = this.data.editing_value
    if(value.length == 0){
      wx.showModal({
        content: "输入不能为空",
        showCancel: false
      })
      return
    }
    if(key == "phone" && value.length != 11){
      wx.showModal({
        content: "手机号格式错误",
        showCancel: false
      })
      return
    }
    wx.showLoading({})
    http.post('/patient/user/edit_info', {
      info: {
        [key]: value
      }
    })
    .then(e=>{
      console.log(e)
    })
    .catch(e=>{
      console.log(e)
    })
    .finally(e=>{
      this.setData({
        edit_mode: "",
        editing_value: ""
      })
      this.getInfo()
      wx.hideLoading({})
    })
  },
  on_edit(e){
    const value = e.detail.value
    this.data.editing_value = value
  },
  press_cancel(e){
    this.setData({
      edit_mode: "",
      editing_value: ""
    })
  },
  // upload_dialog(){
  //   wx.chooseMedia({
  //     count: 1,
  //     mediaType: ['image'],
  //     sourceType: ['album', 'camera']
  //   })
  //   .then(e=>{
  //     wx.showLoading({})
  //     const imgTempPath = e.tempFiles[0].tempFilePath
  //     return http.upload(imgTempPath)
  //   })
  //   .then(e=>{
  //     const data = JSON.parse(e.data)
  //     console.log(data)
  //     let dialog_src
  //     if(data.code == 1){
  //       dialog_src = http.ylqm_admin_baseURL + data.data.url
  //       return dialog_src
  //     }else{
  //       return Promise.reject()
  //     }
  //   })
  //   .then(e=>{
  //     return http.post('/patient/user/edit_info', {
  //       info: {
  //         dialog: e
  //       }
  //     })
  //   })
  //   .then(e=>{
  //     console.log(e)
  //   })
  //   .catch(e=>{
  //     console.log(e)
  //   })
  //   .finally(e=>{
  //     wx.hideLoading({})
  //     this.getInfo()
  //   })
  // },
  previewImage(e){
    console.log(e)
    const url = e.currentTarget.dataset.src
    wx.previewImage({
      urls: [url],
    })

  }
})
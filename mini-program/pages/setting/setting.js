const {
  get
} = require("../../utils/http");
import { useDegreeContext, degreeContext as dC } from '../../core/degree/index'
const degreeContext = useDegreeContext()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    app: getApp(),
    angle: [10, 20, 30, 40, 50, 60, 70, 80, 60, 100],
    time: [],
    timeData: {},
    topheight: 60,
    degreeContext,
    angle_index: 0,
    // time_index: 0,
  },
  ...degreeContext.methods,
  // 跳转用户界面
  gotome() {
    // wx.navigateTo({
    // 	url: '/pages/me/me',
    // })
  },

  // 获得角度
  getangle() {
    var angle;
    for (i = 0; i < 300; i++) {
      if (i % 10 == 0) {
        angle = i;
      }
    }
    console.log(angle)
    this.data({
      angle: angle
    })
  },
  // 得到选择器的值
  getCurrent(e) {
    console.log(e.detail)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      topheight: this.data.app.globalData.topheight
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const app = getApp()
    this.setData({
      "degreeContext.data": app.globalData.degreeContextData
    })
    let angle = app.globalData.degreeContextData.nowinfo.warndata && app.globalData.degreeContextData.nowinfo.warndata.degree / 10
    let time_list = app.globalData.degreeContextData.time_list
    console.log("time_list", time_list)
    for (let i = 0; i < time_list.length; i++) {
      if (time_list[i] == angle) {
        this.setData({
          angle_index: i
        })
        break
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    let app = getApp()
    if (app) {
      console.log("setting页面onHide，app发生改变");
      console.log("before", app);
      app.globalData.degreeContextData = this.data.degreeContext.data;
      console.log("after", app);
    }

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("setting页面unload");
    const app = getApp()
    app.globalData.degreeContextData = this.data.degreeContext.data
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
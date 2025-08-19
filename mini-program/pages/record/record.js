// pages/index/index.js
import * as echarts from '../../ec-canvas/echarts'; // 引入图表
const http = require('../../utils/http')
import {
  formatTime
} from '../../utils/util'
import {
  setHoursChartOption,
  setStatisticsChartOption,
  preDealWithDetail
} from '../../core/chart/index'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    lazyEc: {
      lazyLoad: true
    },
    lazyEc2: {
      lazyLoad: true
    },
    recordList: [],
    list_expand: false,
    newRemark: '',
  },
  changeListExpand() {
    this.setData({
      list_expand: !this.data.list_expand
    })
  },
  // 得到列表数据
  getListData() {
    return http.post('/doctor/record/recordlist', {
      patientid: wx.getStorageSync('userid')
    })
      .then(e => {
        if (e.data) {
          e.data.forEach(i => {
            i.timetoshow = formatTime(new Date(i.starttime))
          })
          this.setData({
            recordList: e.data
          })
        }
      })
  },
  getDetailData(id) {
    wx.showLoading({
      title: '读取中',
      mask: true
    })
    return http.post('/doctor/record/recorddetail', {
      recordid: id
    })
      .then(e => {
        wx.hideLoading({})
        if (e.data) {
          preDealWithDetail(e.data)
          console.log(e.data)
          return e.data
        }
      })
  },
  onTapRecordItem(e) {
    console.log(e.currentTarget.dataset.id)
    let id = e.currentTarget.dataset.id
    let clickedIndex = this.data.recordList.findIndex(item => item.id === id)
    console.log("Clicked index:", clickedIndex);
    this.getDetailData(id)
      .then(e => {
        this.updateChart(e)
        this.setData({
          index: clickedIndex
        })
      })
  },
  // 输入新备注
  remarkInput(e) {
    this.setData({
      newRemark: e.detail.value
    })
  },
  // 更新新备注
  rewriteRemark() {
    return http.patch('/doctor/record/recorddetail', {
      recordid: this.data.recordList[this.data.index].id,
      remark: this.data.newRemark
    })
      .then(e => {
        console.log(e.data.message)
        this.getListData()
      })
  },
  // 跳转用户界面
  gotome() {
    // wx.navigateTo({
    // 	url: '/pages/me/me',
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //获取组件
    this.hoursChartComponent = this.selectComponent('#lazy-mychart-dom')
    this.statisticsChartComponent = this.selectComponent('#lazy-mychart-dom2')
    this.getListData()
      .then(e => {
        let first = this.data.recordList[0]
        return this.getDetailData(first.id)
      })
      .then(e => {
        this.initChart(e)
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    //获取组件
    this.hoursChartComponent = this.selectComponent('#lazy-mychart-dom')
    this.statisticsChartComponent = this.selectComponent('#lazy-mychart-dom2')
    this.getListData()
      .then(e => {
        let first = this.data.recordList[0]
        return this.getDetailData(first.id)
      })
      .then(e => {
        this.initChart(e)
      })
  },
  // 初始化图表
  initChart(data) {
    this.hoursChartComponent.init((canvas, width, height, dpr) => {
      let chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      setHoursChartOption(chart, data)
      this.hoursChart = chart //将图标实例化到this上，方便调用
      return chart
    }),
      this.statisticsChartComponent.init((canvas, width, height, dpr) => {
        let chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        })
        setStatisticsChartOption(chart, data)
        this.statisticsChart = chart //将图标实例化到this上，方便调用
        return chart
      })
  },
  updateChart(data) {
    setHoursChartOption(this.hoursChart, data)
    setStatisticsChartOption(this.statisticsChart, data)
  }
})
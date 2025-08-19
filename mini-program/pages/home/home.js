import {
  useDegreeContext,
  degreeContext as dC,
  createDegreeContext
} from '../../core/degree/index'

import sendErrorToServer from '../../utils/catch_err';

// pages/home/home.js
const degreeContext = useDegreeContext()
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices: [],
    running: false,
    ishow: false,
    message: [],
    orderContainerIsShow: false, // 是否展现发送命令帧的盒子
    specialOrder: 'AA0200000000000000000000', // 特殊帧的具体帧内容
    uploadProgressIsShow: app.globalData.uploadProgressIsShow,
    uploadProgressStep: app.globalData.uploadProgressStep,
    uploadRecordTotalNum: app.globalData.uploadRecordTotalNum,
    uploadRecordIndex: app.globalData.uploadRecordIndex,
    recordTotalNum: app.globalData.recordTotalNum,
    timerId: null,//监测器中的计时器id
    degreeContext
  },
  ...degreeContext.methods,

  // 跳转用户界面
  gotome() {
  },
  setdata(e) {
    const device = e.currentTarget.dataset.device;
    const name = e.currentTarget.dataset.name;
    
    // Simulate connecting to device
    wx.showLoading({
      title: '正在连接...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '连接成功',
        icon: 'success'
      });
      
      // Update global data and state
      getApp().globalData.deviceid222 = device.deviceId;
      getApp().globalData.deviceName = name;
      
      this.setData({
        ishow: false,
        'degreeContext.data.deviceId': device.deviceId,
        'degreeContext.data.deviceName': name,
        'degreeContext.data.bleopen': true
      });
    }, 1500);
  },
  simulateDataUpload() {
    const app = getApp();
    app.globalData.uploadProgressIsShow = true;
    app.globalData.uploadProgressStep = 0;
    app.globalData.uploadRecordTotalNum = 10; // Mock 10 records
    app.globalData.uploadRecordIndex = 0;
    
    this.startAppMonitor(); // Start monitoring global variables
    
    // Simulate progress updates
    const interval = setInterval(() => {
      if (app.globalData.uploadProgressStep >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          app.globalData.uploadProgressIsShow = false;
          wx.showToast({
            title: '上传完成',
            icon: 'success'
          });
        }, 1000);
        return;
      }
      
      app.globalData.uploadProgressStep += 10;
      app.globalData.uploadRecordIndex += 1;
    }, 800);

    this.setData({
      "degreeContext.data.recording": false,
      "degreeContext.data.recording_stop": false
    })
  },
  /**
   * @description 显示命令盒子
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  orderContainerShow() {
    console.log("success");
    if (this.data.degreeContext.data.deviceId) {
      this.setData({
        orderContainerIsShow: true
      })
    }
    else {
      console.log("connect to device first!")
      return
    }

  },
  /**
   * @description 隐藏命令盒子
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  orderContainerClose() {
    this.setData({
      orderContainerIsShow: false
    })
  },
  /**
   * @description 发送特殊命令帧
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  sendSpecialOrder() {
    console.log(this.data.specialOrder)
    this.setData({
      orderContainerIsShow: false
    })
    return this.sendData(null, this.data.specialOrder);
  },
  /**
   * @description 执行修复功能1并隐藏发送命令帧盒子
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  executeFixFuction1() {
    this.setData({
      orderContainerIsShow: false
    });
    this.fixFuction1();
  },
  /**
   * @description 开始监测全局变量中是否有改变
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  startAppMonitor() {
    const monitor = () => {
      // console.log("监视全局变量", app);
      if (app.globalData.uploadProgressIsShow !== this.data.uploadProgressIsShow) {
        console.log('uploadProgressIsShow has changed');
        this.setData({ uploadProgressIsShow: app.globalData.uploadProgressIsShow });
      }
      if (app.globalData.uploadProgressStep !== this.data.uploadProgressStep) {
        console.log('uploadProgressStep has changed');
        this.setData({ uploadProgressStep: app.globalData.uploadProgressStep });
      }
      if (app.globalData.uploadRecordTotalNum !== this.data.uploadRecordTotalNum) {
        console.log('uploadRecordTotalNum has changed');
        this.setData({ uploadRecordTotalNum: app.globalData.uploadRecordTotalNum });
      }
      if (app.globalData.uploadRecordIndex !== this.data.uploadRecordIndex) {
        console.log('uploadRecordIndex has changed');
        this.setData({ uploadRecordIndex: app.globalData.uploadRecordIndex });
      }
      if (app.globalData.recordTotalNum !== this.data.recordTotalNum) {
        console.log('recordTotalNum has changed');
        this.setData({ recordTotalNum: app.globalData.recordTotalNum });
      }
      this.data.timerId = setTimeout(monitor, 1000);
    };
    this.data.timerId = setTimeout(monitor, 500);
  },
  /**
 * @description 结束监测全局变量中是否有改变
 * @version 1.4.3
 * @author zixian Zhu(hiddensharp)
 */
  stopAppMonitor() {
    clearInterval(this.data.timerId)
  },
  showblue() {
    this.setData({
      ishow: true
    });
    
    // Mock device discovery after 1 second
    setTimeout(() => {
      this.setData({
        devices: [
          { name: "JDY 19", deviceId: "mock-id-1" },
          { name: "IPONE", deviceId: "mock-id-2" },
        ]
      });
    }, 1000);
  },
  // 第二步 开始搜索附近的蓝牙设备
  startBluetoothDevicesDiscovery() {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: (res) => {
        console.log('开始搜索附近的蓝牙设备', res)
        this.onBluetoothDeviceFound()
      },
      fail: (err) => {
        console.error('开始搜索附近的蓝牙设备失败', err)
      }
    })
  },
  // 第三步 监听发现附近的蓝牙设备
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        // 过滤掉没有名称的设备以及"Unknown"或"Unsupported Device"设备
        const name = device.name || device.localName || '';
        const lowerName = name.toLowerCase();
        
        // 检查设备名称是否为空或包含"unknown"或"unsupported"等关键字
        if (!name || 
            lowerName.includes('unknown') || 
            lowerName.includes('unsupported') ||
            lowerName.includes('unsupoorted') ||
            lowerName === 'null' ||
            lowerName === 'undefined') {
          console.log("过滤掉不支持的设备:", device);
          return;
        }
        
        // 检查设备是否已经在列表中
        const isDuplicate = this.data.devices.some(existingDevice => 
          existingDevice.deviceId === device.deviceId
        );
        
        if (!isDuplicate) {
          console.log("发现的蓝牙设备", device);
          this.data.devices.push(device);
          this.setData({
            devices: this.data.devices
          });
        }
      });
    });
  },
  // 第五步、 停止搜索
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log('停止搜索成功');
      },
      fail: function (res) {
        console.log('停止搜索失败');
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("onLoad!!!");
    var app = getApp()
    createDegreeContext.call(app)
    this.startAppMonitor()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("onShow!!");
    const app = getApp();
    console.log("app", app);
    this.setData({
      "degreeContext.data": app.globalData.degreeContextData
    })
    // this.startAppMonitor();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    const app = getApp()
    app.globalData.degreeContextData = this.data.degreeContext.data
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopAppMonitor();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
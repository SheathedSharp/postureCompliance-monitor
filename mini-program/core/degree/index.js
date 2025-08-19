import { postRecord } from './url'
import { buf2hex, calculateCheckByte, hexStringToArrayBuffer, parseRes, stringifyReq, validRes } from 'util'
import * as cl from "./command"
import sendErrorToServer from '../../utils/catch_err';

const lifeCricle = [
  "onLoad"
]
const http = require('../../utils/http')

var deviceId = ""//D298029D-4D0D-7789-817B-288E09EAB3CC

console.log("设备码：" + deviceId)

export const degreeContext = {
  data: {
    setwarndata_show: false,
    listjson: '',
    deviceId,
    deviceName: '',
    services: '',
    lastrecord: {
      startnum: -1,
      starttime: -1,
      stopdetail: [],
      warndata: {
        init_x: -1,
        init_y: -1,
        init_z: -1,
        checktime: -1,
        totaltime: -1,
        degree: -1
      }
    },
    warndata: {
      degree: 0,
      totaltime: 0,
      checktime: 0
    },
    init_xyz: false,
    bleopen: false,
    characteristicValue: "",
    cvList: [],
    nowinfo: {},
    recording: false,
    recording_stop: false,
    degree_list: Array(10).fill(0).map((i, index) => 5 * (index + 1)),
    time_list: Array(10).fill(0).map((i, index) => 5 * (index + 1))
  },
  blechange(event) {
    console.log("蓝牙连接情况", event.currentTarget.dataset.bleopen)
    let bleopen = event.currentTarget.dataset.bleopen
    if (!bleopen) {
      console.log(`蓝牙设备的deviceId: ${this.data.degreeContext.data.deviceId}`)
      let connect = wx.showLoading({
        title: '连接中...',
        mask: true
      })
        .then((e) => {
          //打开蓝牙
          return wx.openBluetoothAdapter({})
        })
        .then((e) => {
          if (e && (e.errno != 0 && e.errno != -1)) return Promise.reject(e)
          this.setData({ "degreeContext.data.bleopen": !bleopen })

          //连接蓝牙设备
          return wx.createBLEConnection({
            deviceId: this.data.degreeContext.data.deviceId
          })
        })
        .then((e) => {
          if (e && (e.errno != 0 && e.errno != -1)) return Promise.reject(e)
          //获取服务值
          return wx.getBLEDeviceServices({
            deviceId: this.data.degreeContext.data.deviceId
          })
        })
        .then((e) => {
          if (e && (e.errno != 0 && e.errno != -1)) return Promise.reject(e)
          this.data.degreeContext.data.services = e.services
          //获取特征值
          return wx.getBLEDeviceCharacteristics({
            deviceId: this.data.degreeContext.data.deviceId,
            serviceId: e.services[0].uuid
          })
        })
        .then((e) => {
          if (e && (e.errno != 0 && e.errno != -1)) return Promise.reject(e)
          this.data.degreeContext.data.characteristics = e.characteristics
        })
        .then((e) => {
          //启用蓝牙低功耗设备特征值变化时的 notify 功能
          return wx.notifyBLECharacteristicValueChange({
            characteristicId: this.data.degreeContext.data.characteristics[0].uuid,
            deviceId: this.data.degreeContext.data.deviceId,
            serviceId: this.data.degreeContext.data.services[0].uuid,
            state: true,
          })
        })
        .then((e) => {
          if (e && (e.errno != 0 && e.errno != -1)) return Promise.reject(e)
          //监听蓝牙低功耗设备的特征值变化事件
          return wx.onBLECharacteristicValueChange((res) => {
            let hex = buf2hex(res.value)
            console.log(hex)
            this.data.degreeContext.data.characteristicValue = 
            this.data.degreeContext.data.characteristicValue.concat(hex)
          })
        })
        .then(() => {
          return this.getRecordNum()
        })
        .then((e) => {
          wx.hideLoading({}).then((e) => { console.log(e) }, (e) => { console.log(e) })
          let app = getApp();
          if (app) {
            app.globalData.recordTotalNum = e.totalnum; // 获取当前设备内的记录条数
          }
        })
        .then((e) => {  //获取当前检测仪的状态
          this.recoverAll()
          // let deviceId = this.degreeContext.deviceId
          // return http.post('/patient/user/bluetooth-conn', { deviceId })
        })
        .catch((reason) => {
          wx.showToast({
            title: '连接失败2',
            duration: 3000,
            icon: "loading"
          })
          console.log("reason", reason)
          this.setData({ "degreeContext.data.bleopen": false })
          wx.closeBluetoothAdapter({}).then((e) => { console.log(e) }, (e) => { console.log(e) })
        })

    } else {
      this.setData({ "degreeContext.data.bleopen": false })
      wx.closeBluetoothAdapter({})
        .then((e) => { console.log(e); this.setData({ "degreeContext.data.bleopen": false }) }, (e) => { console.log(e); this.setData({ "degreeContext.data.bleopen": true }) })
    }
  },
  sendData(event, operation) {
    this.data.degreeContext.data.characteristicValue = ""
    var opt = operation || event.target.dataset.operation
    opt = calculateCheckByte(opt, 'C5')
    console.log('opt', opt);
    var databuffer = hexStringToArrayBuffer(opt)
    console.log('发送数据databuffer: ', databuffer)
    var that = this
    // console.log("0", new Date().getTime())
    return wx.writeBLECharacteristicValue({
      deviceId: that.data.degreeContext.data.deviceId,
      serviceId: that.data.degreeContext.data.services[0].uuid,
      characteristicId: that.data.degreeContext.data.characteristics[0].uuid,
      value: databuffer
    })
      .then((e) => {
        console.log("完成writeBLECharacteristicValue操作", e);
        return new Promise((resolve, reject) => {
          let tag = 1
          let timeout = setTimeout(() => { tag = 0 }, 8000)
          let interval = setInterval(() => {
            console.log(opt, this.data.degreeContext.data.characteristicValue)
            if (tag == 0 || validRes(opt, this.data.degreeContext.data.characteristicValue)) {
              console.log("validRes", validRes(opt, this.data.degreeContext.data.characteristicValue))
              clearTimeout(timeout)
              clearInterval(interval)
              // console.log("tag", tag)
              resolve(tag)  //tag为0表示超时， 为1表示获取响应成功
            }
          }, 200)
        })
      }, () => {
        console.log("发送失败，请重新连接！")
      })
  },
  change_setwarndata_show(e) {
    // console.log(e)
    if (!this.validBle()) return
    this.setData({
      "degreeContext.data.setwarndata_show": e.currentTarget.dataset.option
    })
  },
  async getRecordNum() {
    console.log("getRecordNum fuction start")
    try {
      this.data.degreeContext.data.characteristicValue = "";
      let e = await this.sendData({}, "AA070000");
      if (!e) { // 若超时，最多尝试5次
        let tag = 0;
        for (let i = 0; i < 5; i++) {
          if (tag = await this.sendData({}, "AA070000")) break;
        }
        if (tag == 0) {
          throw new Error("timeout");
        }
      }
      // console.log("AA070000 order send successful, check characteristicValue", this.data.degreeContext.data.characteristicValue);
      let res = parseRes(this.data.degreeContext.data.characteristicValue);
      console.log("result after parseRes", res);
      this.setData({
        'degreeContext.data.warndata': res.warndata,
        'degreeContext.data.nowinfo': res,
        'degreeContext.data.degreeInputValue': res.warndata.degree / 10
      });
      // let app = getApp();
      // if (app) {
      //   app.globalData.uploadProgressStep = 1; // 下一个阶段
      //   app.globalData.uploadRecordTotalNum = res.totalnum; // 收取记录总条数
      // }
      return res;
    } catch (error) {
      console.error("Error in getRecordNum:", error);
      sendErrorToServer(error);
      throw error;
    }
  },
  async getRecordDetail(event, start = 0, length = 20) {
    try {
      this.data.degreeContext.data.characteristicValue = "";
      let e = await this.sendData({}, stringifyReq(cl.TRANSMIT_DATA_REQ, { start, length }));
      if (!e) { // 若超时，最多尝试5次
        let errInfo1 = `在请求第${start}条数据的时候发生超时`;
        sendErrorToServer(errInfo1);
        let tag = 0;
        for (let i = 0; i < 5; i++) {
          if (tag = await this.sendData({}, stringifyReq(cl.TRANSMIT_DATA_REQ, { start, length }))) break;
        }
        if (tag == 0) {
          let errInfo2 = `获取第${start}条记录失败！！`;
          sendErrorToServer(errInfo2);
          throw new Error("获取记录失败，请重试");
        }
      }
    } catch (error) {
      console.error("Error in getRecordDetail:", error);
      sendErrorToServer(error);
      throw error;
    }
  },
  async getAllRecordDetail(event, start = 0) {
    try {
      let res = await this.getRecordNum();
      let app = getApp();
      if (res.totalnum) { // 蓝牙设备里面存有数据
        if (app) {
          app.globalData.uploadProgressStep = 1; // 下一个阶段
          app.globalData.uploadRecordTotalNum = res.totalnum; // 收取记录总条数
        }
        await this.sleep(1000);        // 让出控制权1s

        let piece = res.totalnum / 20; // 20条记录为一块
        this.data.degreeContext.data.cvList = [];
        // 隐藏 tabbar
        wx.hideTabBar({
          animation: true, // 是否需要动画效果
        });

        for (let i = start; i < res.totalnum; i += 20) {
          await this.getRecordDetail(null, i, res.totalnum - i >= 20 ? 20 : res.totalnum - i);
          this.data.degreeContext.data.cvList.push(this.data.degreeContext.data.characteristicValue);
          if (res.totalnum - i > 20) { // i后面还有至少20条数据
            if (piece > 100) { // 块的个数大于100，即大于2000条数据
              if (i % 100 == 0) {// i每100记录一次
                app.globalData.uploadRecordIndex = i; // 当前已收取的记录条数
                // 让出控制权1s
                await this.sleep(1000)
              }
            }
            else { // 块的个数小于100，即小于2000条数据
              app.globalData.uploadRecordIndex = i; // 当前已收取的记录条数
              // 让出控制权0.5s
              await this.sleep(500);
            }
          }
          else {
            app.globalData.uploadRecordIndex = res.totalnum;
          }
        }
        return res;
      }
      else {
        wx.showToast({
          title: '蓝牙设备无数据了',
          icon: 'none'
        })
        return 0;
      }
    } catch (error) {
      console.error("Error in getAllRecordDetail:", error);
      await wx.hideLoading({});
      wx.showToast({
        title: '失败，请重试',
        duration: 3000
      });
      sendErrorToServer(error);
      throw error;
    }
  },
  mydeal() {
    this.data.degreeContext.data.deallist = this.data.degreeContext.data.cvList.map(i => parseRes(i))
  },
  getFirstRecord() {
    this.sendData({}, stringifyReq(cl.TRANSMIT_DATA_REQ, { start: 0, length: 20 }))
  },
  validBle() {
    if (!this.data.degreeContext.data.bleopen) {
      wx.showToast({
        title: '请先连接设备',
        icon: "error",
        duration: 1000
      })
      return false
    }
    return true
  },
  startRecord() {
    let that = this;
    console.log("startRecord fuction start");
    // if (!this.validBle()) return
    // if (!this.data.degreeContext.data.init_xyz) return wx.showToast({
    //   title: '请先初始化角度',
    //   icon: 'none'
    // })
    wx.showModal({ // 开始记录前询问用户当前设置状态是否符合预期
      title: '请确认设置有关选项',
      content: `预警角度5;警戒时间20(暂不支持修改)。”确认“后开始记录`,
      complete: (res) => {
        if (res.cancel) {

        }

        if (res.confirm) {
          wx.showLoading({
            title: 'loading',
            mask: true
          }).
            then((e) => {
              // return that.getRecordNum()
            })
            .then((e) => {
              //存储本次记录开始时的记录号
              // console.log("after getRecordNum", e)
              // that.data.degreeContext.data.lastrecord.startnum = e.totalnum
              // that.data.degreeContext.data.lastrecord.starttime = new Date().getTime()
              // that.data.degreeContext.data.lastrecord.warndata = e.warndata
              // wx.setStorageSync('lastrecord', JSON.stringify(that.data.degreeContext.data.lastrecord))
              // console.log("lastrecord have be stroaged", that.data.degreeContext.data.lastrecord)
            })
            .then((e) => {
              //开始记录
              // console.log("start to record");
              // return that.sendData(null, 'AA04030000')
            })
            .then((e) => {
              // console.log("AA04030000 send successful, return is", e)
              that.setData({
                "degreeContext.data.recording": true
              })
            })
            .then(() => {
              console.log("startRecord fuction end");
              return wx.hideLoading({})
            })
        }
      }
    })


  },
  stopRecord() { //暂停记录
    if (!this.validBle()) return
    wx.showLoading({
      title: 'loading',
    })
      .then(() => {
        return this.sendData(null, 'AA04040000')
      })
      .then(() => {
        this.setData({
          "degreeContext.data.recording_stop": true
        })
      })
      .then(() => {
        return wx.hideLoading({})
      })
  },
  continueRecord() {
    if (!this.validBle()) return
    wx.showLoading({
      title: 'loading',
    })
      .then(() => {
        return this.getRecordNum()
      })
      .then((e) => {
        console.log(e)
        this.data.degreeContext.data.lastrecord.stopdetail.push([e.totalnum, new Date().getTime()])
        wx.setStorageSync('lastrecord', JSON.stringify(this.data.degreeContext.data.lastrecord))
        return this.sendData(null, 'AA04030000')
      })
      .then(() => {
        this.setData({
          "degreeContext.data.recording_stop": false
        })
      })
      .then(() => {
        return wx.hideLoading({})
      })
  },
  finishRecord() {  //结束记录
    if (!this.validBle()) return
    console.log("finishRecord fuction start");
    return this.sendData(null, 'AA04040000')
      .then((e) => {
        console.log("AA04040000 order send sccessful, return is", e)
        this.setData({
          "degreeContext.data.recording": false,
          "degreeContext.data.recording_stop": false
        })
        let app = getApp();
        app.globalData.uploadProgressIsShow = true; // 显示上传进度盒子
      })
      .then(() => {
        this.sleep(1000);// 让出控制权1s
      })
      .then(() => {
        console.log("switch to getAllRecordDetail")
        return this.getAllRecordDetail(null, this.data.degreeContext.data.lastrecord.startnum)
      })
      .then((e) => {
        console.log("getAllRecordDetail return is", e)
        this.mydeal()
        console.log("after mydeal fuction, dealist is", this.data.degreeContext.data.deallist)
        let record = []
        this.data.degreeContext.data.deallist.forEach((i) => {
          record = record.concat(i.list)
        })
        console.log("record", record)
        return this.uploadRecord(record)
      })
      .then((e) => {
        console.log("uploadRecord fuction return is", e)
        let app = getApp();
        app.globalData.recordTotalNum = app.globalData.uploadRecordTotalNum; // 将本次记录的记录数赋给设备内存储的记录数
      })
      .then(() => {
        let app = getApp();
        if (app) {
          console.log("初始的", app);
          app.globalData.uploadProgressIsShow = false; // 隐藏盒子
          console.log("最终的", app);
        }
        else {
          console.log("未获取到app", app);
        }
        wx.showTabBar()({
          animation: true, // 是否需要动画效果
        });
      })
      .then(() => {
        this.sleep(1000); // 让出控制权1s
      })
      .then(() => {
        let app = getApp();
        if (app) {
          app.globalData.uploadProgressStep = 0; //上传步骤初始化
          app.globalData.uploadRecordIndex = 0;
          app.globalData.uploadRecordTotalNum = 0;
        }
      })
      .catch((e) => {
        if (e.errno == 600001) {
          console.log("上传数据失败，请检查网络")
        }
      })
  },
  f0301() {
    wx.showLoading({
      title: 'loading',
    })
      .then(() => {
        console.log("f0301 start");
        return this.sendData(null, 'AA030100')
      })
      .then((e) => {
        console.log("AA030100 order send sccessful, return is", e)
        console.log("AA030100 order send successful, check characteristicValue", this.data.degreeContext.data.characteristicValue);
        let res = parseRes(this.data.degreeContext.data.characteristicValue);
        console.log(res)
      })
      .then(() => {
        return wx.hideLoading({})
      })
  },
  f0302() {
    wx.showLoading({
      title: 'loading',
    })
      .then(() => {
        console.log("f0302 start");
        return this.sendData(null, 'AA030200')
      })
      .then((e) => {
        console.log("AA030200 order send sccessful, return is", e)
        console.log("AA030200 order send successful, check characteristicValue", this.data.degreeContext.data.characteristicValue);
        let res = parseRes(this.data.degreeContext.data.characteristicValue);
        console.log(res)
      })
      .then(() => {
        return wx.hideLoading({})
      })
  },
  f0303() {
    wx.showLoading({
      title: 'loading',
    })
      .then(() => {
        console.log("f0303 start");
        return this.sendData(null, 'AA030300')
      })
      .then((e) => {
        console.log("AA030300 order send sccessful, return is", e)
        console.log("AA030300 order send successful, check characteristicValue", this.data.degreeContext.data.characteristicValue);
        let res = parseRes(this.data.degreeContext.data.characteristicValue);
        console.log(res)
      })
      .then(() => {
        return wx.hideLoading({})
      })
  },
  uploadRecord(record) {
    let app = getApp();
    if (app) {
      app.globalData.uploadProgressStep = 2; // 下一个阶段
    }

    return http.post(postRecord(), {
      setting: JSON.stringify(this.data.degreeContext.data.lastrecord.warndata),
      record: JSON.stringify(record),
      starttime: this.data.degreeContext.data.lastrecord.starttime,
      stopdetail: JSON.stringify(this.data.degreeContext.data.lastrecord.stopdetail)
    })

  },
  recoverAll() {
    console.log("recover all fuciton start")
    let r = wx.getStorageSync('lastrecord')
    console.log(r)
    if (!r) return
    this.data.degreeContext.data.lastrecord = JSON.parse(r)
    if (this.data.degreeContext.data.lastrecord.startnum == -1 || this.data.degreeContext.data.nowinfo.totalnum <= this.data.degreeContext.data.lastrecord.startnum) return
    if (this.data.degreeContext.data.nowinfo.state == 0) {
      this.setData({
        "degreeContext.data.recording": true,
        "degreeContext.data.recording_stop": true
      })
    }
    else if (this.data.degreeContext.data.nowinfo.state >= 2) {
      this.setData({
        "degreeContext.data.recording": true,
        "degreeContext.data.recording_stop": false
      })
    }
  },
  init_xyz() {
    if (!this.validBle()) return
    return wx.showLoading({
      title: '初始化角度中...',
    })
      .then(() => {
        return this.sendData(null, "AA04020000")
      })
      .then(() => {
        this.setData({
          'degreeContext.data.init_xyz': true
        })
        return wx.hideLoading({})
      })
  },
  quitSetDegree() {
    this.setData({
      'degreeContext.data.setwarndata_show': false,
      'degreeContext.data.nowinfo.warndata.degree': this.data.degreeContext.data.nowinfo.warndata.degree
    })
  },
  comfirmSetDegree(e) {
    if (!this.data.degreeContext.data.init_xyz) {
      return wx.showToast({
        title: "保持设置前请进行”角度初始化“",
        icon: 'none'
      })
    }
    console.log(e)
    console.log("okok", this.data.degreeContext.data.degreeInputValue, this.data.degreeContext.data.nowinfo.warndata.degree)
    if (this.data.degreeContext.data.degreeInputValue * 10 == this.data.degreeContext.data.nowinfo.warndata.degree) {
      this.setData({
        'degreeContext.data.setwarndata_show': false
      })
      return
    }
    return wx.showLoading({
      title: '设置中...',
    })
      .then(() => {
        this.setData({
          'degreeContext.data.nowinfo.warndata.degree': this.data.degreeContext.data.degreeInputValue * 10,
          'degreeContext.data.setwarndata_show': false
        })
        return this.sendData(null, stringifyReq("06", { degree: this.data.degreeContext.data.degreeInputValue * 10 }))
      })
      .then(() => {
        wx.hideLoading({})
      })
  },
  degreeInput(e) {
    this.data.degreeContext.data.degreeInputValue = e.detail.current * 5 + 5
  },

  /**
   * @description 修复函数1：连接上设备，但设备内存有数据未清空
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  fixFuction1() {
    let app = getApp();
    app.globalData.uploadProgressIsShow = true; // 显示上传进度盒子
    this.getAllRecordDetail(null, 0)
      .then((ret1) => {
        console.log("getAllRecordDetail return is", ret1)
        if (ret1 == 0) return NO_DATA; // 假如没有数据则直接返回

        this.mydeal()
        console.log("after mydeal fuction, dealist is", this.data.degreeContext.data.deallist)
        let record = []
        this.data.degreeContext.data.deallist.forEach((i) => {
          record = record.concat(i.list)
        })
        console.log("record", record)
        return this.uploadRecord(record)
      })
      .then((ret2) => {
        if (ret2 === NO_DATA) return NO_DATA;

        console.log("uploadRecord fuction return is", ret2)
        wx.setStorageSync('lastrecord', 0)
        return this.sendData(null, "AA0200000000000000000000")  //清空记录
      })
      .then((ret3) => {
        if (ret3 === NO_DATA) return 0;

        wx.showTabBar({
          animation: true, // 是否需要动画效果
        })
        // let app = getApp();
        // if (app) {
        app.globalData.uploadProgressIsShow = false; // 隐藏盒子
        // }
      })
      .catch((err) => {
        console.error("error!", err);
        sendErrorToServer(err);
      })
  },

  /**
   * @description 休眠：为避免一个JS函数执行过程太长占用CPU资源，使用该函数来让出控制权
   * @param {number} ms - 需要让出控制权几秒
   * @returns {promise} - setTimeout方法
   * @version 1.4.4
   * @author zixian Zhu(hiddensharp)
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  /**
   * @description 清空蓝牙设备内的数据
   * @returns {fuction} - index.js中的sendData方法
   * @version 1.4.4
   * @author zixian Zhu(hiddensharp)
   */
  emptyDeviceRecord() {
    wx.setStorageSync('lastrecord', 0) // 将缓存中的lastrecord初始化
    return this.sendData(null, "AA0200000000000000000000") //清空记录
      .then(() => {
        return this.getRecordNum(); // 重新获取设备内的记录条数
      })
      .then((e) => {
        let app = getApp();
        if (app) {
          app.globalData.recordTotalNum = e.totalnum; // 同步全局变量中的recordTotalNum
        }
      })
      .then(() => {
        wx.showToast({
          title: '清除设备数据成功',
          icon: 'none'
        })
      })
  },
  /**
   * @description 重新上传蓝牙设备中的数据
   * @returns {fuction} - index.js中的uploadRecord函数 
   * @version 1.4.4
   * @author zixian Zhu(hiddensharp)
   */
  retransmitDeviceRecord() {
    let deallist = this.data.degreeContext.data.deallist;
    let record = [];
    deallist.forEach((i) => {
      record = record.concat(i.list)
    })
    console.log("record", record)
    return this.uploadRecord(record).then(() => {
      wx.showToast({
        title: '重新上传数据成功',
        icon: 'none'
      })
    })
  }
}
export const useDegreeContext = function () {
  let context = { ...degreeContext, methods: {} }
  Object.keys(context).forEach(i => {
    if (context[i] instanceof Function && !lifeCricle.includes(i)) {
      context.methods[i] = function () {
        return context[i].call(this, ...arguments)
      }
    }
  })
  return context
}
export const createDegreeContext = function () {
  degreeContext.data.deviceId = this.globalData.deviceid222
  degreeContext.data.deviceName = this.globalData.deviceName
  console.log("degreeContext.data", degreeContext.data)
  console.log("globalData", this.globalData)

  this.globalData.degreeContextData = degreeContext.data
  // this.globalData.degreeContextData.init_xyz = wx.getStorageSync('init_xyz')
  // if (wx.getSystemInfoAsync) wx.getSystemInfoAsync({
  //   success: (result) => {
  //     console.log(result)
  //     if (result.platform == "android") {
  //       this.globalData.degreeContextData.deviceId = this.globalData.deviceid222
  //     }
  //   },
  // })
}
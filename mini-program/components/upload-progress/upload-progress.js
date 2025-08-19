// components/upload-progress/upload-progress.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    recordTotalNum: {
      type: Number,
      value: 0,
      observer: function () {
        this.caculatePercentage();
      }
    },
    recordIndex: {
      type: Number,
      value: 0,
      observer: function () {
        this.caculatePercentage();
      }
    },
    active: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    percentage: 0,
    steps: [
      {
        text: '步骤一',
        desc: '获取记录条数',
        activeIcon: 'arrow',
      },
      {
        text: '步骤二',
        desc: '收取全部记录',
        activeIcon: 'arrow',
      },
      {
        text: '步骤三',
        desc: '上传记录',
        activeIcon: 'arrow',
      },
    ],
  },

  /**
   * 组件的方法列表
   */
  /**
   * @description 计算收取记录的进度
   * @returns {float} 进度（百分制-0~100）
   * @version 1.4.3
   * @author zixian Zhu(hiddensharp)
   */
  methods: {
    caculatePercentage() {
      let recordTotalNum = this.properties.recordTotalNum;
      let recordIndex = this.properties.recordIndex;
      var percentage = 0;

      if (recordTotalNum > 0) {
        percentage = (recordIndex / recordTotalNum * 100);
        if (percentage < 0.001) {
          percentage = parseFloat(percentage.toFixed(4));
        }
        else if (percentage < 0.01) {
          percentage = parseFloat(percentage.toFixed(3));
        }
        else if (percentage < 0.1) {
          percentage = parseFloat(percentage.toFixed(2));
        } else {
          percentage = parseFloat(percentage.toFixed(1));
        }
      }
      this.setData({
        percentage: percentage
      })
    }
  }
})
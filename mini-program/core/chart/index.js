import * as echarts from '../../ec-canvas/echarts'; // 引入图表
export const preDealWithDetail = (data)=>{
  data.record.settings = typeof data.record.settings === 'string'
    ? JSON.parse(data.record.settings)
    : data.record.settings;
  data.record.starttime = new Date(data.record.starttime)
  data.detail.forEach(i=>{
    i.data = typeof i.data === 'string' ? JSON.parse(i.data) : i.data;
    let temp_x = (i.data.x+3600-data.record.settings.init_x)%3600
    let temp_y = (i.data.y+3600-data.record.settings.init_y)%3600
    let temp_z = (i.data.z+3600-data.record.settings.init_z)%3600
    i.data.x = temp_x > 1800 ? (temp_x - 3600)/10 : temp_x/10
    i.data.y = temp_y > 1800 ? (temp_y - 3600)/10 : temp_y/10
    i.data.z = temp_z > 1800 ? (temp_z - 3600)/10 : temp_z/10
    i.warn_tag = Math.abs(i.data.x) > data.record.settings.degree/10 ||
	 			 Math.abs(i.data.y) > data.record.settings.degree/10 ||
	  			 Math.abs(i.data.z) > data.record.settings.degree/10
  })
  return data
}
export const setHoursChartOption = function(chart, data){
  let hoursData = [
    {time: '0时', data: [0, 0, 0]},
    {time: '2时', data: [0, 0, 0]},
    {time: '4时', data: [0, 0, 0]},
    {time: '6时', data: [0, 0, 0]},
    {time: '8时', data: [0, 0, 0]},
    {time: '10时', data: [0, 0, 0]},
    {time: '12时', data: [0, 0, 0]},
    {time: '14时', data: [0, 0, 0]},
    {time: '16时', data: [0, 0, 0]},
    {time: '18时', data: [0, 0, 0]},
    {time: '20时', data: [0, 0, 0]},
    {time: '22时', data: [0, 0, 0]},
  ]
  let index = Math.floor(data.record.starttime.getHours()/2)
  let count = (data.record.starttime.getHours()%2)*3600+data.record.starttime.getMinutes()*60+data.record.starttime.getSeconds()
  data.detail.forEach((i)=>{
    if(i.warn_tag){
      hoursData[index].data[2]++
    }else{
      hoursData[index].data[0]++
    }
    count++
    if(count == 7200){
      index = (index+1)%12
      count = 0
    }
    
  })
  let option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				// Use axis to trigger tooltip
				type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
			}
		},
		legend: {
			top: '15px',
			show: true,
			textStyle: {
				color: "#fff"
			}
		},
		grid: {
			left: "1%",
			right: "1%",
		},
		yAxis: {
			type: 'value',
			axisLine: {
				show: false,
				lineStyle: {
					color: null
				}
			},

		},
		xAxis: {
			type: 'category',
			data: ['0时', '2时', '4时', '6时', '8时', '10时', '12时', '14时', '16时', '18时', '20时', '22时'],
			axisLine: {
				show: true,
				lineStyle: {
					color: "#fff"
				},

			},
			axisTick: {
				show: false
			}
		},
		series: [{
				name: '正常',
				type: 'bar',
				stack: 'total',
				emphasis: {
					focus: 'series'
				},
				data: hoursData.map(i=>i.data[0]),
				textStyle: {
					color: "#fff"
				},

				itemStyle: {
					color: {
						type: 'line',
						x: 0.5,
						y: 0.5,
						r: 0.5,
						colorStops: [{
							offset: 0,
							color: '#3564af' // 0% 处的颜色
						}, {
							offset: 1,
							color: '#2f8ffc' // 100% 处的颜色
						}],
						global: false // 缺省为 false
					}
				},
			},
			{
				name: '提醒',
				type: 'bar',
				colorBy: 'series',
				stack: 'total',
				emphasis: {
					focus: 'series'
				},
				data: hoursData.map(i=>i.data[1]),
				itemStyle: {
					color: '#31fe4c'

				},
			},
			{
				name: '警戒',
				type: 'bar',
				stack: 'total',
				emphasis: {
					focus: 'series'
				},
				data: hoursData.map(i=>i.data[2]),
				itemStyle: {
					color: '#ea3947'
				},
			}
		]
  }
  chart.setOption(option)
}
export const setStatisticsChartOption = function(chart, data){
  let statisticsData = [0, 0, 0]
  data.detail.forEach(i=>{
    if(i.warn_tag){
      statisticsData[2]++
    }else{
      statisticsData[0]++
    }
  })
  let option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			}
		},

		grid: { // 边距
			// left: '10%',
			right: '16%',
			bottom: '15%',
			top: '2%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			boundaryGap: [0, 0.01],
			show: false
		},
		yAxis: {
			type: 'category',
			offset: 20,
			axisLabel: { // 轴文字的配置
				show: true,
				textStyle: {
					color: '#fff',
					fontSize: '14'
				}
			},
			axisLine: { // 轴线的颜色以及宽度
				show: false
			},
			data: ['正常', '提醒', '警戒']
		},
		series: [{
			name: '数量',
			type: 'bar',
			barWidth: 15, // 柱图宽度
			barGap: 25,
			showBackground: true,
			backgroundStyle: {
				color: '#02255F',
				barBorderRadius: [0, 10, 10, 0] // 背景圆角
			},
			data: statisticsData,
			itemStyle: {
				normal: {
					label: {
						show: true, // 开启显示
						distance: 20, // 条柱之间的距离
						position: 'right', // 在上方top在右侧right显示
						textStyle: { // 数值样式
							color: '#fff',
							fontSize: 16
						}
					},
					// 设置柱子圆角
					// barBorderRadius: [0, 10, 10,0],
					// 这里设置每个柱子颜色不一样
					color: function (params) {
						const colorList = ['#0FBED9', '#F65163', '#FF8447', '#76AF50', '#8378E8']
						return colorList[params.dataIndex]
					},
					color: function (params) {
						var colorList = [
							['#3581db', '#4bfaff'],
							['#6bc88c', '#2fff4b'],
							['#e4656b', '#fd5152'],

						]

						var colorItem = colorList[params.dataIndex]
						return new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
								offset: 0,
								color: colorItem[0]
							},
							{
								offset: 1,
								color: colorItem[1]
							}
						], false)
					}
				}
			}
		}]
  }
  chart.setOption(option)
}
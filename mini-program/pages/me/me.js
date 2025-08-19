// pages/me/like/like.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 是否登录
		isLogin: false,
		// 头像
		avatarUrl: '',
		// 昵称
		nickName: '',
	},
	globalData: {
		userInfo: null
	},
	//   获取openid
	login() {
		wx.getUserInfo({
			//成功后会返回
			success: (res) => {
				// console.log(res);
				// 把你的用户信息存到一个变量中方便下面使用
				let userInfo = res.userInfo
				//获取openId（需要code来换取）这是用户的唯一标识符
				// 获取code值
				wx.login({
					//成功放回
					success: (res) => {
						console.log(res);
						let code = res.code
						// 通过code换取openId
						wx.request({
							url: `https://api.weixin.qq.com/sns/jscode2session?appid=wx6b789dce46a19c98&secret=0ccdd2237a123a75c4e339bc68c7164b&js_code=${code}&grant_type=authorization_code`,
							success: (res) => {
								console.log(res);
								userInfo.openid = res.data.openid
								this.globalData.open = userInfo.openid
								let openid = this.globalData.open
								wx.setStorageSync('openid', this.globalData.open)
								// console.log(openid);
							}
						})
					}
				})
			}
		})
	},

	//授权登录
	getuserinfo() {
		let that = this
		wx.getUserProfile({
			desc: '用户完善个人信息',
			success: (res) => {
				//将用户信息渲染到界面	
				this.setData({
					avatarUrl: res.userInfo.avatarUrl,
					nickName: res.userInfo.nickName,
					isLogin: true
				})
				//将用户信息缓存到用户的手机
				wx.setStorageSync('message', res.userInfo)
				//message为缓存名，res.userinfo为缓存值  
			}
		})
	},

	//退出登录
	outuser() {
		let that = this
		wx.showModal({
			title: "确定退出",
			content: "退出后将不再享受部分权益",
			success(res) {
				if (res.confirm == true) {
					//删除用户手机缓存值里面的message
					wx.removeStorageSync('message') //message为要删除的数据名字
					// wx.removeStorageSync('openid')
					that.setData({
						avatarUrl: "",
						nickName: '',
						isLogin: false
					})
					wx.showToast({
						title: '已退出',
						icon: 'none'
					})
				}
			}
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		// this.login()
		//第一步通过用户手机里面的缓存值去判断用户有没有登录
		if (wx.getStorageSync('message')) { //获取缓存值
			let nick = wx.getStorageSync('message')
			this.setData({
				nickName: nick.nickName,
				avatarUrl: nick.avatarUrl,
				isLogin: true
			})
		}
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  jump(){
    let path = 'pages/index/index';
    wx.navigateToMiniProgram({
      appId: 'wx476ee2da58070fe8', // 要跳转的小程序的appid
      path: path,                  // 跳转的目标页面
      extarData: {
        open: 'auth'
      },
      success(res) {
        // 打开成功  
      },
      fail(res) {
      }
    })
  }
})
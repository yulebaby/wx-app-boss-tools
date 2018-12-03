const app = getApp();
const Http = require('../../utils/request.js');
const MD5 = require('../../utils/md5.js');
Page({
  data: {
    accountError:'',
    pwdError:'',
    login_btn:true
  },
  onLoad: function (options) {
    
  },
  accountInput: function (e) {
    this.setData({
      accountInput: e.detail.value
    })
    if (this.data.accountInput){
      this.setData({ accountError: '' })
    }
  },
  pwdInput: function (e) {
    //MD5加密
    this.setData({
      pwdInput: MD5.md5(e.detail.value).toUpperCase()
    })
    if (this.data.pwdInput) {
      this.setData({ pwdError: '' })
    }
  },
  login(){
    let that = this;
    if (that.data.login_btn){
      this.setData({ login_btn: false });
      if (!this.data.accountInput) {
        this.setData({ 
          accountError: '请输入账号',
          login_btn: true
        });
      } else if (!this.data.pwdInput) {
        this.setData({ 
          pwdError: '请输入密码' ,
          login_btn: true
        });
      } else {
        Http.post('/auth/login', { username: that.data.accountInput, password: that.data.pwdInput }).then(res => {
          if (res.code == 1000) {
            that.setData({ login_btn: true });
            /*-----本地存储门店id-------*/
            wx.setStorage({
              key: "storeId",
              data: res.result.store.id
            })
            /*-----登录成功带参返回上一页: 需要刷新数据接口*/
            let nowPage = getCurrentPages();
            let prevPage = nowPage[nowPage.length - 2];
            prevPage.setData({
              login_success : true
            })
            wx.navigateBack({})
          } else {
            that.setData({ login_btn: true });
            wx.showModal({
              content: res.info,
              showCancel: false
            })
          }
          wx.hideLoading();
        }, _ => {
          wx.hideLoading();
        });
      }
    }
  }
})
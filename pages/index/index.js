const app = getApp()
const Http = require('../../utils/request.js');
/*canvas开始*/
let ctx = wx.createCanvasContext('canvasArcCir');
let ctxpos = wx.createCanvasContext('canvasArcpos');
let WXwidth = wx.getSystemInfoSync().windowWidth;
let cxtWidth = 350 / 750 * WXwidth;
/*canvas结束*/

Page({
  data: {
    storeId:'',
    dailyDate:'',       //调用后台接口获取的当前时间
    daily_date:'',      //用于界面展示的时间
    nowDate:'',         //用于选择前一天和后一天时记录的时间
    or_display_tomorrow:false,    //是否显示后一天
    income:'',        
    card_num:'',
    experienceCount:'',
    precent:'',
    compare:''
  },
  onLoad(){
    let that = this;
    wx.getStorage({
      key: 'storeId',
      success(res) {
        that.setData({ storeId: res.data })
        that.getTime();
      }
    })
  },
  onShow(){
    this.orExistStoreId();
  },
  orExistStoreId(){
    let that = this;
    //判断是否存在门店id： 若存在,代表已登录; 
    //                    否则,跳转登录页
    wx.getStorage({
      key: 'storeId',
      success(res) {
        if (!res.data) {
          wx.navigateTo({
            url: '../login/login',
          })
        } else {
          that.setData({ storeId: res.data })
          //登录成功跳转过来需要刷新所有接口
          let nowPage = getCurrentPages();
          let currPage = nowPage[nowPage.length - 1]; //当前页面
          if (currPage.data.login_success) {
            that.getTime();
          }
        }
      },
      fail(error) {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  //获取时间
  getTime(){
    let that = this;
    Http.post('/daily/getDailyDate', { storeId : that.data.storeId}).then(res => {
      if (res.code == 1000) {
        that.setData({
          dailyDate: res.result,
          nowDate : res.result
        })
        that.dateChange(res.result , '不需要再次调用接口');
        that.getIncome();
        that.getCardNum();
        that.getPercent();
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  //获取收入
  getIncome() {
    let that = this;
    Http.post('/daily/todayIncome', { storeId: that.data.storeId, dailyDate: that.data.nowDate }).then(res => {
      if (res.code == 1000) {
        that.setData({income : res.result})
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  //获取办卡数
  getCardNum() {
    let that = this;
    Http.post('/daily/todayDoCard', { storeId: that.data.storeId, dailyDate: that.data.nowDate }).then(res => {
      if (res.code == 1000) {
        that.setData({ card_num: res.result })
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  //获取体验占比
  getPercent() {
    let that = this;
    Http.post('/daily/occupationRatio', { storeId: that.data.storeId, dailyDate: that.data.nowDate }).then(res => {
      if (res.code == 1000) {
        if (res.result.todayPercent > res.result.percent){
          that.setData({ compare: '../../assets/img/up.png'})
        } else if (res.result.todayPercent < res.result.percent){
          that.setData({ compare: '../../assets/img/down.png'})
        } else if (res.result.todayPercent == res.result.percent){
          that.setData({ compare: '../../assets/img/flat.png' })
        }
        let precent = res.result.todayPercent;
        precent = Number(precent * 100).toFixed(0);

        that.setData({
          precent : precent,
          experienceCount: res.result.todayExperienceCount
        });
        that.drawCircle(precent);
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  //前一天
  getYesterday(){
    let that = this;
    //显示后一天
    this.setData({ or_display_tomorrow: true });
    let date = this.data.nowDate;
    let t = new Date(Date.parse(date.replace(/-/g, "/")));

    let yesterday_milliseconds = t.getTime() - 1000 * 60 * 60 * 24;
    let yesterday = new Date();
        yesterday.setTime(yesterday_milliseconds);
    let strYear = yesterday.getFullYear();
    let strDay = yesterday.getDate();
    let strMonth = yesterday.getMonth() + 1;
    if (strMonth < 10) { strMonth = "0" + strMonth; }
    if (strDay < 10) { strDay = "0" + strDay }
    let datastr = strYear + "-" + strMonth + "-" + strDay;
    that.setData({ nowDate : datastr});
    that.dateChange(datastr);
  },
  //后一天
  getTomorrow(){
    if (this.data.nowDate != this.data.dailyDate){
      let that = this;
      let date = this.data.nowDate;
      let t = new Date(Date.parse(date.replace(/-/g, "/")));

      let tm = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);

      let m = '0' + (tm.getMonth() + 1);
      let d = '0' + tm.getDate()
      let datastr = tm.getFullYear() + '-' + m.substr(m.length - 2) + '-' + d.substr(d.length - 2);
      that.setData({ nowDate: datastr });
      that.dateChange(datastr);
      //隐藏后一天
      if (this.data.nowDate == this.data.dailyDate) {
        this.setData({ or_display_tomorrow: false });
      }
    }else{
      //隐藏后一天
      this.setData({ or_display_tomorrow: false });
    }
  },
  //日期转换: 2018-11-22转换为11月22日
  dateChange(nowDate , renovate){
    let that = this;
    if (nowDate) {
      let yearArray = nowDate.split('-');
      if (yearArray[0] == 2018) {
        that.setData({ daily_date: yearArray[1] + '月' + yearArray[2] + '日' })
      }else{
        that.setData({ daily_date: yearArray[0] + '年' + yearArray[1] + '月' + yearArray[2] + '日' })
      }
    }
    if (!renovate){
      that.getIncome();
      that.getCardNum();
      that.getPercent();
    } 
  },
  //canvas
  drawCircle(data) {
    let cxt_arc = wx.createCanvasContext('canvasCircle');
    cxt_arc.setLineWidth(18);
    cxt_arc.setStrokeStyle('#eaeaea');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(cxtWidth / 2, cxtWidth / 2, cxtWidth / 2 - 16, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();

    function drawArc(s, e) {
      ctx.setFillStyle('white');
      ctx.clearRect(0, 0, cxtWidth, cxtWidth);
      ctx.draw();
      var x = cxtWidth / 2, y = cxtWidth / 2, radius = cxtWidth / 2 - 16;
      ctx.setLineWidth(12);
      ctx.setStrokeStyle('#5EA3FE');
      ctx.setLineCap('round');
      ctx.beginPath();
      ctx.arc(x, y, radius, s, e, false);
      ctx.stroke()
      ctx.draw()
    }
    function drawArcs(s, e) {
      ctxpos.setFillStyle('white');
      ctxpos.clearRect(0, 0, cxtWidth, cxtWidth);
      ctxpos.draw();
      var x = cxtWidth / 2, y = cxtWidth / 2, radius = cxtWidth / 2 - 16;
      ctxpos.setLineWidth(13);
      ctxpos.setStrokeStyle('#FFDF3B');
      ctxpos.setLineCap('round');
      ctxpos.beginPath();
      ctxpos.arc(x, y, radius, s, e, false);
      ctxpos.stroke()
      ctxpos.draw()
    }
    let step = data, startAngle = 1.5 * Math.PI, endAngle = 0;
    let n = 100;
    endAngle = step * 2 * Math.PI / n + 1.5 * Math.PI;
    drawArc(startAngle, endAngle);
    if (step > 100) {
      let steps = step - 100, startAngle = 1.5 * Math.PI, endAngle = 0;
      let n = 100;
      endAngle = steps * 2 * Math.PI / n + 1.5 * Math.PI;
      drawArcs(startAngle, endAngle);
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getIncome();
    this.getCardNum();
    this.getPercent();
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1000);
  },
})

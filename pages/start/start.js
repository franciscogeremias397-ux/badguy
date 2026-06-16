const COUNT_SEQUENCE = ["128,642", "128,701", "128,735", "128,756"];

Page({
  data: {
    completedCount: COUNT_SEQUENCE[0],
    countRefreshing: false
  },

  onLoad() {
    this.startCountRefresh();
  },

  onUnload() {
    this.clearCountTimers();
  },

  clearCountTimers() {
    if (this.countTimer) {
      clearInterval(this.countTimer);
      this.countTimer = null;
    }
    if (this.countSettleTimer) {
      clearTimeout(this.countSettleTimer);
      this.countSettleTimer = null;
    }
  },

  startCountRefresh() {
    this.clearCountTimers();
    let index = 0;
    this.setData({
      completedCount: COUNT_SEQUENCE[index],
      countRefreshing: true
    });

    this.countTimer = setInterval(() => {
      index += 1;
      if (index >= COUNT_SEQUENCE.length) {
        this.clearCountTimers();
        this.setData({
          completedCount: COUNT_SEQUENCE[COUNT_SEQUENCE.length - 1],
          countRefreshing: false
        });
        return;
      }

      this.setData({
        completedCount: COUNT_SEQUENCE[index],
        countRefreshing: true
      });
    }, 360);

    this.countSettleTimer = setTimeout(() => {
      this.setData({ countRefreshing: false });
    }, 1500);
  },

  startTest() {
    wx.navigateTo({
      url: "/pages/test/test"
    });
  }
});

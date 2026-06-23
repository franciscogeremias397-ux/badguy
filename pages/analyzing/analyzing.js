const { generateReport } = require("../../utils/scoring");

const STEPS = [
  { at: 8, text: "正在整理测试答案" },
  { at: 32, text: "正在校准六大关系维度" },
  { at: 58, text: "正在生成关系风险画像" },
  { at: 82, text: "正在输出行动建议" }
];

Page({
  data: {
    progress: 0,
    progressText: "0%",
    progressStyle: "width: 0%;",
    statusText: STEPS[0].text,
    stepItems: STEPS.map((item, index) => ({
      text: item.text,
      active: index === 0
    }))
  },

  onLoad() {
    this.enableShareMenu();
    this.startAnalysis();
  },

  onUnload() {
    this.clearTimers();
  },

  clearTimers() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
  },

  enableShareMenu() {
    if (typeof wx.showShareMenu === "function") {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage"]
      });
    }
  },

  updateProgress(progress) {
    const currentStepIndex = STEPS.reduce((activeIndex, step, index) => {
      return progress >= step.at ? index : activeIndex;
    }, 0);
    this.setData({
      progress,
      progressText: `${progress}%`,
      progressStyle: `width: ${progress}%;`,
      statusText: STEPS[currentStepIndex].text,
      stepItems: STEPS.map((item, index) => ({
        text: item.text,
        active: index <= currentStepIndex
      }))
    });
  },

  startAnalysis() {
    const input = wx.getStorageSync("pendingAnalysisInput");
    if (!input || !input.answers) {
      wx.showToast({ title: "请先完成测试", icon: "none" });
      setTimeout(() => {
        wx.redirectTo({ url: "/pages/test/test" });
      }, 900);
      return;
    }

    let progress = 0;
    this.updateProgress(progress);
    this.progressTimer = setInterval(() => {
      const increment = progress < 30 ? 4 : progress < 68 ? 3 : progress < 92 ? 2 : 1;
      progress = Math.min(progress + increment, 96);
      this.updateProgress(progress);
    }, 130);

    this.finishTimer = setTimeout(() => {
      try {
        const report = generateReport(input);
        wx.setStorageSync("latestReport", report);
        wx.removeStorageSync("pendingAnalysisInput");
        this.clearTimers();
        this.updateProgress(100);
        setTimeout(() => {
          wx.redirectTo({ url: "/pages/report/report" });
        }, 260);
      } catch (error) {
        this.clearTimers();
        wx.showToast({ title: "生成失败，请重试", icon: "none" });
        console.error("analysis failed", error);
      }
    }, 3400);
  },

  onShareAppMessage() {
    return {
      title: "鉴渣助手｜生成你的关系风险识别报告",
      path: "/pages/start/start"
    };
  },

  onShareTimeline() {
    return {
      title: "鉴渣助手｜关系风险识别报告",
      query: ""
    };
  }
});

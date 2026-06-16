const {
  QUESTION_SECTIONS,
  getAllQuestionItems
} = require("../../utils/scoring");

Page({
  data: {
    targetName: "",
    gender: "",
    genderOptions: ["男", "女"],
    birthDate: "",
    birthHour: "",
    hourOptions: Array.from({ length: 24 }, (_, index) => {
      const start = `${String(index).padStart(2, "0")}:00`;
      const end = `${String(index + 1).padStart(2, "0")}:00`;
      return `${start} - ${end}`;
    }),
    sections: QUESTION_SECTIONS,
    answers: {},
    currentIndex: 0,
    totalCount: getAllQuestionItems().length,
    currentQuestion: getAllQuestionItems()[0],
    currentSectionTitle: QUESTION_SECTIONS[0].title,
    progressText: "0%",
    progressStyle: "width: 0%;"
  },

  onNameInput(event) {
    this.setData({ targetName: event.detail.value });
  },

  onGenderChange(event) {
    this.setData({ gender: this.data.genderOptions[Number(event.detail.value)] });
  },

  onBirthDateChange(event) {
    this.setData({ birthDate: event.detail.value });
  },

  onBirthHourChange(event) {
    this.setData({ birthHour: Number(event.detail.value) });
  },

  onAnswerChange(event) {
    const id = event.currentTarget.dataset.id;
    const answers = Object.assign({}, this.data.answers, {
      [id]: Number(event.detail.value)
    });
    this.setData({ answers });
    setTimeout(() => this.nextQuestion(), 120);
  },

  getQuestionMeta(index) {
    const question = getAllQuestionItems()[index];
    const section = QUESTION_SECTIONS.find(item => item.items.some(child => child.id === question.id));
    const answeredCount = Object.keys(this.data.answers).length;
    const progress = Math.round((answeredCount / this.data.totalCount) * 100);
    return {
      currentQuestion: question,
      currentSectionTitle: section.title,
      progressText: `${progress}%`,
      progressStyle: `width: ${progress}%;`
    };
  },

  updateQuestion(index) {
    this.setData(Object.assign({ currentIndex: index }, this.getQuestionMeta(index)));
  },

  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.updateQuestion(this.data.currentIndex - 1);
    }
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.totalCount - 1) {
      this.updateQuestion(this.data.currentIndex + 1);
      return;
    }
    this.setData(this.getQuestionMeta(this.data.currentIndex));
  },

  validateBaseInfo() {
    if (!this.data.targetName.trim()) {
      wx.showToast({ title: "请填写姓名", icon: "none" });
      return false;
    }
    if (!this.data.gender) {
      wx.showToast({ title: "请选择性别", icon: "none" });
      return false;
    }
    if (!this.data.birthDate) {
      wx.showToast({ title: "请选择生日", icon: "none" });
      return false;
    }
    if (this.data.birthHour === "") {
      wx.showToast({ title: "请选择出生时间", icon: "none" });
      return false;
    }
    return true;
  },

  submit() {
    if (!this.validateBaseInfo()) {
      return;
    }
    const missing = getAllQuestionItems().filter(item => this.data.answers[item.id] === undefined);
    if (missing.length) {
      wx.showToast({ title: `还有 ${missing.length} 题未答`, icon: "none" });
      return;
    }

    wx.setStorageSync("pendingAnalysisInput", {
      targetName: this.data.targetName.trim(),
      gender: this.data.gender,
      birthDate: this.data.birthDate,
      birthHour: this.data.birthHour,
      answers: this.data.answers
    });
    wx.navigateTo({ url: "/pages/analyzing/analyzing" });
  }
});

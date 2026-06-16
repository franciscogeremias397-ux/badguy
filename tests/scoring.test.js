const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  QUESTION_SECTIONS,
  RESULT_DIMENSIONS,
  analyzeCombined,
  generateReport,
  getAllQuestionItems,
  getRiskLevel
} = require("../utils/scoring");

function makeAnswers(defaultValue, overrides) {
  const answers = {};
  getAllQuestionItems().forEach(item => {
    answers[item.id] = defaultValue;
  });
  return Object.assign(answers, overrides || {});
}

function makeModuleAnswers(valuesByModule) {
  const answers = {};
  getAllQuestionItems().forEach(item => {
    const values = Object.keys(item.dimensions || {}).map(key => valuesByModule[key] || 0);
    answers[item.id] = values.length ? Math.max.apply(null, values) : 0;
  });
  return answers;
}

function readProjectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return readProjectFiles(fullPath);
    }
    return fullPath;
  });
}

const baseBirth = {
  targetName: "测试对象",
  gender: "女",
  birthDate: "1996-08-24",
  birthHour: 8
};

function calculateExpectedAge(birthDate) {
  const parts = birthDate.split("-").map(Number);
  const now = new Date();
  let age = now.getFullYear() - parts[0];
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  if (currentMonth < parts[1] || (currentMonth === parts[1] && currentDay < parts[2])) {
    age -= 1;
  }
  return age;
}

const lowReport = generateReport(Object.assign({}, baseBirth, {
  answers: makeAnswers(0)
}));
assert(lowReport.score <= 20, "低现实风险不应被中西结合直接拉到高风险");
assert.strictEqual(lowReport.level.name, "较低风险", "0-20 分应为较低风险");
assert.strictEqual(lowReport.birthTime, "08:00 - 09:00", "报告出生时间应按一小时时段展示");
assert.strictEqual(lowReport.age, calculateExpectedAge(baseBirth.birthDate), "报告应根据生日计算年龄");
assert.strictEqual(lowReport.ageText, `${lowReport.age}岁`, "报告顶部年龄应使用岁展示");

assert.strictEqual(getRiskLevel(20).name, "较低风险");
assert.strictEqual(getRiskLevel(20).className, "very-low");
assert.strictEqual(getRiskLevel(21).name, "低风险");
assert.strictEqual(getRiskLevel(21).className, "low");
assert.strictEqual(getRiskLevel(45).name, "低风险");
assert.strictEqual(getRiskLevel(46).name, "中风险");
assert.strictEqual(getRiskLevel(46).className, "medium");
assert.strictEqual(getRiskLevel(70).name, "中风险");
assert.strictEqual(getRiskLevel(71).name, "高风险");
assert.strictEqual(getRiskLevel(71).className, "high");
assert.strictEqual(getRiskLevel(85).name, "高风险");
assert.strictEqual(getRiskLevel(86).name, "极高风险");
assert.strictEqual(getRiskLevel(86).className, "extreme");

const lastHourReport = generateReport(Object.assign({}, baseBirth, {
  birthHour: 23,
  answers: makeAnswers(0)
}));
assert.strictEqual(lastHourReport.birthTime, "23:00 - 24:00", "23 点出生时间应展示到 24:00");

const highRealityReport = generateReport(Object.assign({}, baseBirth, {
  answers: makeModuleAnswers({
    loyalty: 100,
    cheating: 100
  })
}));
assert(
  highRealityReport.score >= 71 && ["高风险", "极高风险"].indexOf(highRealityReport.level.name) >= 0,
  "现实高危信号明显时，应触发高风险及以上等级"
);

const noBirthReport = generateReport({
  targetName: "测试对象",
  gender: "男",
  answers: makeAnswers(100)
});
assert.strictEqual(noBirthReport.combined.available, false, "出生年月日时不足时，中西结合不参与计算");
assert.strictEqual(noBirthReport.score, noBirthReport.realityScore, "缺少出生信息时应只按现实测试计分");
assert.strictEqual(noBirthReport.ageText, "年龄未知", "缺少生日时年龄应显示未知");

assert.deepStrictEqual(
  lowReport.modules.map(item => item.key),
  ["loyalty", "cheating", "intimacy", "values", "money", "responsibility"],
  "报告应输出用户指定的六大维度"
);
assert.deepStrictEqual(
  lowReport.modules.map(item => item.key),
  RESULT_DIMENSIONS.map(item => item.key),
  "测试题与报告维度应保持一致"
);
assert.strictEqual(getAllQuestionItems().length, 30, "新版题库应保持 30 题");
assert.deepStrictEqual(
  QUESTION_SECTIONS.map(item => item.key),
  ["confirmed", "observable", "indirect", "consistency"],
  "题库应按重大事实、可观察信号、间接风格和一致性校验分组"
);
assert(
  getAllQuestionItems().every(item => item.options.length === 4),
  "每题应提供四个贴合题意的选项"
);
assert(
  new Set(getAllQuestionItems().map(item => item.options.map(option => option.label).join("|"))).size > 20,
  "选项不应全部使用同一套模板"
);
assert(
  !getAllQuestionItems().some(item => item.prompt.includes("TA 是否出轨")),
  "题目不应直接询问用户无法确认的出轨事实"
);
assert.match(lowReport.portrait, /较低风险|低风险|中风险|高风险|极高风险/, "报告应生成整体画像");
assert.match(lowReport.portrait, /忠诚|出轨|亲密|价值观|金钱|责任/, "整体画像应解释关系判断重点");
assert(lowReport.relationshipType, "报告应输出关系风险类型");
assert.match(lowReport.conclusion, /整体判断/, "报告结论应给出明确整体判断");

const moneyOnlyReport = generateReport(Object.assign({}, baseBirth, {
  answers: makeModuleAnswers({
    money: 100
  })
}));
const moneyModule = moneyOnlyReport.modules.find(item => item.key === "money");
const loyaltyModule = moneyOnlyReport.modules.find(item => item.key === "loyalty");
assert.strictEqual(moneyModule.score, 100, "金钱题答高时，金钱维度必须明确升高");
assert.strictEqual(loyaltyModule.score, 0, "未出现忠诚题信号时，不应凭空拉高忠诚维度");
assert(
  moneyOnlyReport.suggestions.some(item => /借钱|转账|投资|共同消费/.test(item)),
  "金钱维度升高时，应给出对应行动建议"
);
assert.strictEqual(moneyOnlyReport.relationshipType.name, "利益索取型", "金钱维度明显升高时，应识别利益索取风险类型");

const boundaryReport = generateReport(Object.assign({}, baseBirth, {
  answers: makeAnswers(0, {
    q08_transparency: 90,
    q09_social_boundary: 100,
    q10_public_relationship: 100,
    q27_personal_space: 90
  })
}));
assert(
  ["边界模糊型", "多线暧昧型"].indexOf(boundaryReport.relationshipType.name) >= 0,
  "边界和外部关系信号明显时，应输出具体风险类型"
);
assert(
  !/继续观察其解释是否一致/.test(boundaryReport.riskExplanation),
  "报告不应停留在正确但无意义的观察话术"
);

const combined = analyzeCombined({
  gender: "女",
  birthDate: "1995-12-10",
  birthHour: 9
});
assert.strictEqual(combined.available, true, "只输入出生年月日时应能生成中西结合分析");
assert(combined.eastern.pillars.year, "四柱应包含年柱");
assert(combined.eastern.pillars.month, "四柱应包含月柱");
assert(combined.eastern.pillars.day, "四柱应包含日柱");
assert(combined.eastern.pillars.hour, "四柱应包含时柱");
assert(combined.eastern.dayMaster, "四柱应包含日主");
assert(combined.western.sunSign, "西方星盘应包含太阳星座");
assert(combined.western.moonSign, "西方星盘应包含月亮星座估算");
assert.strictEqual(combined.compact.available, true, "中西结合应生成精简展示信息");
assert(combined.compact.easternLines.length <= 3, "四柱简析展示应保持精简");
assert(combined.compact.westernLines.length <= 3, "西方星盘展示应保持精简");
assert(combined.compact.tip.length <= 28, "中西结合提示应避免长文截断");

let conflictDate = "";
for (let month = 1; month <= 12 && !conflictDate; month += 1) {
  for (let day = 1; day <= 28 && !conflictDate; day += 1) {
    const date = `1994-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const result = analyzeCombined({
      gender: "男",
      birthDate: date,
      birthHour: 12
    });
    if (result.conflictNote) {
      conflictDate = date;
    }
  }
}
assert(conflictDate, "测试数据中应能找到中西视角差异样例");

const appConfig = require("../app.json");
assert.strictEqual(appConfig.pages.length, 4, "小程序应包含分析生成页");
assert.deepStrictEqual(appConfig.pages, [
  "pages/start/start",
  "pages/test/test",
  "pages/analyzing/analyzing",
  "pages/report/report"
]);

const testWxml = fs.readFileSync(path.join(__dirname, "../pages/test/test.wxml"), "utf8");
const oldRelationField = "\u5173\u7cfb\u9636\u6bb5";
const birthPlaceLabel = "\u51fa\u751f\u5730";
assert(!testWxml.includes("weight"), "测试页不应展示权重");
assert(!testWxml.includes(oldRelationField), "测试页不应展示旧字段");
assert(!testWxml.includes(birthPlaceLabel), "测试页不应额外要求地点字段");
assert(testWxml.includes("姓名"), "测试页顶部应包含姓名");
assert(testWxml.includes("生日（公历）"), "测试页顶部应包含公历生日");
assert(testWxml.includes('end="2011-12-31"'), "生日选择器应去除 2012-2026 的选项");
assert(testWxml.includes("时间"), "测试页应包含出生时间");
assert(!testWxml.includes("时辰"), "测试页应把时辰文案改为时间");
assert(testWxml.includes("性别"), "测试页顶部应包含性别");

const testJs = fs.readFileSync(path.join(__dirname, "../pages/test/test.js"), "utf8");
assert(testJs.includes('genderOptions: ["男", "女"]'), "性别选项应只保留男和女");
assert(testJs.includes('padStart(2, "0")'), "时间选项应补齐为 HH:00 格式");
assert(testJs.includes("`${start} - ${end}`"), "时间选项应按 HH:00 - HH:00 展示");
assert(testJs.includes("pendingAnalysisInput"), "完成测试后应先进入分析生成流程");
assert(testJs.includes("/pages/analyzing/analyzing"), "测试页应跳转到分析生成页");
assert(!testJs.includes("generateReport"), "测试页不应瞬间生成报告");
assert(testWxml.includes("开始分析"), "最后一题按钮应改为开始分析");
assert(!testWxml.includes("生成报告</view>"), "测试页不应直接显示生成报告按钮");

const analyzingJs = fs.readFileSync(path.join(__dirname, "../pages/analyzing/analyzing.js"), "utf8");
const analyzingWxml = fs.readFileSync(path.join(__dirname, "../pages/analyzing/analyzing.wxml"), "utf8");
const analyzingWxss = fs.readFileSync(path.join(__dirname, "../pages/analyzing/analyzing.wxss"), "utf8");
assert(analyzingJs.includes("generateReport"), "分析页应负责生成报告");
assert(analyzingJs.includes("3400"), "分析页应保留约 3 秒的生成期待感");
assert(analyzingWxml.includes("正在生成鉴渣评估"), "分析页应有明确加载标题");
assert(analyzingWxml.includes("progress-fill"), "分析页应有进度条");
assert(analyzingWxss.includes("@keyframes scanMove"), "分析页应包含扫描动画");

const startWxml = fs.readFileSync(path.join(__dirname, "../pages/start/start.wxml"), "utf8");
assert(startWxml.includes("多维渣值测试"), "首页副标题应更新");
assert(startWxml.includes("{{completedCount}}"), "首页完成人数应使用动态数字");
assert(startWxml.includes("countRefreshing"), "首页完成人数应有轻刷新状态");

const startJs = fs.readFileSync(path.join(__dirname, "../pages/start/start.js"), "utf8");
assert(startJs.includes('"128,642"'), "首页完成人数应从接近目标值开始刷新");
assert(startJs.includes('"128,756"'), "首页完成人数最终应固定到目标值");
assert(startJs.includes("360"), "首页完成人数刷新应保持轻微短动效");

const reportWxml = fs.readFileSync(path.join(__dirname, "../pages/report/report.wxml"), "utf8");
const removedReverseBlock = "\u53cd\u5411\u63d0\u9192";
const removedConclusionBlock = "\u603b\u4f53\u7ed3\u8bba";
const oldRiskSlot = "risk" + "-icon";
assert(reportWxml.includes("生成报告"), "报告页底部应包含生成报告按钮");
assert(reportWxml.includes("一键下载"), "报告页底部应包含一键下载按钮");
assert(reportWxml.includes("分享好友"), "报告页底部应包含分享好友按钮");
assert(reportWxml.includes("鉴渣助手 · 测评报告"), "小程序内报告页应保留原浏览标题");
assert(reportWxml.includes("module-item"), "小程序内报告页应保留六大维度单项解释");
assert(reportWxml.includes("sub-card"), "小程序内报告页应保留中西结合详细分析");
assert(!reportWxml.includes("dimensionRadar"), "小程序内报告页不应使用下载图的六边形画布");
assert(!reportWxml.includes("insight-grid"), "小程序内报告页不应使用下载图的并排结构");
assert(!reportWxml.includes("compact-score"), "小程序内报告页不应使用过度精简的中西结合结构");
assert(!reportWxml.includes(removedReverseBlock), "报告页不应展示已移除板块");
assert(!reportWxml.includes(removedConclusionBlock), "报告页不应展示重复的总体结论板块");
assert(reportWxml.includes("report.ageText"), "报告顶部应展示年龄");
assert(!reportWxml.includes("report.birthDate}} {{report.birthTime"), "报告顶部不应继续展示出生日期和时间");
assert(reportWxml.includes("risk-character-image"), "报告页应直接使用人物风险图片");
assert(reportWxml.includes("assets/risk-characters/{{report.level.className}}.png"), "报告页应按风险等级引用对应人物图片");
assert(!reportWxml.includes(oldRiskSlot), "报告页不应继续使用旧符号风险图形区域");
assert(!reportWxml.includes("score-mark"), "报告页不应继续使用旧感叹号图形结构");

const reportWxss = fs.readFileSync(path.join(__dirname, "../pages/report/report.wxss"), "utf8");
const oldShieldClass = ".icon" + "-shield";
const oldRadarClass = ".icon" + "-radar";
assert(reportWxss.includes(".score-number.extreme"), "报告分数应支持极高风险颜色");
assert(reportWxss.includes(".risk-badge.very-low"), "风险等级标签应支持较低风险颜色");
assert(reportWxss.includes(".risk-character-image"), "报告页应有直接图片样式");
assert(reportWxss.includes("left: -2000px"), "报告导出画布应放到屏幕外，避免生成时覆盖页面");
assert(reportWxss.includes("opacity: 0"), "报告导出画布应完全隐藏，避免生成时露出长图");
assert(reportWxss.includes(".module-item"), "小程序内报告页应保留旧六大维度列表样式");
assert(reportWxss.includes(".sub-card"), "小程序内报告页应保留旧中西结合子卡样式");
assert(!reportWxss.includes(".person"), "不应保留重绘人物的 CSS 结构");
assert(!reportWxss.includes(".bucket-hat"), "不应保留重绘人物的帽子结构");
assert(!reportWxss.includes(oldShieldClass), "不应保留盾牌风险图形样式");
assert(!reportWxss.includes(oldRadarClass), "不应保留雷达风险图形样式");

const reportJs = fs.readFileSync(path.join(__dirname, "../pages/report/report.js"), "utf8");
const oldDrawName = "drawRisk" + "Icon";
assert(reportJs.includes("RISK_COLORS"), "报告长图应同步风险颜色");
assert(reportJs.includes("RISK_CHARACTER_IMAGES"), "报告长图应维护人物图片映射");
assert(reportJs.includes("ctx.drawImage(imagePath"), "报告长图应直接绘制人物图片资产");
assert(reportJs.includes("assets/risk-characters/low.png"), "报告长图人物图片应使用页面相对路径");
assert(!reportJs.includes('"/assets/risk-characters/low.png"'), "报告长图不应使用会被误解析的根路径");
assert(reportJs.includes("measurePosterLayout"), "报告长图应根据内容动态测量高度");
assert(reportJs.includes("drawRadarChart"), "报告长图应绘制六边形维度图");
assert(reportJs.includes("drawDimensionRadarCard"), "报告长图应单独绘制六边形维度图");
assert(reportJs.includes("drawCombinedReportCard"), "报告长图应单独绘制中西结合分析");
assert(reportJs.includes("measureCombinedCardHeight"), "报告长图中西结合应按内容动态测量高度");
assert(reportJs.includes("createSelectorQuery"), "报告长图应使用新版 canvas 节点查询");
assert(reportJs.includes("canvas.createImage"), "报告长图人物图片应通过 canvas 节点加载");
assert(reportJs.includes("exportPosterCanvas"), "报告长图导出应有防卡住保护");
assert(reportJs.includes("POSTER_EXPORT_TIMEOUT"), "报告长图导出应设置超时保护");
assert(reportJs.includes("POSTER_EXPORT_RETRY_DELAYS"), "报告长图导出应设置多次重试保护");
assert(!reportJs.includes("wx.getImageInfo"), "报告长图不应继续使用旧图片解析方式");
assert(!reportJs.includes("createCanvasContext"), "报告长图不应继续使用旧 canvas 绘制方式");
assert(!reportJs.includes("POSTER_HEIGHT"), "报告长图不应继续使用固定高度");
assert(!reportJs.includes("drawModuleScores"), "报告长图不应继续绘制旧六大维度列表");
assert(!reportJs.includes("drawCombined("), "报告长图不应继续绘制旧中西结合长文");
assert(!reportJs.includes("drawInsightGrid"), "报告长图不应再把六大维度和中西结合并排绘制");
assert(!reportJs.includes("drawCombinedCompact"), "报告长图中西结合不应过度精简");
assert(!reportJs.includes(oldDrawName), "报告长图不应继续绘制旧符号风险图形");
assert(!reportJs.includes(removedConclusionBlock), "报告长图不应继续绘制重复的总体结论卡片");

["very-low", "low", "medium", "high", "extreme"].forEach(name => {
  assert(
    fs.existsSync(path.join(__dirname, `../assets/risk-characters/${name}.png`)),
    `应存在 ${name} 人物风险图片`
  );
  assert(
    fs.existsSync(path.join(__dirname, `../pages/report/assets/risk-characters/${name}.png`)),
    `应存在报告页本地 ${name} 人物风险图片`
  );
});
assert(
  fs.existsSync(path.join(__dirname, "../assets/risk-characters/source.png")),
  "应保留用户提供的人物原图"
);

const forbiddenTerms = [
  "\u7384\u5b66",
  "\u9274\u6e23\u795e\u5668",
  "\u6838\u5fc3\u7ea2\u65d7",
  "\u8bc1\u636e\u6e05\u5355"
];
readProjectFiles(path.join(__dirname, ".."))
  .filter(file => !file.includes(`${path.sep}.git${path.sep}`))
  .filter(file => !file.includes(`${path.sep}sessions${path.sep}`))
  .forEach(file => {
    const content = fs.readFileSync(file, "utf8");
    forbiddenTerms.forEach(term => {
      assert(!content.includes(term), `${file} 不应包含禁用词`);
    });
  });

console.log("scoring tests passed");

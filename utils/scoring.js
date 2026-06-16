const REALITY_WEIGHT = 80;
const COMBINED_WEIGHT = 20;

const COMBINED_WEIGHTS = {
  eastern: 12,
  western: 8
};

const RESULT_DIMENSIONS = [
  {
    key: "loyalty",
    title: "情感忠诚风险",
    shortTitle: "忠诚风险",
    weight: 20,
    low: "目前关系身份、重要事实和情感投入的稳定度较清楚，未见明显吊着或隐瞒结构。",
    mid: "关系透明度存在摇摆，重点看 TA 是否愿意把关键事实讲清楚并持续一致。",
    high: "忠诚风险集中在不透明、回避确定性或解释前后不一致，容易让你长期处在猜测里。"
  },
  {
    key: "cheating",
    title: "出轨/多线风险",
    shortTitle: "多线风险",
    weight: 20,
    low: "目前外部关系边界相对清楚，未见明显享受暧昧、多线保留或关系隐藏迹象。",
    mid: "外部关系边界需要校准，重点看 TA 是否会主动减少让你不安的模糊空间。",
    high: "多线风险集中在暧昧边界、公开意愿和新鲜感管理，TA 可能保留不止一种关系可能性。"
  },
  {
    key: "intimacy",
    title: "亲密处理风险",
    shortTitle: "亲密处理",
    weight: 18,
    low: "冲突后仍能沟通、修复和回应需求，暂未形成明显冷处理或情绪拉扯。",
    mid: "亲密处理有不稳定迹象，容易出现解释多、修复少，或问题被拖延到不了了之。",
    high: "亲密处理风险明显，TA 可能用冷淡、失联、反指责或回避修复，让你独自承担关系压力。"
  },
  {
    key: "values",
    title: "价值观与尊重风险",
    shortTitle: "价值观",
    weight: 16,
    low: "目前尊重感、边界感和平等意识较稳定，未见明显打压、双标或施压结构。",
    mid: "价值观与尊重感存在磨损，重点看 TA 是否把你的需求当作同等重要的事。",
    high: "价值观与尊重风险明显，TA 可能通过双标、否定、道德压力或边界侵犯让你不断退让。"
  },
  {
    key: "money",
    title: "金钱与利益风险",
    shortTitle: "金钱利益",
    weight: 10,
    low: "目前金钱边界相对清楚，未见明显借钱、消费转嫁或利益绑定。",
    mid: "金钱边界开始变得含糊，建议把支出、借款、礼物和共同消费讲清楚。",
    high: "金钱与利益风险明显，TA 可能把你的情感投入转化为经济支持或现实便利。"
  },
  {
    key: "responsibility",
    title: "责任感与承诺风险",
    shortTitle: "责任承诺",
    weight: 16,
    low: "目前承诺和行动基本能对上，未见明显只享受关系好处却不承担责任。",
    mid: "责任承担需要继续验证，重点看 TA 能否把承诺转成稳定行动。",
    high: "责任感与承诺风险明显，TA 可能享受伴侣待遇，却在需要承担、兑现和规划时后退。"
  }
];

const RESPONSE_OPTIONS = [
  { value: 0, label: "低风险选项" },
  { value: 30, label: "轻微信号选项" },
  { value: 65, label: "明显风险选项" },
  { value: 100, label: "高危风险选项" }
];

function choice(value, label, flag, floor) {
  return { value, label, flag: flag || "", floor: floor || 0 };
}

function question(id, prompt, dimensions, options, extra) {
  return Object.assign({
    id,
    prompt,
    dimensions,
    options,
    severity: "medium"
  }, extra || {});
}

const QUESTION_SECTIONS = [
  {
    key: "confirmed",
    title: "已确认事实",
    items: [
      question("q01_hidden_truth", "你是否已经发现过 TA 在关系中有重大隐瞒或欺骗？", { loyalty: 1, responsibility: 0.6 }, [
        choice(0, "没有明确发现"),
        choice(30, "有过解释不清的小事", "存在解释不清的小事"),
        choice(70, "有过一次较严重隐瞒", "出现过较严重隐瞒", 62),
        choice(100, "多次被发现说谎", "多次被发现说谎或隐瞒", 72)
      ], { severity: "critical" }),
      question("q02_boundary_evidence", "你是否有明确证据证明 TA 与他人存在暧昧或越界？", { cheating: 1, loyalty: 0.5, values: 0.4 }, [
        choice(0, "没有证据"),
        choice(35, "有一些让人不舒服的迹象", "出现让人不舒服的暧昧迹象"),
        choice(75, "有比较明确的暧昧记录", "存在比较明确的暧昧记录", 68),
        choice(100, "已确认发生越界行为", "已确认发生越界行为", 75)
      ], { severity: "critical" }),
      question("q03_money_boundary", "TA 是否发生过借钱、消费、转账等金钱边界问题？", { money: 1, responsibility: 0.5 }, [
        choice(0, "没有"),
        choice(30, "偶尔让人不舒服", "金钱边界偶尔让人不舒服"),
        choice(70, "有过借钱不清或消费转嫁", "有过借钱不清或消费转嫁", 62),
        choice(100, "多次让你承担经济后果", "多次让你承担经济后果", 70)
      ], { severity: "critical" }),
      question("q04_coercion", "TA 是否曾在冲突中出现羞辱、威胁、冷处理或操控？", { intimacy: 1, values: 1 }, [
        choice(0, "没有"),
        choice(35, "偶尔情绪化", "冲突中偶尔情绪化"),
        choice(75, "经常冷处理或打压", "经常冷处理或打压", 72),
        choice(100, "明显控制、威胁或精神压迫", "存在明显控制、威胁或精神压迫", 80)
      ], { severity: "critical" }),
      question("q05_promise_broken", "TA 是否有过承诺后明显不兑现的情况？", { responsibility: 1, loyalty: 0.4 }, [
        choice(0, "基本守信"),
        choice(25, "小事偶尔忘记", "小事偶尔不兑现"),
        choice(65, "重要承诺经常拖延", "重要承诺经常拖延"),
        choice(100, "反复承诺但几乎不兑现", "反复承诺但几乎不兑现", 70)
      ], { severity: "high" })
    ]
  },
  {
    key: "observable",
    title: "可观察关系信号",
    items: [
      question("q06_plan_change", "当 TA 临时改变计划时，通常会怎么处理？", { responsibility: 1, values: 0.4 }, [
        choice(0, "提前说明，并主动补偿安排"),
        choice(20, "会说明原因，但不一定补偿", "临时改变计划时补偿不足"),
        choice(55, "经常临时通知你配合", "经常临时通知并让你配合"),
        choice(85, "消失、失约，或让你自己消化", "临时失约后让你自己消化")
      ], { severity: "medium" }),
      question("q07_insecurity_response", "当你表达不安时，TA 更常见的反应是？", { intimacy: 1, values: 0.6 }, [
        choice(0, "认真听，并给出具体回应"),
        choice(25, "会解释，但不太深入", "回应不安时解释多于安抚"),
        choice(65, "觉得你想太多", "把你的不安归因为想太多"),
        choice(95, "反过来指责你不信任", "反过来指责你不信任")
      ], { severity: "high" }),
      question("q08_transparency", "TA 的行程和社交状态给你的感觉是？", { loyalty: 1, cheating: 0.7 }, [
        choice(0, "基本透明自然"),
        choice(25, "有私人空间，但解释合理", "关系信息有保留但尚可解释"),
        choice(65, "经常模糊不清", "行程和社交状态经常模糊"),
        choice(90, "你长期无法判断 TA 在做什么", "长期无法判断 TA 的真实状态")
      ], { severity: "high" }),
      question("q09_social_boundary", "TA 与异性或潜在暧昧对象相处时，边界感如何？", { cheating: 1, values: 0.6 }, [
        choice(0, "边界清楚"),
        choice(30, "偶尔需要提醒", "外部关系边界偶尔需要提醒"),
        choice(70, "经常让你不舒服", "外部关系边界经常让你不舒服"),
        choice(100, "明知你介意仍继续", "明知你介意仍继续模糊边界", 72)
      ], { severity: "critical" }),
      question("q10_public_relationship", "TA 对公开你们关系的态度更接近？", { loyalty: 1, cheating: 0.6, responsibility: 0.4 }, [
        choice(0, "自然公开"),
        choice(25, "分场合公开，有合理解释", "关系公开存在场景限制"),
        choice(70, "总是找理由回避", "总是找理由回避公开关系"),
        choice(100, "明确不愿让别人知道", "明确不愿让别人知道关系", 72)
      ], { severity: "high" }),
      question("q11_conflict_repair", "冲突发生后，TA 通常怎么做？", { intimacy: 1, responsibility: 0.5 }, [
        choice(0, "主动沟通解决"),
        choice(25, "冷静后愿意谈", "冲突后需要冷静才愿意谈"),
        choice(65, "拖着不处理", "冲突后拖着不处理"),
        choice(95, "消失、冷处理或转移责任", "冲突后消失、冷处理或转移责任")
      ], { severity: "high" }),
      question("q12_apology_change", "TA 道歉后的表现通常是？", { responsibility: 1, intimacy: 0.6 }, [
        choice(0, "会有实际改变"),
        choice(30, "会短暂改善", "道歉后只能短暂改善"),
        choice(70, "只说好听的", "道歉停留在好听的话"),
        choice(95, "道歉后继续重复", "道歉后继续重复同样问题")
      ], { severity: "high" }),
      question("q13_give_take", "你们关系中的付出是否平衡？", { values: 0.7, responsibility: 0.8, money: 0.4 }, [
        choice(0, "基本平衡"),
        choice(25, "偶尔失衡"),
        choice(65, "经常你付出更多", "关系中经常由你付出更多"),
        choice(90, "TA 只享受好处不承担义务", "TA 只享受好处不承担义务")
      ], { severity: "high" }),
      question("q14_novelty", "TA 面对诱惑或新鲜感时的表现更像？", { cheating: 0.9, loyalty: 0.7 }, [
        choice(0, "有分寸"),
        choice(30, "偶尔好奇，但能收住", "面对新鲜感时偶尔摇摆"),
        choice(70, "喜欢暧昧感", "喜欢暧昧带来的新鲜感"),
        choice(95, "享受被多人关注", "享受被多人关注或追逐")
      ], { severity: "high" }),
      question("q15_need_based_hotcold", "TA 是否经常在需要你时热情，不需要时冷淡？", { intimacy: 0.7, money: 0.5, values: 0.4 }, [
        choice(0, "很少"),
        choice(30, "偶尔"),
        choice(70, "比较明显", "需要你时热情、不需要时冷淡"),
        choice(95, "长期如此", "长期按自己需求冷热切换")
      ], { severity: "high" }),
      question("q16_money_state", "涉及钱时，TA 更常见的状态是？", { money: 1, responsibility: 0.4 }, [
        choice(0, "清楚公平"),
        choice(30, "偶尔含糊", "金钱表达偶尔含糊"),
        choice(70, "经常让你多承担", "经常让你多承担开销"),
        choice(95, "习惯把压力转给你", "习惯把经济压力转给你")
      ], { severity: "high" }),
      question("q17_boundary_respect", "TA 是否尊重你的边界、时间和感受？", { values: 1, intimacy: 0.6 }, [
        choice(0, "尊重"),
        choice(20, "大多尊重"),
        choice(65, "经常忽略", "经常忽略你的边界和感受"),
        choice(95, "只按自己需求来", "只按自己的需求安排关系")
      ], { severity: "critical" }),
      question("q18_reasonable_need", "当你提出合理需求时，TA 的态度通常是？", { values: 0.8, responsibility: 0.6, intimacy: 0.6 }, [
        choice(0, "愿意协商"),
        choice(25, "会听，但行动慢", "愿意听但行动迟缓"),
        choice(65, "觉得你麻烦", "把合理需求视为麻烦"),
        choice(95, "用冷淡或愤怒让你闭嘴", "用冷淡或愤怒压回你的需求")
      ], { severity: "high" }),
      question("q19_explanation_consistency", "TA 的解释是否经常前后不一致？", { loyalty: 1, cheating: 0.7 }, [
        choice(0, "很少"),
        choice(30, "偶尔"),
        choice(70, "比较频繁", "解释比较频繁地前后不一致"),
        choice(95, "经常自相矛盾", "解释经常自相矛盾")
      ], { severity: "high" }),
      question("q20_relationship_feeling", "你在这段关系里更常感受到什么？", { intimacy: 0.8, values: 0.6, loyalty: 0.4 }, [
        choice(0, "稳定安心"),
        choice(30, "有甜蜜，也有不安", "关系里甜蜜和不安并存"),
        choice(70, "经常患得患失", "经常患得患失"),
        choice(95, "长期焦虑、怀疑、自我否定", "长期焦虑、怀疑或自我否定")
      ], { severity: "high" })
    ]
  },
  {
    key: "indirect",
    title: "关系风格测试",
    items: [
      question("q21_boundary_belief", "TA 更认同哪句话？", { loyalty: 0.7, values: 0.8, cheating: 0.5 }, [
        choice(0, "关系需要自由，也需要边界"),
        choice(25, "不必什么都说，但不能伤害对方", "重视自由但能承认关系边界"),
        choice(75, "只要没被发现就不算问题", "把没被发现当作关系底线"),
        choice(100, "伴侣没资格管我的社交", "用自由名义取消伴侣边界", 70)
      ], { severity: "critical" }),
      question("q22_responsibility_style", "TA 面对责任时更像哪种人？", { responsibility: 1 }, [
        choice(0, "先解决问题"),
        choice(25, "能承担，但需要提醒", "承担责任需要提醒"),
        choice(70, "能拖就拖", "面对责任能拖就拖"),
        choice(95, "习惯让别人收拾残局", "习惯让别人收拾残局")
      ], { severity: "high" }),
      question("q23_money_belief", "TA 对金钱关系的态度更接近？", { money: 1, values: 0.6 }, [
        choice(0, "亲密也要清楚"),
        choice(25, "可以灵活，但要讲明", "金钱关系可以灵活但需讲明"),
        choice(75, "爱我就该支持我", "把爱和经济支持绑定"),
        choice(100, "谁更在乎谁就多付出", "用在乎程度要求对方多付出", 68)
      ], { severity: "critical" }),
      question("q24_friend_description", "TA 在朋友面前通常如何描述亲密关系？", { values: 1, intimacy: 0.4 }, [
        choice(0, "尊重伴侣"),
        choice(25, "偶尔吐槽，但有分寸", "偶尔吐槽但有分寸"),
        choice(65, "爱拿关系开玩笑", "爱拿亲密关系开玩笑"),
        choice(90, "贬低伴侣来显得自己占上风", "贬低伴侣来显得自己占上风")
      ], { severity: "high" }),
      question("q25_mistake_reaction", "如果 TA 做错事，最可能的第一反应是？", { intimacy: 0.8, responsibility: 0.8, values: 0.6 }, [
        choice(0, "承认并解释"),
        choice(30, "先辩解，之后缓和", "做错事后先辩解再缓和"),
        choice(70, "转移话题", "做错事后转移话题"),
        choice(95, "反过来怪你逼 TA", "做错事后反过来怪你逼 TA")
      ], { severity: "high" }),
      question("q26_long_term_view", "TA 对长期关系的想象更接近？", { responsibility: 1, loyalty: 0.5 }, [
        choice(0, "一起规划并落实"),
        choice(25, "想过，但不急", "长期规划节奏偏慢"),
        choice(65, "享受当下，不想谈以后", "享受当下但回避以后"),
        choice(95, "不想负责，但不想失去好处", "不想负责但不想失去关系好处")
      ], { severity: "high" }),
      question("q27_personal_space", "TA 对“个人空间”的理解更像？", { loyalty: 0.7, intimacy: 0.5 }, [
        choice(0, "有空间，但不制造不安"),
        choice(25, "需要空间，但会说明", "需要空间但会说明"),
        choice(65, "不喜欢被问任何细节", "把任何细节都视为不能被问"),
        choice(90, "用空间当作逃避解释的理由", "用个人空间逃避必要解释")
      ], { severity: "high" }),
      question("q28_external_interest", "TA 面对别人示好时更可能？", { cheating: 1, loyalty: 0.7 }, [
        choice(0, "明确保持距离"),
        choice(25, "礼貌回应，但有边界", "礼貌回应且基本有边界"),
        choice(70, "享受暧昧，但说没什么", "享受暧昧又淡化问题"),
        choice(100, "主动维持多条可能性", "主动维持多条关系可能性", 76)
      ], { severity: "critical" })
    ]
  },
  {
    key: "consistency",
    title: "一致性校验",
    items: [
      question("q29_key_conflict_cold", "你觉得 TA 平时很会照顾你的感受，但在关键冲突中是否会突然变得冷漠？", { intimacy: 0.8, values: 0.5 }, [
        choice(0, "很少"),
        choice(30, "偶尔"),
        choice(70, "经常", "关键冲突中经常突然冷漠"),
        choice(95, "越关键越冷漠", "越关键的冲突越冷漠")
      ], { severity: "high" }),
      question("q30_behavior_without_words", "如果只看 TA 的行为，而不听 TA 的解释，你会觉得这段关系更像？", { responsibility: 0.7, values: 0.6, loyalty: 0.5, intimacy: 0.5 }, [
        choice(0, "稳定可靠"),
        choice(30, "有问题，但可沟通", "关系有问题但仍可沟通"),
        choice(70, "反复拉扯", "关系长期反复拉扯"),
        choice(95, "消耗、失衡、看不到责任", "关系消耗失衡且看不到责任")
      ], { severity: "high" })
    ]
  }
];

const RISK_ARCHETYPES = {
  stable: {
    name: "稳定可信型",
    shortName: "稳定可信",
    mechanism: "当前关系更接近清楚、可沟通、能兑现的结构。TA 的行为和解释大体能对上，你不需要靠反复猜测来维持安全感。",
    verification: "继续看三个基础点：关系边界是否稳定、冲突后是否能修复、承诺是否能落地。",
    stopLine: "若后续突然出现重大隐瞒、金钱转嫁或持续冷处理，再重新评估。"
  },
  boundaryBlur: {
    name: "边界模糊型",
    shortName: "边界模糊",
    mechanism: "核心问题不是某个单一事件，而是关系身份、社交距离和解释责任都留有余地。你越追问，TA 越容易把问题变成你敏感或管太多。",
    verification: "接下来只验证一件事：TA 是否愿意把关系边界说清楚，并在外部关系里主动执行。",
    stopLine: "如果边界谈完仍继续含糊、回避公开或让你长期猜测，就不适合继续加深投入。"
  },
  commitmentAvoidant: {
    name: "逃避承诺型",
    shortName: "逃避承诺",
    mechanism: "TA 更像把关系停在享受当下的位置：需要陪伴和亲密，但遇到身份、规划、责任和兑现时就开始后退。",
    verification: "不要再听未来会怎样，只看 2-4 周内是否兑现已经说出口的具体行动。",
    stopLine: "如果承诺持续停在口头，且你越投入 TA 越不落地，应停止推进同居、金钱和长期绑定。"
  },
  emotionalControl: {
    name: "情绪操控型",
    shortName: "情绪操控",
    mechanism: "TA 的风险集中在冲突处理：用冷淡、反指责、否定或压力让问题结束，让你从表达需求变成自我怀疑。",
    verification: "看 TA 能不能在冲突中讨论具体问题，而不是攻击你的感受、动机或人格。",
    stopLine: "如果再次出现威胁、羞辱、持续冷处理或让你害怕表达，应优先保护自己并求助可信支持。"
  },
  benefitSeeking: {
    name: "利益索取型",
    shortName: "利益索取",
    mechanism: "TA 可能把你的情感投入转化成现实便利：钱、资源、照顾、消费或机会。关系越亲密，你越容易被要求承担更多。",
    verification: "把所有借款、转账、共同消费和投资建议都暂停，看 TA 是否仍然尊重你。",
    stopLine: "只要出现借钱不清、消费施压、项目绑定或让你承担后果，就不要再扩大经济往来。"
  },
  lowResponsibilityTaking: {
    name: "低责任高索取型",
    shortName: "低责高索",
    mechanism: "TA 享受伴侣待遇、情绪价值和你的让步，但在兑现、修复、规划和承担后果时明显不足。",
    verification: "把期待从情绪表达改成具体任务：时间、边界、承诺、补偿，让 TA 用行动回答。",
    stopLine: "如果 TA 继续只要好处、不接责任，你需要降低投入，而不是用更多付出去换稳定。"
  },
  multiTrackAmbiguous: {
    name: "多线暧昧型",
    shortName: "多线暧昧",
    mechanism: "TA 的主要风险在外部关系边界和新鲜感管理。问题不只是认识多少人，而是是否主动维持让别人误会的空间。",
    verification: "看 TA 是否愿意公开边界、减少暧昧空间，并在你不舒服后主动调整。",
    stopLine: "如果 TA 一边享受你的投入，一边保留多条可能性，就不适合继续投入排他性关系。"
  },
  drainingPushPull: {
    name: "消耗拉扯型",
    shortName: "消耗拉扯",
    mechanism: "这段关系容易进入冷热循环：甜的时候让你舍不得，关键时刻又让你失望。你被困住的不是单次事件，而是反复期待和落空。",
    verification: "减少解释和追问，记录 TA 是否能稳定回应、稳定修复、稳定兑现。",
    stopLine: "如果 2-4 周后仍是拉近又推开、安抚又重复，建议停止继续加码情绪投入。"
  }
};

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEM_ELEMENTS = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
const BRANCH_ELEMENTS = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
const PEACH_BRANCHES = ["子", "午", "卯", "酉"];
const ELEMENTS = ["木", "火", "土", "金", "水"];

const ZODIAC_PROFILES = [
  { sign: "白羊座", start: [3, 21], end: [4, 19], score: 60, element: "火象", modality: "基本宫", style: "表达直接、启动快，关系中需要观察冲动后的承担能力。" },
  { sign: "金牛座", start: [4, 20], end: [5, 20], score: 36, element: "土象", modality: "固定宫", style: "重稳定和确定性，关系节奏偏慢，但也可能在安全感不足时固执。" },
  { sign: "双子座", start: [5, 21], end: [6, 21], score: 66, element: "风象", modality: "变动宫", style: "互动轻快、好奇心强，关系中需要观察边界与持续承诺。" },
  { sign: "巨蟹座", start: [6, 22], end: [7, 22], score: 42, element: "水象", modality: "基本宫", style: "重情绪连接和安全感，关系中需要观察是否能成熟表达需求。" },
  { sign: "狮子座", start: [7, 23], end: [8, 22], score: 52, element: "火象", modality: "固定宫", style: "重自尊和被认可，关系中需要观察是否能平等尊重对方。" },
  { sign: "处女座", start: [8, 23], end: [9, 22], score: 34, element: "土象", modality: "变动宫", style: "谨慎、重细节和秩序，关系中需要区分建议与挑剔。" },
  { sign: "天秤座", start: [9, 23], end: [10, 23], score: 58, element: "风象", modality: "基本宫", style: "社交感强、重关系氛围，关系中需要明确暧昧边界。" },
  { sign: "天蝎座", start: [10, 24], end: [11, 22], score: 56, element: "水象", modality: "固定宫", style: "情感浓度高、占有感强，关系中需要观察控制与信任边界。" },
  { sign: "射手座", start: [11, 23], end: [12, 21], score: 70, element: "火象", modality: "变动宫", style: "重自由和探索，关系中需要观察承诺稳定性和边界意识。" },
  { sign: "摩羯座", start: [12, 22], end: [1, 19], score: 32, element: "土象", modality: "基本宫", style: "重现实责任和长期结构，情感表达可能克制但通常看重稳定。" },
  { sign: "水瓶座", start: [1, 20], end: [2, 18], score: 64, element: "风象", modality: "固定宫", style: "重独立和精神空间，关系中需要观察自由与承诺的平衡。" },
  { sign: "双鱼座", start: [2, 19], end: [3, 20], score: 58, element: "水象", modality: "变动宫", style: "浪漫、共情强，关系中需要观察是否用逃避代替现实承担。" }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value);
}

function mod(value, base) {
  return ((value % base) + base) % base;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function parseBirthDate(value) {
  const match = typeof value === "string" ? value.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  if (!match) {
    return null;
  }
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
  if (parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.day > 31) {
    return null;
  }
  return parts;
}

function cleanAnswer(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return 0;
  }
  return round(clamp(numberValue, 0, 100));
}

function getAllQuestionItems() {
  return QUESTION_SECTIONS.reduce((items, section) => items.concat(section.items), []);
}

function getSectionByKey(key) {
  return QUESTION_SECTIONS.find(section => section.key === key);
}

function getResultDimension(key) {
  return RESULT_DIMENSIONS.find(dimension => dimension.key === key);
}

function getQuestionSection(itemId) {
  return QUESTION_SECTIONS.find(section => section.items.some(item => item.id === itemId));
}

function getSelectedOption(item, answers) {
  const score = cleanAnswer(answers[item.id]);
  const exact = (item.options || []).find(option => Number(option.value) === score);
  if (exact) {
    return exact;
  }
  const sortedOptions = (item.options || []).slice().sort((a, b) => Number(a.value) - Number(b.value));
  const nearest = sortedOptions.reduce((selected, option) => {
    if (!selected) {
      return option;
    }
    return Math.abs(Number(option.value) - score) < Math.abs(Number(selected.value) - score)
      ? option
      : selected;
  }, null);
  return nearest || { value: score, label: "", flag: "" };
}

function scoreDimension(dimensionKey, answers) {
  let weightedScore = 0;
  let totalWeight = 0;
  getAllQuestionItems().forEach(item => {
    const dimensionWeight = item.dimensions && item.dimensions[dimensionKey];
    if (!dimensionWeight) {
      return;
    }
    weightedScore += cleanAnswer(answers[item.id]) * dimensionWeight;
    totalWeight += dimensionWeight;
  });
  return totalWeight ? round(weightedScore / totalWeight) : 0;
}

function collectSignals(answers) {
  const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
  const signals = [];
  QUESTION_SECTIONS.forEach(section => {
    section.items.forEach(item => {
      const option = getSelectedOption(item, answers);
      const score = cleanAnswer(option.value);
      if (score >= 55) {
        signals.push({
          id: item.id,
          sectionKey: section.key,
          sectionTitle: section.title,
          dimensions: item.dimensions || {},
          text: option.flag || item.prompt,
          score,
          severity: item.severity,
          floor: option.floor || 0
        });
      }
    });
  });
  return signals.sort((a, b) => {
    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0) || b.score - a.score;
  });
}

function getRiskLevel(score) {
  if (score <= 20) {
    return { name: "较低风险", text: "目前未见明显高危关系模式", className: "very-low" };
  }
  if (score <= 45) {
    return { name: "低风险", text: "存在少量需要继续观察的关系信号", className: "low" };
  }
  if (score <= 70) {
    return { name: "中风险", text: "关系中已出现一定不稳定因素", className: "medium" };
  }
  if (score <= 85) {
    return { name: "高风险", text: "存在明显消耗、越界、欺骗或责任逃避倾向", className: "high" };
  }
  return { name: "极高风险", text: "建议优先保护情绪、隐私、财产与人身安全", className: "extreme" };
}

function getPillar(index) {
  const normalized = mod(index, 60);
  return {
    name: `${GAN[normalized % 10]}${ZHI[normalized % 12]}`,
    stem: GAN[normalized % 10],
    branch: ZHI[normalized % 12],
    stemIndex: normalized % 10,
    branchIndex: normalized % 12,
    element: STEM_ELEMENTS[normalized % 10]
  };
}

function getYearPillar(parts) {
  const adjustedYear = parts.month < 2 || (parts.month === 2 && parts.day < 4)
    ? parts.year - 1
    : parts.year;
  return getPillar(adjustedYear - 1984);
}

function getMonthPillar(parts, yearPillar) {
  let solarMonth = parts.day < 6 ? parts.month - 1 : parts.month;
  if (solarMonth <= 0) {
    solarMonth += 12;
  }
  const branchByMonth = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 0 };
  const startStemByYearStemGroup = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
  const branchIndex = branchByMonth[solarMonth];
  const offsetFromYin = mod(branchIndex - 2, 12);
  const stemIndex = mod(startStemByYearStemGroup[yearPillar.stemIndex] + offsetFromYin, 10);
  return {
    name: `${GAN[stemIndex]}${ZHI[branchIndex]}`,
    stem: GAN[stemIndex],
    branch: ZHI[branchIndex],
    stemIndex,
    branchIndex,
    element: STEM_ELEMENTS[stemIndex]
  };
}

function getJulianDayNumber(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getDayPillar(parts) {
  const jdn = getJulianDayNumber(parts.year, parts.month, parts.day);
  return getPillar(jdn - 2451545 + 54);
}

function getHourPillar(hour, dayPillar) {
  const normalizedHour = Number(hour);
  const branchIndex = normalizedHour === 23 ? 0 : Math.floor((normalizedHour + 1) / 2) % 12;
  const startStemByDayStemGroup = { 0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8 };
  const stemIndex = mod(startStemByDayStemGroup[dayPillar.stemIndex] + branchIndex, 10);
  return {
    name: `${GAN[stemIndex]}${ZHI[branchIndex]}`,
    stem: GAN[stemIndex],
    branch: ZHI[branchIndex],
    stemIndex,
    branchIndex,
    element: STEM_ELEMENTS[stemIndex]
  };
}

function getElementCounts(pillars) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach(pillar => {
    counts[STEM_ELEMENTS[pillar.stemIndex]] += 1;
    counts[BRANCH_ELEMENTS[pillar.branchIndex]] += 1;
  });
  return counts;
}

function getControlledElement(element) {
  const controls = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
  return controls[element];
}

function getControllingElement(element) {
  const controlling = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };
  return controlling[element];
}

function getTenGodHint(dayElement, gender) {
  if (gender === "男") {
    return `以${getControlledElement(dayElement)}为财星参考，侧重观察其在亲密关系中的投入、占有与现实责任。`;
  }
  if (gender === "女") {
    return `以${getControllingElement(dayElement)}为官杀星参考，侧重观察其对承诺、边界与长期秩序的态度。`;
  }
  return "十神关系以日主五行为中心，侧重观察情感投入、边界与责任的平衡。";
}

function analyzeEasternProfile(input) {
  const parts = parseBirthDate(input.birthDate);
  const birthHour = input.birthHour === "" || input.birthHour === undefined ? null : Number(input.birthHour);
  if (!parts || birthHour === null || birthHour < 0 || birthHour > 23) {
    return {
      available: false,
      score: 0,
      summary: "出生时间信息不足，东方命理分析未参与本次综合计算。"
    };
  }

  const year = getYearPillar(parts);
  const month = getMonthPillar(parts, year);
  const day = getDayPillar(parts);
  const hour = getHourPillar(birthHour, day);
  const pillars = [year, month, day, hour];
  const counts = getElementCounts(pillars);
  const values = ELEMENTS.map(element => counts[element]);
  const maxElement = ELEMENTS.slice().sort((a, b) => counts[b] - counts[a])[0];
  const minElement = ELEMENTS.slice().sort((a, b) => counts[a] - counts[b])[0];
  const imbalance = Math.max.apply(null, values) - Math.min.apply(null, values);
  const peachCount = pillars.filter(pillar => PEACH_BRANCHES.indexOf(pillar.branch) >= 0).length;
  const dayElement = STEM_ELEMENTS[day.stemIndex];
  const elementBaseScore = { 木: 42, 火: 58, 土: 36, 金: 48, 水: 54 };
  const score = round(clamp(elementBaseScore[dayElement] + imbalance * 4 + peachCount * 5, 12, 82));
  const tenGodHint = getTenGodHint(dayElement, input.gender);
  const palaceHint = PEACH_BRANCHES.indexOf(day.branch) >= 0
    ? "日支落桃花支，夫妻宫的人际吸引与情感互动信号较强。"
    : "日支未见明显桃花支，夫妻宫更适合结合现实行为观察稳定度。";
  const relationHint = imbalance >= 4
    ? `五行分布中${maxElement}偏旺、${minElement}偏弱，关系表达可能存在偏性。`
    : "五行分布未见极端偏枯，关系风格更适合做稳定观察。";

  return {
    available: true,
    score,
    pillars: {
      year: year.name,
      month: month.name,
      day: day.name,
      hour: hour.name
    },
    dayMaster: `${day.stem}${dayElement}`,
    elementCounts: counts,
    keywords: [`日主${dayElement}`, `${maxElement}偏旺`, peachCount ? "桃花星动" : "桃花信号平稳"],
    summary: `四柱简析显示：年柱${year.name}、月柱${month.name}、日柱${day.name}、时柱${hour.name}，日主为${day.stem}${dayElement}。${relationHint}${palaceHint}${tenGodHint}`,
    disclaimer: "东方命理分析基于公历出生年月日时进行四柱简析，未结合流年、大运与完整合盘。"
  };
}

function isDateInRange(month, day, start, end) {
  const value = month * 100 + day;
  const startValue = start[0] * 100 + start[1];
  const endValue = end[0] * 100 + end[1];
  if (startValue <= endValue) {
    return value >= startValue && value <= endValue;
  }
  return value >= startValue || value <= endValue;
}

function analyzeWesternProfile(input) {
  const parts = parseBirthDate(input.birthDate);
  const birthHour = input.birthHour === "" || input.birthHour === undefined ? null : Number(input.birthHour);
  if (!parts || birthHour === null || birthHour < 0 || birthHour > 23) {
    return {
      available: false,
      score: 0,
      summary: "出生时间信息不足，西方星盘分析未参与本次综合计算。"
    };
  }

  const profile = ZODIAC_PROFILES.find(item => isDateInRange(parts.month, parts.day, item.start, item.end));
  const moonIndex = mod(Math.floor((getJulianDayNumber(parts.year, parts.month, parts.day) + birthHour / 24) / 2.3), 12);
  const moonSign = ZODIAC_PROFILES[moonIndex].sign;
  const score = round(clamp(profile.score + (profile.element === "火象" || profile.element === "风象" ? 4 : -2), 12, 82));

  return {
    available: true,
    score,
    sunSign: profile.sign,
    moonSign,
    element: profile.element,
    modality: profile.modality,
    keywords: [profile.sign, profile.element, profile.modality],
    summary: `太阳星座为${profile.sign}，元素属性为${profile.element}，模式为${profile.modality}；月亮星座采用生日与出生时间进行基础估算，约为${moonSign}。${profile.style}`,
    disclaimer: "西方星盘分析当前采用太阳星座与月亮星座估算，不展开上升星座、宫位系统、金星火星精确落座与行星相位。"
  };
}

function analyzeCombined(input) {
  const eastern = analyzeEasternProfile(input);
  const western = analyzeWesternProfile(input);
  const availableWeight = (eastern.available ? COMBINED_WEIGHTS.eastern : 0) + (western.available ? COMBINED_WEIGHTS.western : 0);
  const score = availableWeight
    ? round(((eastern.available ? eastern.score * COMBINED_WEIGHTS.eastern : 0) + (western.available ? western.score * COMBINED_WEIGHTS.western : 0)) / availableWeight)
    : 0;
  const conflictNote = eastern.available && western.available && Math.abs(eastern.score - western.score) >= 22
    ? "东方四柱与西方星盘视角存在差异，本报告不强行统一结论，仍以现实行为测试为优先依据。"
    : "";

  return {
    available: availableWeight > 0,
    score,
    eastern,
    western,
    conflictNote,
    compact: buildCombinedCompact(eastern, western, score, conflictNote),
    summary: availableWeight > 0
      ? `中西结合指数 ${score} 分，用于解释关系风格与潜在倾向，不单独作为现实行为判定依据。${conflictNote}`
      : "出生时间信息不足，中西结合未参与本次综合计算。"
  };
}

function buildCombinedCompact(eastern, western, score, conflictNote) {
  if (!eastern.available && !western.available) {
    return {
      available: false,
      score: 0,
      easternLines: ["出生时间不足"],
      westernLines: ["星盘信息不足"],
      tip: "本模块未参与本次综合计算。"
    };
  }

  const easternLines = eastern.available
    ? [
      `年${eastern.pillars.year} 月${eastern.pillars.month}`,
      `日${eastern.pillars.day} 时${eastern.pillars.hour}`,
      `日主 ${eastern.dayMaster}`
    ]
    : ["四柱信息不足"];
  const westernLines = western.available
    ? [
      `太阳 ${western.sunSign}`,
      `月亮约 ${western.moonSign}`,
      `${western.element} · ${western.modality}`
    ]
    : ["星盘信息不足"];
  const tip = conflictNote
    ? "中西视角存在差异，仍以现实行为为准。"
    : score >= 65
      ? "关系风格更需要观察边界、承诺与持续稳定。"
      : score >= 45
        ? "关系风格有可观察波动，建议结合现实互动判断。"
        : "关系风格相对平稳，重点仍看现实行动。";

  return {
    available: true,
    score,
    easternLines,
    westernLines,
    tip
  };
}

function buildDimensionCards(answers) {
  return RESULT_DIMENSIONS.map(dimension => {
    const score = scoreDimension(dimension.key, answers);
    const selectedSignals = getAllQuestionItems()
      .filter(item => item.dimensions && item.dimensions[dimension.key])
      .map(item => ({ item, option: getSelectedOption(item, answers), score: cleanAnswer(answers[item.id]) }))
      .filter(entry => entry.score >= 55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(entry => entry.option.flag || entry.item.prompt);
    const bucket = score <= 40 ? "low" : score <= 60 ? "mid" : "high";

    return {
      key: dimension.key,
      name: dimension.title,
      shortName: dimension.shortTitle,
      score,
      rating: getRiskLevel(score).name,
      barStyle: `width: ${score}%;`,
      summary: dimension[bucket],
      manifestations: selectedSignals.length ? selectedSignals : ["未见明显异常表现"]
    };
  });
}

function calculateRealityScore(dimensionCards) {
  const totalWeight = RESULT_DIMENSIONS.reduce((sum, dimension) => sum + dimension.weight, 0);
  return round(dimensionCards.reduce((sum, card) => {
    const dimension = getResultDimension(card.key);
    return sum + card.score * dimension.weight;
  }, 0) / totalWeight);
}

function calculateRiskFloor(signals, realityScore) {
  let floor = signals.reduce((max, signal) => Math.max(max, signal.floor || 0), 0);
  const confirmedStrongCount = signals.filter(signal => {
    return signal.sectionKey === "confirmed" && signal.score >= 65;
  }).length;
  const criticalHighCount = signals.filter(signal => {
    return signal.severity === "critical" && signal.score >= 75;
  }).length;

  if (confirmedStrongCount >= 3) {
    floor = Math.max(floor, 78);
  }
  if (criticalHighCount >= 4 || realityScore >= 92) {
    floor = Math.max(floor, 86);
  } else if (criticalHighCount >= 2 || realityScore >= 80) {
    floor = Math.max(floor, 71);
  }

  return floor;
}

function calculateFinalScore(realityScore, combined, signals) {
  const combinedPart = combined.available ? combined.score : 0;
  let score = combined.available
    ? realityScore * (REALITY_WEIGHT / 100) + combinedPart * (COMBINED_WEIGHT / 100)
    : realityScore;
  const floor = calculateRiskFloor(signals, realityScore);

  if (realityScore <= 20) {
    score = Math.min(score, realityScore + 10);
  }
  if (realityScore <= 45) {
    score = Math.min(score, 60);
  }
  score = Math.max(score, floor);

  return round(clamp(score, 0, 100));
}

function getCardScore(dimensionCards, key) {
  const card = dimensionCards.find(item => item.key === key);
  return card ? card.score : 0;
}

function getSignalScore(signals, id) {
  const signal = signals.find(item => item.id === id);
  return signal ? signal.score : 0;
}

function buildRelationshipType(score, dimensionCards, signals) {
  if (score <= 20) {
    return Object.assign({ key: "stable", score: 100 }, RISK_ARCHETYPES.stable);
  }

  const loyalty = getCardScore(dimensionCards, "loyalty");
  const cheating = getCardScore(dimensionCards, "cheating");
  const intimacy = getCardScore(dimensionCards, "intimacy");
  const values = getCardScore(dimensionCards, "values");
  const money = getCardScore(dimensionCards, "money");
  const responsibility = getCardScore(dimensionCards, "responsibility");
  const candidates = [
    {
      key: "boundaryBlur",
      score: loyalty * 0.34 + cheating * 0.24 + values * 0.18
        + getSignalScore(signals, "q08_transparency") * 0.1
        + getSignalScore(signals, "q10_public_relationship") * 0.08
        + getSignalScore(signals, "q27_personal_space") * 0.06
    },
    {
      key: "commitmentAvoidant",
      score: responsibility * 0.46 + loyalty * 0.18
        + getSignalScore(signals, "q05_promise_broken") * 0.14
        + getSignalScore(signals, "q26_long_term_view") * 0.14
        + getSignalScore(signals, "q12_apology_change") * 0.08
    },
    {
      key: "emotionalControl",
      score: intimacy * 0.35 + values * 0.35
        + getSignalScore(signals, "q04_coercion") * 0.15
        + getSignalScore(signals, "q07_insecurity_response") * 0.08
        + getSignalScore(signals, "q25_mistake_reaction") * 0.07
    },
    {
      key: "benefitSeeking",
      score: money * 0.62 + values * 0.12 + responsibility * 0.1
        + getSignalScore(signals, "q03_money_boundary") * 0.08
        + getSignalScore(signals, "q23_money_belief") * 0.08
    },
    {
      key: "lowResponsibilityTaking",
      score: responsibility * 0.42 + values * 0.22 + intimacy * 0.14 + money * 0.1
        + getSignalScore(signals, "q13_give_take") * 0.06
        + getSignalScore(signals, "q22_responsibility_style") * 0.06
    },
    {
      key: "multiTrackAmbiguous",
      score: cheating * 0.52 + loyalty * 0.22
        + getSignalScore(signals, "q09_social_boundary") * 0.08
        + getSignalScore(signals, "q14_novelty") * 0.08
        + getSignalScore(signals, "q28_external_interest") * 0.1
    },
    {
      key: "drainingPushPull",
      score: intimacy * 0.34 + loyalty * 0.18 + values * 0.18
        + getSignalScore(signals, "q15_need_based_hotcold") * 0.1
        + getSignalScore(signals, "q20_relationship_feeling") * 0.12
        + getSignalScore(signals, "q29_key_conflict_cold") * 0.08
    }
  ].sort((a, b) => b.score - a.score);
  const top = candidates[0];

  if (score <= 45 && top.score < 55) {
    return Object.assign({ key: "stable", score: round(top.score) }, RISK_ARCHETYPES.stable);
  }

  return Object.assign({ key: top.key, score: round(top.score) }, RISK_ARCHETYPES[top.key]);
}

function buildConclusion(score, level, dimensionCards, relationshipType) {
  const top = dimensionCards.slice().sort((a, b) => b.score - a.score)[0];
  if (score <= 20) {
    return `整体判断：${relationshipType.name}。目前综合渣值较低，关键关系行为大体能对上，不需要把普通磨合理解成高危信号。`;
  }
  if (score <= 45) {
    return `整体判断：${relationshipType.name}。当前主要压力在${top.name}，还不到直接止损，但需要用行动验证，而不是继续听解释。`;
  }
  if (score <= 70) {
    return `整体判断：${relationshipType.name}。这段关系已出现明显风险，主要集中在${top.name}，短期热情不足以抵消长期不稳定。`;
  }
  return `整体判断：${relationshipType.name}。TA 的主要问题集中在${top.name}，关系结构已经偏向不对等，继续投入前必须先设止损线。`;
}

function buildPortrait(input, score, level, dimensionCards, signals, combined, relationshipType) {
  const name = input.targetName || "TA";
  const topCards = dimensionCards.slice().sort((a, b) => b.score - a.score).slice(0, 2);
  const mainText = signals.length
    ? signals.slice(0, 3).map(signal => signal.text).join("、")
    : "暂未出现明显高危关系信号";
  const tone = score <= 45
    ? "目前不适合用单个细节直接定性，更适合看 TA 能否持续做出稳定回应。"
    : score <= 70
      ? "这类关系最容易消耗你的地方，是你会不断想证明问题到底存不存在，却忽略了自己已经长期不舒服。"
      : "继续投入前，不应再把重点放在 TA 怎么解释，而要看 TA 是否有能力承担关系后果。";
  const topText = topCards.map(card => card.shortName).join("、");

  return `${name}属于${level.name}，更接近${relationshipType.name}。${relationshipType.mechanism}${tone} 当前重点维度是${topText}；主要信号包括：${mainText}。`;
}

function buildRiskExplanation(score, level, realityScore, combined, relationshipType) {
  const basis = combined.available
    ? `本次计算以现实测试为主（80%），中西结合为辅（20%）。`
    : "出生年月日时信息不足，本次计算只采用现实测试。";
  if (score <= 20) {
    return `${basis}低分的意义不是给 TA 盖章，而是说明目前没有形成“你投入、TA 回避；你焦虑、TA 推责”的高消耗结构。后续重点是维持清楚边界，而不是主动制造测试。`;
  }
  if (score <= 45) {
    return `${basis}${level.name}表示关系里已有一些不舒服的信号，但还没有形成稳定伤害模式。真正要看的不是 TA 此刻怎么解释，而是${relationshipType.verification}`;
  }
  if (score <= 70) {
    return `${basis}${level.name}表示关系结构已经开始让你承担额外情绪成本。核心机制是：${relationshipType.mechanism}${relationshipType.stopLine}`;
  }
  return `${basis}${level.name}不是在说某一件事已经坐实，而是在提示这段关系的运行方式正在伤害你。${relationshipType.mechanism}${relationshipType.stopLine}`;
}

function buildSuggestions(score, dimensionCards, relationshipType) {
  const moneyScore = dimensionCards.find(card => card.key === "money").score;
  const cheatingScore = dimensionCards.find(card => card.key === "cheating").score;
  const valuesScore = dimensionCards.find(card => card.key === "values").score;
  const suggestions = [];

  if (score <= 20) {
    suggestions.push("继续观察，不要因为普通磨合过度推断。");
    suggestions.push("可以清晰沟通关系边界、联系频率、异性社交和未来节奏。");
    suggestions.push("保持基本金钱和隐私边界。");
  } else if (score <= 45) {
    suggestions.push(relationshipType.verification);
    suggestions.push("不要过早投入金钱、同居、长期承诺或共同资产。");
    suggestions.push("把不舒服的点讲清楚，并观察 TA 是否尊重。");
  } else if (score <= 70) {
    suggestions.push("给自己设置 2-4 周观察期，只记录行动，不再反复解释 TA 的动机。");
    suggestions.push("不要用解释、讨好或自我牺牲换取关系稳定。");
    suggestions.push(relationshipType.verification);
  } else {
    suggestions.push("降低投入，把情绪、隐私、财产和人身安全放在优先位置。");
    suggestions.push("把真实情况告诉可信朋友，不要独自消化。");
    suggestions.push(relationshipType.stopLine);
  }

  if (moneyScore >= 50) {
    suggestions.push("涉及借钱、转账、投资或共同消费时先暂停。");
  }
  if (cheatingScore >= 50) {
    suggestions.push("明确异性社交和暧昧边界，看 TA 是否主动调整。");
  }
  if (valuesScore >= 50) {
    suggestions.push("如果出现打压、双标、施压或边界侵犯，优先恢复现实支持系统。");
  }

  return suggestions.slice(0, 5);
}

function buildKeywords(dimensionCards, combined) {
  const keywords = dimensionCards
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(card => card.shortName);
  if (combined.available && combined.western.available) {
    keywords.push(combined.western.sunSign);
  }
  return keywords;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatBirthTime(hour) {
  if (hour === "" || hour === undefined || hour === null) {
    return "";
  }
  const startHour = Number(hour);
  if (!Number.isFinite(startHour) || startHour < 0 || startHour > 23) {
    return "";
  }
  const start = `${String(startHour).padStart(2, "0")}:00`;
  const end = `${String(startHour + 1).padStart(2, "0")}:00`;
  return `${start} - ${end}`;
}

function calculateAge(birthDate, now) {
  const parts = parseBirthDate(birthDate);
  if (!parts) {
    return null;
  }
  const current = now || new Date();
  let age = current.getFullYear() - parts.year;
  const currentMonth = current.getMonth() + 1;
  const currentDay = current.getDate();
  if (currentMonth < parts.month || (currentMonth === parts.month && currentDay < parts.day)) {
    age -= 1;
  }
  return age >= 0 && age <= 120 ? age : null;
}

function formatAge(age) {
  return age === null ? "年龄未知" : `${age}岁`;
}

function generateReport(input) {
  const answers = input.answers || {};
  const dimensionCards = buildDimensionCards(answers);
  const signals = collectSignals(answers);
  const realityScore = calculateRealityScore(dimensionCards);
  const combined = analyzeCombined(input);
  const score = calculateFinalScore(realityScore, combined, signals);
  const level = getRiskLevel(score);
  const relationshipType = buildRelationshipType(score, dimensionCards, signals);
  const now = new Date();
  const age = calculateAge(input.birthDate, now);

  return {
    targetName: input.targetName || "TA",
    gender: input.gender || "",
    birthDate: input.birthDate || "",
    birthHour: input.birthHour,
    birthTime: formatBirthTime(input.birthHour),
    age,
    ageText: formatAge(age),
    generatedAt: formatDate(now),
    score,
    level,
    relationshipType,
    conclusion: buildConclusion(score, level, dimensionCards, relationshipType),
    portrait: buildPortrait(input, score, level, dimensionCards, signals, combined, relationshipType),
    modules: dimensionCards,
    combined,
    realityScore,
    riskExplanation: buildRiskExplanation(score, level, realityScore, combined, relationshipType),
    suggestions: buildSuggestions(score, dimensionCards, relationshipType),
    keywords: [relationshipType.shortName].concat(buildKeywords(dimensionCards, combined)).slice(0, 4),
    caveat: "本报告用于亲密关系风险识别和自我保护参考，不构成对任何人的绝对人格判定。"
  };
}

module.exports = {
  REALITY_WEIGHT,
  COMBINED_WEIGHT,
  COMBINED_WEIGHTS,
  RESULT_DIMENSIONS,
  RESPONSE_OPTIONS,
  QUESTION_SECTIONS,
  analyzeCombined,
  generateReport,
  getAllQuestionItems,
  getRiskLevel
};

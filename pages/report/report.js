const POSTER_WIDTH = 750;
const POSTER_INITIAL_HEIGHT = 2600;
const POSTER_PADDING = 44;
const POSTER_CONTENT_WIDTH = POSTER_WIDTH - POSTER_PADDING * 2;
const POSTER_GAP = 24;
const POSTER_RENDER_DELAY = 120;
const POSTER_EXPORT_DELAY = 420;
const POSTER_EXPORT_RETRY_DELAYS = [0, 900, 2200, 4200, 6500];
const POSTER_EXPORT_TIMEOUT = 14000;
const RISK_COLORS = {
  "very-low": "#2f8f5b",
  low: "#4d8fcb",
  medium: "#d89b19",
  high: "#d45a2c",
  extreme: "#b4232c"
};
const RISK_CHARACTER_IMAGES = {
  "very-low": "assets/risk-characters/very-low.png",
  low: "assets/risk-characters/low.png",
  medium: "assets/risk-characters/medium.png",
  high: "assets/risk-characters/high.png",
  extreme: "assets/risk-characters/extreme.png"
};

function roundedPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPanel(ctx, x, y, width, height, radius, fillColor, strokeColor, lineWidth) {
  roundedPath(ctx, x, y, width, height, radius);
  setFill(ctx, fillColor || "#ffffff");
  ctx.fill();
  if (strokeColor) {
    setStroke(ctx, strokeColor);
    setLineWidth(ctx, lineWidth || 3);
    ctx.stroke();
  }
}

function setFill(ctx, color) {
  if (typeof ctx.setFillStyle === "function") {
    ctx.setFillStyle(color);
  } else {
    ctx.fillStyle = color;
  }
}

function setStroke(ctx, color) {
  if (typeof ctx.setStrokeStyle === "function") {
    ctx.setStrokeStyle(color);
  } else {
    ctx.strokeStyle = color;
  }
}

function setLineWidth(ctx, width) {
  if (typeof ctx.setLineWidth === "function") {
    ctx.setLineWidth(width);
  } else {
    ctx.lineWidth = width;
  }
}

function setTextStyle(ctx, size, color, align) {
  setFill(ctx, color);
  if (typeof ctx.setFontSize === "function") {
    ctx.setFontSize(size);
  } else {
    ctx.font = `${size}px sans-serif`;
  }
  if (typeof ctx.setTextAlign === "function") {
    ctx.setTextAlign(align || "left");
  } else {
    ctx.textAlign = align || "left";
  }
  if (typeof ctx.setTextBaseline === "function") {
    ctx.setTextBaseline("top");
  } else {
    ctx.textBaseline = "top";
  }
}

function splitTextToLines(ctx, text, maxWidth) {
  const chars = String(text || "").replace(/\s+/g, " ").split("");
  const lines = [];
  let line = "";

  chars.forEach(char => {
    const nextLine = line + char;
    if (getTextWidth(ctx, nextLine) > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = nextLine;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function getTextWidth(ctx, text) {
  if (ctx && typeof ctx.measureText === "function") {
    const result = ctx.measureText(text);
    if (result && Number.isFinite(result.width)) {
      return result.width;
    }
  }
  return String(text || "").length * 26;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = splitTextToLines(ctx, text, maxWidth);
  const visibleLines = maxLines ? lines.slice(0, maxLines) : lines;

  visibleLines.forEach((line, index) => {
    const isClipped = maxLines && index === maxLines - 1 && lines.length > maxLines;
    ctx.fillText(isClipped ? `${line.slice(0, -1)}...` : line, x, y + index * lineHeight);
  });

  return y + visibleLines.length * lineHeight;
}

function getRiskColor(level) {
  const className = level && level.className;
  return RISK_COLORS[className] || "#111111";
}

function drawTag(ctx, text, x, y, width, color) {
  drawPanel(ctx, x, y, width, 48, 10, color || "#111111", color || "#111111", 3);
  setTextStyle(ctx, 24, "#ffffff", "center");
  ctx.fillText(text, x + width / 2, y + 10);
}

function getRadarItems(modules) {
  const labels = {
    loyalty: "忠诚",
    cheating: "多线",
    intimacy: "亲密",
    values: "尊重",
    money: "金钱",
    responsibility: "责任"
  };
  return (modules || []).map(item => ({
    label: labels[item.key] || item.shortName || item.name,
    score: item.score === null ? 0 : item.score
  }));
}

function drawRadarChart(ctx, modules, centerX, centerY, radius, options) {
  const items = getRadarItems(modules);
  const count = items.length || 6;
  const labelSize = options && options.labelSize ? options.labelSize : 20;
  const scoreSize = options && options.scoreSize ? options.scoreSize : 18;
  const gridColor = options && options.gridColor ? options.gridColor : "#d9d9d9";

  function pointAt(index, valueRadius) {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
    return {
      x: centerX + Math.cos(angle) * valueRadius,
      y: centerY + Math.sin(angle) * valueRadius
    };
  }

  setStroke(ctx, gridColor);
  setLineWidth(ctx, 2);
  for (let level = 1; level <= 5; level += 1) {
    ctx.beginPath();
    items.forEach((_, index) => {
      const point = pointAt(index, radius * level / 5);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
  }

  items.forEach((_, index) => {
    const point = pointAt(index, radius);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  });

  ctx.beginPath();
  items.forEach((item, index) => {
    const point = pointAt(index, radius * item.score / 100);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  setFill(ctx, "#d9d9d9");
  ctx.fill();
  setStroke(ctx, "#111111");
  setLineWidth(ctx, 4);
  ctx.stroke();

  items.forEach((item, index) => {
    const point = pointAt(index, radius + 36);
    const align = Math.abs(point.x - centerX) < 8 ? "center" : point.x > centerX ? "left" : "right";
    setTextStyle(ctx, labelSize, "#111111", align);
    ctx.fillText(item.label, point.x, point.y - 14);
    setTextStyle(ctx, scoreSize, "#555555", align);
    ctx.fillText(String(item.score), point.x, point.y + 10);
  });
}

function countWrappedLines(ctx, text, size, maxWidth) {
  if (typeof ctx.setFontSize === "function") {
    ctx.setFontSize(size);
  } else {
    ctx.font = `${size}px sans-serif`;
  }
  return splitTextToLines(ctx, text, maxWidth).length || 1;
}

function measureTextCardHeight(ctx, text, width, minHeight) {
  const lines = countWrappedLines(ctx, text, 25, width - 52);
  return Math.max(minHeight || 180, 78 + lines * 38 + 28);
}

function measureListCardHeight(ctx, items, width) {
  const listItems = (items || []).slice(0, 5);
  const bodyHeight = listItems.reduce((height, item) => {
    const lines = countWrappedLines(ctx, item, 25, width - 88);
    return height + Math.max(48, lines * 34 + 18);
  }, 0);
  return 82 + bodyHeight + 24;
}

function measureCombinedCardHeight(ctx, combined, width) {
  const innerWidth = width - 52;
  let height = 82;
  height += countWrappedLines(ctx, combined.summary, 25, innerWidth) * 36 + 18;

  if (combined.eastern && combined.eastern.available) {
    height += 44 + countWrappedLines(ctx, combined.eastern.summary, 24, innerWidth) * 34 + 18;
  }
  if (combined.western && combined.western.available) {
    height += 44 + countWrappedLines(ctx, combined.western.summary, 24, innerWidth) * 34 + 18;
  }
  if (combined.conflictNote) {
    height += countWrappedLines(ctx, combined.conflictNote, 23, innerWidth) * 32 + 18;
  }

  return Math.max(300, height + 24);
}

function measurePosterLayout(ctx, report) {
  const portraitHeight = measureTextCardHeight(ctx, report.portrait, POSTER_CONTENT_WIDTH, 200);
  const dimensionHeight = 430;
  const combinedHeight = measureCombinedCardHeight(ctx, report.combined, POSTER_CONTENT_WIDTH);
  const riskHeight = measureTextCardHeight(ctx, report.riskExplanation, POSTER_CONTENT_WIDTH, 190);
  const suggestionsHeight = measureListCardHeight(ctx, report.suggestions, POSTER_CONTENT_WIDTH);
  const caveatLines = countWrappedLines(ctx, report.caveat, 22, POSTER_CONTENT_WIDTH);
  const caveatHeight = caveatLines * 32;
  const scoreHeight = 410;
  const footerHeight = 76;
  const totalHeight = POSTER_PADDING
    + scoreHeight + POSTER_GAP
    + portraitHeight + POSTER_GAP
    + dimensionHeight + POSTER_GAP
    + combinedHeight + POSTER_GAP
    + riskHeight + POSTER_GAP
    + suggestionsHeight + POSTER_GAP
    + caveatHeight + footerHeight
    + POSTER_PADDING;

  return {
    scoreHeight,
    portraitHeight,
    dimensionHeight,
    combinedHeight,
    riskHeight,
    suggestionsHeight,
    caveatHeight,
    totalHeight: Math.ceil(totalHeight)
  };
}

function drawScorePanel(ctx, report, y, imagePath, height) {
  const riskColor = getRiskColor(report.level);
  const iconWidth = 174;
  const iconHeight = 180;
  const iconX = POSTER_WIDTH - POSTER_PADDING - 26 - iconWidth;
  drawPanel(ctx, POSTER_PADDING, y, POSTER_CONTENT_WIDTH, height, 20, "#ffffff", "#111111", 4);

  setTextStyle(ctx, 26, "#111111");
  ctx.fillText("鉴渣评估报告", POSTER_PADDING + 28, y + 26);
  drawTag(ctx, report.level.name, POSTER_WIDTH - POSTER_PADDING - 168, y + 24, 140, riskColor);

  setTextStyle(ctx, 28, "#555555");
  ctx.fillText(`${report.targetName || "TA"} · ${report.gender || "未填性别"} · ${report.ageText || "年龄未知"}`, POSTER_PADDING + 28, y + 76);
  ctx.fillText(report.generatedAt || "", POSTER_PADDING + 28, y + 116);

  setTextStyle(ctx, 32, "#111111");
  ctx.fillText("综合渣值", POSTER_PADDING + 28, y + 170);
  setTextStyle(ctx, 106, riskColor);
  const scoreText = String(report.score);
  ctx.fillText(scoreText, POSTER_PADDING + 28, y + 206);
  const scoreWidth = getTextWidth(ctx, scoreText);
  setTextStyle(ctx, 32, "#111111");
  ctx.fillText("/100", POSTER_PADDING + 28 + scoreWidth + 8, y + 272);

  if (imagePath) {
    ctx.drawImage(imagePath, iconX, y + 138, iconWidth, iconHeight);
  }
  setTextStyle(ctx, 27, "#333333");
  drawWrappedText(ctx, report.conclusion, POSTER_PADDING + 28, y + 326, POSTER_CONTENT_WIDTH - 56, 40, 2);

  return y + height + POSTER_GAP;
}

function exportPosterCanvas(canvas, height, resolve, reject) {
  let settled = false;
  let started = false;
  let lastError = null;
  const retryTimers = [];
  let timeoutTimer = null;

  function finish(callback, value) {
    if (settled) {
      return;
    }
    settled = true;
    retryTimers.forEach(timer => clearTimeout(timer));
    clearTimeout(timeoutTimer);
    callback(value);
  }

  function exportCanvas() {
    if (settled) {
      return;
    }
    wx.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width: POSTER_WIDTH,
      height,
      destWidth: POSTER_WIDTH,
      destHeight: height,
      fileType: "png",
      success: result => finish(resolve, result.tempFilePath),
      fail: error => {
        lastError = error;
      }
    });
  }

  return function startExport() {
    if (started || settled) {
      return;
    }
    started = true;
    POSTER_EXPORT_RETRY_DELAYS.forEach(delay => {
      retryTimers.push(setTimeout(exportCanvas, delay));
    });
    timeoutTimer = setTimeout(() => {
      finish(reject, lastError || new Error("报告图片生成超时，请重试"));
    }, POSTER_EXPORT_TIMEOUT);
  };
}

function drawTextCard(ctx, title, text, y, height) {
  drawPanel(ctx, POSTER_PADDING, y, POSTER_CONTENT_WIDTH, height, 18, "#ffffff", "#111111", 3);
  setTextStyle(ctx, 30, "#111111");
  ctx.fillText(title, POSTER_PADDING + 26, y + 24);
  setTextStyle(ctx, 25, "#333333");
  drawWrappedText(ctx, text, POSTER_PADDING + 26, y + 78, POSTER_CONTENT_WIDTH - 52, 38);
  return y + height + POSTER_GAP;
}

function drawDimensionRadarCard(ctx, modules, y, height) {
  drawPanel(ctx, POSTER_PADDING, y, POSTER_CONTENT_WIDTH, height, 18, "#ffffff", "#111111", 3);
  setTextStyle(ctx, 30, "#111111");
  ctx.fillText("六大维度", POSTER_PADDING + 26, y + 24);
  drawRadarChart(ctx, modules, POSTER_WIDTH / 2, y + 238, 128, {
    labelSize: 25,
    scoreSize: 21
  });

  return y + height + POSTER_GAP;
}

function drawCombinedReportCard(ctx, combined, y, height) {
  const textX = POSTER_PADDING + 26;
  const maxWidth = POSTER_CONTENT_WIDTH - 52;
  let rowY = y + 78;

  drawPanel(ctx, POSTER_PADDING, y, POSTER_CONTENT_WIDTH, height, 18, "#ffffff", "#111111", 3);
  setTextStyle(ctx, 30, "#111111");
  ctx.fillText("中西结合", textX, y + 24);

  setTextStyle(ctx, 25, "#333333");
  rowY = drawWrappedText(ctx, combined.summary, textX, rowY, maxWidth, 36) + 18;

  if (combined.eastern && combined.eastern.available) {
    setTextStyle(ctx, 27, "#111111");
    ctx.fillText(`四柱简析 · ${combined.eastern.score} 分`, textX, rowY);
    rowY += 42;
    setTextStyle(ctx, 24, "#333333");
    rowY = drawWrappedText(ctx, combined.eastern.summary, textX, rowY, maxWidth, 34) + 18;
  }

  if (combined.western && combined.western.available) {
    setTextStyle(ctx, 27, "#111111");
    ctx.fillText(`西方星盘 · ${combined.western.score} 分`, textX, rowY);
    rowY += 42;
    setTextStyle(ctx, 24, "#333333");
    rowY = drawWrappedText(ctx, combined.western.summary, textX, rowY, maxWidth, 34) + 18;
  }

  if (combined.conflictNote) {
    setTextStyle(ctx, 23, "#555555");
    drawWrappedText(ctx, combined.conflictNote, textX, rowY, maxWidth, 32);
  }

  return y + height + POSTER_GAP;
}

function drawListCard(ctx, title, items, y, height) {
  drawPanel(ctx, POSTER_PADDING, y, POSTER_CONTENT_WIDTH, height, 18, "#ffffff", "#111111", 3);
  setTextStyle(ctx, 30, "#111111");
  ctx.fillText(title, POSTER_PADDING + 26, y + 24);
  setTextStyle(ctx, 25, "#333333");

  let rowY = y + 82;
  (items || []).slice(0, 5).forEach((item, index) => {
    rowY = drawWrappedText(ctx, `${index + 1}. ${item}`, POSTER_PADDING + 26, rowY, POSTER_CONTENT_WIDTH - 52, 34);
    rowY += 16;
  });

  return y + height + POSTER_GAP;
}

Page({
  data: {
    report: null,
    posterPath: "",
    posterWidth: POSTER_WIDTH,
    posterHeight: POSTER_INITIAL_HEIGHT,
    isGeneratingPoster: false
  },

  onLoad() {
    const report = wx.getStorageSync("latestReport");
    if (report) {
      this.setData({ report });
    }
  },

  backToForm() {
    wx.navigateBack();
  },

  generatePoster() {
    if (!this.data.report || this.data.isGeneratingPoster) {
      return Promise.resolve(this.data.posterPath);
    }

    this.setData({
      isGeneratingPoster: true,
      posterPath: ""
    });
    wx.showLoading({ title: "生成报告中" });

    return new Promise((resolve, reject) => {
      try {
        this.drawPoster(resolve, reject);
      } catch (error) {
        reject(error);
      }
    })
      .then(filePath => {
        this.setData({
          posterPath: filePath,
          isGeneratingPoster: false
        });
        wx.hideLoading();
        wx.showToast({
          title: "图片已生成",
          icon: "success"
        });
        return filePath;
      })
      .catch(error => {
        this.setData({ isGeneratingPoster: false });
        wx.hideLoading();
        wx.showToast({
          title: "生成失败，请重试",
          icon: "none"
        });
        console.error("generate poster failed", error);
        throw error;
      });
  },

  loadCanvasImage(canvas, src) {
    return new Promise(resolve => {
      if (!canvas || typeof canvas.createImage !== "function") {
        resolve(null);
        return;
      }
      const image = canvas.createImage();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  },

  getPosterCanvasNode() {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        .in(this)
        .select("#reportPoster")
        .fields({ node: true, size: true })
        .exec(result => {
          const item = result && result[0];
          if (!item || !item.node) {
            reject(new Error("未找到报告画布"));
            return;
          }
          resolve({
            canvas: item.node,
            width: item.width,
            height: item.height
          });
        });
    });
  },

  drawPoster(resolve, reject) {
    const report = this.data.report;
    this.getPosterCanvasNode()
      .then(({ canvas }) => {
        const measureCtx = canvas.getContext("2d");
        const layout = measurePosterLayout(measureCtx, report);
        this.setData({
          posterWidth: POSTER_WIDTH,
          posterHeight: layout.totalHeight
        }, () => {
          setTimeout(() => {
            this.getPosterCanvasNode()
              .then(({ canvas: renderCanvas }) => {
                renderCanvas.width = POSTER_WIDTH;
                renderCanvas.height = layout.totalHeight;
                return this.loadCanvasImage(renderCanvas, RISK_CHARACTER_IMAGES[report.level.className] || RISK_CHARACTER_IMAGES["very-low"])
                  .then(image => ({ renderCanvas, image }));
              })
              .then(({ renderCanvas, image }) => {
                const ctx = renderCanvas.getContext("2d");
                this.renderPoster(renderCanvas, ctx, report, layout, image, resolve, reject);
              })
              .catch(reject);
          }, POSTER_RENDER_DELAY);
        });
      })
      .catch(reject);
  },

  renderPoster(canvas, ctx, report, layout, imagePath, resolve, reject) {
    let y = POSTER_PADDING;

    setFill(ctx, "#f6f6f3");
    ctx.fillRect(0, 0, POSTER_WIDTH, layout.totalHeight);

    y = drawScorePanel(ctx, report, y, imagePath, layout.scoreHeight);
    y = drawTextCard(ctx, "整体画像", report.portrait, y, layout.portraitHeight);
    y = drawDimensionRadarCard(ctx, report.modules, y, layout.dimensionHeight);
    y = drawCombinedReportCard(ctx, report.combined, y, layout.combinedHeight);
    y = drawTextCard(ctx, "风险解释", report.riskExplanation, y, layout.riskHeight);
    y = drawListCard(ctx, "行动建议", report.suggestions, y, layout.suggestionsHeight);

    setTextStyle(ctx, 22, "#555555", "left");
    const caveatBottom = drawWrappedText(ctx, report.caveat, POSTER_PADDING, y, POSTER_CONTENT_WIDTH, 32);
    setTextStyle(ctx, 24, "#111111", "center");
    ctx.fillText("由鉴渣助手生成", POSTER_WIDTH / 2, caveatBottom + 38);

    const startExport = exportPosterCanvas(canvas, layout.totalHeight, resolve, reject);
    setTimeout(startExport, POSTER_EXPORT_DELAY);
  },

  savePoster() {
    const save = filePath => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => {
          wx.showToast({
            title: "已保存到相册",
            icon: "success"
          });
        },
        fail: error => {
          const message = error && error.errMsg ? error.errMsg : "";
          if (
            message.indexOf("auth deny") >= 0
            || message.indexOf("auth denied") >= 0
            || message.indexOf("authorize no response") >= 0
            || message.indexOf("scope.writePhotosAlbum") >= 0
            || message.indexOf("permission") >= 0
          ) {
            wx.showModal({
              title: "需要相册权限",
              content: "请允许保存到相册，才能一键下载报告图片。",
              confirmText: "去设置",
              success: modalResult => {
                if (modalResult.confirm) {
                  wx.openSetting();
                }
              }
            });
          } else {
            wx.showToast({
              title: "保存失败，请重试",
              icon: "none"
            });
          }
        }
      });
    };

    if (this.data.posterPath) {
      save(this.data.posterPath);
      return;
    }

    this.generatePoster().then(save).catch(() => {});
  },

  previewPoster() {
    if (!this.data.posterPath) {
      return;
    }
    wx.previewImage({
      urls: [this.data.posterPath],
      current: this.data.posterPath
    });
  },

  onShareAppMessage() {
    const report = this.data.report || {};
    const scoreText = report.score !== undefined ? `${report.score}分` : "测评报告";
    return {
      title: `我生成了一份鉴渣助手报告：${scoreText}`,
      path: "/pages/start/start"
    };
  }
});

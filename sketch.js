// 1. 定義測驗題目資料庫（共五題 p5.js 基礎指令測驗）
let questions = [
  {
    question: "1. 在 p5.js 中，哪一個函數會在程式啟動時「只執行一次」？",
    options: ["draw()", "setup()", "preload()", "mousePressed()"],
    answer: 1 // 正確答案索引（1 代表 setup()）
  },
  {
    question: "2. 想要設定畫布背景顏色，應該使用哪一個指令？",
    options: ["fill()", "stroke()", "background()", "color()"],
    answer: 2
  },
  {
    question: "3. 繪製一個圓形或橢圓形時，應使用下列哪一個指令？",
    options: ["rect()", "line()", "triangle()", "ellipse()"],
    answer: 3
  },
  {
    question: "4. 哪一個內建變數可以取得「目前滑鼠的 X 軸座標」？",
    options: ["mouseX", "mouseY", "width", "height"],
    answer: 0
  },
  {
    question: "5. 若要填滿圖形的內部顏色，應該使用哪一個指令？",
    options: ["stroke()", "fill()", "noFill()", "strokeWeight()"],
    answer: 1
  }
];

// 2. 全域狀態變數
let currentQuestion = 0;   // 當前題目索引 (0 ~ 4)
let score = 0;             // 答對題數
let selectedOption = -1;   // 玩家選中的選項索引 (-1 表示尚未選擇)
let isAnswered = false;    // 當前題目是否已作答
let quizFinished = false;  // 測驗是否已完成
let lastClickTime = 0;     // 紀錄上次點擊時間，用於防衝擊 (Cooldown)

// 3. 佈局座標與尺寸資料
let layout = {
  isLandscape: false,
  boxW: 0,
  boxH: 0,
  spacing: 0,
  startY: 0,
  optionBoxes: [],
  nextBtn: { x: 0, y: 0, w: 0, h: 0 },
  restartBtn: { x: 0, y: 0, w: 0, h: 0 }
};

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 設定文字對齊方式為垂直與水平居中
  textAlign(CENTER, CENTER);
  // 設定矩形繪製模式為中心點對齊 (CENTER)
  rectMode(CENTER);
}

function draw() {
  // 每次重繪時，精準更新響應式佈局
  updateLayout();

  // 設定背景顏色為深藍灰 (質感暗色主題)
  background(24, 32, 54);

  // 判斷當前為「測驗進行中」或「結算結果畫面」
  if (quizFinished) {
    drawScoreScreen();
  } else {
    drawQuizScreen();
  }
}

// 4. 動態計算響應式版面尺寸與按鈕座標
function updateLayout() {
  let isLandscape = width > height && height < 500;
  let baseUnit = min(width, height);

  let boxW = constrain(width * 0.85, 260, 680);
  let boxH = isLandscape ? constrain(height * 0.1, 32, 45) : constrain(height * 0.075, 42, 60);
  let spacing = isLandscape ? boxH + 8 : boxH + constrain(height * 0.018, 10, 20);
  let startY = isLandscape ? height * 0.38 : height * 0.36;

  layout.isLandscape = isLandscape;
  layout.boxW = boxW;
  layout.boxH = boxH;
  layout.spacing = spacing;
  layout.startY = startY;

  // 更新 4 個選項按鈕座標
  layout.optionBoxes = [];
  for (let i = 0; i < 4; i++) {
    layout.optionBoxes.push({
      x: width / 2,
      y: startY + i * spacing,
      w: boxW,
      h: boxH
    });
  }

  // 更新「下一題」按鈕座標
  layout.nextBtn = {
    x: width / 2,
    y: startY + 4 * spacing + (isLandscape ? 10 : 20),
    w: constrain(boxW * 0.5, 140, 220),
    h: constrain(boxH * 0.9, 36, 50)
  };

  // 更新「重新測驗」按鈕座標
  layout.restartBtn = {
    x: width / 2,
    y: height * 0.62,
    w: constrain(width * 0.4, 160, 240),
    h: constrain(height * 0.08, 45, 60)
  };
}

// 5. 繪製測驗主要畫面
function drawQuizScreen() {
  let q = questions[currentQuestion];
  let baseUnit = min(width, height);

  let progressTextSize = constrain(baseUnit * 0.035, 14, 20);
  let titleTextSize    = constrain(baseUnit * 0.045, 16, 26);
  let optionTextSize   = constrain(baseUnit * 0.038, 14, 22);

  // 頂部進度與題目
  fill(160, 175, 200);
  noStroke();
  textSize(progressTextSize);
  text(`第 ${currentQuestion + 1} 題 / 共 ${questions.length} 題`, width / 2, layout.isLandscape ? height * 0.1 : height * 0.12);

  fill(255);
  textSize(titleTextSize);
  textStyle(BOLD);
  text(q.question, width / 2, layout.isLandscape ? height * 0.22 : height * 0.22, layout.boxW, layout.isLandscape ? 45 : 70);
  textStyle(NORMAL);

  // 繪製四個選項
  for (let i = 0; i < 4; i++) {
    let b = layout.optionBoxes[i];
    let bgColor = color(38, 48, 77);

    if (isAnswered) {
      if (i === q.answer) {
        if (selectedOption === q.answer) {
          bgColor = color(40, 167, 69); // 答對：綠色
        } else {
          bgColor = color('#c1121f');  // 答錯：指定紅色背景標示正確答案
        }
      } else if (i === selectedOption) {
        bgColor = color(70, 75, 90);    // 選錯的項目：暗灰色
      }
    } else {
      if (checkHover(b.x, b.y, b.w, b.h, mouseX, mouseY)) {
        bgColor = color(60, 78, 118);   // 電腦端懸停變亮
      }
    }

    // 繪製選項框
    stroke(255, 30);
    strokeWeight(1.5);
    fill(bgColor);
    rect(b.x, b.y, b.w, b.h, b.h * 0.25);

    // 繪製選項文字
    noStroke();
    fill(255);
    textSize(optionTextSize);
    text(q.options[i], b.x, b.y);
  }

  // 答題完成後顯示「下一題」按鈕
  if (isAnswered) {
    let nb = layout.nextBtn;
    let btnColor = checkHover(nb.x, nb.y, nb.w, nb.h, mouseX, mouseY)
      ? color(255, 183, 3)
      : color(251, 133, 0);

    stroke(255, 150);
    strokeWeight(1);
    fill(btnColor);
    rect(nb.x, nb.y, nb.w, nb.h, nb.h * 0.5);

    noStroke();
    fill(0);
    textSize(optionTextSize);
    textStyle(BOLD);
    let btnText = (currentQuestion === questions.length - 1) ? "查看結果" : "下一題";
    text(btnText, nb.x, nb.y);
    textStyle(NORMAL);
  }
}

// 6. 繪製測驗結果頁面
function drawScoreScreen() {
  let baseUnit = min(width, height);
  let titleSize = constrain(baseUnit * 0.08, 28, 48);
  let scoreSize = constrain(baseUnit * 0.05, 20, 32);

  fill(255);
  noStroke();
  textSize(titleSize);
  textStyle(BOLD);
  text("🎉 測驗結束！", width / 2, height * 0.3);

  textSize(scoreSize);
  textStyle(NORMAL);
  fill(220, 230, 255);
  text(`你的最終得分： ${score} / ${questions.length}`, width / 2, height * 0.44);

  // 重新開始按鈕
  let rb = layout.restartBtn;
  let isHover = checkHover(rb.x, rb.y, rb.w, rb.h, mouseX, mouseY);
  
  fill(isHover ? color(40, 167, 69) : color(32, 139, 58));
  stroke(255, 100);
  strokeWeight(1.5);
  rect(rb.x, rb.y, rb.w, rb.h, rb.h * 0.5);

  noStroke();
  fill(255);
  textSize(constrain(baseUnit * 0.04, 16, 24));
  textStyle(BOLD);
  text("重新測驗", rb.x, rb.y);
  textStyle(NORMAL);
}

// 7. 防連點/防連發與跨裝置點擊的核心處理函數
function processInput(px, py) {
  // 設定 250 毫秒冷卻時間，防止手機「連擊過速」或同時觸發 touch + mouse 事件
  if (millis() - lastClickTime < 250) return;
  lastClickTime = millis();

  updateLayout();

  // 情況 A: 測驗結束時，點擊重新測驗
  if (quizFinished) {
    let rb = layout.restartBtn;
    if (checkHover(rb.x, rb.y, rb.w, rb.h, px, py)) {
      resetQuiz();
    }
    return;
  }

  // 情況 B: 尚未回答時，點擊選項作答
  if (!isAnswered) {
    for (let i = 0; i < layout.optionBoxes.length; i++) {
      let b = layout.optionBoxes[i];
      if (checkHover(b.x, b.y, b.w, b.h, px, py)) {
        selectedOption = i;
        isAnswered = true;

        if (selectedOption === questions[currentQuestion].answer) {
          score++;
        }
        break;
      }
    }
  } else {
    // 情況 C: 已回答時，點擊「下一題」按鈕
    let nb = layout.nextBtn;
    if (checkHover(nb.x, nb.y, nb.w, nb.h, px, py)) {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        selectedOption = -1;
        isAnswered = false;
      } else {
        quizFinished = true;
      }
    }
  }
}

// 8. 電腦滑鼠點擊觸發
function mousePressed() {
  processInput(mouseX, mouseY);
}

// 9. 行動裝置觸控觸發 (精準抓取手指接觸座標)
function touchStarted() {
  let touchX = mouseX;
  let touchY = mouseY;
  
  if (touches.length > 0) {
    touchX = touches[0].x;
    touchY = touches[0].y;
  }

  processInput(touchX, touchY);
  return false; // 阻止瀏覽器畫面上下滾動或縮放
}

// 10. 通用座標碰撞檢查函數 (CENTER 模式)
function checkHover(cx, cy, w, h, px, py) {
  return (
    px >= cx - w / 2 &&
    px <= cx + w / 2 &&
    py >= cy - h / 2 &&
    py <= cy + h / 2
  );
}

// 11. 視窗尺寸改變時，動態自適應畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}

// 12. 重置測驗狀態
function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  selectedOption = -1;
  isAnswered = false;
  quizFinished = false;
}
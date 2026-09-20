// 成人 ADHD 自评问卷 — ASRS v1.1（WHO / Harvard）
// 本文件实现量表渲染、作答收集与计分。计分逻辑依据官方 ASRS v1.1 Screener。

// 18 道题。part: "A" 为筛查核心 6 题（Screener），"B" 为补充 12 题。
const QUESTIONS = [
  // —— Part A：核心筛查（1–6）——
  { part: "A", text: "在一个项目里，当最有挑战性的部分完成后，却很难把收尾的细节做完。" },
  { part: "A", text: "当一项任务需要组织规划时，很难把事情安排得井井有条。" },
  { part: "A", text: "经常忘记约会或应该履行的义务。" },
  { part: "A", text: "会回避或推迟开始那些需要很多精力的任务。" },
  { part: "A", text: "久坐时，会动来动去或坐立不安。" },
  { part: "A", text: "感觉自己过度活跃，被一种内在动力驱使着去做事情，就像上了发条一样。" },
  // —— Part B：补充症状（7–18）——
  { part: "B", text: "在做枯燥或困难的项目时，会犯一些粗心的错误。" },
  { part: "B", text: "别人对你说话时，很难把注意力集中在对方说的话上。" },
  { part: "B", text: "很难集中精力把一本书读下去。" },
  { part: "B", text: "在家里或工作中，经常把东西放错地方或找不到。" },
  { part: "B", text: "容易被周围的活动或噪音分散注意力。" },
  { part: "B", text: "在开会或其他需要坐着的场合，会离开座位。" },
  { part: "B", text: "感觉坐立不安、躁动。" },
  { part: "B", text: "很难放松下来、让自己闲下来。" },
  { part: "B", text: "缺乏耐心。" },
  { part: "B", text: "很难不去抢话或打断别人。" },
  { part: "B", text: "很难排队等候、按次序来。" },
  { part: "B", text: "别人插到前面时，会感到恼火或心烦。" },
];

// ASRS v1.1 官方 Screener 阈值：该题为阳性（症状符合）所需的最低分值。
// 下标对应 Part A 第 1–6 题。0=从不 1=很少 2=有时 3=经常 4=总是。
const PART_A_THRESHOLDS = [2, 3, 3, 2, 3, 3];

const OPTIONS = [
  { label: "从不", value: 0 },
  { label: "很少", value: 1 },
  { label: "有时", value: 2 },
  { label: "经常", value: 3 },
  { label: "总是", value: 4 },
];

const TOTAL = QUESTIONS.length;
const answers = new Array(TOTAL).fill(null);

const quizEl = document.getElementById("quiz");
const progressEl = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const progressNum = document.getElementById("progress-num");
const submitBtn = document.getElementById("submit");
const resetBtn = document.getElementById("reset");
const resultEl = document.getElementById("result");

function renderQuiz() {
  let html = "";
  let lastPart = null;
  QUESTIONS.forEach((q, i) => {
    if (q.part !== lastPart) {
      const title =
        q.part === "A"
          ? '核心筛查 · Part A<small>第 1–6 题（ADHD 症状最特异的 6 题）</small>'
          : '补充症状 · Part B<small>第 7–18 题（进一步描画症状轮廓）</small>';
      html += `<div class="part-title">${title}</div>`;
      lastPart = q.part;
    }
    const opts = OPTIONS.map(
      (o) => `
      <label class="opt">
        <input type="radio" name="q${i}" value="${o.value}" data-q="${i}" />
        <span>${o.label}</span>
      </label>`
    ).join("");
    html += `
      <div class="q" id="qbox-${i}">
        <div class="q-title"><span class="num">${i + 1}</span>${q.text}</div>
        <div class="options">${opts}</div>
      </div>`;
  });
  quizEl.innerHTML = html;
}

function updateProgress() {
  const answered = answers.filter((a) => a !== null).length;
  progressEl.hidden = false;
  progressFill.style.width = (answered / TOTAL) * 100 + "%";
  progressNum.textContent = answered;
  submitBtn.disabled = answered < TOTAL;
}

function onSelect(e) {
  const t = e.target;
  if (t.tagName !== "INPUT" || t.type !== "radio") return;
  const i = Number(t.dataset.q);
  answers[i] = Number(t.value);
  document.getElementById(`qbox-${i}`).classList.add("answered");
  updateProgress();
}

function compute() {
  // Part A 计分
  let partAPositive = 0;
  for (let k = 0; k < 6; k++) {
    if (answers[k] >= PART_A_THRESHOLDS[k]) partAPositive++;
  }
  // Part B 计分（0–48）
  let partB = 0;
  for (let k = 6; k < TOTAL; k++) partB += answers[k];

  // 官方判定：核心 6 题中 ≥4 题阳性 → 筛查阳性（提示存在 ADHD 相关症状）
  const screenerPositive = partAPositive >= 4;
  return { partAPositive, partB, screenerPositive };
}

function renderResult(r) {
  const pctA = Math.round((r.partAPositive / 6) * 100);
  const pctB = Math.round((r.partB / 48) * 100);

  const verdict = r.screenerPositive
    ? `<div class="verdict positive">筛查阳性 · 建议进一步评估</div>`
    : `<div class="verdict negative">筛查阴性 · 当前症状倾向较低</div>`;

  const note = r.screenerPositive
    ? `核心 6 题中有 <strong>${r.partAPositive} 题</strong>符合 ADHD 典型表现（阈值 ≥4 题即提示阳性）。
       这并不代表确诊，但说明你近期的注意力/冲动/多动相关的困扰达到了值得关注的量级。
       建议带着这份结果，到综合医院精神科或精神专科医院的<strong>成人 ADHD 门诊</strong>做进一步评估
       （常结合临床访谈、量表与必要的体格检查）。`
    : `核心 6 题中仅有 <strong>${r.partAPositive} 题</strong>符合 ADHD 典型表现（阈值 ≥4 题才提示阳性），
       说明你目前自我报告的注意力/多动困扰相对有限。
       若你仍长期受困于注意力、拖延或情绪波动，也可与专业人士聊一聊——
       量表只是入口，不是结论。`;

  resultEl.innerHTML = `
    <h2>你的筛查结果</h2>
    ${verdict}
    <div class="score-grid">
      <div class="score-card">
        <div class="label">核心筛查 Part A 阳性题数</div>
        <div class="value">${r.partAPositive}<small> / 6</small></div>
      </div>
      <div class="score-card">
        <div class="label">补充症状 Part B 总分</div>
        <div class="value">${r.partB}<small> / 48</small></div>
      </div>
    </div>
    <div class="bar-row">
      <div class="bar-head"><span>Part A 阳性占比</span><span>${pctA}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-w="${pctA}"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-head"><span>Part B 症状负荷</span><span>${pctB}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-w="${pctB}"></div></div>
    </div>
    <div class="note">${note}</div>
    <div class="note" style="margin-top:12px;">
      ⚠️ 再次提醒：这是<strong>自我筛查</strong>，不是医学诊断。
      结果受当下状态、对自身的观察偏差影响；成年人 ADHD 也常与焦虑、抑郁、睡眠问题重叠，
      需要专业人员结合完整背景来判断。
    </div>
  `;
  resultEl.hidden = false;
  resetBtn.hidden = false;
  submitBtn.disabled = true;
  // 触发进度条动画
  requestAnimationFrame(() => {
    resultEl.querySelectorAll(".bar-fill").forEach((b) => {
      b.style.width = b.dataset.w + "%";
    });
  });
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetAll() {
  answers.fill(null);
  quizEl.querySelectorAll("input[type=radio]").forEach((i) => (i.checked = false));
  quizEl.querySelectorAll(".q").forEach((q) => q.classList.remove("answered"));
  resultEl.hidden = true;
  resultEl.innerHTML = "";
  resetBtn.hidden = true;
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

quizEl.addEventListener("change", onSelect);
submitBtn.addEventListener("click", () => {
  if (answers.includes(null)) return;
  renderResult(compute());
});
resetBtn.addEventListener("click", resetAll);

renderQuiz();
updateProgress();

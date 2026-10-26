'use strict';
/* 冲刺打卡 · 每日一栏  —  单页打卡应用
   数据存在 localStorage，键名 dsh.checkin.v1
   支持 ?demo=1 演示数据；?today=YYYY-MM-DD 指定“今天”（调试用） */
(function () {
  /* ================= 常量 ================= */
  const KEY = 'dsh.checkin.v1';
  const QS = new URLSearchParams(location.search);
  const DEMO = QS.has('demo');
  const TODAY_OVERRIDE = QS.get('today');
  const DEMO_TODAY = '2026-11-13';
  const WD = ['一', '二', '三', '四', '五', '六', '日'];
  const PROGRAM_START = '2026-10-26';

  const TRACKS = [
    {
      id: 'lanqiao', name: '蓝桥杯', sub: 'C++ 省赛', color: '#2f6bd8', soft: '#e9f0fd',
      from: '2026-10-26', to: '2027-04-11',
      tasks: {
        1: [{ t: '模板默写：快排 / 归并', m: 20 }, { t: '洛谷 P1093 奖学金 + P1059 明明的随机数', m: 50 }],
        2: [{ t: '蓝桥真题 1 道（限时 45min）', m: 45 }, { t: '错题重写 1 道', m: 25 }],
        3: [{ t: 'STL 小抄：vector / map / set', m: 20 }, { t: '洛谷 P2249 查找 + P1678 烦恼的高考志愿', m: 50 }],
        4: [{ t: '蓝桥真题 1 道 + 手写思路', m: 45 }, { t: '模板默写：二分 / 前缀和', m: 20 }],
        5: [{ t: '洛谷 P1102 A-B 数对 + P1638 逛画展', m: 50 }, { t: '本周错题回看', m: 20 }],
        6: [{ t: '限时套题 1 套（70min）', m: 70 }, { t: '补题 2 道', m: 25 }],
        7: [{ t: '补题 + 整理模板库', m: 40 }, { t: '周复盘：本周 AC 题数', m: 15 }]
      }
    },
    {
      id: 'challenge', name: '计挑赛', sub: 'C++ 真题', color: '#7b5cd6', soft: '#efeafc',
      from: '2026-10-26', to: '2026-11-29',
      tasks: {
        1: [{ t: '计挑赛真题 1 道（枚举 / 模拟）', m: 40 }, { t: 'C++ 语法回炉 1 点', m: 15 }],
        2: [{ t: '计挑赛真题 1 道（排序 / 结构体）', m: 40 }],
        3: [{ t: '计挑赛真题 1 道（递推 / 递归）', m: 40 }, { t: '输入输出细节整理', m: 15 }],
        4: [{ t: '计挑赛真题 1 道（二分）', m: 40 }],
        5: [{ t: '计挑赛真题 1 道（贪心）', m: 40 }, { t: '错题重做 1 道', m: 20 }],
        6: [{ t: '计挑赛错题重做 2 道', m: 45 }],
        7: [{ t: '错题重做 + 看题解', m: 30 }]
      }
    },
    {
      id: 'cet6', name: '英语六级', sub: 'CET-6', color: '#cf4f7d', soft: '#fce9f0',
      from: '2026-10-26', to: '2026-12-12',
      tasks: {
        1: [{ t: '单词 50 个（新词 + 复习）', m: 15 }, { t: '听力精听 1 篇（Section A）', m: 20 }, { t: '仔细阅读 1 篇', m: 20 }],
        2: [{ t: '单词 50 个', m: 15 }, { t: '听力精听 1 篇', m: 20 }, { t: '翻译 1 段（真题）', m: 20 }],
        3: [{ t: '单词 50 个', m: 15 }, { t: '听力精听 1 篇', m: 20 }, { t: '仔细阅读 1 篇', m: 20 }],
        4: [{ t: '单词 50 个', m: 15 }, { t: '听力精听 1 篇', m: 20 }, { t: '写作 1 篇提纲 + 1 段', m: 20 }],
        5: [{ t: '单词 50 个', m: 15 }, { t: '阅读 2 篇（限时 20min）', m: 25 }],
        6: [{ t: '六级听力 + 阅读限时练', m: 60 }, { t: '错题整理', m: 15 }],
        7: [{ t: '单词复习 + 写作 1 篇', m: 40 }]
      }
    },
    {
      id: 'java', name: 'Java 实验', sub: '课程实验', color: '#c9861a', soft: '#fdf1da',
      from: '2026-10-26', to: '2027-01-15',
      tasks: {
        1: [{ t: 'Java 实验 / 作业推进', m: 40 }],
        2: [{ t: '实验代码整理 + 注释', m: 30 }],
        3: [{ t: 'Java 实验推进', m: 40 }],
        4: [{ t: 'Java 课笔记 + 当天代码重敲', m: 35 }],
        5: [{ t: 'Java 实验推进', m: 45 }],
        6: [{ t: '实验收尾 / 提交', m: 40 }],
        7: [{ t: '预习下周实验', m: 30 }]
      }
    },
    {
      id: 'ds', name: '数据结构', sub: 'C++ 课内', color: '#0e8f9e', soft: '#e2f6f8',
      from: '2026-10-26', to: '2027-01-15',
      tasks: {
        1: [{ t: '手写顺序表 / 链表基本操作', m: 30 }],
        2: [{ t: 'LeetCode 1 题（栈 / 队列）', m: 30 }],
        3: [{ t: '数据结构课复盘：手写当天代码', m: 40 }],
        4: [{ t: '手写 1 个基础结构（栈 / 队列 / 树）', m: 30 }],
        5: [{ t: 'LeetCode 1 题（链表 / 树）', m: 30 }],
        6: [{ t: '本周代码整理 + 边界测试', m: 25 }],
        7: [{ t: '预习下周内容', m: 20 }]
      }
    }
  ];

  const EXAMS = [
    { id: 'challenge', name: '计挑赛', full: '计算机能力挑战赛', date: '2026-11-29', color: '#a78bfa', goal: '省二' },
    { id: 'cet6', name: '英语六级', full: 'CET-6', date: '2026-12-12', color: '#f0a0bd', goal: '550+' },
    { id: 'lanqiao', name: '蓝桥杯', full: '蓝桥杯省赛', date: '2027-04-11', color: '#7fb0ff', goal: '省一' }
  ];

  const PHASES = [
    { n: '阶段一', name: '计挑赛冲刺', from: '2026-10-26', to: '2026-11-28', goal: '省三保底 / 冲省二', items: ['专题 0–10 各 4 题，累计 55–66 题', '4 次模拟：11/07、11/14、11/21、11/28', '11/29 比赛：省三保底，冲省二'] },
    { n: '阶段二', name: '六级冲刺', from: '2026-11-29', to: '2026-12-12', goal: '六级 550+', items: ['算法每天 1 题保温，不追新专题', '六级 3 套模考 + 听力精听', '12/12 考试：目标 550+'] },
    { n: '阶段三', name: '寒假系统刷题', from: '2026-12-13', to: '2027-02-28', goal: '蓝桥省二打底', items: ['专题 11–16：树 / 堆、DP、图论、并查集、数论', '累计 60–80 题，模板库成型', '每个专题独立 AC 率 ≥ 70%'] },
    { n: '阶段四', name: '蓝桥冲刺', from: '2027-03-01', to: '2027-04-11', goal: '省一冲刺', items: ['每周 1 场 4h 模拟赛', '全专题错题重刷', '2027-04 省赛（以官方为准）'] }
  ];

  const WEEKS = [
    { w: 'W1', d: '10/26–11/01', topic: '专题 0–2：语法回炉 / 枚举模拟 / 排序', q: '15–17 题', weekend: '30min 小测' },
    { w: 'W2', d: '11/02–11/08', topic: '专题 3–4：递归 / 二分', q: '12 题', weekend: '模拟 1（2h）' },
    { w: 'W3', d: '11/09–11/15', topic: '专题 4–6：二分 / 前缀和 / 双指针', q: '12–14 题', weekend: '模拟 2（2h）' },
    { w: 'W4', d: '11/16–11/22', topic: '专题 7–8：贪心 / 栈队列', q: '10–11 题', weekend: '模拟 3（2h）' },
    { w: 'W5', d: '11/23–11/28', topic: '专题 9–10 + 错题：DFS / BFS', q: '10–12 题', weekend: '模拟 4 + 11/29 比赛' }
  ];

  const RHYTHM = [
    ['周一', '16:00–17:25 壁球', '09:00–11:30 算法', '自由 / 补漏'],
    ['周二', '概率论、毛概、专业英语、英语整理', '08:30–10:00 算法', '20:30–21:30 Java'],
    ['周三', '数据结构 10:15–12:25、14:15–16:40', '08:30–10:00 算法', '19:00–20:00 DS 代码'],
    ['周四', '离散 10:15–11:40；Java 19:00–21:45', '13:30–16:30 算法', 'Java 课'],
    ['周五', '离散 10:15–11:40', '13:30–16:30 算法', '19:00–21:00 Java'],
    ['周六', '10:00–11:30 家教备课', '14:00–16:30 套题', '19:00–20:30 Java'],
    ['周日', '08:00–13:00 家教', '14:30–16:00 错题重写', '19:30–20:15 复盘']
  ];

  /* 五个项目的总规划：时间轴 / 里程碑 / 资源 */
  const PLANS = {
    challenge: {
      name: '计挑赛 C++', color: '#7b5cd6', date: '2026-11-29（报名 11/25 12:00 截止）',
      goal: '省三保底，冲省二',
      weekly: '4–5h：每天 1 题 + 周末 1 次限时',
      now: '专题 0–10 + 官方真题 / 模拟',
      stages: [
        ['10/26–11/01', '诊断周', '官方在线练习 1 套（限时），列出 3 个最弱题型', '1 套 + 弱项清单'],
        ['11/02–11/15', '专题周', '枚举模拟 / 排序 / 递归 / 二分 / 前缀和，每天 1 题', '14 题'],
        ['11/16–11/22', '真题周', '官方题库真题 5 道；周末 2h 模拟', '5 题 + 1 次模拟'],
        ['11/23–11/28', '考前周', '错题重做；模板速度；确认编译器 / 输入输出 / 考场', '错题全过']
      ],
      miles: ['11/01 诊断模拟', '11/08 模拟 1', '11/15 模拟 2', '11/22 模拟 3', '11/29 比赛'],
      res: [
        ['赛事官网', 'http://www.ncccu.org.cn/'],
        ['题库训练（往届真题）', 'http://www.ncccu.org.cn/index/Practice/contest.html'],
        ['在线练习（模拟）', 'http://www.ncccu.org.cn/index/Practice/exercise.html'],
        ['程序设计赛项说明', 'http://www.ncccu.org.cn/index/Paper/case4.html']
      ],
      tip: '报名和在线练习都在 11/25 12:00 截止，别拖到最后一天。真题在官网「备赛 → 题库训练」，报名登录后才能刷。'
    },
    lanqiao: {
      name: '蓝桥杯 C++', color: '#2f6bd8', date: '2027-04-11（官方待定）',
      goal: '省二保底，冲省一',
      weekly: '现在 4–6h；寒假 8–10h；3 月 12h',
      now: '和计挑赛共用专题 0–10，先保 25 题',
      stages: [
        ['10/26–11/28', '和计挑赛共用专题', '专题 0–10 每专题 2 题；周末 1 套 1.5h 小模拟；模板：排序 / 二分 / 前缀和 / DFS', '20–25 题'],
        ['11/29–12/12', '六级优先，只保温', '每天 1 题（旧题或模板），不碰新专题', '12 题'],
        ['12/13–02/28', '寒假系统刷题', '专题 11–16：树 / 堆、基础 DP、图论、并查集、数论、骗分；每个专题先手写模板', '60–80 题，16 个模板'],
        ['03/01–04/11', '真题冲刺', '每周 1 套 4h 真题；错题二刷；最后两周只做真题 + 模板速度', '5 套真题']
      ],
      miles: ['11/28 累计 25 题', '12/31 模板 10 个', '02/28 累计 80 题', '03/31 模拟 ≥ 60%', '04/11 省赛'],
      res: [
        ['蓝桥杯大赛官网', 'https://dasai.lanqiao.cn/'],
        ['官方题库（蓝桥云课）', 'https://www.lanqiao.cn/questions/'],
        ['洛谷题单', 'https://www.luogu.com.cn/training/list']
      ],
      tip: '蓝桥是填空 + 编程，填空题别空着。省二大约 4 题，先把送分题拿稳，再谈省一。'
    },
    cet6: {
      name: '英语六级', color: '#cf4f7d', date: '2026-12-12',
      goal: '550+（听力是提分点）',
      weekly: '6.5h：每天 55min + 周末 1 套',
      now: '单词 + 听力精听 + 阅读，只做真题',
      stages: [
        ['10/26–11/15', '基础', '单词 50/天；听力精听 1 篇；阅读 1 篇；周末 1 套听力', '听力正确率 60%'],
        ['11/16–11/29', '题型', '翻译 2 篇、写作 2 篇、阅读限时；整套听力 1 套', '各题型有模板'],
        ['11/30–12/06', '套题', '3 套完整模考（15:00–17:25，按考试时间）', '模考 540'],
        ['12/07–12/11', '保温', '错题 + 作文模板 + 听力真题；不背新词', '作文 3 篇成型']
      ],
      miles: ['11/15 听力 60%', '11/29 模考 500', '12/05 模考 540', '12/12 考试'],
      res: [
        ['四六级考试官网', 'https://cet.neea.edu.cn/'],
        ['近 5 年真题（2022–2025）', '']
      ],
      tip: '只做真题，不刷模拟题；听力每天 30min，精听 + 跟读，不要泛听。'
    },
    java: {
      name: 'Java 实验', color: '#c9861a', date: '2027-01-15 学期结束',
      goal: '实验全交，期末不挂',
      weekly: '4.5h：周二 0.5h / 周五 1h / 周六 1.5h / 课后 0.5h',
      now: '当周实验不拖过周末',
      stages: [
        ['10/26–11/15', '跟课', '周四课后 30min 重敲当天代码；实验先写 10 分钟再问 AI', '当周实验按时交'],
        ['11/16–12/13', '实验周', '每周 4.5h；实验报告模板化（需求 / 设计 / 测试 / 问题）', '4 次实验全交'],
        ['12/14–01/10', '大作业 / 期末', '项目收尾；复习面向对象、集合、IO、多线程', '大作业 + 复习完']
      ],
      miles: ['每次实验不拖过周日', '12/20 大作业选题', '01/10 复习完'],
      res: [
        ['JavaGuide', 'https://javaguide.cn/'],
        ['菜鸟教程 Java', 'https://www.runoob.com/java/java-tutorial.html']
      ],
      tip: 'AI 只用来解释报错、给思路、review；别直接抄完整代码。报错记到 04_错题与报错.md。'
    },
    ds: {
      name: '数据结构 C++', color: '#0e8f9e', date: '2027-01-15 学期结束',
      goal: '课内 85+，手写代码不卡',
      weekly: '3.5h：周三课后 + 周末',
      now: '当天代码当天手写',
      stages: [
        ['10/26–11/30', '跟课', '周三 5 节课；当晚 40min 手写课上代码，不抄', '每章 1 个手写结构'],
        ['12/01–12/31', '章节复习', '顺序表 / 链表 / 栈队列 / 树 / 图 / 排序，各配 3 道题', '6 章过关'],
        ['01/01–01/10', '期末', '历年卷 + 实验报告 + 边界测试', '期末 85+']
      ],
      miles: ['每章手写通过', '4 次实验全交', '期末 85+'],
      res: [
        ['洛谷题单', 'https://www.luogu.com.cn/training/list'],
        ['LeetCode 题库', 'https://leetcode.cn/problemset/']
      ],
      tip: '手写 > 看视频；每个结构都测空表、满表、单节点、删除头节点。'
    }
  };


  const SLOTS = [
    ['08:30', '09:10'], ['09:15', '09:55'], ['10:15', '10:55'], ['11:00', '11:40'],
    ['11:45', '12:25'], ['13:30', '14:10'], ['14:15', '14:55'], ['15:00', '15:40'],
    ['16:00', '16:40'], ['16:45', '17:25'], ['19:00', '19:40'], ['19:40', '20:20'],
    ['20:30', '21:10'], ['21:10', '21:45']
  ];

  const SCHEDULE = [
    { id: 'c1', day: 1, start: '16:00', end: '17:25', name: '壁球俱乐部', place: '南区体育馆球馆', kind: 'sport' },
    { id: 'c2', day: 2, start: '10:15', end: '12:25', name: '概率论与数理统计', place: '致理楼 L1-501', kind: 'class' },
    { id: 'c3', day: 2, start: '14:15', end: '15:40', name: '毛概', place: '待补', kind: 'class' },
    { id: 'c4', day: 2, start: '16:00', end: '17:25', name: '专业英语', place: '致理楼 L1-601', kind: 'class' },
    { id: 'c5', day: 2, start: '19:00', end: '20:20', name: '专业英语整理', place: '待补', kind: 'class' },
    { id: 'c6', day: 3, start: '10:15', end: '12:25', name: '数据结构', place: '致理楼 L1-709', kind: 'class' },
    { id: 'c7', day: 3, start: '14:15', end: '16:40', name: '数据结构', place: '致腾楼 327', kind: 'class' },
    { id: 'c8', day: 4, start: '10:15', end: '11:40', name: '离散数学', place: '致理楼 L2-410', kind: 'class' },
    { id: 'c9', day: 4, start: '19:00', end: '20:20', name: 'Java 程序设计', place: '致理楼 L1-401', kind: 'class' },
    { id: 'c10', day: 4, start: '20:30', end: '21:45', name: 'Java 程序设计', place: '致腾楼 328', kind: 'class' },
    { id: 'c11', day: 5, start: '10:15', end: '11:40', name: '离散数学', place: '致理楼 L2-410', kind: 'class' },
    { id: 'c12', day: 6, start: '10:00', end: '11:30', name: '家教备课', place: '—', kind: 'fixed' },
    { id: 'c13', day: 7, start: '08:00', end: '13:00', name: '家教', place: '—', kind: 'fixed' }
  ];

  const COURSE_TONE = {
    '数据结构': ['#7b5cd6', '#efeafc'],
    '概率论与数理统计': ['#2f6bd8', '#e8f0fd'],
    '毛概': ['#3f9e6a', '#e6f5ec'],
    '专业英语': ['#cf4f7d', '#fce9f0'],
    '专业英语整理': ['#cf4f7d', '#fce9f0'],
    '离散数学': ['#c9861a', '#fdf1da'],
    'Java 程序设计': ['#bf7a12', '#fdf3dc'],
    '壁球俱乐部': ['#e08a3c', '#fff0e2'],
    '家教': ['#0e8f9e', '#e2f6f8'],
    '家教备课': ['#0e8f9e', '#e2f6f8']
  };
  const TONE_PALETTE = [['#2f6bd8', '#e8f0fd'], ['#7b5cd6', '#efeafc'], ['#3f9e6a', '#e6f5ec'], ['#c9861a', '#fdf1da'], ['#cf4f7d', '#fce9f0'], ['#0e8f9e', '#e2f6f8']];

  /* ================= 小工具 ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function ymd(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function todayISO() {
    if (TODAY_OVERRIDE) return TODAY_OVERRIDE;
    if (DEMO) return DEMO_TODAY;
    const d = new Date();
    return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }
  function parseISO(s) { const p = String(s).split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function dateObj(s) { const o = parseISO(s); return new Date(o.y, o.m - 1, o.d); }
  function addDays(s, n) { const o = parseISO(s); const dt = new Date(o.y, o.m - 1, o.d + n); return ymd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); }
  function wdOf(s) { const w = dateObj(s).getDay(); return w === 0 ? 7 : w; }
  function daysBetween(a, b) {
    const A = parseISO(a), B = parseISO(b);
    return Math.round((Date.UTC(B.y, B.m - 1, B.d) - Date.UTC(A.y, A.m - 1, A.d)) / 86400000);
  }
  function fmtDate(s) { const o = parseISO(s); return pad(o.m) + '.' + pad(o.d); }
  function fmtFull(s) { const o = parseISO(s); return o.y + '年' + o.m + '月' + o.d + '日 周' + WD[wdOf(s) - 1]; }
  function fmtMin(m) { if (m >= 60) { const h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? r + 'm' : ''); } return m + 'min'; }
  function mmss(sec) { sec = Math.max(0, Math.floor(sec)); return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }
  function timeOf(ts) { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function toMin(t) { const p = String(t).split(':').map(Number); return (p[0] || 0) * 60 + (p[1] || 0); }
  function minLabel(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function weekNo(date) { return Math.max(1, Math.floor(daysBetween(PROGRAM_START, date) / 7) + 1); }

  /* ================= 数据 ================= */
  function defaults() {
    return {
      version: 1,
      start: todayISO(),
      createdAt: Date.now(),
      settings: { targetMin: 180 },
      exams: EXAMS.map(e => ({ id: e.id, date: e.date, goal: e.goal })),
      schedule: SCHEDULE.map(c => Object.assign({}, c)),
      done: {}, hidden: {}, overrides: {}, custom: {}, notes: {}, checkins: {}, focus: {},
      meta: { lastExport: null }
    };
  }

  function migrate(raw) {
    const d = defaults();
    const s = Object.assign(d, raw || {});
    s.settings = Object.assign({}, d.settings, raw.settings || {});
    s.meta = Object.assign({}, d.meta, raw.meta || {});
    ['done', 'hidden', 'overrides', 'custom', 'notes', 'checkins', 'focus'].forEach(k => { s[k] = (raw && raw[k]) || {}; });
    if (!Array.isArray(raw.schedule) || !raw.schedule.length) s.schedule = d.schedule;
    if (!Array.isArray(raw.exams) || !raw.exams.length) s.exams = d.exams;
    if (!s.start) s.start = todayISO();
    return s;
  }

  let storageOK = true;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return migrate(JSON.parse(raw));
    } catch (e) {
      console.warn('读取失败', e);
      return defaults();
    }
  }
  function save() {
    if (DEMO) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOK = false; }
  }
  let saveTimer = null;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }

  let state = DEMO ? null : load();
  const view = { name: 'today' };
  let activeDate = todayISO();
  let calY = parseISO(todayISO()).y, calM = parseISO(todayISO()).m;
  let modal = null;
  let focusRun = null;      // { startedAt, date }
  let lastFlush = 0;

  /* ================= 任务生成 ================= */
  function trackById(id) { return TRACKS.find(t => t.id === id) || TRACKS[0]; }
  function activeTracks(date) {
    return TRACKS.filter(t => (!t.from || date >= t.from) && (!t.to || date <= t.to));
  }
  function tasksFor(date, opts) {
    const all = opts && opts.all;
    const wd = wdOf(date);
    const list = all ? TRACKS : activeTracks(date);
    const hidden = state.hidden[date] || [];
    const ov = state.overrides[date] || {};
    const done = state.done[date] || {};
    const out = [];
    list.forEach(tr => {
      (tr.tasks[wd] || []).forEach((task, i) => {
        const id = tr.id + ':' + wd + ':' + i;
        if (hidden.indexOf(id) >= 0) return;
        const o = ov[id] || {};
        out.push({
          id: id, track: tr.id,
          title: o.title != null ? o.title : task.t,
          min: o.min != null ? o.min : task.m,
          done: !!done[id], custom: false
        });
      });
    });
    (state.custom[date] || []).forEach(c => {
      out.push({ id: c.id, track: c.track, title: c.title, min: c.min, done: !!done[c.id], custom: true });
    });
    return out;
  }
  function findTask(date, id) { return tasksFor(date).find(t => t.id === id); }

  function toggleTask(date, id) {
    if (date > todayISO()) { toast('还没到这一天，先过好今天'); return; }
    const d = state.done[date] || (state.done[date] = {});
    if (d[id]) delete d[id]; else d[id] = Date.now();
    syncAutoCheckin(date);
    save(); render();
  }

  function syncAutoCheckin(date) {
    const ts = tasksFor(date);
    const doneN = ts.filter(t => t.done).length;
    const rec = state.checkins[date];
    if (!rec) {
      if (ts.length && doneN === ts.length) {
        state.checkins[date] = { at: Date.now(), ratio: 1, auto: true, partial: false };
        toast('全部完成，已自动打卡 🎉');
      }
      return;
    }
    if (rec.auto) {
      if (ts.length && doneN === ts.length) rec.ratio = 1;
      else delete state.checkins[date];
    }
  }

  function doCheckin() {
    if (activeDate > todayISO()) { toast('还没到这一天，先过好今天'); return; }
    const ts = tasksFor(activeDate);
    const doneN = ts.filter(t => t.done).length;
    if (!doneN) { toast('先完成至少 1 项再打卡'); return; }
    state.checkins[activeDate] = {
      at: Date.now(), ratio: ts.length ? doneN / ts.length : 0,
      auto: false, partial: doneN < ts.length
    };
    save(); render();
    toast(doneN < ts.length ? '已打卡 · 完成 ' + doneN + '/' + ts.length + '，明天补上' : '打卡成功，今日全勤 🎉');
  }
  function undoCheckin() { delete state.checkins[activeDate]; save(); render(); toast('已撤销打卡'); }

  function streakNow() {
    let n = 0, d = todayISO();
    if (!state.checkins[d]) d = addDays(d, -1);
    while (state.checkins[d]) { n++; d = addDays(d, -1); if (n > 2000) break; }
    return n;
  }
  function longestStreak() {
    const ds = Object.keys(state.checkins).filter(d => state.checkins[d]).sort();
    let best = 0, cur = 0, prev = null;
    ds.forEach(d => { cur = (prev && daysBetween(prev, d) === 1) ? cur + 1 : 1; if (cur > best) best = cur; prev = d; });
    return best;
  }
  function weekPct() {
    const wd = wdOf(todayISO()), mon = addDays(todayISO(), 1 - wd);
    let total = 0, done = 0;
    for (let i = 0; i < wd; i++) {
      const d = addDays(mon, i);
      const ts = tasksFor(d, { all: true });
      total += ts.length; done += ts.filter(t => t.done).length;
    }
    return total ? Math.round(done / total * 100) : 0;
  }
  function sideStats() {
    return { streak: streakNow(), checked: Object.keys(state.checkins).length, weekPct: weekPct() };
  }

  /* ================= 课表 ================= */
  function classesFor(day) {
    return state.schedule.filter(c => c.day === day).sort((a, b) => a.start.localeCompare(b.start));
  }
  function toneOf(name) {
    if (COURSE_TONE[name]) return COURSE_TONE[name];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
    return TONE_PALETTE[h % TONE_PALETTE.length];
  }
  function blockSpan(c) {
    let s = SLOTS.findIndex(x => x[0] >= c.start) + 1;
    if (s <= 0) s = SLOTS.length;
    let e = 0;
    for (let i = 0; i < SLOTS.length; i++) if (SLOTS[i][0] < c.end) e = i + 1;
    if (e < s) e = s;
    return { s: s, e: e };
  }
  function freeBlocks(date) {
    const cls = classesFor(wdOf(date));
    const windows = [[8 * 60, 12 * 60, '上午'], [13 * 60 + 30, 17 * 60 + 30, '下午'], [19 * 60, 23 * 60, '晚上']];
    const out = [];
    windows.forEach(w => {
      let cur = w[0];
      const segs = [];
      cls.forEach(c => {
        const s = Math.max(w[0], toMin(c.start)), e = Math.min(w[1], toMin(c.end));
        if (e <= w[0] || s >= w[1] || e <= s) return;
        if (s > cur) segs.push([cur, s]);
        cur = Math.max(cur, e);
      });
      if (cur < w[1]) segs.push([cur, w[1]]);
      segs.forEach(seg => { if (seg[1] - seg[0] >= 45) out.push({ a: seg[0], b: seg[1], min: seg[1] - seg[0], label: w[2] }); });
    });
    return out.slice(0, 6);
  }

  /* ================= 视图：今日 ================= */
  function head(title, sub, right) {
    return '<div class="page-head"><div><h2>' + title + '</h2><p class="sub">' + sub + '</p></div>' +
      '<div class="chips">' + (right || '') + '</div></div>';
  }

  function examRows() {
    const today = todayISO();
    return examList().map(e => {
      const left = daysBetween(today, e.date);
      const tail = left > 0 ? left + '<small>天</small>' : (left === 0 ? '今天' : '<small>已考</small>');
      return '<div class="ex"><i style="--c:' + e.color + '"></i><div><b>' + esc(e.name) + '</b>' +
        '<span>' + e.date + ' · 目标 ' + esc(e.goal) + '</span></div><em>' + tail + '</em></div>';
    }).join('');
  }
  function examList() {
    return EXAMS.map(def => {
      const s = (state.exams || []).find(e => e.id === def.id) || {};
      return Object.assign({}, def, { date: s.date || def.date, goal: s.goal || def.goal });
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
  function phaseFor(date) {
    return PHASES.find(p => date >= p.from && date <= p.to) || PHASES[PHASES.length - 1];
  }

  function viewToday() {
    const date = activeDate;
    const isToday = date === todayISO();
    const ts = tasksFor(date);
    const doneN = ts.filter(t => t.done).length;
    const total = ts.length;
    const pct = total ? Math.round(doneN / total * 100) : 0;
    const planMin = ts.reduce((s, t) => s + t.min, 0);
    const doneMin = ts.filter(t => t.done).reduce((s, t) => s + t.min, 0);
    const rec = state.checkins[date];
    const dObj = parseISO(date);
    const trackList = activeTracks(date);
    const runHere = focusRun && focusRun.date === date;

    return head(isToday ? '今日打卡' : '补记 · ' + fmtDate(date),
      isToday ? '勾掉每一栏的任务，22:00 前收工打卡' : '正在查看 ' + fmtFull(date) + '，勾选会直接写入记录',
      '<button class="btn ghost sm" data-act="day-prev" title="前一天">‹</button>' +
      '<span class="chip">' + fmtDate(date) + ' 周' + WD[wdOf(date) - 1] + '</span>' +
      '<button class="btn ghost sm" data-act="day-next" title="后一天">›</button>' +
      (isToday ? '' : '<button class="btn ghost sm" data-act="day-today">回到今天</button>')) +
      '<section class="hero">' +
        '<div class="hero-main">' +
          '<div class="hero-date"><span class="dnum">' + pad(dObj.m) + '.' + pad(dObj.d) + '</span>' +
            '<span class="dinfo">周' + WD[wdOf(date) - 1] + ' · 第 ' + weekNo(date) + ' 周<br><em>' + phaseFor(date).n + ' · ' + phaseFor(date).name + '</em></span></div>' +
          '<div class="hero-metrics">' +
            '<div class="hm"><b>' + doneN + '<span>/' + total + '</span></b><em>今日完成</em></div>' +
            '<div class="hm"><b>' + doneMin + '<span>min</span></b><em>已完成时长</em></div>' +
            '<div class="hm"><b id="focusClock">' + mmss(focusSeconds(date)) + '</b><em>今日专注</em></div>' +
            '<div class="hm"><b>' + streakNow() + '<span>天</span></b><em>连续打卡</em></div>' +
          '</div>' +
          '<div class="hero-actions">' +
            (isToday ? '<button class="btn light" data-act="timer" id="timerBtn">' + (runHere ? '暂停专注' : '开始专注') + '</button>' : '') +
            (rec ? '<span class="chip" style="background:rgba(31,157,107,.16);border-color:rgba(31,157,107,.32);color:#c4f3dd">已打卡 ' + timeOf(rec.at) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="hero-ring"><svg viewBox="0 0 120 120">' +
          '<circle class="ring-bg" cx="60" cy="60" r="52"></circle>' +
          '<circle class="ring-fg" cx="60" cy="60" r="52" style="stroke-dasharray:' + (pct * 3.267).toFixed(1) + ' 327;' + (pct ? '' : 'opacity:0;') + '"></circle>' +
        '</svg><div class="ring-txt"><b>' + pct + '%</b><span>完成</span></div></div>' +
        '<div class="hero-exams">' + examRows() + '</div>' +
      '</section>' +
      (isToday ? carryStrip() : '') +
      '<div class="sec-head"><h3>今日任务 · ' + trackList.length + ' 栏</h3>' +
        '<span class="hint">点任务即可勾选；不合适的任务可「改」「删」</span>' +
        '<div class="right">' + (rec ? '<button class="link" data-act="uncheck">取消打卡</button>' : '<span class="hint">计划 ' + fmtMin(planMin) + ' · 目标 ' + state.settings.targetMin + 'min</span>') + '</div>' +
      '</div>' +
      '<div class="tracks">' + trackList.map(tr => trackCard(tr, ts.filter(t => t.track === tr.id), date)).join('') + '</div>' +
      '<div class="checkin">' +
        '<div class="note"><label for="dayNote">今日一句 / 卡点（可留空）</label>' +
          '<input id="dayNote" placeholder="例：二分边界又写错了，明天先重写 lower_bound。" value="' + esc(state.notes[date] || '') + '"></div>' +
        '<div class="acts">' +
          '<button class="btn ghost" data-act="reset-day">恢复默认任务</button>' +
          (rec ? '<button class="btn primary ok" data-act="uncheck">已打卡 · 点击撤销</button>'
               : '<button class="btn primary" data-act="checkin"' + (doneN ? '' : ' disabled') + '>' + ((total && doneN === total) ? '全勤打卡 🎉' : '收工打卡') + '</button>') +
        '</div>' +
      '</div>' +
      '<p class="plan-hint" style="margin-top:10px">状态差时的保底：<b>英语 15min + 1 道旧题</b>；满课 / 实验截止：<b>英语 30min + 算法 1 题 + Java 20min</b>。没做完的不自动顺延，要紧的在上面带 1–2 项。</p>' +
      weekStrip();
  }

  function carryStrip() {
    const y = addDays(todayISO(), -1);
    if (y < state.start) return '';
    const act = activeTracks(todayISO()).map(t => t.id);
    const items = tasksFor(y).filter(t => !t.done && act.indexOf(t.track) >= 0);
    if (!items.length) return '';
    const shown = items.slice(0, 4);
    return '<section class="carry"><div class="carry-h"><b>昨天还有 ' + items.length + ' 项没完成</b>' +
      '<span>不自动顺延；真要紧的带 1–2 项过来，其余周日统一处理</span></div>' +
      '<div class="carry-list">' + shown.map(t =>
        '<button class="carry-item" data-act="carry" data-date="' + y + '" data-id="' + t.id + '">＋ ' + esc(t.title) + '<i>' + t.min + 'min</i></button>'
      ).join('') + '</div></section>';
  }

  function weekStrip() {
    const today = todayISO(), wd = wdOf(today), mon = addDays(today, 1 - wd);
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(mon, i);
      const ts = tasksFor(d, { all: true });
      const dn = ts.filter(t => t.done).length;
      const pct = ts.length ? Math.round(dn / ts.length * 100) : 0;
      const future = d > today;
      cells.push('<button class="wday ' + (d === today ? 'on ' : '') + (future ? 'fut' : '') + '" data-act="open-day" data-date="' + d + '"' + (future ? ' disabled' : '') + '>' +
        '<span>周' + WD[i] + '</span><b>' + fmtDate(d) + '</b>' +
        '<span class="wbar"><em style="width:' + pct + '%"></em></span>' +
        '<em class="wv">' + (ts.length ? dn + '/' + ts.length : '—') + '</em></button>');
    }
    return '<section class="week"><div class="week-h"><h3>本周概览</h3><span>本周完成率 ' + weekPct() + '% · 点日期可回看 / 补记</span></div>' +
      '<div class="week-grid">' + cells.join('') + '</div></section>';
  }

  function trackCard(tr, items, date) {
    const done = items.filter(i => i.done).length;
    const pct = items.length ? Math.round(done / items.length * 100) : 0;
    return '<article class="track" style="--c:' + tr.color + '">' +
      '<div class="track-h"><div class="tn"><i class="dot"></i><span class="tname">' + tr.name + '</span>' +
        '<span class="tsub">' + tr.sub + '</span></div>' +
        '<div class="tcount"><b>' + done + '</b>/' + items.length + '</div></div>' +
      '<div class="tbar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="tasklist">' + (items.length ? items.map(taskRow).join('') : '<p class="empty">今天这栏空着，可以加一项</p>') + '</div>' +
      '<div class="track-f"><button class="addbtn" data-act="add-task" data-track="' + tr.id + '">＋ 添加任务</button>' +
        '<span class="track-all">' + items.reduce((s, i) => s + i.min, 0) + ' min</span></div>' +
      '</article>';
  }

  function taskRow(t) {
    return '<div class="task ' + (t.done ? 'done' : '') + '" data-act="toggle" data-id="' + t.id + '">' +
      '<button class="chk" data-act="toggle" data-id="' + t.id + '" aria-label="勾选任务">' + (t.done ? '✓' : '') + '</button>' +
      '<div class="tbody"><p class="tt">' + esc(t.title) + '</p>' +
        '<div class="tmeta"><span>' + t.min + ' min</span>' + (t.done ? '<span class="ok">已完成</span>' : '') +
          '<button class="mini" data-act="edit-task" data-id="' + t.id + '">改</button>' +
          '<button class="mini" data-act="del-task" data-id="' + t.id + '">删</button>' +
        '</div></div></div>';
  }

  /* ================= 视图：日历 ================= */
  function viewCalendar() {
    const y = calY, m = calM;
    const first = ymd(y, m, 1);
    const lead = wdOf(first) - 1;
    const dim = new Date(y, m, 0).getDate();
    const prevDim = new Date(y, m - 1, 0).getDate();
    const cells = [];
    for (let i = lead - 1; i >= 0; i--) cells.push({ d: prevDim - i, out: true });
    for (let d = 1; d <= dim; d++) cells.push({ d: d, date: ymd(y, m, d) });
    let nx = 1;
    while (cells.length % 7 !== 0) cells.push({ d: nx++, out: true });

    let checked = 0, full = 0, sum = 0, cnt = 0;
    for (let d = 1; d <= dim; d++) {
      const ds = ymd(y, m, d);
      if (ds > todayISO()) continue;
      const rec = state.checkins[ds];
      if (rec) { checked++; if (rec.ratio >= 0.999) full++; sum += rec.ratio; cnt++; }
    }

    const grid = cells.map(c => {
      if (c.out) return '<div class="cell out"><span class="cell-d">' + c.d + '</span></div>';
      const ts = tasksFor(c.date, { all: true });
      const tot = ts.length, dn = ts.filter(x => x.done).length;
      const r = tot ? dn / tot : 0;
      const lvl = r === 0 ? 0 : (r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4);
      const bg = ['#f8fafd', '#dfeafd', '#c3d8fb', '#96bcf6', '#1f9d6b'][lvl];
      const fg = lvl === 4 ? '#fff' : (lvl >= 3 ? '#123a6b' : '#4d6280');
      const rec = state.checkins[c.date];
      return '<button class="cell ' + (c.date === todayISO() ? 'today ' : '') + (c.date === activeDate ? 'sel' : '') + '"' +
        ' data-act="open-day" data-date="' + c.date + '" style="background:' + bg + '" title="' + c.date + ' · 完成 ' + dn + '/' + tot + '">' +
        '<span class="cell-d" style="color:' + fg + '">' + c.d + '</span>' +
        (rec ? '<i class="cell-dot" style="background:' + (lvl === 4 ? '#fff' : '#1f9d6b') + '"></i>' : '') +
        '</button>';
    }).join('');

    const recent = Object.keys(state.checkins).sort().slice(-6).reverse().map(d =>
      '<div class="mini-row" data-act="open-day" data-date="' + d + '" style="cursor:pointer">' +
      '<span>' + fmtDate(d) + ' 周' + WD[wdOf(d) - 1] + '</span><b>' + Math.round((state.checkins[d].ratio || 0) * 100) + '%</b></div>'
    ).join('') || '<p class="empty">还没有打卡记录</p>';

    return head('打卡日历', '颜色越深完成越多，整格变绿 = 全勤', '<button class="btn ghost sm" data-act="open-day" data-date="' + todayISO() + '">回到今天</button>') +
      '<div class="cal-wrap">' +
        '<div class="cal">' +
          '<div class="cal-head"><div><h3>' + y + ' 年 ' + m + ' 月</h3></div>' +
            '<div style="display:flex;gap:6px"><button class="cbtn" data-act="cal-prev">‹</button><button class="cbtn" data-act="cal-next">›</button></div></div>' +
          '<div class="cal-wd">' + WD.map(w => '<span>周' + w + '</span>').join('') + '</div>' +
          '<div class="cal-grid">' + grid + '</div>' +
          '<div class="cal-legend"><span>少</span><i style="background:#eaf2fe"></i><i style="background:#d6e6fc"></i><i style="background:#b7d1f8"></i><i style="background:#1f9d6b"></i><span>多</span>' +
            '<span style="margin-left:10px">● 小圆点 = 当天已打卡</span></div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:14px">' +
          '<div class="side-card-white"><h4>本月概览</h4>' +
            '<div class="mini-row"><span>打卡天数</span><b>' + checked + ' 天</b></div>' +
            '<div class="mini-row"><span>全勤天数</span><b>' + full + ' 天</b></div>' +
            '<div class="mini-row"><span>平均完成率</span><b>' + (cnt ? Math.round(sum / cnt * 100) : 0) + '%</b></div>' +
            '<div class="mini-row"><span>当前连续</span><b>' + streakNow() + ' 天</b></div>' +
          '</div>' +
          '<div class="side-card-white"><h4>最近打卡</h4>' + recent + '</div>' +
        '</div>' +
      '</div>';
  }

  /* ================= 视图：课表 ================= */
  function viewSchedule() {
    const today = todayISO();
    const wd = wdOf(today);
    const monday = addDays(today, 1 - wd);
    const days = [];
    for (let i = 0; i < 7; i++) days.push(addDays(monday, i));

    let grid = '<div class="sgrid"><div class="scorner"></div>';
    days.forEach((d, i) => {
      grid += '<div class="sday-head ' + (d === today ? 'on' : '') + '">周' + WD[i] + '<em>' + fmtDate(d) + '</em></div>';
    });
    grid += '<div class="stimes">' + SLOTS.map((s, i) => '<div class="stime"><b>' + (i + 1) + '</b><span>' + s[0] + '</span></div>').join('') + '</div>';
    for (let day = 1; day <= 7; day++) {
      const blocks = classesFor(day).map(c => {
        const span = blockSpan(c);
        const tone = toneOf(c.name);
        const cls = c.kind === 'fixed' ? ' fixed' : (c.kind === 'sport' ? ' sport' : '');
        return '<button class="sb' + cls + '" style="top:' + ((span.s - 1) * 36) + 'px;height:' + ((span.e - span.s + 1) * 36 - 3) + 'px;--c:' + tone[0] + ';--soft:' + tone[1] + '"' +
          ' data-act="edit-class" data-id="' + c.id + '" title="' + esc(c.name + ' ' + c.start + '–' + c.end + ' ' + c.place) + '">' +
          '<b>' + esc(c.name) + '</b><span>' + c.start + '–' + c.end + '</span></button>';
      }).join('');
      grid += '<div class="scol ' + (days[day - 1] === today ? 'on' : '') + '"><div class="scol-bg">' +
        SLOTS.map(() => '<i></i>').join('') + '</div>' + blocks + '</div>';
    }
    grid += '</div>';

    const list = '<div class="slist">' + days.map((d, i) => {
      const cls = classesFor(i + 1);
      return '<div class="sdaycard ' + (d === today ? 'on' : '') + '"><div class="sdh"><b>周' + WD[i] + '</b><span>' + fmtDate(d) + '</span></div>' +
        (cls.length ? cls.map(c => '<div class="sclass"><i style="background:' + toneOf(c.name)[0] + '"></i><div><b>' + esc(c.name) + '</b><span>' + c.start + '–' + c.end + ' · ' + esc(c.place) + '</span></div></div>').join('')
          : '<p class="empty">没课，适合整块刷题</p>') + '</div>';
    }).join('') + '</div>';

    const free = freeBlocks(today);
    const freeHTML = free.length ? free.map(f => '<span class="tag"><b>' + minLabel(f.a) + '–' + minLabel(f.b) + '</b> ' + f.label + ' ' + fmtMin(f.min) + '</span>').join('')
      : '<span class="tag">今天没有 45min 以上的整块时间</span>';

    return head('本周课表', '按图片整理，每周循环；点课程块可改时间 / 地点 / 删除', '<button class="btn ghost sm" data-act="add-class">＋ 添加课程</button>') +
      '<div class="sched">' + grid + '</div>' + list +
      '<div class="sec-head"><h3>今天（周' + WD[wdOf(today) - 1] + '）还有哪些整块时间</h3><span class="hint">07:30–23:30，已扣除课程与固定事项</span></div>' +
      '<div class="card"><div class="free">' + freeHTML + '</div>' +
        '<p class="tip">建议：限时套题 / 模拟赛放在 ≥90min 的整块里；背单词、听力精听这类可以塞进 45–60min 的碎片。同一天的课越满，当天只保底，不追进度。</p></div>';
  }

  /* ================= 视图：规划 ================= */
  let planTab = 'overview';
  const PLAN_TABS = [['overview', '总览'], ['challenge', '计挑赛'], ['cet6', '六级'], ['lanqiao', '蓝桥杯'], ['java', 'Java'], ['ds', '数据结构']];

  function curWeek() { return Math.min(5, Math.max(1, Math.floor(daysBetween('2026-10-26', todayISO()) / 7) + 1)); }

  function viewPlan() {
    const tabs = PLAN_TABS.map(t => '<button class="' + (planTab === t[0] ? 'on' : '') + '" data-act="plan-tab" data-tab="' + t[0] + '">' + t[1] + '</button>').join('');
    return head('总体规划', '总览 + 每个项目的时间轴、里程碑和真题入口', '<span class="chip">第 <b>' + curWeek() + '</b> / 5 周</span>') +
      '<div class="tabs">' + tabs + '</div>' +
      (planTab === 'overview' ? planOverview() : planProject(planTab));
  }

  function planOverview() {
    const today = todayISO();
    const order = ['challenge', 'cet6', 'lanqiao', 'java', 'ds'];
    const summary = order.map(k => {
      const p = PLANS[k];
      return '<tr><td><b style="color:' + p.color + '">' + p.name + '</b></td><td>' + p.goal + '</td>' +
        '<td class="mono">' + p.date + '</td><td>' + p.weekly + '</td><td>' + p.now + '</td></tr>';
    }).join('');

    const phases = PHASES.map(p => {
      const st = today > p.to ? 'done' : (today >= p.from ? 'cur' : '');
      const tag = today > p.to ? '已结束' : (today >= p.from ? '进行中' : '未开始');
      return '<div class="phase ' + st + '"><span class="pno">' + p.n + ' · ' + tag + '</span><h4>' + p.name + '</h4>' +
        '<span class="pdate">' + p.from + ' → ' + p.to + '</span><ul>' + p.items.map(i => '<li>' + i + '</li>').join('') + '</ul>' +
        '<span class="pdate">目标：' + p.goal + '</span></div>';
    }).join('');

    const weeks = WEEKS.map((w, i) => '<tr class="' + ((i + 1) === curWeek() ? 'cur' : '') + '"><td class="mono"><b>' + w.w + '</b></td><td class="mono">' + w.d + '</td><td>' + w.topic + '</td><td class="mono">' + w.q + '</td><td>' + w.weekend + '</td></tr>').join('');
    const rhythm = RHYTHM.map((r, i) => '<tr class="' + ((i + 1) === wdOf(today) ? 'cur' : '') + '"><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>').join('');

    return '<div class="sec-head"><h3>五个项目 · 一页总览</h3><span class="hint">按紧急程度排：计挑赛 → 六级 → 蓝桥 → Java / DS</span></div>' +
      '<div class="card" style="padding:6px 14px 10px;overflow-x:auto"><table class="tbl" style="min-width:760px"><thead><tr><th>项目</th><th>目标</th><th>关键日期</th><th>每周投入</th><th>现在的重点</th></tr></thead><tbody>' + summary + '</tbody></table></div>' +
      '<div class="sec-head"><h3>四个阶段</h3><span class="hint">阶段一只保省三，省二看基础题命中</span></div>' +
      '<div class="phases">' + phases + '</div>' +
      '<div class="sec-head"><h3>阶段一 · 五周题表</h3><span class="hint">题量是总量，不是一天做完；每天只取 2–3 题</span></div>' +
      '<div class="card" style="padding:6px 14px 10px;overflow-x:auto"><table class="tbl" style="min-width:700px"><thead><tr><th>周</th><th>日期</th><th>专题</th><th>题量</th><th>周末</th></tr></thead><tbody>' + weeks + '</tbody></table></div>' +
      '<div class="sec-head"><h3>每日节奏</h3><span class="hint">固定课和家教先扣掉，再排任务</span></div>' +
      '<div class="card" style="padding:6px 14px 10px;overflow-x:auto"><table class="tbl" style="min-width:700px"><thead><tr><th>星期</th><th>固定占用</th><th>主学习块</th><th>晚上</th></tr></thead><tbody>' + rhythm + '</tbody></table></div>' +
      '<div class="sec-head"><h3>没做完怎么办</h3><span class="hint">默认不补债，只手动带 1–2 项</span></div>' +
      '<div class="card"><ol class="note-list">' +
        '<li><b>不自动顺延。</b>昨天没勾的留在昨天，日历里能回看和补勾，但不占今天的任务量。</li>' +
        '<li><b>只带关键项。</b>真题 / 实验 / 听力这类必须连贯的，在今日页顶部点「顺延」，一天最多带 2 项。</li>' +
        '<li><b>周日统一处理。</b>连续 3 天完成 &lt; 50%，下周任务量降 20%，不加新任务。</li>' +
        '<li><b>例外：</b>实验截止、比赛前一天，可以把必须交的顺延，考完再回到节奏。</li>' +
      '</ol></div>' +
      '<div class="sec-head"><h3>状态不好时怎么降级</h3></div>' +
      '<div class="card" style="padding:6px 14px 10px;overflow-x:auto"><table class="tbl" style="min-width:640px"><thead><tr><th>情况</th><th>保底版本</th><th>可以砍掉</th></tr></thead><tbody>' +
        '<tr><td>满课 / 实验截止</td><td>英语 30min + 算法 1 题 + Java 20min</td><td>新专题、模拟赛</td></tr>' +
        '<tr><td>低电量 / 生病</td><td>英语 15min + 复习 1 道旧题</td><td>全部新课</td></tr>' +
        '<tr><td>突发聚会 / 通勤</td><td>英语 10min + 5min 复盘</td><td>其他全部</td></tr>' +
        '<tr><td>连续 3 天完成 &lt; 50%</td><td>下周任务量降 20%</td><td>不加新任务</td></tr>' +
      '</tbody></table></div>';
  }

  function planProject(id) {
    const p = PLANS[id];
    if (!p) return '';
    const stages = p.stages.map((s, i) => '<tr><td class="mono"><b>' + (i + 1) + '</b></td><td class="mono">' + s[0] + '</td><td><b>' + s[1] + '</b></td><td>' + s[2] + '</td><td>' + s[3] + '</td></tr>').join('');
    const stagesMobile = p.stages.map(s => '<div class="pstage"><div class="pstage-h"><b>' + s[1] + '</b><span>' + s[0] + '</span></div>' +
      '<p>' + s[2] + '</p><em>产出 / 验收：' + s[3] + '</em></div>').join('');
    const miles = p.miles.map(m => '<li>' + m + '</li>').join('');
    const res = p.res.map(r => '<li>' + (r[1]
      ? '<a href="' + r[1] + '" target="_blank" rel="noopener">' + r[0] + '</a><span>' + r[1].replace(/^https?:\/\//, '') + '</span>'
      : '<span class="nolink">' + r[0] + '</span><span>下载后放进 真题/ 文件夹</span>') + '</li>').join('');

    return '<section class="proj" style="--c:' + p.color + '">' +
      '<div class="proj-top"><div><h3>' + p.name + '</h3><p>' + p.goal + ' · ' + p.date + '</p></div>' +
        '<div class="proj-kpis"><div><span>每周投入</span><b>' + p.weekly + '</b></div><div><span>现在的重点</span><b>' + p.now + '</b></div></div></div>' +
      '<div class="proj-tablewrap"><table class="tbl proj-tbl"><thead><tr><th>#</th><th>时间</th><th>阶段</th><th>做什么</th><th>产出 / 验收</th></tr></thead><tbody>' + stages + '</tbody></table></div>' +
      '<div class="pstages">' + stagesMobile + '</div>' +      '<div class="proj-grid"><div><h4>里程碑</h4><ol class="note-list">' + miles + '</ol></div>' +
        '<div><h4>资源 / 真题入口</h4><ul class="res-list">' + res + '</ul></div></div>' +
      '<p class="tip">' + p.tip + '</p></section>';
  }

  /* ================= 视图：统计 ================= */
  function rangeStats() {
    const end = todayISO();
    const start = state.start <= end ? state.start : end;
    const n = Math.min(730, Math.max(0, daysBetween(start, end)));
    const tracks = {};
    TRACKS.forEach(t => { tracks[t.id] = { done: 0, total: 0, minDone: 0 }; });
    let total = 0, done = 0;
    for (let i = 0; i <= n; i++) {
      const d = addDays(start, i);
      tasksFor(d, { all: true }).forEach(t => {
        total++;
        tracks[t.track].total++;
        if (t.done) { done++; tracks[t.track].done++; tracks[t.track].minDone += t.min; }
      });
    }
    let checked = 0, full = 0;
    Object.keys(state.checkins).forEach(d => {
      if (d >= start && d <= end) { checked++; if ((state.checkins[d].ratio || 0) >= 0.999) full++; }
    });
    const focus = Object.keys(state.focus).reduce((s, k) => s + (state.focus[k] || 0), 0);
    let weekFocus = 0;
    for (let i = 0; i < 7; i++) weekFocus += state.focus[addDays(end, -i)] || 0;
    return { start: start, end: end, days: n + 1, total: total, done: done, tracks: tracks, checked: checked, full: full, focus: focus, weekFocus: weekFocus, avg: total ? Math.round(done / total * 100) : 0 };
  }

  function last14() {
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const d = addDays(todayISO(), -i);
      const ts = tasksFor(d, { all: true });
      out.push({ d: d, total: ts.length, done: ts.filter(t => t.done).length });
    }
    return out;
  }

  function viewStats() {
    const s = rangeStats();
    const chart = last14().map(x => {
      const r = x.total ? x.done / x.total : 0;
      const h = Math.max(3, Math.round(r * 132));
      return '<div class="col" title="' + x.d + ' · ' + x.done + '/' + x.total + '"><div class="cbar ' + (r ? '' : 'zero') + '" style="height:' + h + 'px"></div>' +
        '<span class="clb">' + fmtDate(x.d) + '</span></div>';
    }).join('');

    const bars = TRACKS.map(t => {
      const d = s.tracks[t.id] || { done: 0, total: 0, minDone: 0 };
      const pct = d.total ? Math.round(d.done / d.total * 100) : 0;
      return '<div class="tb-row" style="--c:' + t.color + '"><span class="nm"><i></i>' + t.name + '</span>' +
        '<span class="barbg"><i style="width:' + pct + '%"></i></span><span class="vv">' + d.done + '/' + d.total + '</span></div>';
    }).join('');

    return head('数据统计', '从 ' + s.start + ' 开始，共 ' + s.days + ' 天', '<button class="btn ghost sm" data-act="export">导出备份</button>') +
      '<div class="kpis">' +
        '<div class="kpi"><span>连续打卡</span><b>' + streakNow() + '<i>天</i></b><em>最长 ' + longestStreak() + ' 天</em></div>' +
        '<div class="kpi"><span>累计打卡</span><b>' + s.checked + '<i>天</i></b><em>全勤 ' + s.full + ' 天</em></div>' +
        '<div class="kpi"><span>总完成项</span><b>' + s.done + '<i>项</i></b><em>平均完成率 ' + s.avg + '%</em></div>' +
        '<div class="kpi"><span>累计专注</span><b>' + (s.focus / 3600).toFixed(1) + '<i>h</i></b><em>近 7 天 ' + (s.weekFocus / 3600).toFixed(1) + ' h</em></div>' +
      '</div>' +
      '<div class="sec-head"><h3>近 14 天完成率</h3><span class="hint">柱子越高，当天勾掉的任务越多</span></div>' +
      '<div class="card"><div class="chart">' + chart + '</div></div>' +
      '<div class="sec-head"><h3>各栏目累计</h3><span class="hint">完成项 / 计划项</span></div>' +
      '<div class="card"><div class="trackbars">' + bars + '</div>' +
        '<p class="tip">某一栏长期低于 50%，就把它下周的任务量降 20%，别硬扛。</p></div>';
  }

  /* ================= 视图：设置 ================= */
  function viewSettings() {
    const ex = examList();
    const examFields = EXAMS.map(def => {
      const e = ex.find(x => x.id === def.id);
      return '<div class="row2" style="grid-template-columns:96px 1fr 92px;align-items:end">' +
        '<div class="field" style="margin-bottom:0"><span>' + esc(def.name) + '</span><span class="hint">' + esc(def.full) + '</span></div>' +
        '<div class="field" style="margin-bottom:0"><input type="date" id="ex-' + def.id + '" value="' + e.date + '"></div>' +
        '<div class="field" style="margin-bottom:0"><input id="g-' + def.id + '" value="' + esc(e.goal) + '" placeholder="目标"></div>' +
      '</div>';
    }).join('<div style="height:10px"></div>');

    let lastExport = '还没有导出过';
    if (state.meta.lastExport) {
      const d = new Date(state.meta.lastExport);
      lastExport = ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()) + ' ' + timeOf(state.meta.lastExport);
    }

    return head('设置与备份', '改完记得点保存，改日期会立刻影响倒计时', '') +
      '<div class="grid2">' +
        '<section class="card"><div class="card-h"><h3>考试日期与目标</h3><span>默认按官方通知前的估计</span></div>' +
          examFields +
          '<div class="form-row"><button class="btn primary" data-act="save-exams">保存考试信息</button></div>' +
        '</section>' +
        '<section class="card"><div class="card-h"><h3>每日目标</h3><span>低于这个时长算“没达标”</span></div>' +
          '<div class="field"><span>每日目标分钟</span><input type="number" id="f-target" min="30" max="720" step="10" value="' + state.settings.targetMin + '">' +
            '<span class="hint">建议 180：约等于每天 3 小时有效学习</span></div>' +
          '<div class="form-row"><button class="btn primary" data-act="save-target">保存目标</button></div>' +
          '<div class="warn" style="margin-top:12px">目标只是底线。当天课多、实验赶截止，就按计划页的降级方案执行，不算失败。</div>' +
        '</section>' +
        '<section class="card"><div class="card-h"><h3>数据</h3><span>存在这台设备的浏览器里</span></div>' +
          '<p class="tip" style="margin-top:0">换浏览器、清理缓存、换设备前，先导出 JSON 备份；在新设备打开页面后导入即可恢复。</p>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">' +
            '<button class="btn primary" data-act="export">导出备份</button>' +
            '<button class="btn ghost" data-act="import">导入备份</button>' +
            '<button class="btn ghost" data-act="reset-all" style="color:#cf4f4f;border-color:#f0d3d3">清空所有数据</button>' +
          '</div>' +
          '<div class="mini-row"><span>上次导出</span><b>' + lastExport + '</b></div>' +
          '<div class="mini-row"><span>打卡记录</span><b>' + Object.keys(state.checkins).length + ' 天</b></div>' +
          '<div class="mini-row"><span>已存任务勾选</span><b>' + Object.keys(state.done).length + ' 天</b></div>' +
          (storageOK ? '' : '<div class="warn" style="margin-top:10px">当前浏览器禁止本地存储，打卡不会保存。请换 Chrome / Edge 打开。</div>') +
        '</section>' +
        '<section class="card"><div class="card-h"><h3>怎么用</h3></div>' +
          '<ol class="note-list">' +
            '<li>每天打开「今日」，逐栏勾任务；勾满自动打卡，没做完也可以点「收工打卡」。</li>' +
            '<li>任务不合适就点「改」换题、「删」去掉，或「＋ 添加任务」补一项，只影响当天。</li>' +
            '<li>「课表」里可以改上课时间 / 地点，空档时间会自动重算。</li>' +
            '<li>「规划」页是五个项目的总规划（时间轴 / 里程碑 / 真题入口）；周日复盘时看「数据」，低于 50% 的栏目下周降量。</li>' +
            '<li>22:00 前打卡。没做完的不自动顺延，要紧的在今日页顶部带 1–2 项；周日复盘统一处理。</li>' +
          '</ol>' +
          '<p class="tip">快捷键：Esc 关闭弹窗。演示数据可加 <b>?demo=1</b> 查看。</p>' +
        '</section>' +
        '<section class="card"><div class="card-h"><h3>手机上用</h3><span>加到主屏幕，像 App 一样打开</span></div>' +
          '<ol class="note-list">' +
            '<li>同一 Wi-Fi：双击文件夹里的「启动手机访问.bat」，手机浏览器输入窗口显示的地址。</li>' +
            '<li>长期用：把运行文件传到 GitHub Pages，手机打开网址后「添加到主屏幕」，首次加载后离线可用。</li>' +
            '<li>手机和电脑的数据各存一份，换设备用「数据 → 导出 / 导入」。</li>' +
          '</ol>' +
          '<p class="tip">详细步骤见文件夹里的 手机使用说明.md。</p>' +
        '</section>' +
      '</div>';
  }

  /* ================= 弹窗 ================= */
  function openTaskModal(trackId, taskId) {
    const t = taskId ? findTask(activeDate, taskId) : null;
    modal = { type: 'task', date: activeDate, id: taskId || null, track: (t && t.track) || trackId || TRACKS[0].id, task: t };
    renderModal();
  }
  function openClassModal(id) {
    const c = id ? state.schedule.find(x => x.id === id) : null;
    modal = { type: 'class', id: id || null, data: c || { day: wdOf(todayISO()), start: '10:15', end: '11:40', name: '', place: '', kind: 'class' } };
    renderModal();
  }

  function renderModal() {
    const host = $('#modalHost');
    if (!modal) { host.innerHTML = ''; return; }
    let body = '';
    if (modal.type === 'task') {
      const t = modal.task;
      body = '<form class="sheet" id="taskForm"><h3>' + (modal.id ? '编辑任务' : '添加任务') + '</h3>' +
        '<div class="field"><span>任务内容</span><input id="f-title" value="' + esc(t ? t.title : '') + '" placeholder="例：洛谷 P1048 采药（01 背包）" autocomplete="off"></div>' +
        '<div class="row2">' +
          '<div class="field"><span>预计分钟</span><input type="number" id="f-min" min="1" max="600" step="5" value="' + (t ? t.min : 30) + '"></div>' +
          '<div class="field"><span>所属栏目</span><select id="f-track"' + (modal.id ? ' disabled' : '') + '>' +
            TRACKS.map(tr => '<option value="' + tr.id + '"' + (tr.id === modal.track ? ' selected' : '') + '>' + tr.name + '</option>').join('') +
          '</select></div>' +
        '</div>' +
        '<p class="hint" style="font-size:11px;color:#9aa7bb">只改 ' + fmtDate(modal.date) + ' 这一天，不影响其他日期。</p>' +
        '<div class="sheet-f">' +
          (modal.id ? '<button type="button" class="btn ghost del" data-act="del-task" data-id="' + modal.id + '">删除任务</button>' : '') +
          '<button type="button" class="btn ghost" data-act="close">取消</button>' +
          '<button type="button" class="btn primary" data-act="save-task">保存</button>' +
        '</div></form>';
    } else {
      const c = modal.data;
      body = '<form class="sheet" id="classForm"><h3>' + (modal.id ? '编辑课程' : '新增课程') + '</h3>' +
        '<div class="field"><span>课程 / 事项名称</span><input id="c-name" value="' + esc(c.name) + '" placeholder="例：数据结构" autocomplete="off"></div>' +
        '<div class="row2">' +
          '<div class="field"><span>星期</span><select id="c-day">' + [1, 2, 3, 4, 5, 6, 7].map(d => '<option value="' + d + '"' + (d === c.day ? ' selected' : '') + '>周' + WD[d - 1] + '</option>').join('') + '</select></div>' +
          '<div class="field"><span>类型</span><select id="c-kind">' +
            '<option value="class"' + (c.kind === 'class' ? ' selected' : '') + '>课程</option>' +
            '<option value="fixed"' + (c.kind === 'fixed' ? ' selected' : '') + '>固定事项</option>' +
            '<option value="sport"' + (c.kind === 'sport' ? ' selected' : '') + '>运动</option></select></div>' +
        '</div>' +
        '<div class="row2">' +
          '<div class="field"><span>开始</span><input type="time" id="c-start" value="' + c.start + '"></div>' +
          '<div class="field"><span>结束</span><input type="time" id="c-end" value="' + c.end + '"></div>' +
        '</div>' +
        '<div class="field"><span>地点</span><input id="c-place" value="' + esc(c.place) + '" placeholder="例：致理楼 L1-501"></div>' +
        '<div class="sheet-f">' +
          (modal.id ? '<button type="button" class="btn ghost del" data-act="del-class" data-id="' + modal.id + '">删除</button>' : '') +
          '<button type="button" class="btn ghost" data-act="close">取消</button>' +
          '<button type="button" class="btn primary" data-act="save-class">保存</button>' +
        '</div></form>';
    }
    host.innerHTML = '<div class="mask" data-mask="1">' + body + '</div>';
    const first = host.querySelector('input,select');
    if (first) first.focus();
  }
  function closeModal() { modal = null; renderModal(); }

  function saveTaskModal() {
    const title = ($('#f-title').value || '').trim();
    let min = Number($('#f-min').value) || 30;
    min = Math.max(1, Math.min(600, Math.round(min)));
    const track = $('#f-track').value;
    if (!title) { toast('先写个任务名'); return; }
    const date = modal.date;
    if (modal.id) {
      if (modal.task && modal.task.custom) {
        const c = (state.custom[date] || []).find(x => x.id === modal.id);
        if (c) { c.title = title; c.min = min; }
      } else {
        const ov = state.overrides[date] || (state.overrides[date] = {});
        ov[modal.id] = { title: title, min: min };
      }
    } else {
      const arr = state.custom[date] || (state.custom[date] = []);
      arr.push({ id: 'c' + Date.now().toString(36), track: track, title: title, min: min });
    }
    modal = null; save(); render(); toast('已保存');
  }

  function saveClassModal() {
    const name = ($('#c-name').value || '').trim();
    const day = Number($('#c-day').value);
    const start = $('#c-start').value || '10:15';
    const end = $('#c-end').value || '11:40';
    const place = ($('#c-place').value || '').trim() || '—';
    const kind = $('#c-kind').value;
    if (!name) { toast('先写课程名'); return; }
    if (toMin(end) <= toMin(start)) { toast('结束时间要晚于开始时间'); return; }
    if (modal.id) {
      const c = state.schedule.find(x => x.id === modal.id);
      if (c) { c.name = name; c.day = day; c.start = start; c.end = end; c.place = place; c.kind = kind; }
    } else {
      state.schedule.push({ id: 'c' + Date.now().toString(36), day: day, start: start, end: end, name: name, place: place, kind: kind });
    }
    modal = null; save(); render(); toast('课表已更新');
  }

  /* ================= 专注计时 ================= */
  function focusSeconds(date) {
    let s = state.focus[date] || 0;
    if (focusRun && focusRun.date === date) s += Math.floor((Date.now() - focusRun.startedAt) / 1000);
    return s;
  }
  function flushFocus() {
    if (!focusRun) return;
    const s = Math.floor((Date.now() - focusRun.startedAt) / 1000);
    if (s > 0) {
      state.focus[focusRun.date] = (state.focus[focusRun.date] || 0) + s;
      focusRun.startedAt = Date.now();
      save();
    }
  }
  function toggleTimer() {
    if (focusRun) {
      flushFocus(); focusRun = null;
      toast('已暂停，专注时长已计入今天');
    } else {
      focusRun = { startedAt: Date.now(), date: activeDate };
      toast('开始专注，去把这一栏勾完');
    }
    render();
  }
  function tickUI() {
    const el = document.getElementById('focusClock');
    if (el) el.textContent = mmss(focusSeconds(activeDate));
    const btn = document.getElementById('timerBtn');
    if (btn) btn.textContent = (focusRun && focusRun.date === activeDate) ? '暂停专注' : '开始专注';
  }

  /* ================= 渲染 ================= */
  function renderNav() {
    const items = [['today', '今日'], ['calendar', '日历'], ['schedule', '课表'], ['plan', '规划'], ['stats', '数据'], ['settings', '设置']];
    const icons = {
      today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
      calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
      schedule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M15 10v10"/></svg>',
      plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5M4 19h16"/><path d="M8 15l4-5 3 3 5-7"/></svg>',
      stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
      settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15a1.6 1.6 0 0 0-1.1-2.7H1.8a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 3.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 8 3.6h.1A1.6 1.6 0 0 0 9 1.8V1.8a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 3.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 8v.1a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.9z"/></svg>'
    };
    const html = items.map(it => '<button data-act="nav" data-view="' + it[0] + '">' + icons[it[0]] + '<span>' + it[1] + '</span></button>').join('');
    $('#nav').innerHTML = html;
    $('#mnav').innerHTML = items.map(it => '<button data-act="nav" data-view="' + it[0] + '">' + it[1] + '</button>').join('');
  }

  function renderSide() {
    const st = sideStats();
    $('#sideCard').innerHTML =
      '<div class="sc"><span>连续打卡</span><b>' + st.streak + ' 天</b></div>' +
      '<div class="sc"><span>累计打卡</span><b>' + st.checked + ' 天</b></div>' +
      '<div class="sc"><span>本周完成率</span><b>' + st.weekPct + '%</b></div>';
    const sub = document.getElementById('mSub');
    if (sub) sub.textContent = '第 ' + weekNo(todayISO()) + ' 周 · 连续 ' + st.streak + ' 天';
  }

  function render() {
    document.querySelectorAll('[data-act="nav"]').forEach(b => b.classList.toggle('on', b.dataset.view === view.name));
    renderSide();
    const map = { today: viewToday, calendar: viewCalendar, schedule: viewSchedule, plan: viewPlan, stats: viewStats, settings: viewSettings };
    const banner = DEMO ? '<div class="demo-banner">演示数据：仅用于预览，不会写入本地存储。真实使用请直接打开 index.html。</div>' : '';
    $('#view').innerHTML = banner + (map[view.name] || viewToday)();
    renderModal();
    tickUI();
  }

  function setView(v) {
    view.name = v;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goDay(date) {
    if (focusRun) { flushFocus(); focusRun = null; }
    activeDate = date;
    const o = parseISO(date);
    calY = o.y; calM = o.m;
    render();
  }

  /* ================= 交互 ================= */
  let toastTimer = null;
  function toast(msg, ms) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), ms || 2200);
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) {
      if (e.target.dataset && e.target.dataset.mask) closeModal();
      return;
    }
    const act = el.dataset.act;
    switch (act) {
      case 'nav': setView(el.dataset.view); break;
      case 'day-prev': goDay(addDays(activeDate, -1)); break;
      case 'day-next': goDay(addDays(activeDate, 1)); break;
      case 'day-today': goDay(todayISO()); break;
      case 'open-day': goDay(el.dataset.date); setView('today'); break;
      case 'toggle': toggleTask(activeDate, el.dataset.id); break;
      case 'plan-tab': planTab = el.dataset.tab; render(); break;
      case 'carry': {
        const d = el.dataset.date, id = el.dataset.id;
        const t = tasksFor(d).find(x => x.id === id);
        if (!t) return;
        if (activeTracks(todayISO()).every(tr => tr.id !== t.track)) { toast('这一栏已经结束了'); return; }
        const arr = state.custom[todayISO()] || (state.custom[todayISO()] = []);
        if (arr.some(x => x.track === t.track && x.title === t.title)) { toast('今天已经带了这一项'); return; }
        arr.push({ id: 'c' + Date.now().toString(36), track: t.track, title: t.title, min: t.min });
        save(); render(); toast('已顺延到今天（建议一天最多 2 项）');
        break;
      }
      case 'add-task': openTaskModal(el.dataset.track); break;
      case 'edit-task': openTaskModal(null, el.dataset.id); break;
      case 'del-task': {
        const id = el.dataset.id;
        const t = findTask(modal ? modal.date : activeDate, id);
        if (modal && modal.type === 'task') {
          if (t && t.custom) state.custom[modal.date] = (state.custom[modal.date] || []).filter(x => x.id !== id);
          else (state.hidden[modal.date] || (state.hidden[modal.date] = [])).push(id);
          delete (state.done[modal.date] || {})[id];
          modal = null; save(); render(); toast('任务已删除');
        } else {
          const date = activeDate;
          const task = findTask(date, id);
          if (!task) return;
          if (task.custom) state.custom[date] = (state.custom[date] || []).filter(x => x.id !== id);
          else (state.hidden[date] || (state.hidden[date] = [])).push(id);
          delete (state.done[date] || {})[id];
          save(); render(); toast('任务已删除，可点「恢复默认任务」找回');
        }
        break;
      }
      case 'save-task': saveTaskModal(); break;
      case 'checkin': doCheckin(); break;
      case 'uncheck': undoCheckin(); break;
      case 'timer': toggleTimer(); break;
      case 'reset-day': {
        if (!confirm('恢复 ' + fmtDate(activeDate) + ' 的默认任务？会清掉这一天的改动（打卡记录保留）。')) return;
        delete state.overrides[activeDate]; delete state.hidden[activeDate]; delete state.custom[activeDate];
        save(); render(); toast('已恢复默认任务');
        break;
      }
      case 'cal-prev': calM--; if (calM < 1) { calM = 12; calY--; } render(); break;
      case 'cal-next': calM++; if (calM > 12) { calM = 1; calY++; } render(); break;
      case 'edit-class': openClassModal(el.dataset.id); break;
      case 'add-class': openClassModal(null); break;
      case 'save-class': saveClassModal(); break;
      case 'del-class': {
        if (!confirm('删除这门课？')) return;
        state.schedule = state.schedule.filter(c => c.id !== el.dataset.id);
        modal = null; save(); render(); toast('已删除');
        break;
      }
      case 'save-exams': {
        state.exams = EXAMS.map(def => {
          const cur = (state.exams || []).find(x => x.id === def.id) || {};
          const dateEl = $('#ex-' + def.id), goalEl = $('#g-' + def.id);
          return { id: def.id, date: (dateEl && dateEl.value) || cur.date || def.date, goal: (goalEl && goalEl.value.trim()) || def.goal };
        });
        save(); render(); toast('考试信息已更新');
        break;
      }
      case 'save-target': {
        const v = Number($('#f-target').value);
        if (!v || v < 30) { toast('目标太小了，至少 30min'); return; }
        state.settings.targetMin = Math.min(720, Math.round(v));
        save(); render(); toast('目标已更新');
        break;
      }
      case 'export': exportData(); break;
      case 'import': $('#fileIn').click(); break;
      case 'reset-all': {
        if (!confirm('确定清空所有打卡、任务和课表改动？此操作不可撤销，建议先导出备份。')) return;
        if (!confirm('再确认一次：真的要清空吗？')) return;
        state = defaults();
        state.start = todayISO();
        calY = parseISO(todayISO()).y; calM = parseISO(todayISO()).m;
        activeDate = todayISO();
        save(); render(); toast('已清空，重新开始');
        break;
      }
      case 'close': closeModal(); break;
      default: break;
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'dayNote') {
      state.notes[activeDate] = e.target.value;
      saveSoon();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal) closeModal();
  });

  $('#fileIn').addEventListener('change', function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || typeof obj !== 'object' || !obj.done || !obj.checkins) throw new Error('格式不对');
        state = migrate(obj);
        save(); render(); toast('备份已导入');
      } catch (err) {
        toast('导入失败：不是本应用的备份文件');
      }
      e.target.value = '';
    };
    reader.readAsText(f);
  });

  function exportData() {
    if (DEMO) { toast('演示数据不能导出'); return; }
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '打卡备份-' + todayISO() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      state.meta.lastExport = Date.now(); save(); render();
      toast('已导出，建议存到网盘');
    } catch (e) {
      toast('导出失败，请换 Chrome / Edge 试试');
    }
  }

  /* ================= 演示数据 ================= */
  function demoState() {
    const s = defaults();
    s.start = '2026-10-26';
    state = s;
    const end = todayISO();
    const n = Math.max(0, daysBetween('2026-10-26', end));
    for (let i = 0; i < n; i++) {
      const d = addDays('2026-10-26', i);
      const ts = tasksFor(d, { all: true });
      const seed = (i * 37 + 11) % 100;
      let ratio = seed < 6 ? 0 : seed < 16 ? 0.25 : seed < 34 ? 0.5 : seed < 58 ? 0.7 : 1;
      if (seed > 90) ratio = 0.85;
      if (!s.done[d]) s.done[d] = {};
      const cnt = Math.round(ts.length * ratio);
      ts.forEach((t, idx) => { if (idx < cnt) s.done[d][t.id] = Date.now(); });
      if (ratio >= 0.5 && seed % 13 !== 0) {
        s.checkins[d] = { at: Date.now(), ratio: cnt / ts.length, auto: ratio === 1, partial: ratio < 1 };
      }
      if (i % 5 === 0) s.notes[d] = ['二分边界又写错了，明天重写 lower_bound。', '听力 Section A 跟不上，先精听再做题。', '实验三卡在文件读入，明天先写 10 分钟再问。', '今天课太多，只保底了英语和 1 道题。'][i % 4];
      if (seed % 3 === 0) s.focus[d] = 1800 + (seed * 37) % 7200;
    }
    // 今天留一半左右未完成，方便演示“勾选 / 收工打卡”
    const td = end;
    if (!s.done[td]) s.done[td] = {};
    const todayTasks = tasksFor(td);
    todayTasks.slice(0, Math.max(1, Math.floor(todayTasks.length * 0.6))).forEach(function (t) { s.done[td][t.id] = Date.now(); });
    s.focus[td] = 2400;
    return s;
  }

  /* ================= 启动 ================= */
  function boot() {
    if (DEMO) state = demoState();
    else {
      state = load();
      save(); // 写入默认值，确保记录起始日
    }
    const vq = QS.get('view');
    if (vq && ['today', 'calendar', 'schedule', 'plan', 'stats', 'settings'].indexOf(vq) >= 0) view.name = vq;
    const tq = QS.get('tab');
    if (tq && PLANS[tq]) planTab = tq;
    renderNav();
    render();
    setInterval(function () {
      tickUI();
      if (focusRun && Date.now() - lastFlush > 30000) { lastFlush = Date.now(); flushFocus(); }
    }, 1000);
    window.addEventListener('beforeunload', function () { flushFocus(); save(); });
    window.addEventListener('error', function (ev) {
      toast('页面出错：' + (ev.message || '未知错误'));
    });
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
    }
  }

  // 供测试 / 调试使用
  window.__APP = {
    getState: function () { return state; },
    get activeDate() { return activeDate; },
    setView: setView,
    goDay: goDay,
    toggle: toggleTask,
    checkin: doCheckin,
    tasks: tasksFor,
    render: render,
    isDemo: DEMO
  };

  boot();
})();

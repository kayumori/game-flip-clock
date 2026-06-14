/* ============================================================
   Game Flip Clock
   ------------------------------------------------------------
   フリップ時計 + 遊び要素（コインキャッチ / スコア & コンボ /
   実績 / 反応するマスコット / 触って気持ちいい演出）
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 要素参照 ---------- */
  const clock   = document.getElementById("clock");
  const board   = document.querySelector(".board");
  const buddy   = document.getElementById("buddy");
  const bubble  = document.getElementById("bubble");
  const toasts  = document.getElementById("toasts");
  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const bestEl  = document.getElementById("best");
  const comboBox = document.getElementById("comboBox");
  const ampm    = clock.querySelector("[data-ampm]");

  const cards = {};
  clock.querySelectorAll(".flip").forEach((el) => (cards[el.dataset.place] = el));

  /* ---------- ゲーム状態 ---------- */
  const SAVE_KEY = "game-flip-clock";
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
  let score = 0;
  let best  = saved.best || 0;
  let combo = 1;
  let comboTimer = null;
  let chanceUntil = 0;
  const unlocked = new Set(saved.achievements || []);
  bestEl.textContent = best;

  const ACHIEVEMENTS = [
    { id: "first",   emoji: "✨", name: "はじめの一歩",   desc: "コインを初キャッチ",       test: (s) => s.catches >= 1 },
    { id: "combo5",  emoji: "🔥", name: "ノッてきた",       desc: "コンボ x5 達成",          test: (s) => s.maxCombo >= 5 },
    { id: "combo10", emoji: "⚡", name: "止まらない",       desc: "コンボ x10 達成",         test: (s) => s.maxCombo >= 10 },
    { id: "p100",    emoji: "🪙", name: "コインコレクター", desc: "100点 到達",              test: (s) => s.score >= 100 },
    { id: "p1000",   emoji: "👑", name: "タイムマスター",   desc: "1000点 到達",             test: (s) => s.score >= 1000 },
    { id: "chance",  emoji: "🎯", name: "ゾロ目ハンター",   desc: "チャンスタイムでキャッチ", test: (s) => s.chanceCatch >= 1 },
    { id: "poke50",  emoji: "👆", name: "ぷにぷに中毒",     desc: "カードを50回つつく",      test: (s) => s.pokes >= 50 },
    { id: "boom",    emoji: "💥", name: "ドンマイ！",       desc: "ハズレを踏んでしまう",     test: (s) => s.bombs >= 1 },
    { id: "safe20",  emoji: "🍀", name: "慎重派",           desc: "ハズレ無しで20キャッチ",   test: (s) => s.catches >= 20 && s.bombs === 0 },
  ];
  const stats = { score: 0, catches: 0, maxCombo: 1, chanceCatch: 0, pokes: 0, bombs: 0 };

  /* ============================================================
     効果音（WebAudio・ファイル不要）
     ============================================================ */
  let audioCtx = null;
  function beep(freq, dur, type = "square", vol = 0.06) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain).connect(audioCtx.destination);
      const t = audioCtx.currentTime;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    } catch (_) { /* 無音でも続行 */ }
  }

  /* ============================================================
     フリップ描画
     ============================================================ */
  function flip(card, next) {
    const topSpan = card.querySelector(".top span");
    const bottomSpan = card.querySelector(".bottom span");
    const current = topSpan.textContent;
    if (current === next) return;

    topSpan.textContent = next;
    bottomSpan.textContent = current;

    const ft = document.createElement("div");
    ft.className = "flip-top";
    ft.innerHTML = `<span>${current}</span>`;
    const fb = document.createElement("div");
    fb.className = "flip-bottom";
    fb.innerHTML = `<span>${next}</span>`;
    card.append(ft, fb);
    ft.addEventListener("animationend", () => ft.remove());
    fb.addEventListener("animationend", () => {
      bottomSpan.textContent = next;
      fb.remove();
    });
  }
  const setCard = (place, ch) => cards[place] && flip(cards[place], ch);

  /* ============================================================
     時計の更新
     ============================================================ */
  let lastSec = -1;
  function render() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (clock.dataset.format === "12") {
      if (ampm) ampm.textContent = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
    }

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    setCard("h-tens", hh[0]); setCard("h-ones", hh[1]);
    setCard("m-tens", mm[0]); setCard("m-ones", mm[1]);
    setCard("s-tens", ss[0]); setCard("s-ones", ss[1]);

    if (s !== lastSec) {
      lastSec = s;
      onTick(h, m, s, hh, mm, ss);
    }
  }

  function onTick(h, m, s, hh, mm, ss) {
    // チャンスタイム判定：ゾロ目（HH:MM の数字が揃う）or 毎時0分
    const digits = hh + mm;
    const allSame = digits.split("").every((d) => d === digits[0]);
    const isStartChance = (m === 0 && s === 0) || (allSame && s === 0) || (hh === mm && s === 0);
    if (isStartChance) startChance();

    // 通常のコインは数秒おきにランダムで出現
    if (Date.now() > chanceUntil && Math.random() < 0.45) spawnCoin();
    // チャンスタイム中はコインが降る
    if (Date.now() <= chanceUntil) { spawnCoin(true); spawnCoin(true); }

    updateChanceVisual();
  }

  function startChance() {
    chanceUntil = Date.now() + 8000;
    say("チャンスタイム！🎯", 2500);
    beep(880, 0.12); setTimeout(() => beep(1175, 0.16), 120);
    updateChanceVisual();
  }
  function updateChanceVisual() {
    clock.classList.toggle("is-chance", Date.now() <= chanceUntil);
  }

  /* ============================================================
     コイン
     ============================================================ */
  function spawnCoin(isChance = false) {
    const placeKeys = Object.keys(cards).filter((k) => {
      // 秒が非表示なら秒カードからは出さない
      if (clock.dataset.seconds === "false" && k.startsWith("s-")) return false;
      return true;
    });
    const anchor = cards[placeKeys[(Math.random() * placeKeys.length) | 0]];
    const a = anchor.getBoundingClientRect();
    const b = board.getBoundingClientRect();

    // 種類を決定：チャンスタイム中はハズレ無し、通常は約22%でハズレ（爆弾）
    const roll = Math.random();
    let type = "gold";
    if (!isChance && roll < 0.22) type = "bad";
    else if (isChance ? roll < 0.5 : roll > 0.85) type = "pink";

    const coin = document.createElement("div");
    coin.className = "coin is-" + type;
    coin.textContent = { bad: "💣", pink: "★", gold: "●" }[type];
    coin.dataset.value = { bad: -30, pink: 50, gold: 10 }[type];
    coin.dataset.bad = type === "bad" ? "1" : "";
    coin.dataset.chance = isChance ? "1" : "";
    coin.style.left = a.left - b.left + a.width / 2 + (Math.random() * 30 - 15) + "px";
    coin.style.top  = a.top  - b.top  + (Math.random() * 20) + "px";
    board.appendChild(coin);

    coin.addEventListener("animationend", () => coin.remove());
    coin.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      collectCoin(coin);
    });
  }

  function collectCoin(coin) {
    if (coin.dataset.dead) return;
    coin.dataset.dead = "1";
    const rect = coin.getBoundingClientRect();
    const b = board.getBoundingClientRect();
    const x = rect.left - b.left + rect.width / 2;
    const y = rect.top - b.top + rect.height / 2;

    if (coin.dataset.bad) {        // ハズレ（爆弾）を踏んだ
      const loss = Math.min(score, 30);
      addScore(-loss, x, y);
      resetCombo();
      burst(x, y, "#444");
      sadBuddy();
      shakeBoard();
      say("ハズレ…！💥", 1600);
      beep(140, 0.28, "sawtooth", 0.08);
      stats.bombs++;
      coin.remove();
      checkAchievements();
      return;
    }

    addScore(parseInt(coin.dataset.value, 10) * combo, x, y);
    bumpCombo();
    burst(x, y, coin.classList.contains("is-pink") ? "#ff5d73" : "#ffcf33");
    happyBuddy();
    beep(660 + combo * 40, 0.08, "square");

    stats.catches++;
    if (coin.dataset.chance) stats.chanceCatch++;
    coin.remove();
    checkAchievements();
  }

  /* ============================================================
     スコア & コンボ
     ============================================================ */
  function addScore(amount, x, y) {
    score = Math.max(0, score + amount);
    stats.score = score;
    scoreEl.textContent = score;
    scoreEl.classList.remove("score-bump");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("score-bump");

    if (score > best) {
      best = score;
      bestEl.textContent = best;
      persist();
    }
    if (x != null && amount !== 0) {
      const f = document.createElement("div");
      f.className = "float-score" + (amount < 0 ? " is-loss" : "");
      f.textContent = (amount > 0 ? "+" : "") + amount;
      f.style.left = x + "px";
      f.style.top = y + "px";
      board.appendChild(f);
      f.addEventListener("animationend", () => f.remove());
    }
  }

  function bumpCombo() {
    combo++;
    comboEl.textContent = "x" + combo;
    stats.maxCombo = Math.max(stats.maxCombo, combo);
    if (combo >= 3) {
      comboBox.classList.remove("is-hot");
      void comboBox.offsetWidth;
      comboBox.classList.add("is-hot");
    }
    clearTimeout(comboTimer);
    comboTimer = setTimeout(resetCombo, 2600); // 少し間が空くとコンボ終了
  }
  function resetCombo() {
    if (combo > 1) say("コンボ終了… x" + combo, 1400);
    combo = 1;
    comboEl.textContent = "x1";
    comboBox.classList.remove("is-hot");
  }

  /* ============================================================
     エフェクト
     ============================================================ */
  function burst(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("div");
      p.className = "spark";
      p.style.background = color;
      p.style.left = x + "px";
      p.style.top = y + "px";
      const ang = (Math.PI * 2 * i) / 10 + Math.random();
      const dist = 30 + Math.random() * 30;
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      board.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }

  let bubbleTimer = null;
  function say(text, ms = 1800) {
    bubble.textContent = text;
    bubble.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove("show"), ms);
  }
  let happyTimer = null;
  function happyBuddy() {
    buddy.classList.remove("is-happy", "is-sad");
    void buddy.offsetWidth;
    buddy.classList.add("is-happy");
    clearTimeout(happyTimer);
    happyTimer = setTimeout(() => buddy.classList.remove("is-happy"), 500);
  }
  let sadTimer = null;
  function sadBuddy() {
    buddy.classList.remove("is-happy", "is-sad");
    void buddy.offsetWidth;
    buddy.classList.add("is-sad");
    clearTimeout(sadTimer);
    sadTimer = setTimeout(() => buddy.classList.remove("is-sad"), 700);
  }
  let shakeTimer = null;
  function shakeBoard() {
    board.classList.remove("shake");
    void board.offsetWidth;
    board.classList.add("shake");
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => board.classList.remove("shake"), 400);
  }

  /* ============================================================
     カードを「つつく」(触って気持ちいい演出)
     ============================================================ */
  Object.values(cards).forEach((card) => {
    card.addEventListener("pointerdown", () => {
      card.classList.remove("is-poked");
      void card.offsetWidth;
      card.classList.add("is-poked");
      const r = card.getBoundingClientRect();
      const b = board.getBoundingClientRect();
      burst(r.left - b.left + r.width / 2, r.top - b.top + r.height / 2, "#bbbbbb");
      beep(220 + Math.random() * 60, 0.05, "triangle", 0.04);
      stats.pokes++;
      checkAchievements();
    });
  });

  buddy.addEventListener("pointerdown", () => {
    happyBuddy();
    const lines = ["やっほー！", "いまは " + clock.querySelector('[data-place="h-tens"] .top span').textContent + "時台！", "コイン集めよ！", "ぷにっ"];
    say(lines[(Math.random() * lines.length) | 0]);
    beep(520, 0.07, "sine", 0.05);
  });

  /* ============================================================
     実績
     ============================================================ */
  function checkAchievements() {
    ACHIEVEMENTS.forEach((a) => {
      if (!unlocked.has(a.id) && a.test(stats)) {
        unlocked.add(a.id);
        toast(a);
        persist();
      }
    });
  }
  function toast(a) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="emoji">${a.emoji}</span><span>実績解除！<small>${a.name} — ${a.desc}</small></span>`;
    toasts.appendChild(el);
    beep(784, 0.1); setTimeout(() => beep(1046, 0.14), 110);
    setTimeout(() => el.remove(), 3500);
  }

  function persist() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      best,
      achievements: [...unlocked],
    }));
  }

  /* ---------- 起動 ---------- */
  render();
  setInterval(render, 250); // 秒の頭に確実に追従させるため小刻みにチェック
})();

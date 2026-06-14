/* ============================================================
   Game Flip Clock
   ------------------------------------------------------------
   現在時刻を1秒ごとに更新し、数字が変わった桁だけを
   パタッと「めくる」フリップアニメーションで描画します。
   ============================================================ */

(function () {
  "use strict";

  const clock = document.getElementById("clock");
  if (!clock) return;

  // 桁ごとの要素をキャッシュ
  const cards = {};
  clock.querySelectorAll(".flip").forEach((el) => {
    cards[el.dataset.place] = el;
  });
  const ampm = clock.querySelector("[data-ampm]");

  /**
   * 1枚のフリップカードを新しい数字へめくる
   * @param {HTMLElement} card  .flip 要素
   * @param {string} next       表示したい1文字
   */
  function flip(card, next) {
    const topSpan = card.querySelector(".top span");
    const bottomSpan = card.querySelector(".bottom span");
    const current = topSpan.textContent;
    if (current === next) return; // 変化なし

    // 静止部分を即座に更新（めくり中は前面のフリップ層で隠れる）
    topSpan.textContent = next; // 上半分は新しい数字（下りてくる層の裏）
    bottomSpan.textContent = current; // 下半分はめくり終わるまで古い数字

    // めくり層を生成
    const flipTop = document.createElement("div");
    flipTop.className = "flip-top";
    flipTop.innerHTML = `<span>${current}</span>`;

    const flipBottom = document.createElement("div");
    flipBottom.className = "flip-bottom";
    flipBottom.innerHTML = `<span>${next}</span>`;

    card.append(flipTop, flipBottom);

    flipTop.addEventListener("animationend", () => flipTop.remove());
    flipBottom.addEventListener("animationend", () => {
      bottomSpan.textContent = next; // めくり終わりに下半分を確定
      flipBottom.remove();
    });
  }

  function setCard(place, char) {
    if (cards[place]) flip(cards[place], char);
  }

  function render() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (clock.dataset.format === "12") {
      const suffix = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      if (ampm) ampm.textContent = suffix;
    }

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    setCard("h-tens", hh[0]);
    setCard("h-ones", hh[1]);
    setCard("m-tens", mm[0]);
    setCard("m-ones", mm[1]);
    setCard("s-tens", ss[0]);
    setCard("s-ones", ss[1]);
  }

  // 初期描画 → 次の秒の頭に合わせて毎秒更新
  render();
  setInterval(render, 1000);
})();

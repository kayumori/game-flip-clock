# 🕹️ Game Flip Clock

ただ時刻を表示するだけじゃない、**遊べる**フリップ時計ウィジェット。
依存ライブラリなしの **HTML + CSS + JavaScript だけ** で動きます。

**▶ デモ: https://kayumori.github.io/game-flip-clock/**

## 🎮 遊び要素

- **★コインキャッチ** … カードの上にときどき出現するコインをタップしてスコアを稼ぐ（●金=10点 / ★ピンク=50点）
- **✕ハズレ** … ✕マークを踏むと減点＆コンボ消滅、マスコットが落ち込み画面が揺れる。よく見て避けよう
- **コンボ** … 連続でキャッチするほど倍率アップ（良いコインを取り逃すとリセット）
- **チャンスタイム** … ゾロ目の時刻（11:11 など）や毎時0分にコインが降り注ぐ
- **反応するマスコット** … キャッチや操作に合わせて跳ねたり喋ったりする相棒
- **実績システム** … コンボ・スコア・ゾロ目キャッチなどでバッジを解除（`localStorage`に保存）
- **触って気持ちいい演出** … カードを叩くとプルッと跳ねて火花＆効果音（WebAudioでファイル不要）

解除した実績はブラウザに保存され、次回も引き継がれます。

## ⏰ 時計としての機能

- パタッとめくれるフリップアニメーション（変わった桁だけが動く）
- 12 / 24 時間表記、秒の表示 ON/OFF
- レスポンシブ（`clamp()` で画面幅に合わせて自動スケール）

## 🚀 使い方

**`index.html` をダブルクリックして開くだけ。** CSS・JS はすべて1ファイルに入っているので、ビルドも追加ファイルも不要です。

```bash
git clone https://github.com/kayumori/game-flip-clock.git
cd game-flip-clock
open index.html        # macOS（Windows は start、Linux は xdg-open）
```

GitHub Pages に置けば URL でそのまま遊べます（Settings → Pages → ブランチを指定するだけ）。

## ⚙️ カスタマイズ

`index.html` の `.clock` 要素の `data-*` 属性で設定できます。

```html
<div class="clock"
     data-format="12"     <!-- "12" または "24" -->
     data-seconds="true"> <!-- "true" / "false"  秒の表示 -->
```

色やサイズは `index.html` 内の `<style>` 先頭、`:root` にある CSS 変数でまとめて変更できます。

```css
:root {
  --bg: #ffffff;        /* 背景色 */
  --card-bg: #1c1c1c;   /* カードの色 */
  --accent: #ffcf33;    /* コイン・AM/PM・マスコットの色 */
  --pop: #ff5d73;       /* コンボ・特別コインの色 */
  --card-w: clamp(54px, 11vw, 92px);  /* カード幅 */
  --card-h: clamp(82px, 17vw, 134px); /* カード高さ */
  --flip-speed: 0.3s;   /* めくる速さ */
}
```

## 📁 構成

```
game-flip-clock/
├── index.html   # これ1つで完結（HTML + CSS + JavaScript をすべて内包）
├── README.md
└── LICENSE
```

## 📜 ライセンス

[MIT](LICENSE)
